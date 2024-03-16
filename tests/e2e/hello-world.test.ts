import { describe, expect, it } from "bun:test";
import packageJson from "../../package.json";

const BASE_URL = new URL("http://localhost:3000");

describe("Hello world endpoint", () => {
  it("should return health check message", async () => {
    const expectedMessage = `v${packageJson.version} - OK`;
    let res = await fetch(BASE_URL.toString()).then((res) => res.text());
    expect(res).toBe(expectedMessage);
  });
});
