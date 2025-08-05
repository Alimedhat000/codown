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
  const doc = await prisma.document.findFirst({
    where: {
      id: req.params.id,
    },
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

  const doc = await prisma.document.findFirst({
    where: {
      id: req.params.id,
    },
  });

  if (!doc || doc.authorId !== req.user?.userId) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
    return;
  }

  const updatedDoc = await prisma.document.update({
    where: { id: doc.id },
    data: { title, content, isPublic },
  });

  res.status(StatusCodes.OK).json(updatedDoc);
});

export const deleteDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const doc = await prisma.document.findFirst({
    where: {
      id: req.params.id,
    },
  });

  if (!doc || doc.authorId !== req.user?.userId) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
    return;
  }

  await prisma.document.delete({
    where: { id: doc.id },
  });

  res.status(StatusCodes.NO_CONTENT).send();
});

export const updateDocSettings = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { allowSelfJoin } = req.body;

  const userId = req.user?.userId;
  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== userId) {
    res.status(StatusCodes.FORBIDDEN).json({ error: 'Unauthorized' });
    return;
  }

  const updated = await prisma.document.update({
    where: { id },
    data: {
      allowSelfJoin,
    },
  });

  res.json({ updated });
});

export const getDocByShareId = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { shareId } = req.params;
  const userId = req.user?.userId;

  if (!shareId) {
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing shareId in URL' });
    return;
  }
  const doc = await prisma.document.findUnique({
    where: { shareId },
    include: { Collaborator: true },
  });

  if (!doc) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
    return;
  }

  const isAlreadyCollaborator = doc.Collaborator.some(c => c.userId === userId);

  if (isAlreadyCollaborator) {
    res.status(StatusCodes.OK).json(doc);
    return;
  }

  if (doc.allowSelfJoin) {
    // ! Permission is controlled via a query param which is insecure
    // ! Change this immediately
    const permission = req.query.perm === 'view' ? 'view' : 'edit';

    await prisma.collaborator.create({
      data: {
        documentId: doc.id,
        userId,
        permission,
      },
    });

    res.status(StatusCodes.OK).json(doc);
  } else {
    // Create a request instead
    const existingRequest = await prisma.collaborationRequest.findFirst({
      where: { documentId: doc.id, userId },
    });

    if (!existingRequest) {
      await prisma.collaborationRequest.create({
        data: { documentId: doc.id, userId },
      });
    }

    res.status(StatusCodes.ACCEPTED).json({ message: 'Request submitted. Waiting for approval.' });
  }
});

export const getRequests = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  const requests = await prisma.collaborationRequest.findMany({
    where: { documentId: id, status: 'pending' },
    include: { user: true },
  });

  res.json(requests);
});

export const approveRequest = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id, requestId } = req.params;
  const userId = req.user?.userId;

  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  const request = await prisma.collaborationRequest.findUnique({ where: { id: requestId } });

  if (!request || request.documentId !== id) {
    res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
    return;
  }

  //? Will leave it as edit for now
  await prisma.collaborator.create({
    data: { documentId: id, userId: request.userId, permission: 'edit' },
  });

  await prisma.collaborationRequest.update({
    where: { id: requestId },
    data: { status: 'accepted' },
  });

  res.json({ message: 'Approved' });
});

export const rejectRequest = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id, requestId } = req.params;
  const userId = req.user?.userId;

  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== userId) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  await prisma.collaborationRequest.update({ where: { id: requestId }, data: { status: 'rejected' } });

  res.json({ message: 'Rejected' });
});

export const getCollaborators = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  const collabs = await prisma.collaborator.findMany({
    where: { documentId: id },
    include: { user: true },
  });

  res.json(collabs);
});

export const addCollaborator = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { userId, permission } = req.body;
  const ownerid = req.user?.userId;

  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== ownerid) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  const collab = await prisma.collaborator.create({
    data: { documentId: id, userId, permission },
  });

  res.json(collab);
});

export const removeCollaborator = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const { id, userId } = req.params;
  const ownerid = req.user?.userId;

  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== ownerid) {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  await prisma.collaborator.deleteMany({
    where: { documentId: id, userId },
  });

  res.json({ message: 'Removed' });
});
