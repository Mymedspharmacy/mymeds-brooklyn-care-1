const { PrismaClient } = require('@prisma/client');

async function fixAdminEmail() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking current admin users...');
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });
    
    console.log('Current admin users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Update the admin user email
    console.log('\n🔄 Updating admin email...');
    const updatedUser = await prisma.user.update({
      where: { email: 'admin@mymedspharmacyinc.com' },
      data: { email: 'admin@mymedspharmacy.com' }
    });
    
    console.log('✅ Successfully updated admin user:');
    console.log(`- ID: ${updatedUser.id}`);
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Role: ${updatedUser.role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminEmail();

