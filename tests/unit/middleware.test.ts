import { describe, it, expect, mock } from "bun:test";
import { createUserJwt } from "../../src/jwt";
import { apiKey, authUser } from "../../src/middleware";
import { ApiKeyRepo } from "../../src/api-key-repo";

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

  describe("apiKey", () => {
    const container = {
      apiKeyRepo: {
        getByKeyHash: mock(),
      },
    };

    it("should authenticate an api key successfully", async () => {
      const req = {
        headers: {
          authorization: "Bearer key",
        },
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      container.apiKeyRepo.getByKeyHash.mockResolvedValue({
        id: "id",
        key_hash: ApiKeyRepo.hashKey(req.headers["authorization"]),
        owner_id: "owner-id",
        is_active: true,
      });

      const middleware = apiKey(container as any);

      // this is actually async

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should fail to authenticate an api key with no key", async () => {
      const req = {
        headers: {},
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      const middleware = apiKey(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should fail to authenticate an api key with a bad key", async () => {
      const req = {
        headers: {
          authorization: "Bearer bad",
        },
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      // in this case, we pretend the key doesn't exist
      container.apiKeyRepo.getByKeyHash.mockResolvedValue(undefined);

      const middleware = apiKey(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });

    it("should fail to authenticate an api key with an inactive key", async () => {
      const req = {
        headers: {
          authorization: "Bearer key",
        },
      } as any;

      const res = {
        status: mock(() => res),
        send: mock(() => res),
      } as any;

      const next = mock();

      container.apiKeyRepo.getByKeyHash.mockResolvedValue({
        id: "id",
        key_hash: ApiKeyRepo.hashKey(req.headers["authorization"]),
        owner_id: "owner-id",
        is_active: false,
      });

      const middleware = apiKey(container as any);

      // this is actually async
      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Unauthorized");
      expect(next).not.toHaveBeenCalled();
    });
  });
});
