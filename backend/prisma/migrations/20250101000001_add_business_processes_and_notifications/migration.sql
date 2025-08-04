-- CreateTable
CREATE TABLE "RefillRequest" (
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
);

-- CreateTable
CREATE TABLE "TransferRequest" (
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
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WooCommerceSettings" (
    "id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "storeUrl" TEXT,
    "consumerKey" TEXT,
    "consumerSecret" TEXT,
    "webhookSecret" TEXT,
    "lastSync" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WooCommerceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPressSettings" (
    "id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "siteUrl" TEXT,
    "username" TEXT,
    "applicationPassword" TEXT,
    "lastSync" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordPressSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_refill_requests_notified_requested" ON "RefillRequest"("notified", "requestedDate");

-- CreateIndex
CREATE INDEX "idx_refill_requests_status_requested" ON "RefillRequest"("status", "requestedDate");

-- CreateIndex
CREATE INDEX "idx_transfer_requests_notified_requested" ON "TransferRequest"("notified", "requestedDate");

-- CreateIndex
CREATE INDEX "idx_transfer_requests_status_requested" ON "TransferRequest"("status", "requestedDate");

-- CreateIndex
CREATE INDEX "idx_notifications_read_created" ON "Notification"("read", "createdAt");

-- CreateIndex
CREATE INDEX "idx_notifications_type_created" ON "Notification"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "RefillRequest" ADD CONSTRAINT "RefillRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferRequest" ADD CONSTRAINT "TransferRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 