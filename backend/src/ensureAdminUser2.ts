// This script ensures the second admin user exists in the database
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  // Validate required environment variables
  const email = process.env.ADMIN2_EMAIL;
  const hash = process.env.ADMIN2_PASSWORD_HASH;
  const firstName = process.env.ADMIN2_FIRST_NAME || 'MyMeds';
  const lastName = process.env.ADMIN2_LAST_NAME || 'Admin';
  
  if (!email || !hash) {
    console.error('❌ Missing required environment variables: ADMIN2_EMAIL and ADMIN2_PASSWORD_HASH');
    console.error('Please add these to your .env file:');
    console.error('ADMIN2_EMAIL=your-admin-email@domain.com');
    console.error('ADMIN2_PASSWORD_HASH=$2b$12$auPmZQBuFSoEiqpK1mTQWu7ItdaRkAQjKgK0xL/X8TDA3iuGEnNFa');
    console.error('ADMIN2_FIRST_NAME=MyMeds');
    console.error('ADMIN2_LAST_NAME=Admin');
    process.exit(1);
  }
  
  // Validate password hash format
  if (!hash.startsWith('$2')) {
    console.error('❌ ADMIN2_PASSWORD_HASH must be a valid bcrypt hash');
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
          emailVerified: true,
          lastLoginAt: new Date()
        }
      });
      console.log(`✅ Second admin user created: ${email}`);
      console.log(`👤 Name: ${firstName} ${lastName}`);
      console.log(`🔑 Email: ${email}`);
      console.log(`🔒 Password: [Set via ADMIN2_PASSWORD_HASH environment variable]`);
    } else {
      // Update existing admin user with new password hash
      await prisma.user.update({
        where: { email },
        data: { 
          password: hash,
          name: `${firstName} ${lastName}`,
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      });
      console.log(`✅ Second admin user updated: ${email}`);
      console.log(`👤 Name: ${firstName} ${lastName}`);
    }
  } catch (error) {
    console.error('❌ Error ensuring second admin user:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('');
  console.log('🎉 Second admin user setup complete!');
  console.log('📝 Login credentials:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: [Set via ADMIN2_PASSWORD_HASH environment variable]`);
  console.log('');
  console.log('⚠️  Please change the password after first login for security.');
  
  process.exit(0);
})();
