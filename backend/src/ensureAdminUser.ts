// This script ensures the admin user exists in the database for secure authentication
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  // Validate required environment variables
  const email = process.env.ADMIN_EMAIL;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const firstName = process.env.ADMIN_FIRST_NAME || 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME || 'User';
  
  if (!email || !hash) {
    console.error('❌ Missing required environment variables: ADMIN_EMAIL and ADMIN_PASSWORD_HASH');
    process.exit(1);
  }
  
  // Validate password hash format
  if (!hash.startsWith('$2')) {
    console.error('❌ ADMIN_PASSWORD_HASH must be a valid bcrypt hash');
    process.exit(1);
  }
  
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email, 
          password: hash, 
          name: `${firstName} ${lastName}`, 
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      console.log(`✅ Admin user created: ${email}`);
    } else {
      // Update existing admin user with new password hash
      await prisma.user.update({
        where: { email },
        data: { 
          password: hash,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      console.log(`✅ Admin user updated: ${email}`);
    }
  } catch (error) {
    console.error('❌ Error ensuring admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  
  process.exit(0);
})();
