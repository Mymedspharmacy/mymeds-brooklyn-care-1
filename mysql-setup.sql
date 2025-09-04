
-- MySQL Database Setup for MyMeds Pharmacy Production
-- Generated: September 4, 2025

-- Create database
CREATE DATABASE IF NOT EXISTS mymeds_production
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123';

-- Grant privileges
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';

-- Grant additional privileges for development
GRANT CREATE, DROP, ALTER, INDEX ON mymeds_production.* TO 'mymeds_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use database
USE mymeds_production;

-- Create indexes for better performance
-- (These will be created by Prisma, but we can add custom ones here)

-- Show database info
SHOW DATABASES LIKE 'mymeds_production';
SELECT USER(), DATABASE();
