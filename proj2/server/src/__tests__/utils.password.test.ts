import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";

import { hashPassword, verifyPassword } from "../utils/password";

describe("utils/password", () => {
  it("hashes passwords with bcrypt", async () => {
    const spy = vi.spyOn(bcrypt, "hash");
    await hashPassword("super-secret");
    expect(spy).toHaveBeenCalledWith("super-secret", 10);
    spy.mockRestore();
  });

  it("creates hashes that do not equal the original password", async () => {
    const hash = await hashPassword("another-secret");
    expect(hash).not.toEqual("another-secret");
  });

  it("verifies matching passwords successfully", async () => {
    const password = "route-dash-rocks";
    const hash = await hashPassword(password);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it("rejects non-matching passwords", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
