import { beforeAll, describe, it } from "bun:test";
import { createDIContainer } from "../../../src/di";
import { EmailService } from "../../../src/email-service";
import { initResendClient } from "../../../src/resend";
import { HtmlTemplateService } from "../../../src/html-template-service";

describe("Email service", () => {
  const container = createDIContainer();
  let emailService: EmailService;

  beforeAll(() => {
    container.resendClient = initResendClient();
    emailService = new EmailService(container);
  });

  it("should add a contact", async () => {
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

  describe("HTML Template Service", () => {
    let htmlTemplateService: HtmlTemplateService;

    beforeAll(async () => {
      htmlTemplateService = await HtmlTemplateService.init();
    });

    it("should send an early-access thank you", async () => {
      const message = htmlTemplateService.renderTemplate("early-access", {});

      await emailService.sendEmail(
        `amftech512@gmail.com`,
        "Integration Test (early access thank you)",
        message
      );
    });
  });
});
