#!/bin/bash

# WordPress Installation Script for MyMeds Pharmacy VPS

echo "Starting WordPress installation..."

# Create WordPress directory
sudo mkdir -p /var/www/wordpress
cd /tmp

# Download latest WordPress
echo "Downloading WordPress..."
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz

# Move WordPress to web directory
sudo cp -r wordpress/* /var/www/wordpress/

# Set proper permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress

# Create WordPress configuration
sudo cp /var/www/wordpress/wp-config-sample.php /var/www/wordpress/wp-config.php

# Configure database settings in wp-config.php
sudo sed -i "s/database_name_here/wordpress_db/g" /var/www/wordpress/wp-config.php
sudo sed -i "s/username_here/wordpress_user/g" /var/www/wordpress/wp-config.php
sudo sed -i "s/password_here/WordPress-2004-Secure/g" /var/www/wordpress/wp-config.php
sudo sed -i "s/localhost/localhost/g" /var/www/wordpress/wp-config.php

# Generate WordPress security keys
echo "Generating WordPress security keys..."
curl -s | https://api.wordpress.org/secret-key/1.1/salt/ | sudo tee /tmp/salt
sudo sed -i '/AUTH_KEY\|SECURE_AUTH_KEY\|LOGGED_IN_KEY\|NONCE_KEY\|AUTH_SALT\|SECURE_AUTH_SALT\|LOGGED_IN_SALT\|NONCE_SALT/,+1d' /var/www/wordpress/wp-config.php
sudo awk 'NR>35' salt | sudo tee -a /var/www/wordpress/wp-config.php

# Clean up
rm -rf wordpress latest.tar.gz salt

echo "WordPress installation completed!"
echo "WordPress files installed to: /var/www/wordpress"
echo "Access URL: http://your-domain.com/blog"

# Create PHP-FPM configuration for WordPress
sudo tee /etc/php/8.1/fpm/pool.d/wordpress.conf << 'EOF'
[wordpress]
user = www-data
group = www-data
listen = /run/php/php8.1-fpm-wordpress.sock
listen.owner = www-data
listen.group = www-data
pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3
chdir = /
EOF

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm

echo "PHP-FPM configured for WordPress"
