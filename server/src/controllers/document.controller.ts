import { Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { prisma } from '@/lib/prisma';

export const createDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { title, content = '', isPublic = false } = req.body;

  const newDoc = await prisma.document.create({
    data: {
      title,
      content,
      isPublic,
      authorId: req.user?.userId,
    },
  });
  res.status(StatusCodes.CREATED).json(newDoc);
});

export const getDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const doc = await prisma.document.findUnique({
    where: { id: req.params.id },
  });

  if (!doc || doc.authorId !== req.user?.userId) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
    return;
  }

  res.status(StatusCodes.OK).json(doc);
});

export const getDocs = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const docs = await prisma.document.findMany({
    where: { authorId: req.user.userId },
    orderBy: { updatedAt: 'desc' },
  });
  res.status(StatusCodes.OK).json(docs);
});

export const updateDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, isPublic } = req.body;

  const doc = await prisma.document.update({
    where: { id: req.params.id },
    data: {
      title,
      content,
      isPublic,
    },
  });

  res.status(StatusCodes.OK).json(doc);
});

export const deleteDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  await prisma.document.delete({
    where: { id: req.params.id },
  });

  res.status(StatusCodes.NO_CONTENT).send();
});
