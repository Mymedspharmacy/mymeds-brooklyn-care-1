-- Migration script to add updatedAt columns to existing tables
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

-- Create triggers to automatically update the updatedAt column on row updates
-- For Product table
CREATE OR REPLACE FUNCTION update_product_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_updated_at
    BEFORE UPDATE ON "Product"
    FOR EACH ROW
    EXECUTE FUNCTION update_product_updated_at();

-- For Order table
CREATE OR REPLACE FUNCTION update_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_order_updated_at
    BEFORE UPDATE ON "Order"
    FOR EACH ROW
    EXECUTE FUNCTION update_order_updated_at();

-- For Blog table
CREATE OR REPLACE FUNCTION update_blog_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_blog_updated_at
    BEFORE UPDATE ON "Blog"
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_updated_at();
