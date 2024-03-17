import { RequestHandler, Response } from "express";
import { DIContainer } from "./di";
import { ProcessStep, getBuffer, processSteps } from "./image-processor";
import Joi, { ValidationError } from "joi";
import gm from "gm";
import { rm } from "fs/promises";
import { hashPassword, verifyPassword } from "./password";
import { createUserJwt } from "./jwt";
import { ApiKeyAuthedRequest, UserAuthedRequest } from "./middleware";
import { ApiKeyRepo } from "./api-key-repo";

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
  password: string;
}

const USER_CREATE_BODY_SCHEMA = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
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

    try {
      await container.userRepo.insert({
        id: crypto.randomUUID(),
        email: body.email,
        password_hash: await hashPassword(body.password),
      });
    } catch (e: any) {
      if (e.code === "23505" && e.constraint === "users_email_key") {
        res.status(400).send("A user with that email already exists.");
      } else {
        console.error(e);
        res.status(500).send("A server error occurred.");
      }
    }

    res.sendStatus(201);
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
      userRow.password_hash
    );
    if (!isPasswordCorrect) {
      res.status(401).send("Incorrect password.");
      return;
    }

    // create a user access token and send it in the response
    // TODO: get the nonce from the db
    const token = createUserJwt(userRow.id, 0, container.jwtConfig);

    res.cookie("jwt", token, { secure: true, httpOnly: true }).sendStatus(200);
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
