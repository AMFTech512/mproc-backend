import { describe, it, expect } from "bun:test";
import { UserJwtPayload, createUserJwt, verifyJwt } from "../../src/jwt";

describe("jwt", () => {
  const jwtConfig = {
    secret: "secret",
  };

  it("should generate and verify a user access token", () => {
    const uacJwt = createUserJwt("user-id", 0, jwtConfig);

    const payload = verifyJwt<UserJwtPayload>(uacJwt, jwtConfig);

    expect(payload).toMatchObject({
      sub: "user-id",
      iss: "mproc.io",
      type: "uac",
      nonce: 0,
    });
  });

  it("should throw an error when verifying an invalid token", () => {
    expect(() =>
      verifyJwt<UserJwtPayload>("invalid-token", jwtConfig)
    ).toThrow();
  });

  it("should throw an error when verifying a token with an invalid secret", () => {
    const uacJwt = createUserJwt("user-id", 0, { secret: "invalid" });

    expect(() => verifyJwt<UserJwtPayload>(uacJwt, jwtConfig)).toThrow();
  });
});
