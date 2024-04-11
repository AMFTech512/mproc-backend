import { RequestHandler, Response, Request } from "express";
import { DIContainer } from "./di";
import { ProcessStep, getBuffer, processSteps } from "./image-processor";
import Joi, { ValidationError } from "joi";
import gm from "gm";
import { rm } from "fs/promises";
import { verifyPassword } from "./password";
import { createUserJwt } from "./jwt";
import { ApiKeyAuthedRequest, UserAuthedRequest } from "./middleware";
import { ApiKeyRepo } from "./api-key-repo";
import { oneMonthFromNow } from "./util";
import { getRegistrationOptions } from "./webauthn";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { RegistrationResponseJSON } from "@simplewebauthn/types";

// POST /early-adopter
export const handleEarlyAdopter =
  (container: DIContainer) => async (req: Request, res: Response) => {
    const email = req.body?.email as string;
    if (!email) {
      res.status(400).send("Email is required.");
      return;
    }

    // add the email to the contact list
    await container.emailService.addContact({ email });

    // send them a welcome email;
    // don't await this so that the request can return immediately
    container.emailService.sendEmail(
      email,
      "Welcome to mproc!",
      "Welcome to mproc! We're excited to have you on board."
    );

    res.redirect("/early-adopter/");
  };

// POST /upload
export const handleUpload =
  (container: DIContainer) =>
  async (req: ApiKeyAuthedRequest, res: Response) => {
    if (req.file) {
      let reqProcessSteps: ProcessStep<any>[];
      try {
        reqProcessSteps = JSON.parse(req.body.processSteps);
      } catch (e) {
        res
          .status(400)
          .send("`processSteps` must be a valid JSON array of process steps.");

        // delete the file from the file system regardless of whether or not the request was successful
        if (req.file?.path) await rm(req.file.path);
        return;
      }

      try {
        const state = gm(req.file.path);

        const imgBuffer = await processSteps(state, reqProcessSteps).then(
          (state) => getBuffer(state)
        );

        res.status(200).send(imgBuffer);

        // log this in the db
        await container.keyUsageLogRepo.insert({
          key_hash: req.apiKey.key_hash,
          owner_id: req.apiKey.owner_id,
          operation: "image-process",
          unit_count: 1,
          date_executed: new Date(),
        });
      } catch (e) {
        if (e instanceof ValidationError) {
          res.status(400).send(e.annotate(true));
        } else {
          res.status(500).send("A server error occurred.");
        }
      }
    } else {
      // if there is no file, send a 400 error
      res.status(400).send("No file provided.");
    }

    // delete the file from the file system regardless of whether or not the request was successful
    if (req.file?.path) await rm(req.file.path);
  };

interface UserCreateBody {
  email: string;
  name: string;
}

const USER_CREATE_BODY_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().max(32).required(),
});

// POST /user
export const handleUserCreate: (container: DIContainer) => RequestHandler =
  (container: DIContainer) => async (req, res) => {
    // validate the request body
    const { error } = USER_CREATE_BODY_SCHEMA.validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }

    const body = req.body as UserCreateBody;
    const userId = crypto.randomUUID();

    try {
      await container.userRepo.insert({
        id: userId,
        email: body.email,
        name: body.name,
      });
    } catch (e: any) {
      if (e.code === "23505" && e.constraint === "users_email_key") {
        res.status(400).send("A user with that email already exists.");
      } else {
        console.error(e);
        res.status(500).send("A server error occurred.");
      }
    }

    res
      .status(201)
      .json({ token: createUserJwt(userId, 0, container.jwtConfig) });
  };

// GET /register-auth
export const handleRegisterAuthGet =
  (container: DIContainer) => async (req: UserAuthedRequest, res: Response) => {
    const registrationOptions = await getRegistrationOptions(
      container.webAuthnConfig,
      req.user.id,
      req.user.name
    );

    await container.webAuthnChallengeRepo.insert({
      challenge: registrationOptions.challenge,
      user_id: req.user.id,
      is_registration: true,
      created_at: new Date(),
    });

    res.status(200).json({ registrationOptions });
  };

interface UserRegisterAuthBody {
  challenge: string;
  registrationResponse: RegistrationResponseJSON;
}

const USER_REGISTER_AUTH_BODY_SCHEMA = Joi.object({
  challenge: Joi.string().required(),
  registrationResponse: Joi.object().required(),
});

// POST /register-auth
export const handleRegisterAuthPost =
  (container: DIContainer) => async (req: UserAuthedRequest, res: Response) => {
    const { error } = USER_REGISTER_AUTH_BODY_SCHEMA.validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }

    const body = req.body as UserRegisterAuthBody;

    const challengeRow = await container.webAuthnChallengeRepo.getByChallenge(
      body.challenge
    );

    if (!challengeRow) {
      res.status(404).send("Challenge not found.");
      return;
    }

    if (challengeRow.user_id !== req.user.id) {
      res
        .status(403)
        .send("You are not authorized to complete this registration.");
      return;
    }

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body.registrationResponse,
        expectedChallenge: body.challenge,
        expectedOrigin: container.webAuthnConfig.origin,
        expectedRPID: container.webAuthnConfig.rpID,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(400).send({ error: error.message });
    }

    if (!verification || !verification.verified) {
      res.status(400).send({ error: "Verification failed" });
      return;
    }

    const { registrationInfo } = verification;
    if (!registrationInfo) {
      res.status(400).send({ error: "No registration info returned" });
      return;
    }

    const {
      credentialPublicKey,
      credentialID,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    // insert the authenticator into the db
    await container.webAuthnAuthenticatorRepo.insert({
      credential_id: Buffer.from(credentialID),
      credential_public_key: Buffer.from(credentialPublicKey),
      counter: counter.toString(),
      credential_device_type: credentialDeviceType,
      is_credential_backed_up: credentialBackedUp,
      transports: body.registrationResponse.response.transports,
      user_id: req.user.id,
      created_at: new Date(),
    });

    // delete the challenge from the db
    await container.webAuthnChallengeRepo.deleteByChallenge(body.challenge);

    res.status(201).send("Successfully registered authenticator.");
  };

interface UserLoginBody {
  email: string;
  password: string;
}

const USER_LOGIN_BODY_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// POST /login
export const handleUserLogin: (container: DIContainer) => RequestHandler =
  (container: DIContainer) => async (req, res) => {
    // validate the request body
    const { error } = USER_LOGIN_BODY_SCHEMA.validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }

    const body = req.body as UserLoginBody;

    const userRow = await container.userRepo.getByEmail(body.email);
    if (!userRow) {
      res.status(404).send(`User with email ${body.email} not found.`);
      return;
    }

    const isPasswordCorrect = await verifyPassword(
      body.password,
      "userRow.password_hash"
    );
    if (!isPasswordCorrect) {
      res.status(401).send("Incorrect password.");
      return;
    }

    // create a user access token and send it in the response
    // TODO: get the nonce from the db
    const token = createUserJwt(userRow.id, 0, container.jwtConfig);

    res
      .cookie("jwt", token, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        expires: oneMonthFromNow(),
      })
      .sendStatus(200);
  };

interface ApiKeyCreateBody {
  name: string;
}

const API_KEY_CREATE_BODY_SCHEMA = Joi.object({
  name: Joi.string().required(),
});

// POST /api-key
export const handleApiKeyCreate =
  (container: DIContainer) => async (req: UserAuthedRequest, res: Response) => {
    const { error } = API_KEY_CREATE_BODY_SCHEMA.validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }

    const body = req.body as ApiKeyCreateBody;
    const [key, keyHash] = ApiKeyRepo.generateKeyHashPair();

    // insert the key into the db
    await container.apiKeyRepo.insert({
      key_hash: keyHash,
      owner_id: req.user.id,
      is_active: true,
      created_at: new Date(),
      name: body.name,
    });

    res.status(201).json({ key });
  };
