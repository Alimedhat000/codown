import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '@/server';

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

  it('should login with valid credentials', async () => {
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
    expect(res.body).toHaveProperty('token');
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
      password: '123', // too short
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'newuser@test.dev',
      // missing username & password
    });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });
});
