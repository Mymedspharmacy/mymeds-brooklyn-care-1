# WordPress and WooCommerce Setup Script
# This script installs and configures WordPress and WooCommerce

param(
    [Parameter(Mandatory=$true)]
    [string]$VPS_IP,
    
    [Parameter(Mandatory=$false)]
    [string]$VPS_USER = "root"
)

Write-Host "🚀 Starting WordPress and WooCommerce Setup..." -ForegroundColor Green

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $VPS_USER@$VPS_IP "echo 'SSH connection successful'"

# Install WordPress
Write-Host "Installing WordPress..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP @"
# Create WordPress directory
mkdir -p /var/www/mymeds/wordpress
cd /var/www/mymeds/wordpress

# Download WordPress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
mv wordpress/* .
rmdir wordpress
rm latest.tar.gz

# Set permissions
chown -R www-data:www-data /var/www/mymeds/wordpress
chmod -R 755 /var/www/mymeds/wordpress
chmod -R 777 /var/www/mymeds/wordpress/wp-content/uploads
"@

# Create WordPress database
Write-Host "Creating WordPress database..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP @"
mysql -e 'CREATE DATABASE IF NOT EXISTS wordpress_mymeds;'
mysql -e "CREATE USER IF NOT EXISTS 'wordpress_user'@'localhost' IDENTIFIED BY 'WordPressSecurePass2024!';"
mysql -e "GRANT ALL PRIVILEGES ON wordpress_mymeds.* TO 'wordpress_user'@'localhost';"
mysql -e 'FLUSH PRIVILEGES;'
"@

# Create wp-config.php
Write-Host "Creating WordPress configuration..." -ForegroundColor Yellow
$wpConfig = @"
<?php
define('DB_NAME', 'wordpress_mymeds');
define('DB_USER', 'wordpress_user');
define('DB_PASSWORD', 'WordPressSecurePass2024!');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');

define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

\$table_prefix = 'wp_';

define('WP_DEBUG', false);

if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');

require_once(ABSPATH . 'wp-settings.php');
"@

$wpConfig | Out-File -FilePath "wp-config.php" -Encoding UTF8
scp wp-config.php ${VPS_USER}@${VPS_IP}:/var/www/mymeds/wordpress/
Remove-Item wp-config.php

# Configure Nginx for WordPress
Write-Host "Configuring Nginx for WordPress..." -ForegroundColor Yellow
$nginxWordPressConfig = @"
server {
    listen 80;
    server_name mymedspharmacyinc.com;
    root /var/www/mymeds/frontend;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /blog {
        alias /var/www/mymeds/wordpress;
        try_files \$uri \$uri/ /blog/index.php?\$args;
        
        location ~ \.php$ {
            fastcgi_split_path_info ^(/blog)(/.+\.php)(/.*)$;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            fastcgi_param PATH_INFO \$fastcgi_path_info;
        }
    }

    location /shop {
        alias /var/www/mymeds/wordpress;
        try_files \$uri \$uri/ /shop/index.php?\$args;
        
        location ~ \.php$ {
            fastcgi_split_path_info ^(/shop)(/.+\.php)(/.*)$;
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            fastcgi_param PATH_INFO \$fastcgi_path_info;
        }
    }
}
"@

$nginxWordPressConfig | Out-File -FilePath "mymeds-wordpress.conf" -Encoding UTF8
scp mymeds-wordpress.conf ${VPS_USER}@${VPS_IP}:/etc/nginx/sites-available/mymeds
Remove-Item mymeds-wordpress.conf

# Reload Nginx
Write-Host "Reloading Nginx..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "nginx -t && systemctl reload nginx"

# Install WooCommerce
Write-Host "Installing WooCommerce..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP @"
cd /var/www/mymeds/wordpress

# Download WooCommerce plugin
wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip woocommerce.latest-stable.zip -d wp-content/plugins/
rm woocommerce.latest-stable.zip

# Set permissions
chown -R www-data:www-data wp-content/plugins/woocommerce
chmod -R 755 wp-content/plugins/woocommerce
"@

# Create WordPress admin user
Write-Host "Creating WordPress admin user..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP @"
cd /var/www/mymeds/wordpress

# Create admin user via WP-CLI (if available) or manual SQL
mysql -u wordpress_user -p'WordPressSecurePass2024!' wordpress_mymeds -e "
INSERT INTO wp_users (user_login, user_pass, user_nicename, user_email, user_status, display_name, user_registered) 
VALUES ('admin', MD5('AdminSecurePassword2024!'), 'admin', 'admin@mymedspharmacyinc.com', 0, 'MyMeds Admin', NOW());

INSERT INTO wp_usermeta (user_id, meta_key, meta_value) 
VALUES (1, 'wp_capabilities', 'a:1:{s:13:\"administrator\";b:1;}');

INSERT INTO wp_usermeta (user_id, meta_key, meta_value) 
VALUES (1, 'wp_user_level', '10');
"
"@

# Configure WordPress settings
Write-Host "Configuring WordPress settings..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP @"
cd /var/www/mymeds/wordpress

# Update site URL and home URL
mysql -u wordpress_user -p'WordPressSecurePass2024!' wordpress_mymeds -e "
UPDATE wp_options SET option_value = 'https://mymedspharmacyinc.com/blog' WHERE option_name = 'home';
UPDATE wp_options SET option_value = 'https://mymedspharmacyinc.com/blog' WHERE option_name = 'siteurl';
UPDATE wp_options SET option_value = 'MyMeds Pharmacy' WHERE option_name = 'blogname';
UPDATE wp_options SET option_value = 'Your trusted pharmacy partner' WHERE option_name = 'blogdescription';
"
"@

# Set final permissions
Write-Host "Setting final permissions..." -ForegroundColor Yellow
ssh $VPS_USER@$VPS_IP "chown -R www-data:www-data /var/www/mymeds/wordpress"
ssh $VPS_USER@$VPS_IP "chmod -R 755 /var/www/mymeds/wordpress"
ssh $VPS_USER@$VPS_IP "chmod -R 777 /var/www/mymeds/wordpress/wp-content/uploads"

# Test WordPress installation
Write-Host "Testing WordPress installation..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$wordpressTest = ssh $VPS_USER@$VPS_IP "curl -s https://mymedspharmacyinc.com/blog"
if ($wordpressTest -like "*WordPress*" -or $wordpressTest -like "*wordpress*") {
    Write-Host "✅ WordPress is installed and accessible!" -ForegroundColor Green
} else {
    Write-Host "⚠️  WordPress may need manual configuration" -ForegroundColor Yellow
}

# Display summary
Write-Host "=== WORDPRESS/WOOCOMMERCE SETUP SUMMARY ===" -ForegroundColor Green
Write-Host "VPS IP: $VPS_IP" -ForegroundColor Cyan
Write-Host "WordPress URL: https://mymedspharmacyinc.com/blog" -ForegroundColor Cyan
Write-Host "WooCommerce URL: https://mymedspharmacyinc.com/shop" -ForegroundColor Cyan
Write-Host "WordPress Admin: https://mymedspharmacyinc.com/blog/wp-admin" -ForegroundColor Cyan
Write-Host "Admin Username: admin" -ForegroundColor Cyan
Write-Host "Admin Password: AdminSecurePassword2024!" -ForegroundColor Cyan
Write-Host "Database: wordpress_mymeds" -ForegroundColor Cyan
Write-Host "Database User: wordpress_user" -ForegroundColor Cyan

Write-Host "🎉 WordPress and WooCommerce setup completed!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Visit https://mymedspharmacyinc.com/blog/wp-admin" -ForegroundColor Cyan
Write-Host "2. Login with admin/AdminSecurePassword2024!" -ForegroundColor Cyan
Write-Host "3. Complete WordPress setup wizard" -ForegroundColor Cyan
Write-Host "4. Activate WooCommerce plugin" -ForegroundColor Cyan
Write-Host "5. Configure WooCommerce settings" -ForegroundColor Cyan
