import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { slugIDtoFullID } from '@/utils/slugIDtoFullID';

describe('slugIDtoFullID', () => {
  let userId: string;

  beforeEach(async () => {
    await prisma.collaborator.deleteMany();
    await prisma.collaborationRequest.deleteMany();
    await prisma.yjsDocumentState.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { email: 'slug@test.dev', username: 'sluguser', password: 'unused' },
    });
    userId = user.id;
  });

  it('resolves an exact document ID', async () => {
    const doc = await prisma.document.create({
      data: { id: 'aaaa1111-0000-4000-8000-000000000001', title: 'Exact', content: '', authorId: userId },
    });

    await expect(slugIDtoFullID(doc.id)).resolves.toBe(doc.id);
  });

  it('does not resolve a truncated ID prefix', async () => {
    const doc = await prisma.document.create({
      data: { id: 'bbbb1111-0000-4000-8000-000000000002', title: 'Prefixed', content: '', authorId: userId },
    });
    const slug = doc.id.slice(0, 8);

    await expect(slugIDtoFullID(slug)).rejects.toThrow();
  });

  it('does not resolve an ambiguous prefix shared by multiple documents', async () => {
    await prisma.document.createMany({
      data: [
        { id: 'cccc1111-0000-4000-8000-000000000003', title: 'One', content: '', authorId: userId },
        { id: 'cccc2222-0000-4000-8000-000000000004', title: 'Two', content: '', authorId: userId },
      ],
    });

    await expect(slugIDtoFullID('cccc')).rejects.toThrow();
  });

  it('throws when no document exists', async () => {
    await expect(slugIDtoFullID('dddd1111-0000-4000-8000-000000000005')).rejects.toThrow(/not found/);
  });
});
