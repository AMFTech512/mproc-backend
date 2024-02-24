import { describe, expect, test } from "bun:test";
import { makeSetClause } from "../../src/util";

describe("util", () => {
  describe("makeSetClause", () => {
    test("should return a valid set clause", () => {
      const obj = {
        id: "123", // should not be included since it's under the list of excluded keys
        name: "foo", // should be included
        age: 42, // should be included
        email: undefined, // should not be included since it's undefined
        phone: null, // should be included since we're explicitly setting to null
      };

      const [clause, values] = makeSetClause(obj, { exclude: ["id"] });

      expect(clause).toMatchSnapshot();
      expect(values).toMatchSnapshot();
    });
  });
});
