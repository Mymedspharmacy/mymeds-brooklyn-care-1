// This script is for initial setup/testing only. Do NOT use in production.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const email = 'admin@outlook.com';
  const hash = '$2b$10$2zZv4/eQWPFvzrRaXLDbbekOH53lPUCntHc7.UBf/vgCQTBxPc8au';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, password: hash, name: 'Admin User', role: 'ADMIN' }
    });
  } else {
  }
  process.exit(0);
})(); 