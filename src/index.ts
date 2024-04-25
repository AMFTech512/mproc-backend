import { ApiKeyRepo } from "./api-key-repo";
import { createDIContainer } from "./di";
import { EmailService } from "./email-service";
import { initExpressApp } from "./express";
import { HtmlTemplateService } from "./html-template-service";
import { getJwtConfig } from "./jwt";
import { KeyUsageLogRepo } from "./key-usage-repo";
import { initQueue } from "./p-queue";
import { initPostgresClient } from "./postgres";
import { initResendClient } from "./resend";
import { UserRepo } from "./user-repo";
import { getWebAuthnConfig } from "./webauthn";
import { WebAuthnAuthenticatorRepo } from "./webauthn-authenticator-repo";
import { WebAuthnChallengeRepo } from "./webauthn-challenge-repo";

await bootstrap();

async function bootstrap() {
  console.log("Bootstrapping application...");

  // create the DI container
  console.log("Creating DI container...");
  const container = createDIContainer();

  // initialize the jwt config
  console.log("Initializing jwt config...");
  container.jwtConfig = getJwtConfig();

  // initialize the webauthn config
  console.log("Initializing webauthn config...");
  container.webAuthnConfig = getWebAuthnConfig();

  // initialize the postgres client
  console.log("Initializing postgres client...");
  container.postgresClient = await initPostgresClient();

  // initialize the resend client
  console.log("Initializing resend client...");
  container.resendClient = initResendClient();

  // initialize the user repo
  console.log("Initializing user repo...");
  container.userRepo = new UserRepo(container);

  // initialize api key repo
  console.log("Initializing api key repo...");
  container.apiKeyRepo = new ApiKeyRepo(container);

  // initialize the key usage log repo
  console.log("Initializing key usage log repo...");
  container.keyUsageLogRepo = new KeyUsageLogRepo(container);

  // initialize webauthn challenge repo
  console.log("Initializing webauthn challenge repo...");
  container.webAuthnChallengeRepo = new WebAuthnChallengeRepo(container);

  // initialize the webauthn authenticator repo
  console.log("Initializing webauthn authenticator repo...");
  container.webAuthnAuthenticatorRepo = new WebAuthnAuthenticatorRepo(
    container
  );

  // initialize the html template service
  console.log("Initializing html template service...");
  container.htmlTemplateService = await HtmlTemplateService.init();

  // initialize the email service
  console.log("Initializing early adopter repo...");
  container.emailService = new EmailService(container);

  // initialize the image process queue
  console.log("Initializing process queue...");
  container.imagePQueue = initQueue();

  // initialize the express app
  console.log("Initializing express app...");
  container.expressApp = initExpressApp(container);
}
