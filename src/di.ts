import { Application } from "express";
import PQueue from "p-queue";
import { Client } from "pg";
import { JwtConfig } from "./jwt";
import { UserRepo } from "./user-repo";
import { ApiKeyRepo } from "./api-key-repo";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
  userRepo: UserRepo;
  apiKeyRepo: ApiKeyRepo;
  imagePQueue: PQueue;
  jwtConfig: JwtConfig;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
