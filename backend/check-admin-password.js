const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function checkAdminPassword() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking admin user password...');
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mymedspharmacy.com' }
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('Admin user found:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Password hash: ${user.password.substring(0, 20)}...`);
    
    // Test password
    const testPassword = 'Pharm-23-medS';
    const isValid = bcrypt.compareSync(testPassword, user.password);
    console.log(`\n🔐 Password test for "${testPassword}": ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    
    if (!isValid) {
      console.log('\n🔄 Updating password hash...');
      const newHash = bcrypt.hashSync(testPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
      console.log('✅ Password hash updated');
      
      // Test again
      const newUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      const isValidAfter = bcrypt.compareSync(testPassword, newUser.password);
      console.log(`🔐 Password test after update: ${isValidAfter ? '✅ VALID' : '❌ INVALID'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminPassword();

