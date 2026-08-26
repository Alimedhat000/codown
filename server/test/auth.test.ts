import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@/server'; // This imports the express app without starting the server

function extractCookies(rawCookies: string[] | string | undefined): string {
  if (!rawCookies) return '';
  const cookiesArray = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
  return cookiesArray.map(entry => entry.split(';')[0]).join('; ');
}

describe('Auth Routes', () => {
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

  it('should normalize email case on register and allow lowercase login', async () => {
    const register = await request(app).post('/api/auth/register').send({
      email: 'MixedCase@Test.DEV',
      username: 'mixedcase',
      password: 'secure123',
    });

    expect(register.status).toBe(StatusCodes.CREATED);

    const res = await request(app).post('/api/auth/login').send({
      email: 'mixedcase@test.dev',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.user.email).toBe('mixedcase@test.dev');
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
      accessToken: expect.any(String),
      user: {
        id: expect.any(String),
        username: 'tester',
        email: 'test@test.dev',
      },
    });
  });

  it('should not leak which field collided when registration fails (#83)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'enum-email@test.dev',
      username: 'enumuser',
      password: 'secure123',
    });

    const dupEmail = await request(app).post('/api/auth/register').send({
      email: 'enum-email@test.dev',
      username: 'unusedname',
      password: 'secure123',
    });

    const dupUsername = await request(app).post('/api/auth/register').send({
      email: 'unused@test.dev',
      username: 'enumuser',
      password: 'secure123',
    });

    expect(dupEmail.status).toBe(StatusCodes.CONFLICT);
    expect(dupUsername.status).toBe(StatusCodes.CONFLICT);
    // Uniform response regardless of which field collided
    expect(dupEmail.body).toEqual(dupUsername.body);
    expect(typeof dupEmail.body.error).toBe('string');
    expect(dupEmail.body.error).not.toMatch(/email/i);
    expect(dupEmail.body.error).not.toMatch(/username/i);
    expect(dupEmail.body.error).not.toMatch(/exists/i);
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

  it('should not distinguish unknown user from invalid password on login (#83)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'loginenum@test.dev',
      username: 'loginenum',
      password: 'secure123',
    });

    const badPassword = await request(app).post('/api/auth/login').send({
      email: 'loginenum@test.dev',
      password: 'wrongpass',
    });

    const unknownUser = await request(app).post('/api/auth/login').send({
      email: 'ghost@test.dev',
      password: 'anypassword',
    });

    expect(badPassword.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(unknownUser.status).toBe(StatusCodes.UNAUTHORIZED);
    // Identical responses so probing cannot tell whether the account exists
    expect(unknownUser.body).toEqual(badPassword.body);
    // And the response carries an actual message (not the legacy empty `{}`)
    expect(typeof unknownUser.body.error).toBe('string');
    expect(unknownUser.body.error.length).toBeGreaterThan(0);
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

  it('should reject registration with a 6-character password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'shortpass@test.dev',
      username: 'shortpass',
      password: 'abcdef',
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should reject registration with a username containing spaces', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'spaceuser@test.dev',
      username: 'bad name',
      password: 'secure123',
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

    const token = loginRes.body.accessToken;
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader)
      .set('Authorization', `Bearer ${token}`);

    expect(logoutRes.status).toBe(StatusCodes.OK);
  });

  it('should logout with only the refresh cookie when no access token is sent', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'cookie-logout@test.dev',
      username: 'cookieLogoutUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'cookie-logout@test.dev',
      password: 'secure123',
    });
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookieHeader);

    expect(logoutRes.status).toBe(StatusCodes.OK);

    const refreshRes = await request(app).post('/api/auth/refresh').set('Cookie', cookieHeader);
    expect(refreshRes.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should return 401 when accessing protected route without token', async () => {
    const res = await request(app).get('/api/user');
    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should access protected route with valid token', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'me@test.dev',
      username: 'meUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'me@test.dev',
      password: 'secure123',
    });

    const token = loginRes.body.token || loginRes.body.accessToken;

    const res = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(StatusCodes.OK);
    expect(res.body.email).toBe('me@test.dev');
  });

  it('should reject refresh with invalid refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh').set('Cookie', 'refreshToken=invalid.token.here');

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('should not set an accessToken cookie on refresh', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'refresh@test.dev',
      username: 'refreshUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'refresh@test.dev',
      password: 'secure123',
    });
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookieHeader);

    expect(res.status).toBe(StatusCodes.OK);
    const cookies = res.headers['set-cookie'] ?? [];
    const names = (Array.isArray(cookies) ? cookies : [cookies]).map(c => c.split('=')[0]);
    expect(names).not.toContain('accessToken');
  });
});
