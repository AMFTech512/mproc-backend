import Joi from "joi";
import jwt from "jsonwebtoken";

export interface JwtConfig {
  secret: string;
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

export function generateJwtSecret() {
  return crypto
    .getRandomValues(new Uint8Array(32))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
}

export function createUserJwt(
  userId: string,
  nonce: number,
  jwtConfig: JwtConfig
) {
  return jwt.sign({ sub: userId, iss: "mproc.io", nonce }, jwtConfig.secret, {
    expiresIn: "1d",
  });
}
