import { ApiKeyRepo } from "./api-key-repo";
import { createDIContainer } from "./di";
import { initExpressApp } from "./express";
import { getJwtConfig } from "./jwt";
import { KeyUsageLogRepo } from "./key-usage-repo";
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

  // initialize api key repo
  console.log("Initializing api key repo...");
  container.apiKeyRepo = new ApiKeyRepo(container);

  // initialize the key usage log repo
  console.log("Initializing key usage log repo...");
  container.keyUsageLogRepo = new KeyUsageLogRepo(container);

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
