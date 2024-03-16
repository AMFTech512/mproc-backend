import { RequestHandler } from "express";
import { DIContainer } from "./di";
import { ProcessStep, getBuffer, processSteps } from "./image-processor";
import { ValidationError } from "joi";
import gm from "gm";
import { rm } from "fs/promises";

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
      // TODO: send a more descriptive error message
      res.sendStatus(400);
    }

    // delete the file from the file system regardless of whether or not the request was successful
    if (req.file?.path) await rm(req.file.path);
  };
