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
    res.status(StatusCodes.CONFLICT).json({ error: result.error });
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

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  res.status(StatusCodes.OK).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  });
});
