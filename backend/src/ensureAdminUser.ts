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
    console.log('Admin user created:', user);
  } else {
    console.log('Admin user already exists:', user);
  }
  process.exit(0);
})(); 