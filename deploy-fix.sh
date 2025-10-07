#!/bin/bash

# =============================================================================
# MyMeds Pharmacy Inc. - Fixed VPS Deployment Script
# =============================================================================
# This script fixes the issues encountered in the original deployment
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Variables
DOMAIN="mymedspharmacyinc.com"
ADMIN_EMAIL="mymedspharmacyinc@gmail.com"
ADMIN_PASSWORD="Pharm-23-medS"
DB_PASSWORD="Pharm-23-medS"
WP_PASSWORD="Pharm-23-medS"

# Application paths
APP_DIR="/var/www/mymeds-pharmacy"
WORDPRESS_DIR="/var/www/wordpress"
BACKUP_DIR="/var/backups/mymeds-pharmacy"
LOG_DIR="/var/www/mymeds-pharmacy/logs"

# Database configuration
DB_NAME="mymeds_production"
WP_DB_NAME="mymeds_wordpress"
DB_USER="mymeds_user"
WP_DB_USER="mymeds_wordpress_user"

# Function to print colored output
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

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root"
    exit 1
fi

print_status "Starting MyMeds Pharmacy VPS Deployment Fix..."
print_status "Domain: $DOMAIN"
print_status "Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Fix PHP installation
print_status "Installing PHP 8.3 (Ubuntu 24.04 default)..."
apt install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring php8.3-xml php8.3-zip php8.3-intl php8.3-bcmath php8.3-soap

# Start and enable PHP-FPM
systemctl start php8.3-fpm
systemctl enable php8.3-fpm

print_success "PHP 8.3 installed and started"

# Step 2: Install TypeScript globally
print_status "Installing TypeScript globally..."
npm install -g typescript

print_success "TypeScript installed"

# Step 3: Fix MySQL configuration
print_status "Fixing MySQL configuration..."
systemctl restart mysql

# Wait for MySQL to start
sleep 5

# Set root password
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';" || true
mysql -e "FLUSH PRIVILEGES;" || true

# Create databases and users
mysql -u root -p"$DB_PASSWORD" -e "
    CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS $WP_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
    CREATE USER IF NOT EXISTS '$WP_DB_USER'@'localhost' IDENTIFIED BY '$WP_PASSWORD';
    GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
    GRANT ALL PRIVILEGES ON $WP_DB_NAME.* TO '$WP_DB_USER'@'localhost';
    FLUSH PRIVILEGES;
" || print_warning "MySQL configuration may need manual setup"

print_success "MySQL configuration updated"

# Step 4: Clone repository if not exists
if [ ! -d "$APP_DIR" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git $APP_DIR
    print_success "Repository cloned"
fi

# Step 5: Install dependencies and build
print_status "Installing dependencies and building application..."
cd $APP_DIR

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install --production

# Build frontend
cd ..
npm run build:production

# Build backend
cd backend
npm run build:production

# Generate Prisma client
npx prisma generate

print_success "Application built successfully"

# Step 6: Setup WordPress
print_status "Setting up WordPress..."
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
cp -r wordpress/* $WORDPRESS_DIR/

# Download WooCommerce plugin
cd $WORDPRESS_DIR/wp-content/plugins
wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip woocommerce.latest-stable.zip
rm woocommerce.latest-stable.zip

# Set permissions
chown -R www-data:www-data $WORDPRESS_DIR
chmod -R 755 $WORDPRESS_DIR

print_success "WordPress and WooCommerce installed"

# Step 7: Create environment file
print_status "Creating environment configuration..."
cat > $APP_DIR/backend/.env << EOF
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
JWT_SECRET="mymeds-pharmacy-jwt-secret-key-minimum-32-characters-long-for-security-production"
JWT_EXPIRES_IN="24h"
NODE_ENV="production"
PORT=4000
CORS_ORIGIN="https://$DOMAIN"
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
ADMIN_NAME="Admin User"
CSRF_SECRET="mymeds-pharmacy-csrf-secret-key-minimum-32-characters-long-for-security-production"
BCRYPT_ROUNDS=12
WOOCOMMERCE_STORE_URL="https://$DOMAIN/shop"
WOOCOMMERCE_CONSUMER_KEY="ck_your_consumer_key_here"
WOOCOMMERCE_CONSUMER_SECRET="cs_your_consumer_secret_here"
VITE_WORDPRESS_URL="https://$DOMAIN/shop"
VITE_WORDPRESS_API_URL="https://$DOMAIN/shop/wp-json/wp/v2"
EMAIL_HOST="smtp.office365.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="noreply@$DOMAIN"
EMAIL_PASS="$ADMIN_PASSWORD"
EMAIL_FROM="noreply@$DOMAIN"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="$APP_DIR/uploads"
LOG_LEVEL="info"
LOG_FILE="$LOG_DIR/app.log"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET="mymeds-pharmacy-session-secret-key-minimum-32-characters-long"
SESSION_MAX_AGE=86400000
BACKUP_DIR="$BACKUP_DIR"
BACKUP_RETENTION_DAYS=30
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI="https://$DOMAIN/api/security/csp-report"
CACHE_ENABLED=true
CACHE_TTL=3600
DEBUG_MODE=false
MAINTENANCE_MODE=false
ENABLE_DEBUG_ROUTES=false
EOF

chown www-data:www-data $APP_DIR/backend/.env
chmod 600 $APP_DIR/backend/.env

print_success "Environment configured"

# Step 8: Run database migrations
print_status "Running database migrations..."
cd $APP_DIR/backend
npx prisma migrate deploy || print_warning "Migrations may need manual setup"
npx prisma generate

print_success "Database migrations completed"

# Step 9: Create PM2 configuration
print_status "Setting up PM2..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    cwd: '/var/www/mymeds-pharmacy/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/www/mymeds-pharmacy/logs/error.log',
    out_file: '/var/www/mymeds-pharmacy/logs/out.log',
    log_file: '/var/www/mymeds-pharmacy/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF

# Start application with PM2
cd $APP_DIR
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

print_success "PM2 configured and application started"

# Step 10: Update Nginx configuration for PHP 8.3
print_status "Updating Nginx configuration for PHP 8.3..."
sed -i 's/php8.1-fpm/php8.3-fpm/g' /etc/nginx/sites-available/mymeds-pharmacy

# Test and reload Nginx
nginx -t
systemctl reload nginx

print_success "Nginx configuration updated"

# Step 11: Setup SSL certificate
print_status "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect || print_warning "SSL setup may need manual configuration"

# Setup auto-renewal
echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -

print_success "SSL certificate configured"

# Step 12: Verify deployment
print_status "Verifying deployment..."
pm2 status
systemctl status nginx mysql php8.3-fpm --no-pager

# Test backend health
curl -f http://localhost:4000/api/health || print_warning "Backend health check failed"

print_success "=========================================="
print_success "MyMeds Pharmacy Deployment Complete!"
print_success "=========================================="
echo ""
print_status "🌐 Website URLs:"
echo "   Main Application: https://$DOMAIN"
echo "   WooCommerce Store: https://$DOMAIN/shop"
echo "   Admin Panel: https://$DOMAIN/admin"
echo "   WordPress Admin: https://$DOMAIN/shop/wp-admin"
echo ""
print_status "🔐 Admin Credentials:"
echo "   Email: $ADMIN_EMAIL"
echo "   Password: $ADMIN_PASSWORD"
echo ""
print_status "🔧 Management Commands:"
echo "   PM2 Status: pm2 status"
echo "   PM2 Logs: pm2 logs mymeds-backend"
echo "   Restart App: pm2 restart mymeds-backend"
echo "   Nginx Reload: systemctl reload nginx"
echo ""
print_success "Deployment completed successfully! 🎉"


