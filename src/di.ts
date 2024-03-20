import { Application } from "express";
import PQueue from "p-queue";
import { Client } from "pg";
import { JwtConfig } from "./jwt";
import { UserRepo } from "./user-repo";
import { ApiKeyRepo } from "./api-key-repo";
import { KeyUsageLogRepo } from "./key-usage-repo";
import { WebAuthnConfig } from "./webauthn";
import { WebAuthnChallengeRepo } from "./webauthn-challenge-repo";
import { WebAuthnAuthenticatorRepo } from "./webauthn-authenticator-repo";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
  userRepo: UserRepo;
  apiKeyRepo: ApiKeyRepo;
  keyUsageLogRepo: KeyUsageLogRepo;
  webAuthnChallengeRepo: WebAuthnChallengeRepo;
  webAuthnAuthenticatorRepo: WebAuthnAuthenticatorRepo;
  imagePQueue: PQueue;
  jwtConfig: JwtConfig;
  webAuthnConfig: WebAuthnConfig;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
