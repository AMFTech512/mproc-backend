import express, { RequestHandler } from "express";
import { DIContainer } from "./di";
import Joi from "joi";
import multer from "multer";
import cors from "cors";
import {
  handleApiKeyCreate,
  handleUpload,
  handleUserCreate,
  handleUserLogin,
} from "./handlers";
import packageJson from "../package.json";
import { apiKey, authUser } from "./middleware";

interface ServerConfig {
  port: number;
}

function getServerConfig(): ServerConfig {
  return Joi.attempt(
    {
      port: process.env.PORT,
    },
    Joi.object({
      port: Joi.number().required(),
    })
  );
}

export function initExpressApp(container: DIContainer) {
  const app = express();
  const config = getServerConfig();

  const upload = multer({
    dest: "./uploads",
  });

  app.use(cors());

  app.get("/", (req, res) => {
    res.send(`v${packageJson.version} - OK`);
  });

  app.post(
    "/upload",
    // use the apiKey middleware to authenticate the request with an api key
    apiKey(container),
    // extract the file from the request
    upload.single("file"),
    // ts doesn't like the fact that we've added the apiKey to the request object
    handleUpload(container) as unknown as RequestHandler
  );

  app.post("/user", express.json(), handleUserCreate(container));

  app.post("/login", express.json(), handleUserLogin(container));

  app.post(
    "/api-key",
    express.json(),
    // use the authUser middleware to authenticate the request with a user jwt
    authUser(container),
    // ts doesn't like the fact that we've added a user to the request object
    handleApiKeyCreate(container) as unknown as RequestHandler
  );

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  return app;
}
