const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createNewsletterTable() {
  try {
    console.log('Creating newsletter subscription table...');
    
    // Create the table using raw SQL since Prisma migrations might not be set up
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscription" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "source" TEXT NOT NULL DEFAULT 'website',
        "marketingConsent" BOOLEAN NOT NULL DEFAULT true,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "NewsletterSubscription_email_idx" ON "NewsletterSubscription"("email");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "NewsletterSubscription_isActive_idx" ON "NewsletterSubscription"("isActive");
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "NewsletterSubscription_createdAt_idx" ON "NewsletterSubscription"("createdAt");
    `;
    
    console.log('✅ Newsletter subscription table created successfully!');
    
    // Test the table by creating a sample subscription
    const testSubscription = await prisma.newsletterSubscription.create({
      data: {
        email: 'test@example.com',
        source: 'script',
        marketingConsent: true,
        isActive: true
      }
    });
    
    console.log('✅ Test subscription created:', testSubscription);
    
    // Clean up test data
    await prisma.newsletterSubscription.delete({
      where: { id: testSubscription.id }
    });
    
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error creating newsletter table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewsletterTable();
