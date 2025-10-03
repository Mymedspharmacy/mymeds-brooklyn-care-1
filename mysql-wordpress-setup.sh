#!/bin/bash

echo "Setting up MySQL and WordPress..."

# Run MySQL secure installation
echo "Running MySQL security configuration..."
sudo mysql_secure_installation

echo "Creating databases and users..."

# Create MySQL script file
cat > mysql_config.sql << 'EOF'
-- Create MyMeds database
CREATE DATABASE IF NOT EXISTS mymeds_pharmacy 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create WordPress database
CREATE DATABASE IF NOT EXISTS wordpress_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create MyMeds user
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';

-- Create WordPress user
CREATE USER IF NOT EXISTS 'wordpress_user'@'localhost' IDENTIFIED BY 'WordPress-2004-Secure';
GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wordpress_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show databases
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User IN ('mymeds_user', 'wordpress_user');
EOF

# Execute MySQL script
sudo mysql -u root -p < mysql_config.sql

echo "MySQL databases and users created successfully!"
echo "Databases created:"
echo "- mymeds_pharmacy (for MyMeds application)"
echo "- wordpress_db (for WordPress)"
echo
echo "Users created:"
echo "- mymeds_user (for MyMeds)"
echo "- wordpress_user (for WordPress)"

# Clean up
rm mysql_config.sql

echo "MySQL setup completed!"
