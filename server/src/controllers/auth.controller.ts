import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { getClientInfo } from '@/utils/getClientInfo';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

/**
 * Fixed bcrypt hash used to equalize timing when login is attempted for an
 * unknown email (#83): one bcrypt compare runs in both failure paths.
 */
const DUMMY_PASSWORD_HASH = '$2b$10$lZKU2EGQLmnz9Fi65/t3GO/coz9zBl6zMMvDyd0EOBgeU1Y28ESHG';

export const registerUser = asyncErrorWrapper(async (req: Request, res: Response) => {
  const clientInfo = getClientInfo(req);

  logger.debug('User registration attempt', {
    action: 'REGISTER_ATTEMPT',
    ...clientInfo,
    email: req.body.email,
    username: req.body.username,
  });

  const result = RegisterUserSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn('Registration failed - validation error', {
      action: 'REGISTER_VALIDATION_FAILED',
      ...clientInfo,
      errors: result.error.errors,
      email: req.body.email,
    });
    res.status(StatusCodes.BAD_REQUEST).json({ error: result.error });
    return;
  }

  const { email, username, password, fullName } = result.data;

  try {
    // check if there's user OR email matches
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      logger.warn('Registration failed - user already exists', {
        action: 'REGISTER_USER_EXISTS',
        ...clientInfo,
        email,
        username,
        existingField: existing.email === email ? 'email' : 'username',
      });
      res.status(StatusCodes.CONFLICT).json({ error: 'Registration failed' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashed,
        fullName,
      },
    });

    logger.debug('User registered successfully', {
      action: 'REGISTER_SUCCESS',
      ...clientInfo,
      userId: newUser.id,
      email,
      username,
    });

    res.status(StatusCodes.CREATED).json({ message: 'User Created' });
  } catch (error) {
    logger.error('Registration failed - database error', {
      action: 'REGISTER_DB_ERROR',
      ...clientInfo,
      email,
      username,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error; // Let asyncErrorWrapper handle it
  }
});

export const loginUser = asyncErrorWrapper(async (req: Request, res: Response) => {
  const clientInfo = getClientInfo(req);

  logger.debug('User login attempt', {
    action: 'LOGIN_ATTEMPT',
    ...clientInfo,
    email: req.body.email,
  });

  const result = LoginUserSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn('Login failed - validation error', {
      action: 'LOGIN_VALIDATION_FAILED',
      ...clientInfo,
      errors: result.error.errors,
      email: req.body.email,
    });

    res.status(StatusCodes.BAD_REQUEST).json({ error: result.error });
    return;
  }

  const { email, password } = result.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isActive === false) {
      logger.warn('Login failed - user deactivated', {
        action: 'LOGIN_USER_INACTIVE',
        ...clientInfo,
        userId: user.id,
        email,
      });
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email or password' });
      return;
    }

    if (!user) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);

      logger.warn('Login failed - user not found', {
        action: 'LOGIN_USER_NOT_FOUND',
        ...clientInfo,
        email,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      logger.warn('Login failed - invalid password', {
        action: 'LOGIN_INVALID_PASSWORD',
        ...clientInfo,
        userId: user.id,
        email,
        username: user.username,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate Access Token with a short expiration time
    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: '15m',
      }
    );

    // Generate refresh token with jti for rotation / reuse detection
    const jti = crypto.randomUUID();
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        jti,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '24h',
      }
    );

    // Create a new session for this device; do not overwrite other sessions
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        jti,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    // Keep legacy column in sync for any external read (not used for auth)
    await prisma.user.update({
      where: { email },
      data: { refreshToken },
    });

    logger.debug('User logged in successfully', {
      action: 'LOGIN_SUCCESS',
      ...clientInfo,
      userId: user.id,
      email,
      username: user.username,
      tokenExpiry: '15m',
    });

    // Production uses cross-site cookies, which require SameSite=None + Secure.
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    });

    res.status(StatusCodes.OK).json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Login failed - database error', {
      action: 'LOGIN_DB_ERROR',
      ...clientInfo,
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const logoutUser = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;

  logger.debug('User logout attempt', {
    action: 'LOGOUT_ATTEMPT',
    ...clientInfo,
    userId,
  });

  if (!userId) {
    logger.warn('Logout failed - no user session', {
      action: 'LOGOUT_NO_SESSION',
      ...clientInfo,
    });

    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const presented = req.cookies?.refreshToken as string | undefined;
    if (presented) {
      try {
        const dec = jwt.verify(presented, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload & { jti?: string };
        if (dec.jti) {
          await prisma.session.deleteMany({ where: { jti: dec.jti, userId } });
        } else {
          await prisma.session.deleteMany({ where: { refreshToken: presented, userId } });
        }
      } catch {
        await prisma.session.deleteMany({ where: { refreshToken: presented, userId } });
      }
    } else {
      // Fallback: clear all sessions for user if no token presented (e.g. legacy)
      await prisma.session.deleteMany({ where: { userId } });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.debug('User logged out successfully', {
      action: 'LOGOUT_SUCCESS',
      ...clientInfo,
      userId,
    });

    // Must match the attributes used when setting the cookie, otherwise
    // browsers keep the SameSite=None; Secure cookie (prod) alive and a
    // subsequent refresh still succeeds after logout.
    const isProduction = process.env.NODE_ENV === 'production';
    const clearOpts = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };
    res.clearCookie('refreshToken', clearOpts);
    res.clearCookie('accessToken', clearOpts);
    res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout failed - database error', {
      action: 'LOGOUT_DB_ERROR',
      ...clientInfo,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const refreshToken = asyncErrorWrapper(async (req: Request, res: Response) => {
  const clientInfo = getClientInfo(req);
  const refreshToken = req.cookies.refreshToken;

  logger.debug('Token refresh attempt', {
    action: 'REFRESH_TOKEN_ATTEMPT',
    ...clientInfo,
    hasRefreshToken: !!refreshToken,
  });

  if (!refreshToken) {
    logger.warn('Token refresh failed - missing token', {
      action: 'REFRESH_TOKEN_MISSING',
      ...clientInfo,
    });

    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing refresh token' });
    return;
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as jwt.JwtPayload;
  } catch (error) {
    logger.warn('Token refresh failed - invalid token', {
      action: 'REFRESH_TOKEN_INVALID',
      ...clientInfo,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
    return;
  }
  try {
    const payloadWithJti = payload as jwt.JwtPayload & { jti?: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      logger.warn('Token refresh failed - token mismatch or user not found', {
        action: 'REFRESH_TOKEN_MISMATCH',
        ...clientInfo,
        userId: payload.userId,
        userExists: false,
        tokenMatches: false,
      });
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
      return;
    }

    // isActive enforcement — deactivated accounts cannot refresh
    if (user.isActive === false) {
      logger.warn('Token refresh failed - user deactivated', {
        action: 'REFRESH_TOKEN_USER_INACTIVE',
        ...clientInfo,
        userId: user.id,
      });
      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
      return;
    }

    // Prefer Session lookup by jti (new tokens); fallback to legacy column for old tokens
    let session: Awaited<ReturnType<typeof prisma.session.findUnique>> | null = null;
    if (payloadWithJti.jti) {
      session = await prisma.session.findUnique({ where: { jti: payloadWithJti.jti } });

      // Reuse detection: valid JWT for user but no matching session → token was already rotated/revoked
      if (!session || session.refreshToken !== refreshToken || session.userId !== payload.userId) {
        logger.warn('Token refresh failed - token reuse detected', {
          action: 'REFRESH_TOKEN_REUSE',
          ...clientInfo,
          userId: payload.userId,
          jti: payloadWithJti.jti,
        });
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
        return;
      }

      if (session.expiresAt < new Date()) {
        logger.warn('Token refresh failed - session expired', {
          action: 'REFRESH_TOKEN_EXPIRED',
          ...clientInfo,
          userId: payload.userId,
        });
        await prisma.session.delete({ where: { id: session.id } });
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
        return;
      }
    } else {
      // Legacy token without jti — fall back to single-column check
      if (user.refreshToken !== refreshToken) {
        logger.warn('Token refresh failed - token mismatch or user not found', {
          action: 'REFRESH_TOKEN_MISMATCH',
          ...clientInfo,
          userId: payload.userId,
          userExists: true,
          tokenMatches: false,
        });
        res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
        return;
      }
      // Migrate legacy: create a session for this token so future rotates work
      session = await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          jti: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
    }

    // Rotate: new jti + new refresh token, update same session row
    const newJti = crypto.randomUUID();
    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        jti: newJti,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '24h' }
    );

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        jti: newJti,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    // Keep legacy column in sync (not used for auth, but for observability)
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    logger.debug('Token refreshed successfully', {
      action: 'REFRESH_TOKEN_SUCCESS',
      ...clientInfo,
      userId: user.id,
      username: user.username,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
    });

    res.status(StatusCodes.OK).json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error('Token refresh failed - database error', {
      action: 'REFRESH_TOKEN_DB_ERROR',
      ...clientInfo,
      userId: payload?.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});
