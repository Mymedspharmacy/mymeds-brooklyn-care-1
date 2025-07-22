import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const email = 'admin@outlook.com';
  const newHash = '$2b$10$pkhLvqMloM2eV9upbq1RGulTLjZDnuXlLozYrCBEbDx0XKGqEwrdO'; // hash for 'Admin@mymeds'

  const user = await prisma.user.updateMany({
    where: { email },
    data: { password: newHash }
  });

  if (user.count > 0) {
    console.log('Admin password reset successfully.');
  } else {
    console.log('Admin user not found.');
  }
  process.exit(0);
})(); 