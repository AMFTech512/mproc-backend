import { beforeAll, describe, it } from "bun:test";
import { createDIContainer } from "../../../src/di";
import { EmailService } from "../../../src/email-service";
import { initResendClient } from "../../../src/resend";

describe("Email service", () => {
  const container = createDIContainer();
  let emailService: EmailService;

  beforeAll(() => {
    container.resendClient = initResendClient();
    emailService = new EmailService(container);
  });

  it.only("should add a contact", async () => {
    await emailService.addContact({
      email: `${crypto.randomUUID()}@example.com`,
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("should send an email", async () => {
    await emailService.sendEmail(
      `amftech512@gmail.com`,
      "Integration Test",
      "<p>The integration test worked!</p>"
    );
  });
});
