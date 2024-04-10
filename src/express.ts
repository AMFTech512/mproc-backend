import express, { RequestHandler } from "express";
import { DIContainer } from "./di";
import Joi from "joi";
import multer from "multer";
import {
  handleApiKeyCreate,
  handleEarlyAdopter,
  handleRegisterAuthGet,
  handleRegisterAuthPost,
  handleUpload,
  handleUserCreate,
  handleUserLogin,
} from "./handlers";
import packageJson from "../package.json";
import { apiKey, authUser, apiCors, appCors } from "./middleware";
import { validateJson } from "./util";
import bodyParser from "body-parser";

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

  app.post(
    "/early-adopter",
    bodyParser.urlencoded({ extended: true }),
    handleEarlyAdopter(container)
  );

  // set up CORS
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

  // set up CORS
  app.all("/user", appCors(config.userAuthAllowedOrigins));
  app.post(
    "/user",
    // parse the body as json
    express.json(),
    handleUserCreate(container)
  );

  // set up CORS
  app.all("/register-auth", appCors(config.userAuthAllowedOrigins));
  app.get(
    "/register-auth",
    authUser(container),
    // ts doesn't like the fact that we've added a user to the request object
    handleRegisterAuthGet(container) as unknown as RequestHandler
  );
  app.post(
    "/register-auth",
    express.json(),
    authUser(container),
    // ts doesn't like the fact that we've added a user to the request object
    handleRegisterAuthPost(container) as unknown as RequestHandler
  );

  // set up CORS
  app.all("/login", appCors(config.userAuthAllowedOrigins));
  app.post("/login", express.json(), handleUserLogin(container));

  // set up CORS
  app.all("/api-key", appCors(config.userAuthAllowedOrigins));
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
