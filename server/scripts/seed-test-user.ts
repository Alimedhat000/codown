import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { password: hashedPassword },
    create: {
      email: 'test@example.com',
      username: 'tester',
      fullName: 'Playwright Test User',
      password: hashedPassword,
    },
  });
  console.log('✅ Test user ready');
}

main().finally(() => prisma.$disconnect());
