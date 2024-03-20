import { describe, it } from "bun:test";
import { getRegistrationOptions } from "../../src/auth";

describe("Auth", () => {
  describe("getRegistrationOptions", () => {
    it("should return registration options", async () => {
      const options = await getRegistrationOptions();

      console.log(options);
    });
  });
});
