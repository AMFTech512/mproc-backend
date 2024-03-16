import { RequestHandler, json } from "express";
import { DIContainer } from "./di";
import { ProcessStep, getBuffer, processSteps } from "./image-processor";
import Joi, { ValidationError } from "joi";
import gm from "gm";
import { rm } from "fs/promises";
import { insertUser } from "./user-repo";
import { hashPassword } from "./password";

// POST /upload
export const handleUpload: (container: DIContainer) => RequestHandler =
  (container: DIContainer) => async (req, res) => {
    const dbClient = container.postgresClient;

    if (req.file) {
      dbClient.query("INSERT INTO uploads (filename) VALUES ($1)", [
        req.file.filename,
      ]);

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
      await insertUser(container, {
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
