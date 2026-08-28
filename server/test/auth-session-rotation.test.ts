import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@/server';

function extractCookies(raw: string[] | string | undefined): string {
  if (!raw) return '';
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(c => c.split(';')[0]).join('; ');
}

function getRefreshCookie(setCookie: string[] | string | undefined): string | undefined {
  if (!setCookie) return undefined;
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  return arr.find(c => c.startsWith('refreshToken='));
}

describe('Session hardening — refresh rotation (#51.1)', () => {
  it('should rotate refresh token on refresh and invalidate the old one', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'rotate@test.dev',
      username: 'rotater',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'rotate@test.dev',
      password: 'secure123',
    });
    expect(loginRes.status).toBe(StatusCodes.OK);
    const firstCookie = getRefreshCookie(loginRes.headers['set-cookie']);
    expect(firstCookie).toBeDefined();

    const firstCookieHeader = extractCookies(loginRes.headers['set-cookie']);

    // First refresh — should issue a new refreshToken cookie
    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', firstCookieHeader);

    expect(refreshRes.status).toBe(StatusCodes.OK);
    const secondCookie = getRefreshCookie(refreshRes.headers['set-cookie']);
    // This is the RED assertion: new implementation must set a new refresh cookie
    expect(secondCookie).toBeDefined();
    expect(secondCookie).not.toBe(firstCookie);

    // Old token must no longer work
    const replayOld = await request(app).post('/api/auth/refresh').set('Cookie', firstCookieHeader);
    expect(replayOld.status).toBe(StatusCodes.UNAUTHORIZED);

    // New token must work
    const secondCookieHeader = extractCookies(refreshRes.headers['set-cookie']);
    const refreshWithNew = await request(app).post('/api/auth/refresh').set('Cookie', secondCookieHeader);
    expect(refreshWithNew.status).toBe(StatusCodes.OK);
  });
});
