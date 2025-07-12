import { afterAll, beforeEach } from 'vitest';

import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@test.dev',
      },
    },
  });
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        endsWith: '@test.dev',
      },
    },
  });
  await prisma.$disconnect();
});
