import { describe, expect, it } from "bun:test";

const BASE_URL = "http://localhost:3000";

describe("user-create e2e", () => {
  const userCreateUrl = new URL("/user", BASE_URL).toString();

  const newUserBody = {
    email: `test-${Date.now()}@test.com`,
    password: "password",
  };

  it("should create a user successfully", async () => {
    const response = await fetch(userCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserBody),
    });

    expect(response.status).toBe(201);
  });

  it("should fail to create a user with an existing email", async () => {
    const response = await fetch(userCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUserBody),
    });

    expect(response.status).toBe(400);
  });

  it("should fail to create a user with an invalid email", async () => {
    const response = await fetch(userCreateUrl, {
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
});
