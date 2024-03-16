import { Application } from "express";
import PQueue from "p-queue";
import { Client } from "pg";

export interface DIContainer {
  expressApp: Application;
  postgresClient: Client;
  queue: PQueue;
}

export function createDIContainer(): DIContainer {
  return {} as DIContainer;
}
