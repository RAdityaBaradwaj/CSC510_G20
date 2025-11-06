import type { Request, Response, NextFunction } from "express";
import { describe, expect, it, vi } from "vitest";

import { HttpError } from "../errors/HttpError";
import { ensureRestaurantOwnership } from "../middleware/ownership";

const run = (req: Partial<Request>) => {
  const next = vi.fn();
  ensureRestaurantOwnership(req as Request, {} as Response, next as NextFunction);
  return next;
};

describe("middleware/ownership", () => {
  it("passes when user owns the restaurant", () => {
    const next = run({
      user: { restaurantId: "rest-1" } as any,
      params: { restaurantId: "rest-1" } as any,
    });
    expect(next).toHaveBeenCalledWith();
  });

  it("blocks access when user has no restaurant id", () => {
    const next = run({
      user: { restaurantId: undefined } as any,
      params: { restaurantId: "rest-1" } as any,
    });
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0] as HttpError;
    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(403);
  });

  it("blocks access when restaurant ids do not match", () => {
    const next = run({
      user: { restaurantId: "rest-2" } as any,
      params: { restaurantId: "rest-1" } as any,
    });
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.message).toMatch(/do not have access/);
  });

  it("blocks when request has no user object", () => {
    const next = run({
      params: { restaurantId: "rest-1" } as any,
    });
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(403);
  });

  it("blocks when request is missing params", () => {
    const next = run({
      user: { restaurantId: "rest-1" } as any,
      params: {} as any,
    });
    const error = next.mock.calls[0][0] as HttpError;
    expect(error.status).toBe(403);
  });

  it("propagates HttpError instances without wrapping", () => {
    const next = vi.fn();
    const error = new HttpError(403, "Access denied");
    next.mockImplementationOnce(() => {
      throw error;
    });

    expect(() =>
      ensureRestaurantOwnership(
        {
          user: { restaurantId: "rest-1" },
          params: { restaurantId: "rest-2" },
        } as unknown as Request,
        {} as Response,
        next as NextFunction,
      ),
    ).toThrow(error);
  });
});
