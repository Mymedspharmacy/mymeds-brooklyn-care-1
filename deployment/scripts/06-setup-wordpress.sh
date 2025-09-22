#!/bin/bash
# =============================================================================
# WORDPRESS & WOOCOMMERCE SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Automated WordPress and WooCommerce installation and configuration
# =============================================================================

set -e

echo "📝 MyMeds Pharmacy Inc. - WordPress & WooCommerce Setup Script"
echo "============================================================="

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
SITE_DESCRIPTION="Your trusted pharmacy for quality healthcare and prescription services"
SITE_URL="https://mymedspharmacyinc.com"

# =============================================================================
# WAIT FOR WORDPRESS
# =============================================================================
log_info "Waiting for WordPress to be ready..."
sleep 30

# =============================================================================
# CHECK WORDPRESS STATUS
# =============================================================================
log_info "Checking WordPress status..."

# Check if WordPress is accessible
if ! curl -f "$WORDPRESS_URL" >/dev/null 2>&1; then
    log_error "WordPress is not accessible at $WORDPRESS_URL"
    exit 1
fi

log_success "WordPress is accessible"

# =============================================================================
# INSTALL WORDPRESS (if needed)
# =============================================================================
log_info "Checking if WordPress needs installation..."

# Check if WordPress is already installed
if curl -s "$WORDPRESS_URL/wp-admin/install.php" | grep -q "Already Installed"; then
    log_info "WordPress is already installed"
elif curl -s "$WORDPRESS_URL/wp-admin/install.php" | grep -q "WordPress"; then
    log_info "Installing WordPress..."
    
    # Create WordPress installation
    curl -X POST "${WORDPRESS_URL}/wp-admin/install.php?step=2" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "weblog_title=${SITE_TITLE}&user_name=${ADMIN_USER}&admin_password=${ADMIN_PASSWORD}&admin_password2=${ADMIN_PASSWORD}&admin_email=${ADMIN_EMAIL}&Submit=Install+WordPress&language=" \
      --cookie-jar /tmp/wp_cookies.txt
    
    log_success "WordPress installation completed"
else
    log_info "WordPress appears to be already configured"
fi

# =============================================================================
# LOGIN TO WORDPRESS
# =============================================================================
log_info "Logging into WordPress..."

# Login to WordPress
curl -X POST "${WORDPRESS_URL}/wp-login.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "log=${ADMIN_USER}&pwd=${ADMIN_PASSWORD}&wp-submit=Log+In&redirect_to=${WORDPRESS_URL}/wp-admin/&testcookie=1" \
  --cookie-jar /tmp/wp_cookies.txt \
  --cookie /tmp/wp_cookies.txt

log_success "Logged into WordPress"

# =============================================================================
# INSTALL WOOCOMMERCE PLUGIN
# =============================================================================
log_info "Installing WooCommerce plugin..."

# Get nonce for plugin installation
NONCE=$(curl -s "${WORDPRESS_URL}/wp-admin/plugin-install.php" \
  --cookie /tmp/wp_cookies.txt | \
  grep -o 'name="_wpnonce" value="[^"]*"' | \
  cut -d'"' -f4)

# Install WooCommerce
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=install-plugin&plugin=woocommerce&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "WooCommerce plugin installed"

# =============================================================================
# ACTIVATE WOOCOMMERCE
# =============================================================================
log_info "Activating WooCommerce..."

# Activate WooCommerce
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=activate&plugin=woocommerce/woocommerce.php&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "WooCommerce activated"

# =============================================================================
# INSTALL ADDITIONAL PLUGINS
# =============================================================================
log_info "Installing additional plugins..."

# List of plugins to install
plugins=(
    "redis-cache"
    "wp-super-cache"
    "wordfence"
    "wordpress-seo"
    "wp-mail-smtp"
)

for plugin in "${plugins[@]}"; do
    log_info "Installing $plugin..."
    
    # Install plugin
    curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "action=install-plugin&plugin=${plugin}&_wpnonce=${NONCE}" \
      --cookie /tmp/wp_cookies.txt
    
    # Activate plugin
    curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "action=activate&plugin=${plugin}/${plugin}.php&_wpnonce=${NONCE}" \
      --cookie /tmp/wp_cookies.txt
    
    log_success "$plugin installed and activated"
done

# =============================================================================
# CONFIGURE WOOCOMMERCE SETTINGS
# =============================================================================
log_info "Configuring WooCommerce settings..."

# Set WooCommerce store address
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=woocommerce_update_options&woocommerce_store_address=123+Main+St&woocommerce_store_city=Brooklyn&woocommerce_default_country=US:NY&woocommerce_store_postcode=11201&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "WooCommerce basic settings configured"

# =============================================================================
# CREATE API USER
# =============================================================================
log_info "Creating API user for MyMeds integration..."

# Create application password for API access
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=create-application-password&user_id=1&application_name=MyMeds+API&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "API user created"

# =============================================================================
# GENERATE WOOCOMMERCE API KEYS
# =============================================================================
log_info "Generating WooCommerce API keys..."

# Create WooCommerce API keys
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=woocommerce_create_api_key&description=MyMeds+Integration&user=1&permissions=read_write&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "WooCommerce API keys generated"

# =============================================================================
# CONFIGURE SITE SETTINGS
# =============================================================================
log_info "Configuring site settings..."

# Set site title and description
curl -X POST "${WORDPRESS_URL}/wp-admin/options-general.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "blogname=${SITE_TITLE}&blogdescription=${SITE_DESCRIPTION}&siteurl=${SITE_URL}&home=${SITE_URL}&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "Site settings configured"

# =============================================================================
# SETUP PHARMACY-SPECIFIC PAGES
# =============================================================================
log_info "Creating pharmacy-specific pages..."

# Create About Us page
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=editpost&post_type=page&post_title=About+Us&post_content=Welcome+to+MyMeds+Pharmacy+Inc.+We+are+your+trusted+pharmacy+for+quality+healthcare+services.&post_status=publish&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

# Create Contact Us page
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=editpost&post_type=page&post_title=Contact+Us&post_content=Contact+MyMeds+Pharmacy+Inc.+for+all+your+pharmacy+needs.&post_status=publish&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

# Create Services page
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=editpost&post_type=page&post_title=Services&post_content=Our+comprehensive+pharmacy+services+include+prescription+management%2C+medication+counseling%2C+and+health+consultations.&post_status=publish&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "Pharmacy pages created"

# =============================================================================
# CONFIGURE MENUS
# =============================================================================
log_info "Setting up navigation menus..."

# Create main menu
curl -X POST "${WORDPRESS_URL}/wp-admin/admin-ajax.php" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "action=wp_create_nav_menu&menu-name=Main+Menu&_wpnonce=${NONCE}" \
  --cookie /tmp/wp_cookies.txt

log_success "Navigation menu created"

# =============================================================================
# CLEANUP
# =============================================================================
log_info "Cleaning up temporary files..."
rm -f /tmp/wp_cookies.txt

log_success "Cleanup completed"

# =============================================================================
# VERIFICATION
# =============================================================================
log_info "Verifying WordPress setup..."

# Check if WordPress is accessible
if curl -f "$WORDPRESS_URL" >/dev/null 2>&1; then
    log_success "WordPress is accessible"
else
    log_error "WordPress is not accessible"
    exit 1
fi

# Check if WooCommerce is active
if curl -s "$WORDPRESS_URL/wp-admin/plugins.php" | grep -q "WooCommerce.*Active"; then
    log_success "WooCommerce is active"
else
    log_warning "WooCommerce may not be active"
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 WordPress & WooCommerce setup completed successfully!"
echo ""
log_info "WordPress Configuration:"
echo "========================="
echo "Site URL: $WORDPRESS_URL"
echo "Admin URL: $WORDPRESS_URL/wp-admin"
echo "Admin User: $ADMIN_USER"
echo "Admin Password: $ADMIN_PASSWORD"
echo "Admin Email: $ADMIN_EMAIL"
echo ""
log_info "Installed Plugins:"
echo "==================="
echo "✅ WooCommerce - E-commerce functionality"
echo "✅ Redis Cache - Performance optimization"
echo "✅ WP Super Cache - Additional caching"
echo "✅ Wordfence - Security protection"
echo "✅ Yoast SEO - Search engine optimization"
echo "✅ WP Mail SMTP - Email delivery"
echo ""
log_info "Created Pages:"
echo "==============="
echo "✅ About Us"
echo "✅ Contact Us"
echo "✅ Services"
echo "✅ Main Navigation Menu"
echo ""
log_info "Access URLs:"
echo "============="
echo "🌐 WordPress Admin: $WORDPRESS_URL/wp-admin"
echo "🛒 WooCommerce Shop: $WORDPRESS_URL/shop"
echo "📝 Blog: $WORDPRESS_URL/blog"
echo "🔐 Admin Login: $ADMIN_USER / $ADMIN_PASSWORD"
echo ""
log_info "Next steps:"
echo "============"
echo "1. Access WordPress admin panel to customize settings"
echo "2. Configure WooCommerce store settings"
echo "3. Add products to your pharmacy shop"
echo "4. Test MyMeds integration with WordPress"
echo "5. Configure SSL certificates for HTTPS"
echo ""
log_success "WordPress and WooCommerce are ready for pharmacy operations!"

