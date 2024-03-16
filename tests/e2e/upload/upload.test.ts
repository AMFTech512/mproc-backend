import { mkdir } from "fs/promises";
import { beforeAll, describe, expect, it } from "bun:test";
import path from "path";
import { write } from "bun";

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
  beforeAll(async () => {
    // create the results directory
    await mkdir(DEST_PATH, { recursive: true });
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
    });

    const arrayBuffer = await response.arrayBuffer();
    await write(getDestPath("1-converted.jpg"), arrayBuffer);
  });

  it("should return a 400 if no file is provided", async () => {
    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: JSON.stringify({
        processSteps: [
          {
            operation: "border",
            params: { width: 20, height: 20, color: "blue" },
          },
        ],
      }),
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
    });

    expect(response.status).toBe(400);
  });
});
