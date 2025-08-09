import chalk from 'chalk';
import { Response } from 'express';
import asyncErrorWrapper from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';

import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { generateShareToken, verifyShareToken } from '@/lib/shareToken';
import { getClientInfo } from '@/utils/getClientInfo';

export const createDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;
  const { title, content = '', isPublic = false } = req.body;

  logger.info('Document creation attempt', {
    action: 'CREATE_DOCUMENT_ATTEMPT',
    ...clientInfo,
    userId,
    title,
    isPublic,
    contentLength: content.length,
  });

  try {
    const newDoc = await prisma.document.create({
      data: {
        title,
        content,
        isPublic,
        authorId: req.user?.userId,
      },
    });

    logger.info('Document created successfully', {
      action: 'CREATE_DOCUMENT_SUCCESS',
      ...clientInfo,
      userId,
      documentId: newDoc.id,
      title: newDoc.title,
      isPublic: newDoc.isPublic,
    });

    res.status(StatusCodes.CREATED).json(newDoc);
  } catch (error) {
    logger.error('Document creation failed', {
      action: 'CREATE_DOCUMENT_ERROR',
      ...clientInfo,
      userId,
      title,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const getDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;
  const documentId = req.params.id;

  logger.info('Document access attempt', {
    action: 'GET_DOCUMENT_ATTEMPT',
    ...clientInfo,
    userId,
    documentId,
  });

  try {
    const doc = await prisma.document.findFirst({
      where: { id: documentId },
      include: {
        Collaborator: {
          where: { userId },
          select: {
            userId: true,
            permission: true, // assuming you store 'view', 'edit', etc.
          },
        },
      },
    });

    const collaboratorEntry = doc?.Collaborator[0]; // because we filtered by userId

    const isOwner = doc?.authorId === userId;
    const isCollaborator = doc?.Collaborator.some(c => c.userId === userId);
    const permissionFromDB = isOwner ? 'owner' : (collaboratorEntry?.permission ?? 'none');

    if (!doc || (!isOwner && !isCollaborator)) {
      logger.warn('Document access denied', {
        action: 'GET_DOCUMENT_DENIED',
        ...clientInfo,
        userId,
        documentId,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }

    logger.info('Document accessed successfully', {
      action: 'GET_DOCUMENT_SUCCESS',
      ...clientInfo,
      userId,
      documentId,
      title: doc.title,
    });

    res.status(StatusCodes.OK).json({
      ...doc,
      access: {
        isOwner,
        isCollaborator: isCollaborator,
        permission: permissionFromDB,
      },
    });
  } catch (error) {
    logger.error('Document access failed', {
      action: 'GET_DOCUMENT_ERROR',
      ...clientInfo,
      userId,
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const getDocs = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;

  logger.info('Documents list request', {
    action: 'GET_DOCUMENTS_ATTEMPT',
    ...clientInfo,
    userId,
  });

  try {
    const ownedDocs = await prisma.document.findMany({
      where: { authorId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    const collaboratedDocs = await prisma.document.findMany({
      where: {
        Collaborator: {
          some: {
            userId,
          },
        },
        NOT: {
          authorId: userId, // exclude owned docs
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    logger.info('Documents list retrieved successfully', {
      action: 'GET_DOCUMENTS_SUCCESS',
      ...clientInfo,
      userId,
      ownedCount: ownedDocs.length,
      collaboratedCount: collaboratedDocs.length,
    });

    res.status(StatusCodes.OK).json({
      owned: ownedDocs,
      collaborated: collaboratedDocs,
    });
  } catch (error) {
    logger.error('Documents list retrieval failed', {
      action: 'GET_DOCUMENTS_ERROR',
      ...clientInfo,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const updateDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;
  const documentId = req.params.id;
  const { title, content, isPublic } = req.body;

  // logger.info('Document update attempt', {
  //   action: 'UPDATE_DOCUMENT_ATTEMPT',
  //   ...clientInfo,
  //   userId,
  //   documentId,
  //   title,
  //   isPublic,
  //   contentLength: content?.length,
  // });

  try {
    const doc = await prisma.document.findFirst({
      where: { id: documentId },
      include: { Collaborator: true },
    });

    const isOwner = doc?.authorId === userId;
    const isEditor = doc?.Collaborator.some(c => c.userId === userId && c.permission === 'edit');

    if (!doc || (!isOwner && !isEditor)) {
      // logger.warn('Document update denied', {
      //   action: 'UPDATE_DOCUMENT_DENIED',
      //   ...clientInfo,
      //   userId,
      //   documentId,
      //   documentExists: !!doc,
      //   isOwner: doc?.authorId === userId,
      // });

      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }

    const updatedDoc = await prisma.document.update({
      where: { id: doc.id },
      data: { title, content, isPublic },
    });

    // logger.info('Document updated successfully', {
    //   action: 'UPDATE_DOCUMENT_SUCCESS',
    //   ...clientInfo,
    //   userId,
    //   documentId,
    //   title: updatedDoc.title,
    //   isPublic: updatedDoc.isPublic,
    // });

    res.status(StatusCodes.OK).json(updatedDoc);
  } catch (error) {
    logger.error('Document update failed', {
      action: 'UPDATE_DOCUMENT_ERROR',
      ...clientInfo,
      userId,
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const deleteDoc = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;
  const documentId = req.params.id;

  logger.info('Document deletion attempt', {
    action: 'DELETE_DOCUMENT_ATTEMPT',
    ...clientInfo,
    userId,
    documentId,
  });

  try {
    const doc = await prisma.document.findFirst({
      where: { id: documentId },
    });

    if (!doc || doc.authorId !== userId) {
      logger.warn('Document deletion denied', {
        action: 'DELETE_DOCUMENT_DENIED',
        ...clientInfo,
        userId,
        documentId,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.NOT_FOUND).json({ error: 'Document not found' });
      return;
    }

    await prisma.document.delete({
      where: { id: doc.id },
    });

    logger.info('Document deleted successfully', {
      action: 'DELETE_DOCUMENT_SUCCESS',
      ...clientInfo,
      userId,
      documentId,
      title: doc.title,
    });

    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    logger.error('Document deletion failed', {
      action: 'DELETE_DOCUMENT_ERROR',
      ...clientInfo,
      userId,
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const updateDocSettings = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const id = req.params.id;
  const { allowSelfJoin } = req.body;
  const userId = req.user?.userId;

  logger.info('Update document settings attempt', {
    action: 'UPDATE_DOCUMENT_SETTINGS_ATTEMPT',
    ...clientInfo,
    userId,
    documentId: id,
    allowSelfJoin,
  });

  try {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.authorId !== userId) {
      logger.warn('Update document settings failed - unauthorized', {
        action: 'UPDATE_DOCUMENT_SETTINGS_UNAUTHORIZED',
        ...clientInfo,
        userId,
        documentId: id,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.FORBIDDEN).json({ error: 'Unauthorized' });
      return;
    }

    const updated = await prisma.document.update({
      where: { id },
      data: { allowSelfJoin },
    });

    logger.info('Document settings updated successfully', {
      action: 'UPDATE_DOCUMENT_SETTINGS_SUCCESS',
      ...clientInfo,
      userId,
      documentId: id,
      allowSelfJoin,
      title: updated.title,
    });

    res.json({ updated });
  } catch (error) {
    logger.error('Update document settings failed', {
      action: 'UPDATE_DOCUMENT_SETTINGS_ERROR',
      ...clientInfo,
      userId,
      documentId: id,
      allowSelfJoin,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const getDocByToken = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { token } = req.params; // Now getting token from URL params instead of query
  const userId = req.user?.userId;

  logger.info('Shared document access attempt', {
    action: 'ACCESS_SHARED_DOCUMENT_ATTEMPT',
    ...clientInfo,
    userId,
    hasToken: !!token,
  });

  if (!token || typeof token !== 'string') {
    logger.warn('Shared document access failed - invalid token format', {
      action: 'ACCESS_SHARED_DOCUMENT_INVALID_TOKEN_FORMAT',
      ...clientInfo,
      userId,
      tokenType: typeof token,
    });

    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing or invalid token' });
    return;
  }

  let decoded: { shareId: string; permission: 'view' | 'edit' };

  try {
    decoded = verifyShareToken(token);
    console.log(chalk.bold.red('DECODED'), decoded);
  } catch (error) {
    logger.warn('Shared document access failed - token verification failed', {
      action: 'ACCESS_SHARED_DOCUMENT_TOKEN_VERIFICATION_FAILED',
      ...clientInfo,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
    return;
  }

  const { shareId } = decoded; // Extract shareId from the decoded token

  try {
    const doc = await prisma.document.findUnique({
      where: { shareId },
      include: {
        Collaborator: {
          where: { userId },
          select: {
            userId: true,
            permission: true,
          },
        },
      },
    });

    if (!doc) {
      logger.warn('Shared document access failed - document not found', {
        action: 'ACCESS_SHARED_DOCUMENT_NOT_FOUND',
        ...clientInfo,
        userId,
        shareId,
      });

      res.status(StatusCodes.NOT_FOUND).json({ error: 'Not found' });
      return;
    }

    const collaboratorEntry = doc?.Collaborator[0];

    const isOwner = doc?.authorId === userId;
    const isCollaborator = doc?.Collaborator.some(c => c.userId === userId);
    const permissionFromDB = isOwner ? 'owner' : (collaboratorEntry?.permission ?? 'none');

    if (isCollaborator || isOwner) {
      logger.info('Shared document accessed - existing collaborator', {
        action: 'ACCESS_SHARED_DOCUMENT_EXISTING_COLLABORATOR',
        ...clientInfo,
        userId,
        shareId,
        documentId: doc.id,
        permission: decoded.permission,
      });

      res.status(StatusCodes.OK).json({
        ...doc,
        access: {
          isOwner,
          isCollaborator: isCollaborator,
          permission: permissionFromDB,
        },
      });
      return;
    }

    if (doc.allowSelfJoin) {
      await prisma.collaborator.create({
        data: {
          documentId: doc.id,
          userId,
          permission: decoded.permission,
        },
      });

      logger.info('Shared document accessed - auto-joined as collaborator', {
        action: 'ACCESS_SHARED_DOCUMENT_AUTO_JOINED',
        ...clientInfo,
        userId,
        shareId,
        documentId: doc.id,
        permission: decoded.permission,
      });

      res.status(StatusCodes.OK).json({
        ...doc,
        access: {
          isOwner,
          isCollaborator: isCollaborator,
          permission: permissionFromDB,
        },
      });
    } else {
      const existingRequest = await prisma.collaborationRequest.findFirst({
        where: { documentId: doc.id, userId },
      });

      if (!existingRequest) {
        await prisma.collaborationRequest.create({
          data: {
            documentId: doc.id,
            userId,
            permission: decoded.permission,
          },
        });

        logger.info('Collaboration request created', {
          action: 'COLLABORATION_REQUEST_CREATED',
          ...clientInfo,
          userId,
          shareId,
          documentId: doc.id,
          permission: decoded.permission,
        });
      } else {
        logger.info('Existing collaboration request found', {
          action: 'COLLABORATION_REQUEST_EXISTS',
          ...clientInfo,
          userId,
          shareId,
          documentId: doc.id,
          requestId: existingRequest.id,
        });
      }

      res.status(StatusCodes.ACCEPTED).json({ message: 'Request submitted. Waiting for approval.' });
    }
  } catch (error) {
    logger.error('Shared document access failed - database error', {
      action: 'ACCESS_SHARED_DOCUMENT_ERROR',
      ...clientInfo,
      userId,
      shareId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const getShareLink = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const userId = req.user?.userId;
  const { id } = req.params;
  const { permission = 'view' } = req.query;

  logger.info('Share link generation attempt', {
    action: 'GENERATE_SHARE_LINK_ATTEMPT',
    ...clientInfo,
    userId,
    documentId: id,
    permission,
  });

  if (!['view', 'edit'].includes(permission as string)) {
    logger.warn('Share link generation failed - invalid permission', {
      action: 'GENERATE_SHARE_LINK_INVALID_PERMISSION',
      ...clientInfo,
      userId,
      documentId: id,
      permission,
    });

    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid permission' });
    return;
  }

  try {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.authorId !== userId) {
      logger.warn('Share link generation failed - unauthorized', {
        action: 'GENERATE_SHARE_LINK_UNAUTHORIZED',
        ...clientInfo,
        userId,
        documentId: id,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.FORBIDDEN).json({ error: 'Unauthorized' });
      return;
    }

    const token = generateShareToken(doc.shareId, permission as 'view' | 'edit');
    // Updated URL structure - token is now in the path
    const url = `${process.env.CLIENT_BASE}/app/doc/share/${token}`;

    logger.info('Share link generated successfully', {
      action: 'GENERATE_SHARE_LINK_SUCCESS',
      ...clientInfo,
      userId,
      documentId: id,
      shareId: doc.shareId,
      permission,
      title: doc.title,
    });

    res.json({ url });
  } catch (error) {
    logger.error('Share link generation failed', {
      action: 'GENERATE_SHARE_LINK_ERROR',
      ...clientInfo,
      userId,
      documentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const getRequests = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id } = req.params;
  const userId = req.user?.userId;

  logger.info('Get collaboration requests attempt', {
    action: 'GET_COLLABORATION_REQUESTS_ATTEMPT',
    ...clientInfo,
    userId,
    documentId: id,
  });

  try {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.authorId !== userId) {
      logger.warn('Get collaboration requests failed - unauthorized', {
        action: 'GET_COLLABORATION_REQUESTS_UNAUTHORIZED',
        ...clientInfo,
        userId,
        documentId: id,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const requests = await prisma.collaborationRequest.findMany({
      where: { documentId: id, status: 'pending' },
      include: { user: true },
    });

    logger.info('Collaboration requests retrieved successfully', {
      action: 'GET_COLLABORATION_REQUESTS_SUCCESS',
      ...clientInfo,
      userId,
      documentId: id,
      requestCount: requests.length,
    });

    res.json(requests);
  } catch (error) {
    logger.error('Get collaboration requests failed', {
      action: 'GET_COLLABORATION_REQUESTS_ERROR',
      ...clientInfo,
      userId,
      documentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const approveRequest = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id: documentId, requestId } = req.params;
  const userId = req.user?.userId;

  logger.info('Collaboration request approval attempt', {
    action: 'APPROVE_COLLABORATION_REQUEST_ATTEMPT',
    ...clientInfo,
    userId,
    documentId,
    requestId,
  });

  try {
    const doc = await prisma.document.findUnique({ where: { id: documentId } });

    if (!doc || doc.authorId !== userId) {
      logger.warn('Collaboration request approval failed - unauthorized', {
        action: 'APPROVE_COLLABORATION_REQUEST_UNAUTHORIZED',
        ...clientInfo,
        userId,
        documentId,
        requestId,
        documentExists: !!doc,
        isOwner: doc?.authorId === userId,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });

      return;
    }

    // Get the request to extract the requester user ID
    const request = await prisma.collaborationRequest.update({
      where: { id: requestId },
      data: { status: 'approved' },
    });

    // Add the requester as a collaborator
    await prisma.collaborator.upsert({
      where: {
        documentId_userId: {
          documentId,
          userId: request.userId,
        },
      },
      update: {}, // already exists? do nothing
      create: {
        documentId,
        userId: request.userId,
        permission: request.permission,
      },
    });

    logger.info('Collaboration request approved and collaborator added', {
      action: 'APPROVE_COLLABORATION_REQUEST_SUCCESS',
      ...clientInfo,
      ownerId: userId,
      documentId,
      requestId,
    });

    res.json({ message: 'Approved and collaborator added' });
    return;
  } catch (error) {
    logger.error('Collaboration request approval failed', {
      action: 'APPROVE_COLLABORATION_REQUEST_ERROR',
      ...clientInfo,
      userId,
      documentId,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const rejectRequest = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id, requestId } = req.params;
  const userId = req.user?.userId;

  logger.info('Collaboration request rejection attempt', {
    action: 'REJECT_COLLABORATION_REQUEST_ATTEMPT',
    ...clientInfo,
    userId,
    documentId: id,
    requestId,
  });
  const doc = await prisma.document.findUnique({ where: { id } });

  // ? Owner only
  if (!doc || doc.authorId !== userId) {
    logger.warn('Collaboration request rejection failed - unauthorized', {
      action: 'REJECT_COLLABORATION_REQUEST_UNAUTHORIZED',
      ...clientInfo,
      userId,
      documentId: id,
      requestId,
    });

    res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    return;
  }

  await prisma.collaborationRequest.update({ where: { id: requestId }, data: { status: 'rejected' } });

  res.json({ message: 'Rejected' });
});

export const getCollaborators = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id } = req.params;
  const userId = req.user?.userId;

  logger.info('Get collaborators attempt', {
    action: 'GET_COLLABORATORS_ATTEMPT',
    ...clientInfo,
    userId,
    documentId: id,
  });
  try {
    const collabs = await prisma.collaborator.findMany({
      where: { documentId: id },
      include: { user: true },
    });

    res.json(collabs);
  } catch (error) {
    logger.error('Get collaborators failed', {
      action: 'GET_COLLABORATORS_ERROR',
      ...clientInfo,
      userId,
      documentId: id,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const addCollaborator = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id } = req.params;
  const { userId: newCollaboratorId, permission } = req.body;
  const ownerId = req.user?.userId;

  logger.info('Add collaborator attempt', {
    action: 'ADD_COLLABORATOR_ATTEMPT',
    ...clientInfo,
    ownerId,
    documentId: id,
    newCollaboratorId,
    permission,
  });

  try {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.authorId !== ownerId) {
      logger.warn('Add collaborator failed - unauthorized', {
        action: 'ADD_COLLABORATOR_UNAUTHORIZED',
        ...clientInfo,
        ownerId,
        documentId: id,
        newCollaboratorId,
        documentExists: !!doc,
        isOwner: doc?.authorId === ownerId,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const collab = await prisma.collaborator.create({
      data: { documentId: id, userId: newCollaboratorId, permission },
    });

    logger.info('Collaborator added successfully', {
      action: 'ADD_COLLABORATOR_SUCCESS',
      ...clientInfo,
      ownerId,
      documentId: id,
      newCollaboratorId,
      permission,
      collaboratorId: collab.id,
    });

    res.json(collab);
  } catch (error) {
    logger.error('Add collaborator failed', {
      action: 'ADD_COLLABORATOR_ERROR',
      ...clientInfo,
      ownerId,
      documentId: id,
      newCollaboratorId,
      permission,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});

export const removeCollaborator = asyncErrorWrapper(async (req: AuthenticatedRequest, res: Response) => {
  const clientInfo = getClientInfo(req);
  const { id, userId: collaboratorId } = req.params;
  const ownerId = req.user?.userId;

  logger.info('Remove collaborator attempt', {
    action: 'REMOVE_COLLABORATOR_ATTEMPT',
    ...clientInfo,
    ownerId,
    documentId: id,
    collaboratorId,
  });

  try {
    const doc = await prisma.document.findUnique({ where: { id } });

    if (!doc || doc.authorId !== ownerId) {
      logger.warn('Remove collaborator failed - unauthorized', {
        action: 'REMOVE_COLLABORATOR_UNAUTHORIZED',
        ...clientInfo,
        ownerId,
        documentId: id,
        collaboratorId,
        documentExists: !!doc,
        isOwner: doc?.authorId === ownerId,
      });

      res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
      return;
    }

    const collaborator = await prisma.collaborator.findUnique({
      where: { id: collaboratorId },
      select: { userId: true, documentId: true },
    });

    if (!collaborator) {
      throw new Error('Collaborator not found');
    }

    const result = await prisma.collaborator.deleteMany({
      where: { documentId: id, id: collaboratorId },
    });

    await prisma.collaborationRequest.deleteMany({
      where: {
        userId: collaborator.userId,
        documentId: collaborator.documentId,
      },
    });

    console.log(chalk.red('HERE'), result, collaboratorId, id);

    logger.info('Collaborator removed successfully', {
      action: 'REMOVE_COLLABORATOR_SUCCESS',
      ...clientInfo,
      ownerId,
      documentId: id,
      collaboratorId,
      deletedCount: result.count,
    });

    res.json({ message: 'Removed' });
  } catch (error) {
    logger.error('Remove collaborator failed', {
      action: 'REMOVE_COLLABORATOR_ERROR',
      ...clientInfo,
      ownerId,
      documentId: id,
      collaboratorId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw error;
  }
});
