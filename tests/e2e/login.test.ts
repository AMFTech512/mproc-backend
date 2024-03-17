import { beforeAll, describe, expect, it } from "bun:test";
import Cookie from "cookie";

const BASE_URL = "http://localhost:3000";

describe("login e2e", () => {
  const newUserBody = {
    email: `test-${Date.now()}@test.com`,
    password: "password",
  };

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
  });

  it("should login successfully", async () => {
    const loginUrl = new URL("/login", BASE_URL).toString();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserBody),
    });

    const jwt = Cookie.parse(response.headers.get("set-cookie") || "").jwt;

    expect(response.status).toBe(200);
    expect(jwt).toBeDefined();
  });

  it("should fail to login with an invalid email", async () => {
    const loginUrl = new URL("/login", BASE_URL).toString();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "invalid-email",
        password: "password",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("should fail to login with an email that doesn't exist", async () => {
    const loginUrl = new URL("/login", BASE_URL).toString();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "noexist@example.com",
        password: "password",
      }),
    });

    expect(response.status).toBe(404);
  });

  it("should fail to login with an incorrect password", async () => {
    const loginUrl = new URL("/login", BASE_URL).toString();

    const response = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: newUserBody.email,
        password: "incorrect-password",
      }),
    });

    expect(response.status).toBe(401);
  });
});
