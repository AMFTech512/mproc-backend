import { createDIContainer } from "./di";
import { initExpressApp } from "./express";
import { initQueue } from "./p-queue";
import { initPostgresClient } from "./postgres";

await bootstrap();

async function bootstrap() {
  console.log("Bootstrapping application...");

  // create the DI container
  console.log("Creating DI container...");
  const container = createDIContainer();

  // initialize the postgres client
  console.log("Initializing postgres client...");
  container.postgresClient = await initPostgresClient();

  // initialize the process queue
  console.log("Initializing process queue...");
  container.queue = initQueue();

  // initialize the express app
  console.log("Initializing express app...");
  container.expressApp = initExpressApp(container);
}
