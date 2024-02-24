import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import {
  deleteUser,
  getUser,
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

  const testUser = {
    id: "b5ff1ba9-db12-4724-86c5-738cce48f057",
    username: "bob",
  };

  describe("insertUser", () => {
    test("should insert a user successfully", async () => {
      await insertUser(container, testUser);
    });
  });

  describe("getUser", () => {
    test("should get the user successfully", async () => {
      const user = await getUser(container, testUser.id);
      expect(user).toEqual(testUser);
    });
  });

  describe("updateUser", () => {
    test("should update the user successfully", async () => {
      const updatedUser = {
        id: testUser.id,
        username: "alice",
      };

      await updateUser(container, updatedUser);

      const user = await getUser(container, testUser.id);
      expect(user).toEqual(updatedUser);
    });
  });

  describe("deleteUser", () => {
    test("should delete the user successfully", async () => {
      await deleteUser(container, testUser.id);

      const user = await getUser(container, testUser.id);
      expect(user).toBeUndefined();
    });
  });
});
