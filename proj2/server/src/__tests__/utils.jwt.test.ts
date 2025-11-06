import jwt from "jsonwebtoken";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cookieOptions, signSession, verifySession } from "../utils/jwt";

describe("utils/jwt", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("signs and verifies a session payload", () => {
    const token = signSession({ userId: "abc", role: "CUSTOMER" });
    const payload = verifySession(token);
    expect(payload).toMatchObject({ userId: "abc", role: "CUSTOMER" });
  });

  it("produces tokens that expire within the configured window", () => {
    const now = Date.now();
    vi.setSystemTime(now);
    const token = signSession({ userId: "abc", role: "CUSTOMER" });
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    expect(decoded.exp).toBeDefined();
    expect((decoded.exp ?? 0) * 1000).toBeGreaterThan(now);
    expect((decoded.exp ?? 0) * 1000).toBeLessThan(now + 8 * 24 * 60 * 60 * 1000);
  });

  it("throws when verifying a tampered token", () => {
    const token = signSession({ userId: "abc", role: "CUSTOMER" });
    const parts = token.split(".");
    parts[1] = Buffer.from(JSON.stringify({ userId: "abc", role: "CUSTOMER" })).toString("base64url");
    const tampered = parts.join(".");
    expect(() => verifySession(tampered)).toThrow();
  });

  it("throws when verifying random garbage", () => {
    expect(() => verifySession("not-a-jwt")).toThrow();
  });

  it("exposes secure cookie defaults in non-production", () => {
    expect(cookieOptions.secure).toBe(false);
    expect(cookieOptions.httpOnly).toBe(true);
  });

  it("enables secure cookies in production env", async () => {
    vi.resetModules();
    vi.doMock("../env", () => ({
      env: {
        NODE_ENV: "production",
        PORT: 4000,
        JWT_SECRET: "prod-secret-1234567890",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/routedash"
      }
    }));

    const module = await import("../utils/jwt");
    expect(module.cookieOptions.secure).toBe(true);
    vi.doUnmock("../env");
    vi.resetModules();
  });

  it("includes the default max age of 7 days", () => {
    expect(cookieOptions.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("generates unique tokens for the same payload at different times", () => {
    const first = signSession({ userId: "abc", role: "CUSTOMER" });
    vi.setSystemTime(Date.now() + 1000);
    const second = signSession({ userId: "abc", role: "CUSTOMER" });
    expect(first).not.toEqual(second);
  });
});
