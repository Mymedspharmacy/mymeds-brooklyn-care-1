-- =============================================================================
# MYSQL INITIALIZATION SCRIPT - MyMeds Full Stack
# =============================================================================
# Production database setup for MyMeds App + WordPress + WooCommerce
# =============================================================================

-- Create databases
CREATE DATABASE IF NOT EXISTS mymeds_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'mymeds_user'@'%' IDENTIFIED BY 'Mymeds2025!UserSecure123!@#';

-- Grant privileges
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'%';
GRANT ALL PRIVILEGES ON wordpress.* TO 'mymeds_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- =============================================================================
# PRODUCTION OPTIMIZATIONS
# =============================================================================

-- Set MySQL configuration for production
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_type = 1;

-- =============================================================================
# SECURITY SETTINGS
# =============================================================================

-- Remove test database
DROP DATABASE IF EXISTS test;

-- Remove anonymous users
DELETE FROM mysql.user WHERE User='';

-- =============================================================================
# INITIALIZATION COMPLETE
# =============================================================================

-- Log initialization
INSERT INTO mysql.general_log VALUES (NOW(), 'mymeds-full-stack-init', 'MyMeds Full Stack database initialized successfully');

-- Show status
SHOW DATABASES;
SHOW GRANTS FOR 'mymeds_user'@'%';
