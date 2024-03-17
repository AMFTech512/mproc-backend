import { describe, it, expect, mock } from "bun:test";
import { createUserJwt } from "../../src/jwt";
import { authUser } from "../../src/middleware";

describe("middleware", () => {
  describe("authUser", () => {
    const container = {
      jwtConfig: {
        secret: "secret",
      },
      userRepo: {
        getById: mock(),
      },
    };

    it("should should authenticate a user successfully", async () => {
      const userJwt = createUserJwt("user-id", 0, container.jwtConfig);

      const req = {
        headers: {
          cookie: `jwt=${userJwt}`,
        },
      } as any;

      const res = {
        status: mock(),
        send: mock(),
      } as any;

      const next = mock();

      const user = {
        id: "user-id",
        email: "bob@test.com",
        password_hash: "!",
      };

      container.userRepo.getById.mockResolvedValue(user);

      const middleware = authUser(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(container.userRepo.getById).toHaveBeenCalledWith("user-id");
      expect(next).toHaveBeenCalled();
      expect((req as any).user).toBe(user);
    });

    it("should should fail to authenticate a user with no jwt", async () => {
      const req = {
        headers: {
          cookie: "",
        },
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      const middleware = authUser(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should should fail to authenticate a user with a bad jwt", async () => {
      const req = {
        headers: {
          cookie: "jwt=bad",
        },
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      const middleware = authUser(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
