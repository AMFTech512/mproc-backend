import { describe, expect, it } from "bun:test";
import { getRegistrationOptions } from "../../src/webauthn";

describe("Auth", () => {
  describe("getRegistrationOptions", () => {
    it("should return registration options", async () => {
      const options = await getRegistrationOptions(
        {
          attestationType: "none",
          rpID: "localhost",
          rpName: "localhost",
        },
        "123",
        "bob"
      );

      expect(options).toMatchSnapshot();
    });
  });
});
