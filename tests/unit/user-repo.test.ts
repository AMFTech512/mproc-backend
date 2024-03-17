import { describe, expect, test } from "bun:test";
import { UserRepo } from "../../src/user-repo";

describe("user-repo unit", () => {
  describe("makeUpdateQuery", () => {
    test("should return a valid update query", () => {
      const user = {
        id: "123",
        username: "foo",
      };

      const query = UserRepo.makeUpdateQuery(user);

      expect(query.text).toBe("UPDATE users SET username = $1 WHERE id = $2");
      expect(query.values).toEqual([user.username, user.id]);
    });
  });
});
