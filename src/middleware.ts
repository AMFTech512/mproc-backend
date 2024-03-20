import { RequestHandler, Request } from "express";
import { DIContainer } from "./di";
import Cookie from "cookie";
import { UserRow } from "./user-repo";
import { UserJwtPayload, verifyJwt } from "./jwt";
import { ApiKeyRepo, ApiKeyRow } from "./api-key-repo";
import cors from "cors";

export interface UserAuthedRequest extends Request {
  user: UserRow;
}

export interface ApiKeyAuthedRequest extends Request {
  apiKey: ApiKeyRow;
}

export const appCors = (allowedOrigins: string[]) =>
  cors({
    origin: allowedOrigins,
  });

export const apiCors = () => cors();

export const authUser: (container: DIContainer) => RequestHandler =
  (container) => async (req, res, next) => {
    const tokenHeader = req.headers["authorization"] as string;
    const token = /^Bearer (.+)$/.exec(tokenHeader)?.[1];

    if (!token) {
      res.status(401).send("Unauthorized");
      return;
    }

    // verify the jwt

    let jwtPayload: UserJwtPayload;
    try {
      jwtPayload = verifyJwt<UserJwtPayload>(token, container.jwtConfig);
    } catch (e) {
      res.status(401).send("Unauthorized");
      return;
    }

    // ensure that the jwt is of the correct type
    if (jwtPayload.type !== "uac") {
      res.status(401).send("Unauthorized");
      return;
    }

    // get the user associated with this jwt
    const user = await container.userRepo.getById(jwtPayload.sub);

    // if the user does not exist, send a 401
    if (!user) {
      res.status(401).send("Unauthorized");
      return;
    }

    // attach the user to the request
    (req as UserAuthedRequest).user = user;

    // continue to the next handler
    next();
  };

export const apiKey: (container: DIContainer) => RequestHandler =
  (container) => async (req, res, next) => {
    const keyHeader = req.headers["authorization"] as string;
    const key = /^Bearer (.+)$/.exec(keyHeader)?.[1];

    if (!key) {
      res.status(401).send("Unauthorized");
      return;
    }

    const keyHash = ApiKeyRepo.hashKey(key);
    const apiKeyRow = await container.apiKeyRepo.getByKeyHash(keyHash);

    if (!apiKeyRow || !apiKeyRow.is_active) {
      res.status(401).send("Unauthorized");
      return;
    }

    (req as ApiKeyAuthedRequest).apiKey = apiKeyRow;

    next();
  };
