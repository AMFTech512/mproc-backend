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
import { EmailService } from "./email-service";
import { Resend } from "resend";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
  resendClient: Resend;
  userRepo: UserRepo;
  apiKeyRepo: ApiKeyRepo;
  keyUsageLogRepo: KeyUsageLogRepo;
  emailService: EmailService;
  webAuthnChallengeRepo: WebAuthnChallengeRepo;
  webAuthnAuthenticatorRepo: WebAuthnAuthenticatorRepo;
  imagePQueue: PQueue;
  jwtConfig: JwtConfig;
  webAuthnConfig: WebAuthnConfig;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
