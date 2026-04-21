import { Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const getUser = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;

  logger.debug('Get user profile', {
    action: 'GET_USER',
    userId,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    logger.warn('Get user failed - user not found', {
      action: 'GET_USER_NOT_FOUND',
      userId,
    });
    res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
    return;
  }

  res.status(StatusCodes.OK).json(user);
});
