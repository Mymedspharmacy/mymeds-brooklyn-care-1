-- Simple migration script to add updatedAt columns to existing tables
-- Run this script on your PostgreSQL database to add the missing updatedAt columns

-- Add updatedAt column to Product table
ALTER TABLE "Product" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt column to Order table  
ALTER TABLE "Order" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add updatedAt column to Blog table
ALTER TABLE "Blog" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have a valid updatedAt value (set to createdAt)
UPDATE "Product" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Order" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
UPDATE "Blog" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
