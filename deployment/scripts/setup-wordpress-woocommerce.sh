#!/bin/bash
# =============================================================================
# WORDPRESS + WOOCOMMERCE SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Automated WordPress and WooCommerce installation and configuration
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - WordPress + WooCommerce Setup"
echo "======================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# CONFIGURATION
# =============================================================================
WORDPRESS_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PASSWORD="Mymeds2025!AdminSecure123!@#"
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
SITE_TITLE="MyMeds Pharmacy Inc."
SITE_DESCRIPTION="Your trusted pharmacy for quality healthcare"

# =============================================================================
# WAIT FOR WORDPRESS
# =============================================================================
log_info "Waiting for WordPress to be ready..."
sleep 30

# =============================================================================
# INSTALL WORDPRESS
# =============================================================================
log_info "Installing WordPress..."

# Create WordPress installation
curl -X POST "${WORDPRESS_URL}/wp-admin/install.php?step=2" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "weblog_title=${SITE_TITLE}&user_name=${ADMIN_USER}&admin_password=${ADMIN_PASSWORD}&admin_password2=${ADMIN_PASSWORD}&admin_email=${ADMIN_EMAIL}&Submit=Install+WordPress&language="

log_success "WordPress installation completed"

# =============================================================================
# INSTALL WOOCOMMERCE
# =============================================================================
log_info "Installing WooCommerce plugin..."

# Download and install WooCommerce
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=install-plugin&plugin=woocommerce&_wpnonce=$(curl -s "${WORDPRESS_URL}/wp-admin/plugins.php" | grep -o 'name="_wpnonce" value="[^"]*"' | cut -d'"' -f4)"

log_success "WooCommerce installation completed"

# =============================================================================
# CONFIGURE WOOCOMMERCE
# =============================================================================
log_info "Configuring WooCommerce..."

# Activate WooCommerce
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=activate&plugin=woocommerce/woocommerce.php&_wpnonce=$(curl -s "${WORDPRESS_URL}/wp-admin/plugins.php" | grep -o 'name="_wpnonce" value="[^"]*"' | cut -d'"' -f4)"

log_success "WooCommerce configuration completed"

# =============================================================================
# CREATE API USER
# =============================================================================
log_info "Creating API user for MyMeds integration..."

# Create application password for API access
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=create-application-password&user_id=1&application_name=MyMeds+API&_wpnonce=$(curl -s "${WORDPRESS_URL}/wp-admin/profile.php" | grep -o 'name="_wpnonce" value="[^"]*"' | cut -d'"' -f4)"

log_success "API user created"

# =============================================================================
# GENERATE WOOCOMMERCE API KEYS
# =============================================================================
log_info "Generating WooCommerce API keys..."

# Create WooCommerce API keys
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=woocommerce_create_api_key&description=MyMeds+Integration&user=1&permissions=read_write&_wpnonce=$(curl -s "${WORDPRESS_URL}/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys" | grep -o 'name="_wpnonce" value="[^"]*"' | cut -d'"' -f4)"

log_success "WooCommerce API keys generated"

# =============================================================================
# SETUP COMPLETE
# =============================================================================
log_success "🎉 WordPress + WooCommerce setup completed successfully!"
echo ""
log_info "Access URLs:"
echo "🌐 WordPress Admin: ${WORDPRESS_URL}/wp-admin"
echo "🛒 WooCommerce Shop: ${WORDPRESS_URL}/shop"
echo "📝 Blog: ${WORDPRESS_URL}/blog"
echo "🔐 Admin Login: ${ADMIN_USER} / ${ADMIN_PASSWORD}"
echo ""
log_info "Next steps:"
echo "1. Access WordPress admin panel"
echo "2. Configure WooCommerce settings"
echo "3. Add products to your shop"
echo "4. Test MyMeds integration"
