#!/bin/bash

# =============================================================================
# WordPress Setup Script for MyMeds - Blog & WooCommerce
# =============================================================================
# This script sets up WordPress with WooCommerce for MyMeds Pharmacy Inc.
# Domain: mymedspharmacyinc.com
# Blog: blog.mymedspharmacyinc.com
# Shop: shop.mymedspharmacyinc.com
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mymedspharmacyinc.com"
BLOG_SUBDOMAIN="blog"
SHOP_SUBDOMAIN="shop"
WP_VERSION="6.4"
WP_ADMIN_USER="mymeds_admin"
WP_ADMIN_PASS=""
WP_ADMIN_EMAIL="admin@mymedspharmacyinc.com"
WP_SITE_TITLE="MyMeds Pharmacy Inc."
WP_BLOG_DESCRIPTION="Professional Pharmacy Services"
WP_SHOP_DESCRIPTION="Quality Medications & Health Products"

# WordPress directories
WP_BLOG_DIR="/var/www/wordpress/blog"
WP_SHOP_DIR="/var/www/wordpress/shop"
WP_CONFIG_DIR="/var/www/wordpress/config"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-20
}

# Function to generate auth keys
generate_auth_keys() {
    print_status "Generating WordPress security keys..."
    
    SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    SECURE_AUTH_KEY=$(openssl rand -bas64 64 | tr -d "=+/" | cut -c1-60)
    LOGGED_IN_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    NONCE_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    SECURE_AUTH_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    LOGGED_IN_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    NONCE_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    
    echo "SECRET_KEY=$SECRET_KEY"
    echo "SECURE_AUTH_KEY=$SECURE_AUTH_KEY"
    echo "LOGGED_IN_KEY=$LOGGED_IN_KEY"
    echo "NONCE_KEY=$NONCE_KEY"
    echo "SECURE_AUTH_SALT=$SECURE_AUTH_SALT"
    echo "LOGGED_IN_SALT=$LOGGED_IN_SALT"
    echo "NONCE_SALT=$NONCE_SALT"
}

# Function to install PHP and extensions
install_php() {
    print_status "Installing PHP 8.1 and extensions..."
    
    # Add PHP repository
    add-apt-repository ppa:ondrej/php -y
    apt update
    
    # Install PHP and extensions
    apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-gd \
                   php8.1-curl php8.1-zip php8.1-mbstring php8.1-opcache \
                   php8.1-bcmath php8.1-soap php8.1-intl php8.1-imagick
    
    # Configure PHP
    sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 100M/' /etc/php/8.1/fpm/php.ini
    sed -i 's/post_max_size = 8M/post_max_size = 100M/' /etc/php/8.1/fpm/php.ini
    sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.1/fpm/php.ini
    sed -i 's/max_input_vars = 1000/max_input_vars = 3000/' /etc/php/8.1/fpm/php.ini
    
    # Start and enable PHP-FPM
    systemctl start php8.1-fpm
    systemctl enable php8.1-fpm
    
    print_success "PHP 8.1 installed and configured"
}

# Function to download WordPress
download_wordpress() {
    local wp_dir="$1"
    local site_type="$2"
    
    print_status "Downloading WordPress for $site_type..."
    
    # Create directory
    mkdir -p "$wp_dir"
    cd "$wp_dir"
    
    # Download WordPress
    wget https://wordpress.org/wordpress-$WP_VERSION.tar.gz
    tar -xzf wordpress-$WP_VERSION.tar.gz --strip-components=1
    rm.wordpress-$WP_VERSION.tar.gz
    
    # Set permissions
    chown -R www-data:www-data "$wp_dir"
    chmod -R 755 "$wp_dir"
    
    print_success "WordPress downloaded to $wp_dir"
}

# Function to create wp-config.php
create_wp_config() {
    local wp_dir="$1"
    local db_name="$2"
    local db_user="$3"
    local db_pass="$4"
    local site_type="$5"
    
    print_status "Creating wp-config.php for $site_type..."
    
    # Generate auth keys
    local keys=$(generate_auth_keys)
    
    cat > "$wp_dir/wp-config.php" <<EOF
<?php
/**
 * WordPress configuration file for MyMeds $site_type
 * Generated on: $(date)
 */

// Database configuration
define('DB_NAME', '$db_name');
define('DB_USER', '$db_user');
define('DB_PASSWORD', '$db_pass');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// WordPress authentication keys
EOF

    # Add generated keys
    while IFS='=' read -r key value; do
        echo "define('$key', '$value');" >> "$wp_dir/wp-config.php"
    done <<< "$keys"

    cat >> "$wp_dir/wp-config.php" <<EOF

// WordPress salts
define('AUTH_SALT',        '$SECURE_AUTH_SALT');
define('SECURE_AUTH_SALT', '$SECURE_AUTH_SALT');
define('LOGGED_IN_SALT',   '$LOGGED_IN_SALT');
define('NONCE_SALT',       '$NONCE_SALT');

// WordPress configuration
define('WP_TABLE_PREFIX', 'wp_');
\$table_prefix = 'wp_';

// WordPress URLs
define('WP_HOME', 'https://$site_type.$DOMAIN');
define('WP_SITEURL', 'https://$site_type.$DOMAIN');

// Security settings
define('DISALLOW_FILE_EDIT', true);
define('WP_POST_REVISIONS', 5);
define('AUTOMATIC_UPDATER_DISABLED', true);
define('WP_AUTO_UPDATE_CORE', false);

// Performance settings
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', true);

// File permissions
define('FS_METHOD', 'direct');
define('FTP_BASE', '/var/www/wordpress/$site_type');
define('FTP_CONTENT_DIR', '/var/www/wordpress/$site_type/wp-content/');

// Memory limits
ini_set('memory_limit', '256M');

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/wordpress-$site_type-errors.log');

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF

    # Secure the config file
    chown www-data:www-data "$wp_dir/wp-config.php"
    chmod 600 "$wp_dir/wp-config.php"
    
    print_success "wp-config.php created for $site_type"
}

# Function to install WordPress via WP-CLI
install_wordpress_wpcli() {
    local wp_dir="$1"
    local site_title="$2"
    local description="$3"
    local admin_user="$4"
    local admin_email="$5"
    local site_type="$6"
    
    print_status "Installing WordPress for $site_type..."
    
    # Install WP-CLI if not installed
    if ! command -v wp >/dev/null 2>&1; then
        print_status "Installing WP-CLI..."
        curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
        chmod +x wp-cli.phar
        mv wp-cli.phar /usr/local/bin/wp
        
        # Install PHP required extensions for WP-CLI
        apt install -y php8.1-cli php8.1-curl
    fi
    
    cd "$wp_dir"
    
    # Install WordPress
    sudo -u www-data wp core install \
        --url="$site_type.$DOMAIN" \
        --title="$site_title" \
        --admin_user="$admin_user" \
        --admin_password="$WP_ADMIN_PASS" \
        --admin_email="$admin_email" \
        --skip-email
    
    # Configure WordPress
    sudo -u www-data wp option update blogdescription "$description"
    sudo -u www-data wp option update timezone_string "America/New_York"
    sudo -u www-data wp option update date_format "F j, Y"
    sudo -u www-data wp option update time_format "g:i A"
    
    print_success "WordPress installed for $site_type"
}

# Function to install WooCommerce
install_woocommerce() {
    local wp_dir="$1"
    
    print_status "Installing WooCommerce..."
    
    cd "$wp_dir"
    
    # Install WooCommerce plugin
    sudo -u www-data wp plugin install woocommerce --activate
    
    # Configure WooCommerce basics
    sudo -u www-data wp option update woocommerce_store_address "1234 Pharmacy Ave"
    sudo -u www-data wp option update woocommerce_store_address_2 ""
    sudo -u www-data wp option update woocommerce_store_city "Brooklyn"
    sudo -u www-data wp option update woocommerce_default_country "US:NY"
    sudo -u www-data wp option update woocommerce_store_postcode "11201"
    sudo -u www-data wp option update woocommerce_currency "USD"
    sudo -u www-data wp option update woocommerce_allowed_countries "specific"
    sudo -u www-data wp option update woocommerce_specific_allowed_countries "US"
    sudo -u www-data wp option update woocommerce_store_phone ""
    sudo -u www-data wp option update woocommerce_email_from_address "admin@$DOMAIN"
    sudo -u www-data wp option update woocommerce_email_from_name "MyMeds Pharmacy"
    
    # Install WooCommerce pages
    sudo -u www-data wp import-plugin woocommerce-demo --activate
    
    print_success "WooCommerce installed and configured"
}

# Function to install additional plugins
install_plugins() {
    local wp_dir="$1"
    local site_type="$2"
    
    print_status "Installing plugins for $site_type..."
    
    cd "$wp_dir"
    
    if [ "$site_type" = "blog" ]; then
        # Blog-specific plugins
        sudo -u www-data wp plugin install wp-super-cache --activate
        sudo -u www-data wp plugin install wp-mail-smtp --activate
        sudo -u www-data wp plugin install wordpress-seo --activate
        sudo -u www-data wp plugin install really-simple-ssl --activate
        
    elif [ "$site_type" = "shop" ]; then
        # Shop-specific plugins
        sudo -u www-data wp plugin install wp-super-cache --activate
        sudo -u www-data wp plugin install wp-mail-smtp --activate
        sudo -u www-data wp plugin install wordpress-seo --activate
        sudo -u www-data wp plugin install really-simple-ssl --activate
        sudo -u www-data wp plugin install woocommerce-single-product-page-builder --activate
        sudo -u www-data wp plugin install woo-commerce-perfect-brand --activate
    fi
    
    print_success "Plugins installed for $site_type"
}

# Function to create WordPress credentials file
create_wp_credentials() {
    print_status "Creating WordPress credentials file..."
    
    cat > /var/www/mymeds/wp-credentials.conf <<EOF
# WordPress Credentials for MyMeds Pharmacy Inc.
# Generated on: $(date)

# Admin Credentials
WP_ADMIN_USER=$WP_ADMIN_USER
WP_ADMIN_PASS=$WP_ADMIN_PASS
WP_ADMIN_EMAIL=$WP_ADMIN_EMAIL

# WordPress URLs
WP_BLOG_URL=https://blog.$DOMAIN
WP_SHOP_URL=https://shop.$DOMAIN

# WordPress Directories
WP_BLOG_DIR=$WP_BLOG_DIR
WP_SHOP_DIR=$WP_SHOP_DIR

# Application passwords for API access
WP_BLOG_APP_PASSWORD=REPLACE_WITH_BLOG_APP_PASSWORD
WP_SHOP_APP_PASSWORD=REPLACE_WITH_SHOP_APP_PASSWORD
EOF

    chmod 600 /var/www/mymeds/wp-credentials.conf
    chown root:root /var/www/mymeds/wp-credentials.conf
    
    print_success "WordPress credentials saved to /var/www/mymeds/wp-credentials.conf"
}

# Function to setup WordPress security
setup_wordpress_security() {
    print_status "Setting up WordPress security..."
    
    # Hide wp-config.php
    cat > /etc/apache2/conf-available/wordpress-security.conf <<EOF
<Directory /var/www/wordpress/>
    <Files wp-config.php>
        Require all denied
    </Files>
    <Files wp-config-sample.php>
        Require all denied
    </Files>
    <Files .htaccess>
        Require all denied
    </Files>
    <Files readme.html>
        Require all denied
    </Files>
    <Files license.txt>
        Require all denied
    </Files>
</Directory>
EOF

    # Create .htaccess for security
    cat > /var/www/wordpress/blog/.htaccess <<EOF
# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Block access to sensitive files
<Files wp-config.php>
    Require all denied
</Files>
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^wp-admin/admin-ajax.php$ - [L]
    RewriteRule ^wp-.* - [F]
</IfModule>
EOF

    cp /var/www/wordpress/blog/.htaccess /var/www/wordpress/shop/.htaccess
    
    print_success "WordPress security configured"
}

# Main execution
main() {
    echo "=========================================="
    echo "  WordPress Setup for MyMeds Pharmacy"
    echo "  Domain: $DOMAIN"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Load database credentials
    if [ -f "/var/www/mymeds/db-credentials.conf" ]; then
        source /var/www/mymeds/db-credentials.conf
    else
        print_error "Database credentials not found. Run setup-database.sh first."
        exit 1
    fi
    
    # Generate admin password
    WP_ADMIN_PASS=$(generate_password)
    
    print_status "Generated WordPress admin password: $WP_ADMIN_PASS"
    
    # Install PHP
    install_php
    
    # Download WordPress for blog
    download_wordpress "$WP_BLOG_DIR" "blog"
    
    # Download WordPress for shop
    download_wordpress "$WP_SHOP_DIR" "shop"
    
    # Create wp-config for blog
    create_wp_config "$WP_BLOG_DIR" "$DB_NAME" "wp_mymeds" "$DB_PASSWORD" "blog"
    
    # Create wp-config for shop
    create_wp_config "$WP_SHOP_DIR" "$DB_NAME" "wp_mymeds" "$DB_PASSWORD" "shop"
    
    # Install WordPress for blog
    install_wordpress_wpcli "$WP_BLOG_DIR" "$WP_SITE_TITLE" "$WP_BLOG_DESCRIPTION" "$WP_ADMIN_USER" "$WP_ADMIN_EMAIL" "blog"
    
    # Install WordPress for shop
    install_wordpress_wpcli "$WP_SHOP_DIR" "$WP_SITE_TITLE" "$WP_SHOP_DESCRIPTION" "$WP_ADMIN_USER" "$WP_ADMIN_EMAIL" "shop"
    
    # Install WooCommerce on shop
    install_woocommerce "$WP_SHOP_DIR"
    
    # Install plugins
    install_plugins "$WP_BLOG_DIR" "blog"
    install_plugins "$WP_SHOP_DIR" "shop"
    
    # Create credentials file
    create_wp_credentials
    
    # Setup security
    setup_wordpress_security
    
    echo ""
    print_success "WordPress setup completed successfully!"
    echo ""
    echo "WordPress Admin Access:"
    echo "Blog Admin: https://blog.$DOMAIN/wp-admin"
    echo "Shop Admin: https://shop.$DOMAIN/wp-admin"
    echo "Username: $WP_ADMIN_USER"
    echo "Password: $WP_ADMIN_PASS"
    echo ""
    echo "Next steps:"
    echo "1. Run the application setup script: ./setup-application.sh"
    echo "2. Configure SSL certificates: ./setup-ssl.sh"
    echo "3. Update nginx configuration: ./setup-nginx.sh"
}

# Run main function
main "$@"


