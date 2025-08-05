import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { getClientInfo } from '@/utils/getClientInfo';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

export const registerUser = asyncErrorWrapper(async (req: Request, res: Response) => {
  const clientInfo = getClientInfo(req);

  logger.info('User registration attempt', {
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
      res.status(StatusCodes.CONFLICT).json({ error: 'Username or email already exists' });
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

    logger.info('User registered successfully', {
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

  logger.info('User login attempt', {
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

    if (!user) {
      logger.warn('Login failed - user not found', {
        action: 'LOGIN_USER_NOT_FOUND',
        ...clientInfo,
        email,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: result.error });
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

      res.status(StatusCodes.UNAUTHORIZED).json({ error: result.error });
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

    // Generate Access Token with a short expiration time
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: '24h',
      }
    );

    // update user with referesh token
    await prisma.user.update({
      where: { email },
      data: { refreshToken },
    });

    logger.info('User logged in successfully', {
      action: 'LOGIN_SUCCESS',
      ...clientInfo,
      userId: user.id,
      email,
      username: user.username,
      tokenExpiry: '15m',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Ensure the cookie cannot be accessed via JavaScript (security against XSS attacks)
      maxAge: 24 * 60 * 60 * 1000, // 24hrs
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
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

  logger.info('User logout attempt', {
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
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    logger.info('User logged out successfully', {
      action: 'LOGOUT_SUCCESS',
      ...clientInfo,
      userId,
    });

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
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

  logger.info('Token refresh attempt', {
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
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn('Token refresh failed - token mismatch or user not found', {
        action: 'REFRESH_TOKEN_MISMATCH',
        ...clientInfo,
        userId: payload.userId,
        userExists: !!user,
        tokenMatches: user?.refreshToken === refreshToken,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    logger.info('Token refreshed successfully', {
      action: 'REFRESH_TOKEN_SUCCESS',
      ...clientInfo,
      userId: user.id,
      username: user.username,
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
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
