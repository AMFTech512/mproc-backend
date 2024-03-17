import { mkdir } from "fs/promises";
import { beforeAll, describe, expect, it } from "bun:test";
import path from "path";
import { write } from "bun";
import Cookie from "cookie";

const ASSET_PATH = "tests/e2e/upload/assets";
const DEST_PATH = "tests/e2e/upload/results";

const getAssetPath = (name: string) => {
  return path.resolve(ASSET_PATH, name);
};

const getDestPath = (name: string) => {
  return path.resolve(DEST_PATH, name);
};

const BASE_URL = "http://localhost:3000";

describe("Upload endpoint", () => {
  let userJwt: string;
  let apiKey: string;

  const testUser = {
    email: `test-${Date.now()}@test.com`,
    password: "password",
  };

  beforeAll(async () => {
    // create the results directory
    await mkdir(DEST_PATH, { recursive: true });

    // create a test user
    const userCreateUrl = new URL("/user", BASE_URL).toString();

    await fetch(userCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    // login the test user
    const loginUrl = new URL("/login", BASE_URL).toString();

    const loginResp = await fetch(loginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });

    userJwt = Cookie.parse(loginResp.headers.get("set-cookie") || "").jwt;

    // create an api key
    const keyCreateUrl = new URL("/api-key", BASE_URL).toString();

    const keyResp = await fetch(keyCreateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `jwt=${userJwt}`,
      },
      body: JSON.stringify({ name: "test token" }),
    });

    const tokenBody = (await keyResp.json()) as { key: string };
    apiKey = tokenBody.key;
  });

  const UPLOAD_URL = new URL("/upload", BASE_URL).toString();

  it("should convert a file", async () => {
    const file = Bun.file(getAssetPath("1.jpg"));
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "processSteps",
      JSON.stringify([
        {
          operation: "border",
          params: { width: 20, height: 20, color: "blue" },
        },
      ])
    );

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(200);
    const arrayBuffer = await response.arrayBuffer();
    await write(getDestPath("1-converted.jpg"), arrayBuffer);
  });

  it("should return a 400 if no file is provided", async () => {
    const formData = new FormData();
    formData.append(
      "processSteps",
      JSON.stringify([
        {
          operation: "border",
          params: { width: 20, height: 20, color: "blue" },
        },
      ])
    );

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(400);
  });

  it('should return a 400 if the "processSteps" field is missing', async () => {
    const file = Bun.file(getAssetPath("1.jpg"));
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(400);
  });

  it('should return a 400 if the "processSteps" field is not a valid JSON array', async () => {
    const file = Bun.file(getAssetPath("1.jpg"));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("processSteps", "not a valid JSON array");

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(400);
  });

  it('should return a 400 if "processSteps" is a valid json array, but violates the schema', async () => {
    const file = Bun.file(getAssetPath("1.jpg"));
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "processSteps",
      JSON.stringify([
        {
          operation: "border",
          params: { width: 20, height: 20, color: "blue" },
        },
        {
          operation: "invalid-operation",
          params: { width: 20, height: 20, color: "blue" },
        },
      ])
    );

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.status).toBe(400);
  });

  it("should return a 401 if no api key is provided", async () => {
    const file = Bun.file(getAssetPath("1.jpg"));
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "processSteps",
      JSON.stringify([
        {
          operation: "border",
          params: { width: 20, height: 20, color: "blue" },
        },
      ])
    );

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    expect(response.status).toBe(401);
  });
});
