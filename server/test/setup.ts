import { afterAll, beforeEach } from 'vitest';

import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.document.deleteMany(); // first: remove children
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.document.deleteMany(); // first: remove children
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
