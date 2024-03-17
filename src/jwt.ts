import Joi from "joi";
import jwt from "jsonwebtoken";

export interface JwtConfig {
  secret: string;
}

export interface BaseJwtPayload {
  sub: string;
  iss: "mproc.io";
  nonce: number;
  iat: number;
  exp: number;
}

export interface UserJwtPayload extends BaseJwtPayload {
  type: "uac";
}

export function getJwtConfig(): JwtConfig {
  return Joi.attempt(
    {
      secret: process.env.JWT_SECRET,
    },
    Joi.object({
      secret: Joi.string().required(),
    })
  );
}

export function createUserJwt(
  userId: string,
  nonce: number,
  jwtConfig: JwtConfig
) {
  return jwt.sign(
    {
      sub: userId,
      iss: "mproc.io",
      // type: "uac" is added to the token to indicate that it is a user access token
      type: "uac",
      // nonce is added to allow for token invalidation
      nonce,
    },
    jwtConfig.secret,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyJwt<T extends BaseJwtPayload>(
  token: string,
  jwtConfig: JwtConfig
) {
  return jwt.verify(token, jwtConfig.secret) as T;
}
