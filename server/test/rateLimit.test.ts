import express from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createAuthRateLimiter } from '@/middlewares/rate-limit.middleware';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  // The shared limiter skips outside production (vitest runs with NODE_ENV=test),
  // so the tests force it on via the factory's overrides.
  app.post('/login', createAuthRateLimiter({ limit: 3, windowMs: 60_000, skip: () => false }), (_req, res) => {
    res.status(StatusCodes.OK).json({ ok: true });
  });
  return app;
};

describe('auth rate limiter', () => {
  it('allows requests up to the limit and returns 429 afterwards', async () => {
    const app = buildApp();

    for (let i = 0; i < 3; i++) {
      const res = await request(app).post('/login');
      expect(res.status).toBe(StatusCodes.OK);
    }

    const limited = await request(app).post('/login');
    expect(limited.status).toBe(StatusCodes.TOO_MANY_REQUESTS);
    expect(limited.body).toEqual({ error: 'Too many requests, please try again later.' });
  });

  it('sets the standard RateLimit header', async () => {
    const res = await request(buildApp()).post('/login');

    expect(res.headers['ratelimit']).toBeDefined();
    expect(res.headers['ratelimit-policy']).toBeDefined();
  });
});
