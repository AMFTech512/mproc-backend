import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import { UserRepo } from "../../../src/user-repo";
import { KeyUsageLogRepo } from "../../../src/key-usage-repo";
import { ApiKeyRepo } from "../../../src/api-key-repo";

const dbName = `test-${crypto.randomUUID()}`;

describe("key-usage-log-repo integration", () => {
  let container = {} as DIContainer;
  let keyUsageLogRepo: KeyUsageLogRepo;

  const [key, keyHash] = ApiKeyRepo.generateKeyHashPair();

  const testKeyRow = {
    key_hash: keyHash,
    owner_id: "5ed6f788-c008-4d41-bd1e-cd0a35ee0584",
    name: "default",
    created_at: new Date(),
    is_active: true,
  };

  beforeAll(async () => {
    // initialize a test database
    await initDb(dbName);

    // create a connection to the test database
    container.postgresClient = await initPostgresClient({ database: dbName });
    container.userRepo = new UserRepo(container);
    container.apiKeyRepo = new ApiKeyRepo(container);
    keyUsageLogRepo = new KeyUsageLogRepo(container);

    // insert a test user
    await container.userRepo.insert({
      id: testKeyRow.owner_id,
      email: `test@example.com`,
      password_hash: "!",
    });

    // insert a test api key
    await container.apiKeyRepo.insert(testKeyRow);
  });

  afterAll(async () => {
    // close the connection to the test database
    await container.postgresClient.end();

    // drop the test database
    await dropDb(dbName);
  });

  describe("insert", () => {
    it("should insert a key usage log successfully", async () => {
      await keyUsageLogRepo.insert({
        key_hash: keyHash,
        owner_id: testKeyRow.owner_id,
        unit_count: 1,
        operation: "process-image",
        date_executed: new Date(),
      });
    });
  });
});
