import { prisma } from '@/lib/prisma';

export type DocumentPermission = 'edit' | 'view';

/**
 * Resolves the effective collaboration permission of a user for a document.
 * Returns null when the user has no access at all.
 */
export const getDocumentPermission = async (userId: string, documentId: string): Promise<DocumentPermission | null> => {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { authorId: true, isPublic: true },
  });

  if (!doc) return null;
  if (doc.authorId === userId) return 'edit';

  const collaborator = await prisma.collaborator.findUnique({
    where: { documentId_userId: { documentId, userId } },
    select: { permission: true },
  });

  if (collaborator) {
    return collaborator.permission === 'view' ? 'view' : 'edit';
  }

  return doc.isPublic ? 'view' : null;
};
