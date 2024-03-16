import { mkdir } from "fs/promises";
import { beforeAll, describe, it } from "bun:test";
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

    const response = await fetch(UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const arrayBuffer = await response.arrayBuffer();
    await write(getDestPath("1-converted.jpg"), arrayBuffer);
  });
});
