#!/bin/bash
# =============================================================================
# ENVIRONMENT SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Interactive script to configure production environment variables
# =============================================================================

set -e

echo "🔧 MyMeds Pharmacy Inc. - Environment Configuration"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# CONFIGURATION FUNCTIONS
# =============================================================================

prompt_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\${input:-$default}"
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

prompt_password() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " input
    echo
    eval "$var_name=\"$input\""
}

# =============================================================================
# MAIN CONFIGURATION
# =============================================================================

log_info "Starting environment configuration..."

# Database Configuration
echo ""
log_info "=== DATABASE CONFIGURATION ==="
prompt_input "MySQL Root Password" "Mymeds2025!RootSecure123!@#" "MYSQL_ROOT_PASSWORD"
prompt_input "MySQL Database Name" "mymeds_production" "MYSQL_DATABASE"
prompt_input "MySQL Username" "mymeds_user" "MYSQL_USER"
prompt_input "MySQL Password" "Mymeds2025!UserSecure123!@#" "MYSQL_PASSWORD"

# Admin Configuration
echo ""
log_info "=== ADMIN CONFIGURATION ==="
prompt_input "Admin Email" "admin@mymedspharmacyinc.com" "ADMIN_EMAIL"
prompt_password "Admin Password" "ADMIN_PASSWORD"
prompt_input "Admin First Name" "Admin" "ADMIN_FIRST_NAME"
prompt_input "Admin Last Name" "User" "ADMIN_LAST_NAME"

# Domain Configuration
echo ""
log_info "=== DOMAIN CONFIGURATION ==="
prompt_input "Your Domain (e.g., mymedspharmacyinc.com)" "" "DOMAIN"
prompt_input "CORS Origins (comma-separated)" "https://www.$DOMAIN,https://$DOMAIN" "CORS_ORIGIN"

# Email Configuration
echo ""
log_info "=== EMAIL CONFIGURATION ==="
prompt_input "Email Host" "smtp.gmail.com" "EMAIL_HOST"
prompt_input "Email Port" "587" "EMAIL_PORT"
prompt_input "Email Username" "mymedspharmacyinc@gmail.com" "EMAIL_USER"
prompt_password "Email Password" "EMAIL_PASSWORD"
prompt_input "Email From Address" "mymedspharmacyinc@gmail.com" "EMAIL_FROM"
prompt_input "Email From Name" "MyMeds Pharmacy Inc." "EMAIL_FROM_NAME"

# WordPress Configuration
echo ""
log_info "=== WORDPRESS CONFIGURATION ==="
prompt_input "WordPress URL" "https://$DOMAIN/blog" "WORDPRESS_URL"
prompt_input "WordPress Username" "mymeds_api_user" "WORDPRESS_USERNAME"
prompt_password "WordPress App Password" "WORDPRESS_APP_PASSWORD"

# WooCommerce Configuration
echo ""
log_info "=== WOOCOMMERCE CONFIGURATION ==="
prompt_input "WooCommerce Store URL" "https://$DOMAIN/shop" "WOOCOMMERCE_STORE_URL"
prompt_input "WooCommerce Consumer Key" "ck_47e02dc770a3824275746e6efd09a01497e3881f" "WOOCOMMERCE_CONSUMER_KEY"
prompt_password "WooCommerce Consumer Secret" "WOOCOMMERCE_CONSUMER_SECRET"
prompt_password "WooCommerce Webhook Secret" "WOOCOMMERCE_WEBHOOK_SECRET"

# Payment Gateway Configuration
echo ""
log_info "=== PAYMENT GATEWAY CONFIGURATION ==="
prompt_input "Stripe Secret Key" "sk_live_YourStripeSecretKey123" "STRIPE_SECRET_KEY"
prompt_input "Stripe Publishable Key" "pk_live_YourStripePublishableKey123" "STRIPE_PUBLISHABLE_KEY"
prompt_password "Stripe Webhook Secret" "STRIPE_WEBHOOK_SECRET"

# Security Configuration
echo ""
log_info "=== SECURITY CONFIGURATION ==="
prompt_input "JWT Secret" "Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()" "JWT_SECRET"
prompt_input "Session Secret" "Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()" "SESSION_SECRET"

# Optional Configuration
echo ""
log_info "=== OPTIONAL CONFIGURATION ==="
prompt_input "Sentry DSN (optional)" "https://YourSentryDSN@sentry.io/project-id" "SENTRY_DSN"
prompt_input "Google Analytics ID (optional)" "GA-XXXXXXXXX-X" "GOOGLE_ANALYTICS_ID"

# =============================================================================
# GENERATE ENVIRONMENT FILE
# =============================================================================

log_info "Generating production environment file..."

cat > .env.production << EOF
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION - MyMeds Pharmacy Inc.
# =============================================================================
# Generated on: $(date)
# Domain: $DOMAIN
# =============================================================================

# Database Configuration
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_DATABASE=$MYSQL_DATABASE
MYSQL_USER=$MYSQL_USER
MYSQL_PASSWORD=$MYSQL_PASSWORD

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# JWT & Authentication
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_FIRST_NAME=$ADMIN_FIRST_NAME
ADMIN_LAST_NAME=$ADMIN_LAST_NAME

# Email Configuration
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_FROM
EMAIL_FROM_NAME=$EMAIL_FROM_NAME

# CORS Configuration
CORS_ORIGIN=$CORS_ORIGIN

# Security Configuration
SESSION_SECRET=$SESSION_SECRET

# WordPress Integration
WORDPRESS_URL=$WORDPRESS_URL
WORDPRESS_USERNAME=$WORDPRESS_USERNAME
WORDPRESS_APP_PASSWORD=$WORDPRESS_APP_PASSWORD

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=$WOOCOMMERCE_STORE_URL
WOOCOMMERCE_CONSUMER_KEY=$WOOCOMMERCE_CONSUMER_KEY
WOOCOMMERCE_CONSUMER_SECRET=$WOOCOMMERCE_CONSUMER_SECRET
WOOCOMMERCE_WEBHOOK_SECRET=$WOOCOMMERCE_WEBHOOK_SECRET

# Payment Gateway Configuration
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET

# Monitoring & Analytics
SENTRY_DSN=$SENTRY_DSN
GOOGLE_ANALYTICS_ID=$GOOGLE_ANALYTICS_ID

# Additional Configuration
FEATURE_WORDPRESS_ENABLED=true
FEATURE_WOOCOMMERCE_ENABLED=true
PAYMENT_GATEWAY_ENABLED=true
ANALYTICS_ENABLED=true
SENTRY_ENABLED=true
BACKUP_ENABLED=true
COMPRESSION_ENABLED=true
CLUSTER_ENABLED=true
CLUSTER_WORKERS=4
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF

chmod 600 .env.production
log_success "Environment file created: .env.production"

# =============================================================================
# VERIFICATION
# =============================================================================

echo ""
log_info "=== CONFIGURATION SUMMARY ==="
echo "Domain: $DOMAIN"
echo "Admin Email: $ADMIN_EMAIL"
echo "Database: $MYSQL_DATABASE"
echo "WordPress URL: $WORDPRESS_URL"
echo "WooCommerce URL: $WOOCOMMERCE_STORE_URL"
echo "Email From: $EMAIL_FROM"
echo ""

log_success "Environment configuration completed!"
echo ""
log_info "Next steps:"
echo "1. Review the generated .env.production file"
echo "2. Run the deployment script: ./deploy-vps-quick.sh"
echo "3. Test all functionality"
echo "4. Configure SSL certificates"
echo "5. Set up monitoring and backups"
echo ""
log_warning "Important: Keep your .env.production file secure and never commit it to version control!"
