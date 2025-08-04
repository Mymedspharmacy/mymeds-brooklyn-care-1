-- Add performance indexes for admin panel queries
-- This will improve notification and order fetching performance

-- Index for orders notifications (most common query)
CREATE INDEX IF NOT EXISTS "idx_orders_notified_created" ON "Order"("notified", "createdAt" DESC);

-- Index for contact form notifications
CREATE INDEX IF NOT EXISTS "idx_contact_forms_notified_created" ON "ContactForm"("notified", "createdAt" DESC);

-- Index for appointment notifications
CREATE INDEX IF NOT EXISTS "idx_appointments_notified_created" ON "Appointment"("notified", "createdAt" DESC);

-- Index for prescription notifications
CREATE INDEX IF NOT EXISTS "idx_prescriptions_notified_created" ON "Prescription"("notified", "createdAt" DESC);

-- Index for user role queries
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "User"("role");

-- Index for order status queries
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "Order"("status");

-- Index for order user relationship
CREATE INDEX IF NOT EXISTS "idx_orders_user_id" ON "Order"("userId");

-- Index for appointment user relationship
CREATE INDEX IF NOT EXISTS "idx_appointments_user_id" ON "Appointment"("userId");

-- Index for prescription user relationship
CREATE INDEX IF NOT EXISTS "idx_prescriptions_user_id" ON "Prescription"("userId");

-- Index for review status queries
CREATE INDEX IF NOT EXISTS "idx_reviews_status" ON "Review"("status");

-- Index for product category relationship
CREATE INDEX IF NOT EXISTS "idx_products_category_id" ON "Product"("categoryId"); 