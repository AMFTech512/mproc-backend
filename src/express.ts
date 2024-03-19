import express, { RequestHandler } from "express";
import { DIContainer } from "./di";
import Joi from "joi";
import multer from "multer";
import {
  handleApiKeyCreate,
  handleUpload,
  handleUserCreate,
  handleUserLogin,
} from "./handlers";
import packageJson from "../package.json";
import { apiKey, authUser, apiCors, userAuthCors } from "./middleware";
import { validateJson } from "./util";

interface ServerConfig {
  port: number;
  userAuthAllowedOrigins: string[];
}

function getServerConfig(): ServerConfig {
  return Joi.attempt(
    {
      port: process.env.PORT,
      userAuthAllowedOrigins: process.env.USER_AUTH_ALLOWED_ORIGINS,
    },
    Joi.object({
      port: Joi.number().required(),
      userAuthAllowedOrigins: Joi.string().custom(validateJson).required(),
    })
  );
}

export function initExpressApp(container: DIContainer) {
  const app = express();
  const config = getServerConfig();

  const upload = multer({
    dest: "./uploads",
  });

  app.get("/", (_, res) => {
    res.send(`v${packageJson.version} - OK`);
  });

  // set up CORS for the upload route to allow api key auth
  app.all("/upload", apiCors());
  app.post(
    "/upload",
    // use the apiKey middleware to authenticate the request with an api key
    apiKey(container),
    // extract the file from the request
    upload.single("file"),
    // ts doesn't like the fact that we've added the apiKey to the request object
    handleUpload(container) as unknown as RequestHandler
  );

  app.post(
    "/user",
    // parse the body as json
    express.json(),
    handleUserCreate(container)
  );

  // set up CORS for the user auth routes to allow cookie auth
  app.all("/login", userAuthCors(config.userAuthAllowedOrigins));
  app.post(
    "/login",
    // parse the body as json
    express.json(),
    handleUserLogin(container)
  );

  // set up CORS for the user auth routes to allow cookie auth
  app.all("/api-key", userAuthCors(config.userAuthAllowedOrigins));
  app.post(
    "/api-key",
    // use the authUser middleware to authenticate the request with a user jwt
    authUser(container),
    // parse the body as json
    express.json(),
    // ts doesn't like the fact that we've added a user to the request object
    handleApiKeyCreate(container) as unknown as RequestHandler
  );

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });

  return app;
}
