import { beforeAll, describe, expect, it } from "bun:test";
import Cookie from "cookie";

const BASE_URL = "http://localhost:3000";

describe("token-create e2e", () => {
  const newUserBody = {
    email: `test-${Date.now()}@test.com`,
    password: "password",
  };
  let userJwt: string;

  beforeAll(async () => {
    // create a test user
    const userCreateUrl = new URL("/user", BASE_URL).toString();

    await fetch(userCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserBody),
    });

    // login the test user
    const loginUrl = new URL("/login", BASE_URL).toString();

    const tokenRes = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserBody),
    });

    userJwt = Cookie.parse(tokenRes.headers.get("set-cookie") || "").jwt;
  });

  it("should create an api token successfully", async () => {
    const tokenCreateUrl = new URL("/api-key", BASE_URL).toString();

    const response = await fetch(tokenCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${userJwt}`,
      },
      body: JSON.stringify({ name: "test token" }),
    });

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty("key");
  });
});
