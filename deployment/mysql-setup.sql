-- MySQL Database Setup for MyMeds Pharmacy
-- Run this script on your VPS MySQL server

-- Create database
CREATE DATABASE IF NOT EXISTS mymeds_pharmacy 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create user for the application
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';

-- Grant privileges
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';

-- Grant privileges for remote connections (if needed)
-- GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use the database
USE mymeds_pharmacy;

-- Create initial settings
INSERT INTO settings (key, value, siteName, contactEmail, contactPhone, address, businessHours) 
VALUES 
('site_name', 'MyMeds Pharmacy Inc.', 'MyMeds Pharmacy Inc.', 'info@mymedspharmacy.com', '(555) 123-4567', '123 Pharmacy Street, Brooklyn, NY 11201', 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed'),
('site_description', 'Your trusted neighborhood pharmacy', 'MyMeds Pharmacy Inc.', 'info@mymedspharmacy.com', '(555) 123-4567', '123 Pharmacy Street, Brooklyn, NY 11201', 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed'),
('currency', 'USD', 'MyMeds Pharmacy Inc.', 'info@mymedspharmacy.com', '(555) 123-4567', '123 Pharmacy Street, Brooklyn, NY 11201', 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed')
ON DUPLICATE KEY UPDATE 
value = VALUES(value),
updatedAt = NOW();

-- Create default location
INSERT INTO locations (name, address, city, state, zipCode, phone, email, hours, isPrimary, isActive) 
VALUES 
('Main Location', '123 Pharmacy Street', 'Brooklyn', 'NY', '11201', '(555) 123-4567', 'info@mymedspharmacy.com', 'Mon-Fri: 9AM-6PM, Sat: 9AM-4PM, Sun: Closed', true, true)
ON DUPLICATE KEY UPDATE 
name = VALUES(name);

-- Create default categories
INSERT INTO categories (name, description) 
VALUES 
('Prescription Medications', 'Prescription drugs and medications'),
('Over-the-Counter', 'OTC medications and health products'),
('Health & Wellness', 'Health supplements and wellness products'),
('Personal Care', 'Personal hygiene and care products'),
('Medical Supplies', 'Medical equipment and supplies')
ON DUPLICATE KEY UPDATE 
description = VALUES(description);

-- Show database info
SELECT 'Database setup completed successfully!' as status;
SELECT DATABASE() as current_database;
SELECT USER() as current_user;
