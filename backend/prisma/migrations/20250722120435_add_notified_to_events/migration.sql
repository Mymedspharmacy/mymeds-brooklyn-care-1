-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "notified" BOOLEAN NOT NULL DEFAULT false;
