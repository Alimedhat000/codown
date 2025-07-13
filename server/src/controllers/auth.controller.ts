import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';
import { LoginUserSchema } from '@/validations/login.schema';
import { RegisterUserSchema } from '@/validations/register.schema';

export const registerUser = asyncErrorWrapper(async (req: Request, res: Response) => {
  const result = RegisterUserSchema.safeParse(req.body);
  if (!result.success) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: result.error });
    return;
  }

  const { email, username, password, fullName } = result.data;

  // check if there's user OR email matches
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    res.status(StatusCodes.CONFLICT).json({ error: 'Username or email already exists' });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
      fullName,
    },
  });

  res.status(StatusCodes.CREATED).json({ message: 'User Created' });
});

export const loginUser = asyncErrorWrapper(async (req: Request, res: Response) => {
  const result = LoginUserSchema.safeParse(req.body);
  if (!result.success) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: result.error });
    return;
  }

  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: result.error });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
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

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Ensure the cookie cannot be accessed via JavaScript (security against XSS attacks)
    maxAge: 24 * 60 * 60 * 1000, // 24hrs
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15mins
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(StatusCodes.OK).json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

export const logoutUser = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }, // clear the refresh token from the db
    });
  }
  if (!userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
  res.status(StatusCodes.OK).json({ message: 'Logged out successfully' });
});

export const refreshToken = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const refereshToken = req.cookies.refreshToken;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user || !user.refreshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Refresh token not found' });
    return;
  }

  if (user.refreshToken !== refereshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid refresh token' });
    return;
  }

  const newAccessToken = jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
    }
  );

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15mins
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });

  res.status(StatusCodes.OK).json({ message: 'Token refreshed successfully' });
  return;
});
