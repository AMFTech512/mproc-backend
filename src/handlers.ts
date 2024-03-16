import { RequestHandler } from "express";
import { DIContainer } from "./di";
import {
  ProcessStep,
  createProcessStep,
  getBuffer,
  processSteps,
} from "./image-processor";
import gm from "gm";

// POST /upload
export const handleUpload: (container: DIContainer) => RequestHandler =
  (container: DIContainer) => async (req, res) => {
    const dbClient = container.postgresClient;

    if (req.file) {
      dbClient.query("INSERT INTO uploads (filename) VALUES ($1)", [
        req.file.filename,
      ]);

      let state = gm(req.file.path);

      const reqProcessSteps = JSON.parse(
        req.body.processSteps
      ) as ProcessStep<any>[];

      state = await processSteps(state, reqProcessSteps);

      const imgBuffer = await getBuffer(state);

      res.status(200).send(imgBuffer);

      // TODO: delete the file from the file system
    } else {
      // if there is no file, send a 400 error
      res.sendStatus(400);
    }
  };
