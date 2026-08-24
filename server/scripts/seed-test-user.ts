import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_EMAIL = 'test@example.com';

async function main() {
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { password: hashedPassword },
    create: {
      email: TEST_EMAIL,
      username: 'tester',
      fullName: 'Playwright Test User',
      password: hashedPassword,
    },
  });

  // Start every e2e run with a clean dashboard for the test user.
  // Collaborator rows referencing the documents must go first or the
  // document delete fails on the collaborators_documentId_fkey constraint.
  const testDocs = await prisma.document.findMany({
    where: { authorId: user.id },
    select: { id: true },
  });
  const testDocIds = testDocs.map(d => d.id);
  const { count: removedCollaborators } = await prisma.collaborator.deleteMany({
    where: { documentId: { in: testDocIds } },
  });
  const { count: removedRequests } = await prisma.collaborationRequest.deleteMany({
    where: { documentId: { in: testDocIds } },
  });
  const { count } = await prisma.document.deleteMany({
    where: { authorId: user.id },
  });
  if (count > 0 || removedCollaborators > 0 || removedRequests > 0) {
    console.log(
      `🧹 Removed ${count} leftover test document(s), ${removedCollaborators} collaborator link(s) and ${removedRequests} collaboration request(s)`
    );
  }

  // Remove throwaway accounts created by the registration specs in past runs
  const removedUsers = await prisma.user.deleteMany({
    where: { email: { startsWith: 'e2e-' } },
  });
  if (removedUsers.count > 0) {
    console.log(`🧹 Removed ${removedUsers.count} leftover e2e account(s)`);
  }

  console.log('✅ Test user ready');
}

main().finally(() => prisma.$disconnect());
