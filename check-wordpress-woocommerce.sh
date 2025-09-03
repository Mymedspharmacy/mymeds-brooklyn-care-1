#!/bin/bash

# WordPress and WooCommerce Status Check Script
# This script checks if WordPress and WooCommerce are installed and configured

set -e

echo "🔍 Checking WordPress and WooCommerce Status..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

echo "=========================================="
echo "WORDPRESS STATUS CHECK"
echo "=========================================="

# Check common WordPress installation paths
WORDPRESS_PATHS=(
    "/var/www/html"
    "/var/www/mymedspharmacyinc.com"
    "/var/www/mymedspharmacyinc.com/blog"
    "/var/www/mymedspharmacyinc.com/shop"
    "/var/www/wordpress"
    "/var/www/html/blog"
    "/var/www/html/shop"
)

WORDPRESS_FOUND=false
WORDPRESS_PATH=""

for path in "${WORDPRESS_PATHS[@]}"; do
    if [ -d "$path" ] && [ -f "$path/wp-config.php" ]; then
        print_success "WordPress found at: $path"
        WORDPRESS_FOUND=true
        WORDPRESS_PATH="$path"
        break
    fi
done

if [ "$WORDPRESS_FOUND" = false ]; then
    print_warning "WordPress not found in common locations"
    echo "Checking for wp-config.php files in /var/www:"
    find /var/www -name "wp-config.php" 2>/dev/null || print_warning "No wp-config.php files found"
fi

# Check if WordPress is accessible via web
echo ""
print_status "Testing WordPress web accessibility..."

# Check common URLs
WORDPRESS_URLS=(
    "https://mymedspharmacyinc.com"
    "https://mymedspharmacyinc.com/blog"
    "https://mymedspharmacyinc.com/shop"
    "http://localhost"
    "http://localhost/blog"
    "http://localhost/shop"
)

for url in "${WORDPRESS_URLS[@]}"; do
    if curl -s --head "$url" | head -n 1 | grep "HTTP" > /dev/null; then
        print_success "Web server responding at: $url"
        # Check if it's WordPress
        if curl -s "$url" | grep -i "wordpress" > /dev/null; then
            print_success "WordPress detected at: $url"
        fi
    fi
done

echo ""
echo "=========================================="
echo "WOOCOMMERCE STATUS CHECK"
echo "=========================================="

# Check if WooCommerce plugin is installed
if [ "$WORDPRESS_FOUND" = true ]; then
    print_status "Checking WooCommerce plugin in WordPress installation..."
    
    # Check for WooCommerce plugin directory
    if [ -d "$WORDPRESS_PATH/wp-content/plugins/woocommerce" ]; then
        print_success "WooCommerce plugin directory found"
        
        # Check if plugin is active
        if grep -r "woocommerce/woocommerce.php" "$WORDPRESS_PATH/wp-content/plugins/" > /dev/null 2>&1; then
            print_success "WooCommerce plugin appears to be installed"
        else
            print_warning "WooCommerce plugin directory exists but may not be active"
        fi
    else
        print_warning "WooCommerce plugin directory not found"
    fi
fi

# Check WooCommerce API endpoints
echo ""
print_status "Testing WooCommerce API endpoints..."

for url in "${WORDPRESS_URLS[@]}"; do
    if curl -s --head "$url" | head -n 1 | grep "HTTP" > /dev/null; then
        # Test WooCommerce REST API
        if curl -s "$url/wp-json/wc/v3/" > /dev/null 2>&1; then
            print_success "WooCommerce REST API accessible at: $url/wp-json/wc/v3/"
        fi
        
        # Test WooCommerce system status
        if curl -s "$url/wp-json/wc/v3/system_status" > /dev/null 2>&1; then
            print_success "WooCommerce system status endpoint accessible"
        fi
    fi
done

echo ""
echo "=========================================="
echo "DATABASE STATUS CHECK"
echo "=========================================="

# Check MySQL/MariaDB status
if systemctl is-active --quiet mysql; then
    print_success "MySQL/MariaDB service is running"
else
    print_error "MySQL/MariaDB service is not running"
fi

# Check for WordPress databases
print_status "Checking for WordPress databases..."

# Get list of databases
DATABASES=$(mysql -e "SHOW DATABASES;" 2>/dev/null | grep -E "(wordpress|wp_|mymeds|blog|shop)" || echo "")

if [ -n "$DATABASES" ]; then
    print_success "Found potential WordPress databases:"
    echo "$DATABASES"
else
    print_warning "No obvious WordPress databases found"
fi

echo ""
echo "=========================================="
echo "WEB SERVER STATUS CHECK"
echo "=========================================="

# Check Apache/Nginx
if systemctl is-active --quiet apache2; then
    print_success "Apache2 is running"
elif systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_warning "Neither Apache2 nor Nginx appears to be running"
fi

# Check for virtual hosts
print_status "Checking web server configuration..."

if [ -d "/etc/apache2/sites-available" ]; then
    print_status "Apache virtual hosts:"
    ls /etc/apache2/sites-available/ 2>/dev/null || print_warning "No sites found"
fi

if [ -d "/etc/nginx/sites-available" ]; then
    print_status "Nginx virtual hosts:"
    ls /etc/nginx/sites-available/ 2>/dev/null || print_warning "No sites found"
fi

echo ""
echo "=========================================="
echo "SSL CERTIFICATES CHECK"
echo "=========================================="

# Check SSL certificates
for domain in "mymedspharmacyinc.com"; do
    if [ -d "/etc/letsencrypt/live/$domain" ]; then
        print_success "SSL certificate found for $domain"
    else
        print_warning "No SSL certificate found for $domain"
    fi
done

echo ""
echo "=========================================="
echo "ENVIRONMENT VARIABLES CHECK"
echo "=========================================="

# Check if environment variables are set
ENV_FILES=(
    "/var/www/mymeds/backend/.env"
    "/var/www/mymeds/.env"
    "/var/www/mymeds/backend/env.production"
)

for env_file in "${ENV_FILES[@]}"; do
    if [ -f "$env_file" ]; then
        print_success "Environment file found: $env_file"
        
        # Check for WordPress/WooCommerce variables
        if grep -q "WORDPRESS\|WOOCOMMERCE" "$env_file"; then
            print_success "WordPress/WooCommerce environment variables found"
            echo "Variables found:"
            grep -E "WORDPRESS|WOOCOMMERCE" "$env_file" | sed 's/=.*/=***/' || echo "None"
        else
            print_warning "No WordPress/WooCommerce environment variables found"
        fi
    fi
done

echo ""
echo "=========================================="
echo "SUMMARY"
echo "=========================================="

if [ "$WORDPRESS_FOUND" = true ]; then
    print_success "✅ WordPress is installed"
    echo "   Location: $WORDPRESS_PATH"
else
    print_error "❌ WordPress not found"
fi

# Check WooCommerce status
if [ "$WORDPRESS_FOUND" = true ] && [ -d "$WORDPRESS_PATH/wp-content/plugins/woocommerce" ]; then
    print_success "✅ WooCommerce plugin is installed"
else
    print_warning "⚠️ WooCommerce plugin not found or WordPress not installed"
fi

echo ""
print_status "Next steps:"
if [ "$WORDPRESS_FOUND" = false ]; then
    echo "1. Install WordPress"
    echo "2. Configure database"
    echo "3. Set up virtual host"
fi

if [ "$WORDPRESS_FOUND" = true ] && [ ! -d "$WORDPRESS_PATH/wp-content/plugins/woocommerce" ]; then
    echo "1. Install WooCommerce plugin"
    echo "2. Configure WooCommerce settings"
    echo "3. Generate API keys"
fi

echo ""
print_status "Check complete! 🎉"
