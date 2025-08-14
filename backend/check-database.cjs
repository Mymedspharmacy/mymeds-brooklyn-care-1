const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection and tables...\n');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Check if User table exists by trying to query it
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists - ${userCount} users found`);
    } catch (error) {
      console.log('❌ User table does not exist or is not accessible');
      console.log(`   Error: ${error.message}`);
    }
    
    // Check if Cart table exists
    try {
      const cartCount = await prisma.cart.count();
      console.log(`✅ Cart table exists - ${cartCount} carts found`);
    } catch (error) {
      console.log('❌ Cart table does not exist or is not accessible');
      console.log(`   Error: ${error.message}`);
    }
    
    // Check if Order table exists
    try {
      const orderCount = await prisma.order.count();
      console.log(`✅ Order table exists - ${orderCount} orders found`);
    } catch (error) {
      console.log('❌ Order table does not exist or is not accessible');
      console.log(`   Error: ${error.message}`);
    }
    
    // Check if Product table exists
    try {
      const productCount = await prisma.product.count();
      console.log(`✅ Product table exists - ${productCount} products found`);
    } catch (error) {
      console.log('❌ Product table does not exist or is not accessible');
      console.log(`   Error: ${error.message}`);
    }
    
    console.log('\n📊 Database Status Summary:');
    console.log('============================');
    
    // Try to get database info
    try {
      const result = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as db_user`;
      console.log(`Database: ${result[0].db_name}`);
      console.log(`User: ${result[0].db_user}`);
    } catch (error) {
      console.log('Could not retrieve database info');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('P2021')) {
      console.log('\n💡 This error suggests the database tables don\'t exist.');
      console.log('   Solution: Run "npx prisma db push" to create the tables.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This error suggests a connection issue.');
      console.log('   Check your DATABASE_URL environment variable.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabase().catch(console.error);
