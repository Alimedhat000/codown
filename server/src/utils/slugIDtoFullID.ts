import { prisma } from '@/lib/prisma';

export const slugIDtoFullID = async (slugId: string) => {
  const doc = await prisma.document.findFirst({
    where: {
      id: { startsWith: slugId },
    },
    select: {
      id: true,
    },
  });
  if (!doc) {
    throw new Error(`Document with slug ID ${slugId} not found`);
  }
  return doc.id;
};
