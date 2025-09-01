const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('Creating missing tables...\n');

    // Create RefillRequest table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "RefillRequest" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "prescriptionId" INTEGER,
        "medication" TEXT NOT NULL,
        "dosage" TEXT NOT NULL,
        "instructions" TEXT,
        "urgency" TEXT NOT NULL DEFAULT 'normal',
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedDate" TIMESTAMP(3),
        "notified" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "RefillRequest_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ RefillRequest table created');

    // Create TransferRequest table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "TransferRequest" (
        "id" SERIAL NOT NULL,
        "userId" INTEGER NOT NULL,
        "currentPharmacy" TEXT NOT NULL,
        "newPharmacy" TEXT NOT NULL DEFAULT 'My Meds Pharmacy',
        "medications" TEXT NOT NULL,
        "reason" TEXT,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "notes" TEXT,
        "requestedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "completedDate" TIMESTAMP(3),
        "notified" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "TransferRequest_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ TransferRequest table created');

    // Create Notification table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" SERIAL NOT NULL,
        "type" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "read" BOOLEAN NOT NULL DEFAULT false,
        "data" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ Notification table created');

    // Create WooCommerceSettings table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "WooCommerceSettings" (
        "id" INTEGER NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT false,
        "storeUrl" TEXT,
        "consumerKey" TEXT,
        "consumerSecret" TEXT,
        "webhookSecret" TEXT,
        "lastSync" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "WooCommerceSettings_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ WooCommerceSettings table created');

    // Create WordPressSettings table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "WordPressSettings" (
        "id" INTEGER NOT NULL,
        "enabled" BOOLEAN NOT NULL DEFAULT false,
        "siteUrl" TEXT,
        "username" TEXT,
        "applicationPassword" TEXT,
        "lastSync" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "WordPressSettings_pkey" PRIMARY KEY ("id")
      )
    `;
    console.log('✅ WordPressSettings table created');

    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_refill_requests_notified_requested" ON "RefillRequest"("notified", "requestedDate")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_refill_requests_status_requested" ON "RefillRequest"("status", "requestedDate")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_transfer_requests_notified_requested" ON "TransferRequest"("notified", "requestedDate")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_transfer_requests_status_requested" ON "TransferRequest"("status", "requestedDate")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_notifications_read_created" ON "Notification"("read", "createdAt")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_notifications_type_created" ON "Notification"("type", "createdAt")
    `;
    console.log('✅ Indexes created');

    // Add foreign key constraints
    await prisma.$executeRaw`
      ALTER TABLE "RefillRequest" ADD CONSTRAINT IF NOT EXISTS "RefillRequest_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    await prisma.$executeRaw`
      ALTER TABLE "TransferRequest" ADD CONSTRAINT IF NOT EXISTS "TransferRequest_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;
    console.log('✅ Foreign key constraints added');

    console.log('\n🎉 All missing tables created successfully!');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables(); 