const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUser() {
  try {
    console.log('🔍 Checking Admin User Status in Railway Database...\n');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to Railway database successfully\n');
    
    // Check if User table exists and has users
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Total users in database: ${userCount}\n`);
      
      if (userCount === 0) {
        console.log('❌ No users found in database!');
        console.log('   This explains why admin login is failing.\n');
        console.log('💡 Solution: Create admin user manually or check admin creation script.\n');
        return;
      }
      
      // Get all users to see what's there
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true
        }
      });
      
      console.log('👥 Users in database:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Role: ${user.role}, Created: ${user.createdAt}`);
      });
      
      // Check for admin users specifically
      const adminUsers = users.filter(user => user.role === 'ADMIN');
      console.log(`\n👑 Admin users found: ${adminUsers.length}`);
      
      if (adminUsers.length === 0) {
        console.log('❌ No admin users found!');
        console.log('   This explains the login failure.\n');
        console.log('💡 Solution: Create admin user or check role assignment.\n');
      } else {
        console.log('✅ Admin users found:');
        adminUsers.forEach(admin => {
          console.log(`   - ${admin.email} (${admin.name}) - Role: ${admin.role}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Error accessing User table:', error.message);
      console.log('   This suggests the table structure might be incorrect.\n');
    }
    
    // Check database schema
    console.log('\n🔍 Checking database schema...');
    try {
      const result = await prisma.$queryRaw`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position
      `;
      
      if (result.length > 0) {
        console.log('✅ User table schema:');
        result.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      } else {
        console.log('❌ User table not found in schema');
      }
    } catch (error) {
      console.log('❌ Could not check schema:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAdminUser().catch(console.error);



