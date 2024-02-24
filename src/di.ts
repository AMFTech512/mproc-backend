import { Application } from "express";
import { Client } from "pg";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
