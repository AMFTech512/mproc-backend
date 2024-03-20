import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import { UserRow, UserRepo } from "../../../src/user-repo";

const dbName = `test-${crypto.randomUUID()}`;

describe("user-repo integration", () => {
  let container = {} as DIContainer;
  let userRepo: UserRepo;

  beforeAll(async () => {
    // initialize a test database
    await initDb(dbName);

    // create a connection to the test database
    container.postgresClient = await initPostgresClient({ database: dbName });
    userRepo = new UserRepo(container);
  });

  afterAll(async () => {
    // close the connection to the test database
    await container.postgresClient.end();

    // drop the test database
    await dropDb(dbName);
  });

  const testUser: UserRow = {
    id: "b5ff1ba9-db12-4724-86c5-738cce48f057",
    name: "Bob",
    email: "bob@example.com",
  };

  describe("insert", () => {
    test("should insert a user successfully", async () => {
      await userRepo.insert(testUser);
    });

    test("should insert the minumu required fields", async () => {
      const user = {
        id: "233d6281-6aed-45d6-90bc-a4c16c5f8db0",
      };

      await userRepo.insert(user);
    });

    test("should not insert a user with the same id", async () => {
      expect(userRepo.insert(testUser)).rejects.toThrow();
    });

    test("should not insert a user with the same email", async () => {
      const user = {
        id: "17a2d1a7-99b8-4873-857b-cee8641cc434",
        name: "Bob",
        email: "bob@example.com",
      };

      expect(userRepo.insert(user)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    test("should get the user successfully", async () => {
      const user = await userRepo.getById(testUser.id);
      expect(user).toEqual(testUser);
    });
  });

  describe("getByEmail", () => {
    test("should get the user successfully", async () => {
      const user = await userRepo.getByEmail(testUser.email);
      expect(user).toEqual(testUser);
    });
  });

  describe("update", () => {
    test("should update the user successfully", async () => {
      const updatedUser = {
        id: testUser.id,
        email: "alice@example.com",
      };

      await userRepo.update(updatedUser);

      const user = await userRepo.getById(testUser.id);
      expect(user).toMatchObject(updatedUser);
    });
  });

  describe("delete", () => {
    test("should delete the user successfully", async () => {
      await userRepo.delete(testUser.id);

      const user = await userRepo.getById(testUser.id);
      expect(user).toBeUndefined();
    });
  });
});
