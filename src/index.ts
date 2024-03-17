import { createDIContainer } from "./di";
import { initExpressApp } from "./express";
import { getJwtConfig } from "./jwt";
import { initQueue } from "./p-queue";
import { initPostgresClient } from "./postgres";
import { UserRepo } from "./user-repo";

await bootstrap();

async function bootstrap() {
  console.log("Bootstrapping application...");

  // create the DI container
  console.log("Creating DI container...");
  const container = createDIContainer();

  // initialize the postgres client
  console.log("Initializing postgres client...");
  container.postgresClient = await initPostgresClient();

  // initialize the user repo
  console.log("Initializing user repo...");
  container.userRepo = new UserRepo(container);

  // initialize the image process queue
  console.log("Initializing process queue...");
  container.imagePQueue = initQueue();

  // initialize the jwt config
  console.log("Initializing jwt config...");
  container.jwtConfig = getJwtConfig();

  // initialize the express app
  console.log("Initializing express app...");
  container.expressApp = initExpressApp(container);
}
