import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@/server';

function extractCookies(raw: string[] | string | undefined): string {
  if (!raw) return '';
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(c => c.split(';')[0]).join('; ');
}

describe('Session hardening — multi-device (#51.1)', () => {
  it('should keep first device valid after second login (no single-column overwrite)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'multi@test.dev',
      username: 'multiUser',
      password: 'secure123',
    });

    const login1 = await request(app).post('/api/auth/login').send({
      email: 'multi@test.dev',
      password: 'secure123',
    });
    expect(login1.status).toBe(StatusCodes.OK);
    const cookie1 = extractCookies(login1.headers['set-cookie']);

    // Second login simulates another device
    const login2 = await request(app).post('/api/auth/login').send({
      email: 'multi@test.dev',
      password: 'secure123',
    });
    expect(login2.status).toBe(StatusCodes.OK);
    const cookie2 = extractCookies(login2.headers['set-cookie']);

    expect(cookie1).not.toBe(cookie2);

    // Both cookies must still refresh independently
    const refresh1 = await request(app).post('/api/auth/refresh').set('Cookie', cookie1);
    expect(refresh1.status).toBe(StatusCodes.OK);

    const refresh2 = await request(app).post('/api/auth/refresh').set('Cookie', cookie2);
    expect(refresh2.status).toBe(StatusCodes.OK);
  });

  it('should only revoke the presented session on logout, leaving other device', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'multilogout@test.dev',
      username: 'multiLogout',
      password: 'secure123',
    });

    const login1 = await request(app).post('/api/auth/login').send({
      email: 'multilogout@test.dev',
      password: 'secure123',
    });
    const cookie1 = extractCookies(login1.headers['set-cookie']);

    const login2 = await request(app).post('/api/auth/login').send({
      email: 'multilogout@test.dev',
      password: 'secure123',
    });
    const cookie2 = extractCookies(login2.headers['set-cookie']);

    // Logout with first device
    const logout1 = await request(app).post('/api/auth/logout').set('Cookie', cookie1);
    expect(logout1.status).toBe(StatusCodes.OK);

    // First device must no longer refresh
    const refresh1After = await request(app).post('/api/auth/refresh').set('Cookie', cookie1);
    expect(refresh1After.status).toBe(StatusCodes.UNAUTHORIZED);

    // Second device must still refresh
    const refresh2After = await request(app).post('/api/auth/refresh').set('Cookie', cookie2);
    expect(refresh2After.status).toBe(StatusCodes.OK);
  });
});
