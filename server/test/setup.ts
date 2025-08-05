import { execSync } from 'child_process';
import { afterAll, afterEach, beforeAll } from 'vitest';

// ✅ Must set this BEFORE importing PrismaClient
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// console.log('NODE_ENV:', process.env.NODE_ENV);
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

import { PrismaClient } from '@prisma/client'; // ✅ Loaded after DATABASE_URL is set

const prisma = new PrismaClient();

beforeAll(async () => {
  // Sync schema to test DB
  execSync('npx prisma db push --force-reset', {
    env: { ...process.env },
    stdio: 'inherit',
  });
});

afterEach(async () => {
  const tableNames = ['collaboration_requests', 'collaborators', 'yjs_document_states', 'documents', 'users'];

  try {
    await prisma.$transaction(async tx => {
      for (const tableName of tableNames) {
        await tx.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`);
      }
    });
  } catch (error) {
    console.error('Error during test cleanup:', error);
    await prisma.collaborationRequest.deleteMany();
    await prisma.collaborator.deleteMany();
    await prisma.yjsDocumentState.deleteMany();
    await prisma.document.deleteMany();
    await prisma.user.deleteMany();
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
