import type { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "../errors/HttpError";
import { requireAuth, requireRole } from "../middleware/auth";

const verifySessionMock = vi.hoisted(() => vi.fn());
const COOKIE_NAME = vi.hoisted(() => "routedash_session");

vi.mock("../utils/jwt", () => ({
  COOKIE_NAME,
  verifySession: verifySessionMock,
}));

type PrismaMock = ReturnType<typeof createPrismaMock>;

function createPrismaMock(): PrismaMock {
  const mock: Record<string, any> = {};
  mock.user = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.restaurant = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() };
  mock.menuSection = {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  mock.menuItem = {
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  mock.menuItemChangeLog = { create: vi.fn() };
  mock.order = {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const prismaMock = mock as PrismaMock;
  prismaMock.$transaction = vi.fn(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(prismaMock),
  );
  return prismaMock;
}

function resetDeepMocks(obj: Record<string, any>) {
  Object.values(obj).forEach((value) => {
    if (typeof value === "function" && "mockReset" in value) {
      value.mockReset();
    } else if (value && typeof value === "object") {
      resetDeepMocks(value as Record<string, any>);
    }
  });
}

function resetPrismaMock(mock: PrismaMock) {
  resetDeepMocks(mock as Record<string, any>);
  mock.$transaction.mockImplementation(async (callback: (client: PrismaMock) => Promise<unknown>) =>
    callback(mock),
  );
}

const prisma: PrismaMock = vi.hoisted(() => createPrismaMock());

vi.mock("../lib/prisma", () => ({
  prisma,
}));

const createReq = (overrides: Partial<Request> = {}): Request =>
  ({
    headers: {},
    cookies: {},
    user: undefined,
    ...overrides,
  }) as Request;

const createNext = () => vi.fn() as unknown as NextFunction;

describe("middleware/requireAuth", () => {
  beforeEach(() => {
    resetPrismaMock(prisma);
    verifySessionMock.mockReset();
  });

  const baseUser = {
    id: "user-1",
    email: "user@example.com",
    name: "User Example",
    role: "CUSTOMER",
    restaurants: [],
  };

  it("authenticates using a bearer token", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue({ ...baseUser });

    const req = createReq({
      headers: { authorization: "Bearer token-123" },
    });
    const next = createNext();

    await requireAuth(req, {} as Response, next);

    expect(verifySessionMock).toHaveBeenCalledWith("token-123");
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      include: { restaurants: { select: { id: true }, take: 1 } },
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("authenticates using a session cookie when header is absent", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue({ ...baseUser });

    const req = createReq({
      cookies: { [COOKIE_NAME]: "cookie-token" },
    });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(verifySessionMock).toHaveBeenCalledWith("cookie-token");
    expect(req.user?.id).toBe("user-1");
  });

  it("prefers bearer token over cookie when both provided", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue({ ...baseUser });

    const req = createReq({
      headers: { authorization: "Bearer header-token" },
      cookies: { [COOKIE_NAME]: "cookie-token" },
    });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(verifySessionMock).toHaveBeenCalledWith("header-token");
  });

  it("rejects when no token is present", async () => {
    const req = createReq();
    const next = createNext();

    await requireAuth(req, {} as Response, next);

    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(401);
    expect(error.message).toMatch(/Authentication required/);
  });

  it("rejects when verifySession throws", async () => {
    verifySessionMock.mockImplementation(() => {
      throw new Error("bad token");
    });
    const req = createReq({
      headers: { authorization: "Bearer invalid" },
    });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
  });

  it("propagates HttpError from verifySession", async () => {
    verifySessionMock.mockImplementation(() => {
      throw new HttpError(401, "Invalid session");
    });
    const req = createReq({ cookies: { [COOKIE_NAME]: "token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.message).toBe("Invalid session");
  });

  it("rejects when the user is not found", async () => {
    verifySessionMock.mockReturnValue({ userId: "missing-user" });
    prisma.user.findUnique.mockResolvedValue(null);

    const req = createReq({ cookies: { [COOKIE_NAME]: "token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
    expect(error.message).toMatch(/Invalid session/);
  });

  it("attaches restaurantId when user owns a restaurant", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      restaurants: [{ id: "rest-1" }],
    });

    const req = createReq({ headers: { authorization: "Bearer token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(req.user?.restaurantId).toBe("rest-1");
  });

  it("leaves restaurantId undefined when user has none", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue(baseUser);

    const req = createReq({ headers: { authorization: "Bearer token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(req.user?.restaurantId).toBeUndefined();
  });

  it("treats malformed authorization header as missing token", async () => {
    const req = createReq({ headers: { authorization: "Basic 123" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
  });

  it("rejects bearer headers without a token", async () => {
    const req = createReq({ headers: { authorization: "Bearer" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
  });

  it("uses case-sensitive Bearer prefix", async () => {
    const req = createReq({ headers: { authorization: "bearer lowercase" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error.status).toBe(401);
  });

  it("calls next exactly once on success", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue(baseUser);
    const next = createNext();

    await requireAuth(createReq({ headers: { authorization: "Bearer ok" } }), {} as Response, next);

    expect((next as any).mock.calls.length).toBe(1);
    expect((next as any).mock.calls[0][0]).toBeUndefined();
  });

  it("handles prisma errors by propagating them", async () => {
    const prismaError = new HttpError(500, "DB exploded");
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockRejectedValue(prismaError);

    const req = createReq({ headers: { authorization: "Bearer token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);

    const error = (next as any).mock.calls[0][0] as HttpError;
    expect(error).toBe(prismaError);
  });

  it("sanitises user payload before attaching to request", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      passwordHash: "hidden",
      restaurants: [{ id: "rest-9" }],
    });

    const req = createReq({ cookies: { [COOKIE_NAME]: "token" } });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(req.user).not.toHaveProperty("passwordHash");
    expect(req.user?.role).toBe("CUSTOMER");
  });

  it("preserves custom request data", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue(baseUser);
    const req = createReq({
      headers: { authorization: "Bearer token" },
      body: { keep: "me" },
    });
    const next = createNext();

    await requireAuth(req, {} as Response, next);
    expect(req.body).toEqual({ keep: "me" });
  });

  it("supports consecutive authentications with independent state", async () => {
    verifySessionMock.mockReturnValue({ userId: "user-1" });
    prisma.user.findUnique.mockResolvedValue(baseUser);

    const req1 = createReq({ headers: { authorization: "Bearer token-1" } });
    const next1 = createNext();
    await requireAuth(req1, {} as Response, next1);

    verifySessionMock.mockReturnValue({ userId: "user-2" });
    prisma.user.findUnique.mockResolvedValue({ ...baseUser, id: "user-2" });
    const req2 = createReq({ headers: { authorization: "Bearer token-2" } });
    const next2 = createNext();
    await requireAuth(req2, {} as Response, next2);

    expect(req1.user?.id).toBe("user-1");
    expect(req2.user?.id).toBe("user-2");
  });

  it("passes HttpError instances to next when thrown inside verifySession", async () => {
    const injected = new HttpError(401, "Injected");
    verifySessionMock.mockImplementation(() => {
      throw injected;
    });
    const next = createNext();
    await requireAuth(
      createReq({ headers: { authorization: "Bearer boom" } }),
      {} as Response,
      next,
    );
    expect(next).toHaveBeenCalled();
    const lastCall = next.mock.calls[next.mock.calls.length - 1];
    expect(lastCall?.[0]).toBe(injected);
  });
});

describe("middleware/requireRole", () => {
  it("allows matching roles", () => {
    const next = vi.fn();
    const middleware = requireRole("CUSTOMER");
    middleware({ user: { role: "CUSTOMER" } } as Request, {} as Response, next as NextFunction);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects when no user present", () => {
    const next = vi.fn();
    const middleware = requireRole("CUSTOMER");
    middleware({} as Request, {} as Response, next as NextFunction);
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(403);
  });

  it("rejects when roles do not match", () => {
    const next = vi.fn();
    const middleware = requireRole("RESTAURANT");
    middleware({ user: { role: "CUSTOMER" } } as Request, {} as Response, next as NextFunction);
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(403);
  });

  it("maintains original request on success", () => {
    const req = { user: { role: "RESTAURANT", id: "user-1" } } as Request;
    const next = vi.fn();
    requireRole("RESTAURANT")(req, {} as Response, next as NextFunction);
    expect(req.user?.id).toBe("user-1");
  });

  it("supports chained middleware usage", () => {
    const sequence: string[] = [];
    const first = (req: Request, _res: Response, next: NextFunction) => {
      sequence.push("first");
      next();
    };
    const second = requireRole("CUSTOMER");
    const third = (_req: Request, _res: Response, next: NextFunction) => {
      sequence.push("third");
      next();
    };
    const req = { user: { role: "CUSTOMER" } } as Request;
    const res = {} as Response;
    const final = vi.fn();

    first(req, res, () => second(req, res, () => third(req, res, final as NextFunction)));

    expect(sequence).toEqual(["first", "third"]);
    expect(final).toHaveBeenCalled();
  });
});
