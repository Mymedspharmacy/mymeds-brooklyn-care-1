#!/bin/bash
# =============================================================================
# DEPENDENCIES INSTALLATION SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Installs Node.js, WordPress, WooCommerce and other application dependencies
# =============================================================================

set -e

echo "📦 MyMeds Pharmacy Inc. - Dependencies Installation Script"
echo "======================================================="

# Colors
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
# NODE.JS INSTALLATION
# =============================================================================
log_info "Installing Node.js..."

# Remove old Node.js installations
apt remove -y nodejs npm || true

# Add NodeSource repository for Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version
npm --version

log_success "Node.js installed"

# =============================================================================
# GLOBAL NPM PACKAGES
# =============================================================================
log_info "Installing global npm packages..."

# Install essential global packages
npm install -g \
    pm2 \
    nodemon \
    typescript \
    ts-node \
    @types/node \
    prisma \
    concurrently

log_success "Global npm packages installed"

# =============================================================================
# DOCKER IMAGES PULL
# =============================================================================
log_info "Pulling required Docker images..."

# Pull all required images
docker pull mysql:8.0
docker pull wordpress:6.4-php8.2-apache
docker pull redis:7-alpine
docker pull nginx:alpine
docker pull node:18-alpine

log_success "Docker images pulled"

# =============================================================================
# WORDPRESS PLUGINS PREPARATION
# =============================================================================
log_info "Preparing WordPress plugins..."

# Create WordPress plugins directory
mkdir -p /var/www/mymeds/wordpress-plugins

# Download WooCommerce plugin
log_info "Downloading WooCommerce plugin..."
cd /var/www/mymeds/wordpress-plugins

# Download latest WooCommerce
wget -q https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip -q woocommerce.latest-stable.zip
rm woocommerce.latest-stable.zip

# Download essential WordPress plugins
log_info "Downloading essential WordPress plugins..."

# Redis Object Cache
wget -q https://downloads.wordpress.org/plugin/redis-cache.latest-stable.zip
unzip -q redis-cache.latest-stable.zip
rm redis-cache.latest-stable.zip

# WP Super Cache
wget -q https://downloads.wordpress.org/plugin/wp-super-cache.latest-stable.zip
unzip -q wp-super-cache.latest-stable.zip
rm wp-super-cache.latest-stable.zip

# Wordfence Security
wget -q https://downloads.wordpress.org/plugin/wordfence.latest-stable.zip
unzip -q wordfence.latest-stable.zip
rm wordfence.latest-stable.zip

# Yoast SEO
wget -q https://downloads.wordpress.org/plugin/wordpress-seo.latest-stable.zip
unzip -q wordpress-seo.latest-stable.zip
rm wordpress-seo.latest-stable.zip

# WP Mail SMTP
wget -q https://downloads.wordpress.org/plugin/wp-mail-smtp.latest-stable.zip
unzip -q wp-mail-smtp.latest-stable.zip
rm wp-mail-smtp.latest-stable.zip

log_success "WordPress plugins downloaded"

# =============================================================================
# WORDPRESS THEMES PREPARATION
# =============================================================================
log_info "Preparing WordPress themes..."

# Create WordPress themes directory
mkdir -p /var/www/mymeds/wordpress-themes

cd /var/www/mymeds/wordpress-themes

# Download pharmacy-optimized theme (Storefront)
log_info "Downloading Storefront theme for pharmacy..."
wget -q https://downloads.wordpress.org/theme/storefront.latest-stable.zip
unzip -q storefront.latest-stable.zip
rm storefront.latest-stable.zip

# Download Astra theme as alternative
log_info "Downloading Astra theme..."
wget -q https://downloads.wordpress.org/theme/astra.latest-stable.zip
unzip -q astra.latest-stable.zip
rm astra.latest-stable.zip

log_success "WordPress themes downloaded"

# =============================================================================
# SSL CERTIFICATES SETUP
# =============================================================================
log_info "Setting up SSL certificates directory..."

# Create SSL directory
mkdir -p /var/www/mymeds/ssl

# Generate self-signed certificate for development
log_info "Generating self-signed SSL certificate..."
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /var/www/mymeds/ssl/mymeds.key \
    -out /var/www/mymeds/ssl/mymeds.crt \
    -subj "/C=US/ST=NY/L=Brooklyn/O=MyMeds Pharmacy Inc./CN=mymedspharmacyinc.com"

log_success "SSL certificates prepared"

# =============================================================================
# APPLICATION DEPENDENCIES
# =============================================================================
log_info "Installing application dependencies..."

cd /var/www/mymeds

# Install frontend dependencies
if [ -f "package.json" ]; then
    log_info "Installing frontend dependencies..."
    npm install --production
    log_success "Frontend dependencies installed"
fi

# Install backend dependencies
if [ -f "backend/package.json" ]; then
    log_info "Installing backend dependencies..."
    cd backend
    npm install --production
    cd ..
    log_success "Backend dependencies installed"
fi

# =============================================================================
# BUILD APPLICATION
# =============================================================================
log_info "Building application..."

# Build frontend
if [ -f "package.json" ]; then
    log_info "Building frontend..."
    npm run build
    log_success "Frontend built"
fi

# Build backend
if [ -f "backend/package.json" ]; then
    log_info "Building backend..."
    cd backend
    npm run build
    cd ..
    log_success "Backend built"
fi

# =============================================================================
# PRISMA SETUP
# =============================================================================
log_info "Setting up Prisma..."

if [ -f "backend/prisma/schema.prisma" ]; then
    cd backend
    # Generate Prisma client
    npx prisma generate
    cd ..
    log_success "Prisma client generated"
fi

# =============================================================================
# PERMISSIONS SETUP
# =============================================================================
log_info "Setting up permissions..."

# Set proper ownership
chown -R root:root /var/www/mymeds

# Set executable permissions
chmod +x deployment/scripts/*.sh
chmod +x docker-entrypoint*.sh

# Set directory permissions
chmod 755 /var/www/mymeds/{uploads,logs,backups,ssl}
chmod 755 /var/www/mymeds/wordpress-{plugins,themes}

# Set file permissions
chmod 644 /var/www/mymeds/.env.production
chmod 644 /var/www/mymeds/ssl/*.crt
chmod 600 /var/www/mymeds/ssl/*.key

log_success "Permissions set"

# =============================================================================
# VERIFICATION
# =============================================================================
log_info "Verifying installations..."

echo "=== Installation Verification ==="
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"

echo ""
echo "=== WordPress Plugins ==="
ls -la /var/www/mymeds/wordpress-plugins/

echo ""
echo "=== WordPress Themes ==="
ls -la /var/www/mymeds/wordpress-themes/

echo ""
echo "=== SSL Certificates ==="
ls -la /var/www/mymeds/ssl/

echo ""
echo "=== Application Build ==="
if [ -d "dist" ]; then
    echo "Frontend built: $(du -sh dist)"
fi
if [ -d "backend/dist" ]; then
    echo "Backend built: $(du -sh backend/dist)"
fi

echo ""
echo "=== Disk Usage ==="
df -h /var/www/mymeds

log_success "Installation verification completed"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 Dependencies installation completed successfully!"
echo ""
log_info "Installed Components:"
echo "======================="
echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"
echo "✅ PM2 process manager"
echo "✅ Docker images (MySQL, WordPress, Redis, Nginx)"
echo "✅ WordPress plugins (WooCommerce, Redis Cache, etc.)"
echo "✅ WordPress themes (Storefront, Astra)"
echo "✅ SSL certificates"
echo "✅ Application dependencies"
echo "✅ Built applications"
echo ""
log_info "Next steps:"
echo "1. Run: ./deployment/scripts/04-setup-database.sh"
echo "2. Run: ./deployment/scripts/05-deploy-application.sh"
echo ""
log_info "All dependencies are ready for deployment!"

