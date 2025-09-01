const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addErrorTrackingFields() {
  try {
    console.log('🔄 Adding error tracking fields to integration settings...');

    // Add lastError field to WooCommerceSettings if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "WooCommerceSettings" 
        ADD COLUMN IF NOT EXISTS "lastError" TEXT;
      `;
      console.log('✅ Added lastError field to WooCommerceSettings');
    } catch (error) {
      console.log('⚠️ WooCommerceSettings lastError field already exists or error:', error.message);
    }

    // Add lastError field to WordPressSettings if it doesn't exist
    try {
      await prisma.$executeRaw`
        ALTER TABLE "WordPressSettings" 
        ADD COLUMN IF NOT EXISTS "lastError" TEXT;
      `;
      console.log('✅ Added lastError field to WordPressSettings');
    } catch (error) {
      console.log('⚠️ WordPressSettings lastError field already exists or error:', error.message);
    }

    console.log('🎉 Error tracking fields added successfully!');
  } catch (error) {
    console.error('❌ Error adding error tracking fields:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addErrorTrackingFields();

