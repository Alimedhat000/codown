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

  // Start every e2e run with a clean dashboard for the test user
  const { count } = await prisma.document.deleteMany({
    where: { authorId: user.id },
  });
  if (count > 0) {
    console.log(`🧹 Removed ${count} leftover test document(s)`);
  }

  console.log('✅ Test user ready');
}

main().finally(() => prisma.$disconnect());
