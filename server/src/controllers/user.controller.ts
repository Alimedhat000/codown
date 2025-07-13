import { Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '@/lib/prisma';

export const getUser = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
    return;
  }
  res.status(StatusCodes.OK).json(user);
});
