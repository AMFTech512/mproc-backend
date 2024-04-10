import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import { ApiKeyRepo, ApiKeyRow } from "../../../src/api-key-repo";
import { UserRepo } from "../../../src/user-repo";

const dbName = `test-${crypto.randomUUID()}`;

describe("api-key-repo integration", () => {
  let container = {} as DIContainer;
  let apiKeyRepo: ApiKeyRepo;

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
    apiKeyRepo = new ApiKeyRepo(container);

    // insert a test user
    await container.userRepo.insert({
      id: testKeyRow.owner_id,
    });
  });

  afterAll(async () => {
    // close the connection to the test database
    await container.postgresClient.end();

    // drop the test database
    await dropDb(dbName);
  });

  describe("insert", () => {
    it("should insert an api key successfully", async () => {
      await apiKeyRepo.insert(testKeyRow);
    });

    it("should not insert an api key with the same key hash", async () => {
      expect(apiKeyRepo.insert(testKeyRow)).rejects.toThrow();
    });

    it("should not insert an api key with a non-existent owner", async () => {
      const apiKey: ApiKeyRow = {
        key_hash: keyHash,
        owner_id: "17a2d1a7-99b8-4873-857b-cee8641cc434",
        created_at: new Date(),
        name: "default",
        is_active: true,
      };

      expect(apiKeyRepo.insert(apiKey)).rejects.toThrow();
    });
  });

  describe("getByKeyHash", () => {
    it("should get the api key successfully", async () => {
      const apiKey = await apiKeyRepo.getByKeyHash(testKeyRow.key_hash);
      expect(apiKey).toEqual(testKeyRow);
    });
  });

  describe("deleteByKeyHash", () => {
    it("should delete the api key successfully", async () => {
      await apiKeyRepo.deleteByKeyHash(testKeyRow.key_hash);
    });
  });
});
