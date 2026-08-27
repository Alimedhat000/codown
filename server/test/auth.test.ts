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

  it('should clear refreshToken cookie with matching attributes on logout', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'clear-attrs@test.dev',
      username: 'clearAttrsUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'clear-attrs@test.dev',
      password: 'secure123',
    });
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookieHeader);

    expect(logoutRes.status).toBe(StatusCodes.OK);
    const setCookies = (logoutRes.headers['set-cookie'] ?? []) as string[];
    const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies];
    // Express clearCookie sets `name=; Path=/; Expires=Thu, 01 Jan 1970 ...`
    const refreshClear = cookiesArray.find(c => c.startsWith('refreshToken=;'));
    expect(refreshClear).toBeDefined();
    // Must mirror login attributes or browsers (prod SameSite=None; Secure) won't clear
    expect(refreshClear).toContain('Path=/');
    expect(refreshClear).toContain('HttpOnly');
    expect(refreshClear).toContain('SameSite=Lax');
    expect(refreshClear).not.toContain('Secure');
    expect(refreshClear).toMatch(/Expires=Thu, 01 Jan 1970|Max-Age=0/);
  });

  it('should clear both refreshToken and legacy accessToken cookies on logout', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'clear-both@test.dev',
      username: 'clearBothUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'clear-both@test.dev',
      password: 'secure123',
    });
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookieHeader);

    expect(logoutRes.status).toBe(StatusCodes.OK);
    const setCookies = (logoutRes.headers['set-cookie'] ?? []) as string[];
    const cookiesArray = Array.isArray(setCookies) ? setCookies : [setCookies];
    const names = cookiesArray.map(c => c.split('=')[0]);
    expect(names).toContain('refreshToken');
    expect(names).toContain('accessToken');
    // Both clearing cookies must carry the same path/sameSite so they actually overwrite
    for (const c of cookiesArray) {
      if (c.startsWith('refreshToken=;') || c.startsWith('accessToken=;')) {
        expect(c).toContain('Path=/');
        expect(c).toContain('SameSite=Lax');
      }
    }
  });

  it('should not allow refresh with the old cookie after logout', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'refresh-after-logout@test.dev',
      username: 'refreshAfterLogoutUser',
      password: 'secure123',
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'refresh-after-logout@test.dev',
      password: 'secure123',
    });
    const cookieHeader = extractCookies(loginRes.headers['set-cookie']);

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookieHeader);
    expect(logoutRes.status).toBe(StatusCodes.OK);

    // Even though the client still holds the old cookie string, the server has
    // nulled the stored refreshToken and the browser should have received a
    // clearing Set-Cookie (verified above). Replaying the old cookie must fail.
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

  it('should set the refresh cookie without Secure/SameSite=None outside production', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'cookie-flags@test.dev',
      username: 'cookieFlagsUser',
      password: 'secure123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'cookie-flags@test.dev',
      password: 'secure123',
    });

    expect(res.status).toBe(StatusCodes.OK);
    const setCookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : [res.headers['set-cookie'] ?? ''];
    const refreshCookie = setCookies.find(c => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).not.toContain('Secure');
    expect(refreshCookie).toContain('SameSite=Lax');
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
