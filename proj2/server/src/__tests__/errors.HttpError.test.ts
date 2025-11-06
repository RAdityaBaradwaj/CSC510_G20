import { describe, expect, it } from 'vitest';

import { HttpError } from '../errors/HttpError';

describe('HttpError', () => {
  it('sets status and message', () => {
    const error = new HttpError(418, "I'm a teapot");
    expect(error.status).toBe(418);
    expect(error.message).toBe("I'm a teapot");
  });

  it('preserves stack traces via Error superclass', () => {
    const error = new HttpError(500, 'Boom');
    expect(error.stack).toBeDefined();
    expect(error).toBeInstanceOf(Error);
  });
});
