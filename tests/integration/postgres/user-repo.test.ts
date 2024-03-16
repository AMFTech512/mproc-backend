import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import {
  UserRow,
  deleteUser,
  getUserByEmail,
  getUserById,
  insertUser,
  updateUser,
} from "../../../src/user-repo";

const dbName = `test-${crypto.randomUUID()}`;

describe("user-repo integration", () => {
  let container = {} as DIContainer;
  beforeAll(async () => {
    // initialize a test database
    await initDb(dbName);

    // create a connection to the test database
    container.postgresClient = await initPostgresClient({ database: dbName });
  });

  afterAll(async () => {
    // close the connection to the test database
    await container.postgresClient.end();

    // drop the test database
    await dropDb(dbName);
  });

  const testUser: UserRow = {
    id: "b5ff1ba9-db12-4724-86c5-738cce48f057",
    email: "bob@example.com",
    password_hash: "!",
  };

  describe("insertUser", () => {
    test("should insert a user successfully", async () => {
      await insertUser(container, testUser);
    });

    test("should not insert a user with the same id", async () => {
      expect(insertUser(container, testUser)).rejects.toThrow();
    });

    test("should not insert a user with the same email", async () => {
      const user = {
        id: "17a2d1a7-99b8-4873-857b-cee8641cc434",
        email: "bob@example.com",
        password_hash: "!",
      };

      expect(insertUser(container, user)).rejects.toThrow();
    });
  });

  describe("getUserById", () => {
    test("should get the user successfully", async () => {
      const user = await getUserById(container, testUser.id);
      expect(user).toEqual(testUser);
    });
  });

  describe("getUserByEmail", () => {
    test("should get the user successfully", async () => {
      const user = await getUserByEmail(container, testUser.email);
      expect(user).toEqual(testUser);
    });
  });

  describe("updateUser", () => {
    test("should update the user successfully", async () => {
      const updatedUser = {
        id: testUser.id,
        email: "alice@example.com",
      };

      await updateUser(container, updatedUser);

      const user = await getUserById(container, testUser.id);
      expect(user).toMatchObject(updatedUser);
    });
  });

  describe("deleteUser", () => {
    test("should delete the user successfully", async () => {
      await deleteUser(container, testUser.id);

      const user = await getUserById(container, testUser.id);
      expect(user).toBeUndefined();
    });
  });
});
