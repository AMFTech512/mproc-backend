import { Application } from "express";
import PQueue from "p-queue";
import { Client } from "pg";
import { JwtConfig } from "./jwt";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
  imagePQueue: PQueue;
  jwtConfig: JwtConfig;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
