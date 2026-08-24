import { type Options, rateLimit } from 'express-rate-limit';

import { logger } from '@/lib/logger';

export const AUTH_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const AUTH_RATE_LIMIT_MAX = 10;

/**
 * Builds a rate limiter for the auth endpoints (register/login/refresh).
 *
 * @param overrides Partial express-rate-limit options; used by tests to shrink the window/limit.
 */
export const createAuthRateLimiter = (overrides: Partial<Options> = {}) =>
  rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
    limit: AUTH_RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // The limiter is a production safeguard only: in development/E2E the
    // Playwright suite performs many logins from one IP and would trip it.
    skip: () => process.env.NODE_ENV !== 'production',
    handler: (req, res, _next, options) => {
      logger.warn('Auth rate limit exceeded', {
        action: 'AUTH_RATE_LIMIT_EXCEEDED',
        ip: req.ip,
        path: req.originalUrl,
      });
      res.status(options.statusCode).json({ error: 'Too many requests, please try again later.' });
    },
    ...overrides,
  });

/** Shared limiter instance applied to the unauthenticated auth endpoints. */
export const authLimiter = createAuthRateLimiter();
