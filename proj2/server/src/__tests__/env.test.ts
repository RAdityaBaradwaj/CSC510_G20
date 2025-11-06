import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('env schema', () => {
  beforeEach(() => {
    vi.resetModules();
    Object.assign(process.env, ORIGINAL_ENV);
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    process.env.JWT_SECRET = 'test-secret-1234567890';
  });

  afterEach(() => {
    vi.resetModules();
    Object.assign(process.env, ORIGINAL_ENV);
  });

  it('defaults NODE_ENV to development and PORT to 4000', async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    const { env } = await import('../env');
    expect(env.NODE_ENV).toBe('development');
    expect(env.PORT).toBe(4000);
  });

  it('coerces a numeric PORT string into a number', async () => {
    process.env.PORT = '8123';
    const { env } = await import('../env');
    expect(env.PORT).toBe(8123);
  });

  it('propagates NODE_ENV when provided', async () => {
    process.env.NODE_ENV = 'production';
    const { env } = await import('../env');
    expect(env.NODE_ENV).toBe('production');
  });

  it('fails when JWT_SECRET is shorter than 16 characters', async () => {
    process.env.JWT_SECRET = 'short';
    await expect(import('../env')).rejects.toThrow(/JWT_SECRET must be at least 16 characters/);
  });

  it('fails when DATABASE_URL is not a valid URL', async () => {
    process.env.DATABASE_URL = 'not-a-url';
    await expect(import('../env')).rejects.toThrow(/Invalid url/);
  });
});
