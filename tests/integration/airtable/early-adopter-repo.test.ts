import { beforeAll, describe, it } from "bun:test";
import { createDIContainer } from "../../../src/di";
import { initAirtableClient } from "../../../src/airtable";
import { EarlyAdopterRepo } from "../../../src/early-adopter-repo";

describe("early adopter repo", () => {
  let container = createDIContainer();
  let earlyAdopterRepo: EarlyAdopterRepo;

  beforeAll(() => {
    container.airtableClient = initAirtableClient();
    earlyAdopterRepo = new EarlyAdopterRepo(container);
  });

  it("should insert an early adopter successfully", async () => {
    await earlyAdopterRepo.insertEarlyAdopter(
      `test-${crypto.randomUUID()}@example.com`
    );
  });
});
