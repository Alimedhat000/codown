import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { app } from '@/server';

function extractCookies(raw: string[] | string | undefined): string {
  if (!raw) return '';
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map(c => c.split(';')[0]).join('; ');
}

describe('Session hardening — isActive enforcement (#51.2)', () => {
  it('should reject login when user is deactivated', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'inactive-login@test.dev',
      username: 'inactiveLogin',
      password: 'secure123',
    });

    // deactivate
    await prisma.user.update({
      where: { email: 'inactive-login@test.dev' },
      data: { isActive: false },
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'inactive-login@test.dev',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should reject refresh when user is deactivated', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'inactive-refresh@test.dev',
      username: 'inactiveRefresh',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'inactive-refresh@test.dev',
      password: 'secure123',
    });
    expect(loginRes.status).toBe(StatusCodes.OK);
    const cookie = extractCookies(loginRes.headers['set-cookie']);

    await prisma.user.update({
      where: { email: 'inactive-refresh@test.dev' },
      data: { isActive: false },
    });

    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(refreshRes.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should reject protected route when user is deactivated (authenticate middleware)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'inactive-auth@test.dev',
      username: 'inactiveAuth',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'inactive-auth@test.dev',
      password: 'secure123',
    });
    const token = loginRes.body.accessToken;
    expect(token).toBeDefined();

    await prisma.user.update({
      where: { email: 'inactive-auth@test.dev' },
      data: { isActive: false },
    });

    const protectedRes = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

    expect(protectedRes.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});
