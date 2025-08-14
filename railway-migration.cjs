const { PrismaClient } = require('@prisma/client');

// This script will update your Railway production database
// Make sure to set your Railway DATABASE_URL as an environment variable

async function updateRailwayDatabase() {
  console.log('🚀 Railway Database Migration Script\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL environment variable not set!');
    console.log('Please set your Railway DATABASE_URL before running this script.\n');
    console.log('Example:');
    console.log('DATABASE_URL="postgresql://..." node railway-migration.cjs\n');
    return;
  }
  
  console.log('🔗 Connecting to Railway database...');
  console.log(`Database: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}\n`);
  
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Railway database successfully\n');
    
    // Check current state
    console.log('🔍 Checking current database state...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table exists - ${userCount} users found`);
    } catch (error) {
      console.log('❌ User table missing - will be created');
    }
    
    try {
      const cartCount = await prisma.cart.count();
      console.log(`✅ Cart table exists - ${cartCount} carts found`);
    } catch (error) {
      console.log('❌ Cart table missing - will be created');
    }
    
    try {
      const orderCount = await prisma.order.count();
      console.log(`✅ Order table exists - ${orderCount} orders found`);
    } catch (error) {
      console.log('❌ Order table missing - will be created');
    }
    
    console.log('\n🚀 Starting database schema update...');
    
    // Push the new schema
    const { execSync } = require('child_process');
    
    try {
      console.log('📝 Updating database schema...');
      execSync('npx prisma db push', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      console.log('✅ Database schema updated successfully!\n');
    } catch (error) {
      console.log('❌ Failed to update database schema');
      console.log('Error:', error.message);
      return;
    }
    
    // Verify the update
    console.log('🔍 Verifying updated schema...');
    
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table verified - ${userCount} users found`);
    } catch (error) {
      console.log('❌ User table still missing after update');
      return;
    }
    
    try {
      const cartCount = await prisma.cart.count();
      console.log(`✅ Cart table verified - ${cartCount} carts found`);
    } catch (error) {
      console.log('❌ Cart table still missing after update');
      return;
    }
    
    try {
      const orderCount = await prisma.order.count();
      console.log(`✅ Order table verified - ${orderCount} orders found`);
    } catch (error) {
      console.log('❌ Order table still missing after update');
      return;
    }
    
    console.log('\n🎉 Railway Database Migration Complete!');
    console.log('Your guest checkout system is now ready for production! 🚀');
    
  } catch (error) {
    console.error('❌ Database migration failed:', error.message);
    
    if (error.message.includes('P2021')) {
      console.log('\n💡 This error suggests the database tables don\'t exist.');
      console.log('   The migration should fix this.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This error suggests a connection issue.');
      console.log('   Check your Railway DATABASE_URL.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateRailwayDatabase().catch(console.error);
