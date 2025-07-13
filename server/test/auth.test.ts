import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { app } from '@/server';

function extractCookies(rawCookies: string[] | string | undefined): string {
  if (!rawCookies) return '';
  const cookiesArray = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  return cookiesArray.map(entry => entry.split(';')[0]).join('; ');
}

describe('Auth Routes', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany(); // Reset database
  });

  it('should register a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.dev',
      username: 'tester',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.CREATED);
    expect(res.body.message).toBe('User Created');
  });

  it('should not register duplicate user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@test.dev',
      username: 'tester',
      password: 'secure123',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.dev',
      username: 'tester',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.CONFLICT);
  });

  it('should login with valid credentials and receive cookies', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@test.dev',
      username: 'tester',
      password: 'secure123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.dev',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.headers['set-cookie']).toBeDefined(); // cookies contain tokens
    expect(res.body).toMatchObject({
      id: expect.any(String),
      username: 'tester',
      email: 'test@test.dev',
    });
  });

  it('should reject login with invalid password', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@test.dev',
      username: 'tester',
      password: 'secure123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@test.dev',
      password: 'wrongpass',
    });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should reject login with non-existing email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'doesnotexist@test.dev',
      password: 'anypassword',
    });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should reject registration with invalid email format', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'invalid-email',
      username: 'tester',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@test.dev',
      username: 'newuser',
      password: '123',
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@test.dev',
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should logout and clear cookies', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'logout@test.dev',
      username: 'logoutUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'logout@test.dev',
      password: 'secure123',
    });

    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookieHeader);

    expect(logoutRes.status).toBe(StatusCodes.OK);
  });
});
