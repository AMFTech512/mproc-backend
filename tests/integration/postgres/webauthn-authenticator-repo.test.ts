import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { DIContainer } from "../../../src/di";
import { dropDb, initDb, initPostgresClient } from "../../../src/postgres";
import {
  IAuthenticatorInsert,
  WebAuthnAuthenticatorRepo,
} from "../../../src/webauthn-authenticator-repo";
import { UserRepo } from "../../../src/user-repo";

const dbName = `test-${crypto.randomUUID()}`;

describe("webauthn-authenticator-repo integration", () => {
  let container = {} as DIContainer;
  let userRepo: UserRepo;
  let webauthnAuthRepo: WebAuthnAuthenticatorRepo;

  const testUser = {
    id: "b5ff1ba9-db12-4724-86c5-738cce48f057",
    name: "test",
    email: "bob@test.com",
  };

  const testAuth: IAuthenticatorInsert = {
    credential_id: Buffer.from("123"),
    credential_public_key: Buffer.from("456"),
    counter: "1",
    credential_device_type: "singleDevice",
    is_credential_backed_up: true,
    user_id: "b5ff1ba9-db12-4724-86c5-738cce48f057",
  };

  beforeAll(async () => {
    // initialize a test database
    await initDb(dbName);

    // create a connection to the test database
    container.postgresClient = await initPostgresClient({ database: dbName });
    userRepo = new UserRepo(container);
    webauthnAuthRepo = new WebAuthnAuthenticatorRepo(container);

    // insert a user
    await userRepo.insert(testUser);
  });

  afterAll(async () => {
    // close the connection to the test database
    await container.postgresClient.end();

    // drop the test database
    await dropDb(dbName);
  });

  describe("insert", () => {
    test("should insert an authenticator successfully", async () => {
      await webauthnAuthRepo.insert(testAuth);
    });
  });

  describe("getByUserId", () => {
    test("should get the authenticator successfully", async () => {
      const authenticators = await webauthnAuthRepo.getByUserId(
        testAuth.user_id
      );
      expect(authenticators).toMatchObject([testAuth]);
    });
  });

  describe("getByCredentialId", () => {
    test("should get the authenticator successfully", async () => {
      const authenticator = await webauthnAuthRepo.getByCredentialId(
        testAuth.credential_id
      );
      expect(authenticator).toMatchObject(testAuth);
    });
  });

  describe("deleteByCredentialId", () => {
    test("should delete the authenticator successfully", async () => {
      await webauthnAuthRepo.deleteByCredentialId(testAuth.credential_id);
      const authenticator = await webauthnAuthRepo.getByCredentialId(
        testAuth.credential_id
      );
      expect(authenticator).toBeUndefined();
    });
  });
});
