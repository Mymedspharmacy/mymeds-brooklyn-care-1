#!/bin/bash

# =============================================================================
# MyMeds Application Setup Script
# =============================================================================
# This script sets up the MyMeds Pharmacy React/Node.js application
# Domain: mymedspharmacyinc.com
# VPS: 72.60.116.253
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
NODE_VERSION="18"
APP_DIR="/var/www/mymeds"
BACKEND_PORT="4000"
FRONTEND_PORT="3000"

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

# Function to generate secure passwords/keys
generate_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

generate_jwt_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js $NODE_VERSION..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    
    # Install Node.js
    apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    print_success "Node.js installed: $node_version"
    print_success "NPM installed: $npm_version"
}

# Function to install PM2 globally
install_pm2() {
    print_status "Installing PM2 process manager..."
    
    npm install -g pm2 pm2-logrotate
    
    # Configure PM2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
    
    print_success "PM2 installed and configured"
}

# Function to setup application directory structure
setup_directory_structure() {
    print_status "Setting up application directory structure..."
    
    # Create directories
    mkdir -p "$APP_DIR"/{backend,frontend,logs,uploads,scripts}
    mkdir -p "$APP_DIR"/backend/{dist,logs,uploads}
    mkdir -p "$APP_DIR"/frontend/dist
    
    # Set ownership
    chown -R www-data:www-data "$APP_DIR"
    
    print_success "Directory structure created"
}

# Function to clone or copy application files
setup_application_files() {
    print_status "Setting up application files..."
    
    # If git repository is available
    if [ -d ".git" ]; then
        print_status "Copying files from current repository..."
        cp -r . "$APP_DIR/"
    else
        print_status "Creating placeholder files..."
        cat > "$APP_DIR/package.json" <<EOF
{
  "name": "mymeds-pharmacy",
  "version": "1.0.0",
  "description": "MyMeds Pharmacy Inc. Application",
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "npm run build:frontend",
    "start": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop ecosystem.config.js",
    "restart": "pm2 restart ecosystem.config.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF
    fi
    
    # Set permissions
    chown -R www-data:www-data "$APP_DIR"
    
    print_success "Application files prepared"
}

# Function to install backend dependencies
install_backend_dependencies() {
    print_status "Installing backend dependencies..."
    
    cd "$APP_DIR/backend"
    
    # Install dependencies
    npm install --production
    
    # Install Prisma CLI
    npm install -g prisma
    
    print_success "Backend dependencies installed"
}

# Function to install frontend dependencies
install_frontend_dependencies() {
    print_status "Installing frontend dependencies..."
    
    cd "$APP_DIR"
    
    # Install dependencies
    npm install --production
    
    print_success "Frontend dependencies installed"
}

# Function to create production environment file
create_production_env() {
    print_status "Creating production environment configuration..."
    
    # Load database credentials
    if [ -f "/var/www/mymeds/db-credentials.conf" ]; then
        source /var/www/mymeds/db-credentials.conf
    else
        print_error "Database credentials not found. Run setup-database.sh first."
        exit 1
    fi
    
    # Load WordPress credentials
    if [ -f "/var/www/mymeds/wp-credentials.conf" ]; then
        source /var/www/mymeds/wp-credentials.conf
    fi
    
    # Generate secrets
    JWT_SECRET=$(generate_jwt_secret)
    SESSION_SECRET=$(generate_secret)
    CSRF_SECRET=$(generate_secret)
    
    cat > "$APP_DIR/backend/.env.production" <<EOF
# =============================================================================
# MyMeds Production Environment Configuration
# Generated on: $(date)
# =============================================================================

# Basic server configuration
NODE_ENV=production
PORT=$BACKEND_PORT
HOST=0.0.0.0

# Database configuration
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"

# MySQL configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=$DB_NAME
MYSQL_USER=$DB_USER
MYSQL_PASSWORD=$DB_PASSWORD
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

# Authentication & Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=<｜tool▁calls▁end｜>24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=$SESSION_SECRET
BCRYPT_ROUNDS=12
CSRF_SECRET=$CSRF_SECRET

# Admin account
ADMIN_EMAIL=admin@$DOMAIN
ADMIN_PASSWORD_HASH=REPLACE_WITH_HASHED_ADMIN_PASSWORD_HERE
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@$DOMAIN
EMAIL_PASSWORD=REPLACE_WITH_GMAIL_APP_PASSWORD_HERE
EMAIL_FROM=admin@$DOMAIN
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# WordPress integration
WORDPRESS_URL=https://$WP_BLOG_URL
WORDPRESS_USERNAME=$WP_ADMIN_USER
WORDPRESS_APP_PASSWORD=REPLACE_WITH_BLOG_APP_PASSWORD
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce integration
WOOCOMMERCE_STORE_URL=https://$WP_SHOP_URL
WOOCOMMERCE_CONSUMER_KEY=ck_REPLACE_WITH_CONSUMER_KEY_HERE
WOOCOMMERCE_CONSUMER_SECRET=cs_REPLACE_WITH_CONSUMER_SECRET_HERE
WOOCOMMERCE_WEBHOOK_SECRET=REPLACE_WITH_WEBHOOK_SECRET_HERE
FEATURE_WOOCOMMERCE_ENABLED=true

# Frontend environment variables
VITE_BACKEND_URL=https://$DOMAIN
VITE_API_BASE_URL=/api
VITE_WORDPRESS_URL=https://$WP_BLOG_URL
VITE_WOOCOMMERCE_URL=https://$WP_SHOP_URL
VITE_WOOCOMMERCE_STORE_URL=https://$WP_SHOP_URL
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_REPLACE_WITH_CONSUMER_KEY_HERE
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_REPLACE_WITH_CONSUMER_SECRET_HERE

# Feature flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# Contact information
VITE_PHONE_NUMBER=+123456789
VITE_CONTACT_EMAIL=contact@$DOMAIN
VITE_PHARMACY_ADDRESS="1234 Pharmacy Avenue, Brooklyn, NY 11201"
VITE_PHARMACY_HOURS="Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM"
VITE_GOOGLE_MAPS_URL=https://www.google.com/maps/YOUR_LOCATION_URL

# CORS configuration
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN,https://$WP_BLOG_URL,https://$WP_SHOP_URL
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# Production settings
RATE_LIMIT_ENABLED=true
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
DEBUG_MODE=false
VERBOSE_LOGGING=false
ENABLE_-dev-TOOLS=false
LOG_LEVEL=info
LOG_FILE_PATH=$APP_DIR/logs/production.log

# Security headers
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# External API keys (replace with actual values)
GOOGLE_MAPS_API_KEY=REPLACE_WITH_GOOGLE_MAPS_API_KEY_HERE
SENTRY_DSN=REPLACE_WITH_SENTRY_DSN_HERE
GOOGLE_ANALYTICS_ID=REPLACE_WITH_GA_TRACKING_ID_HERE
FACEBOOK_PIXEL_ID=REPLACE_WITH_FACEBOOK_PIXEL_ID_HERE
EOF

    # Create .env link for development
    ln -sf "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
    
    # Secure the environment file
    chown www-data:www-data "$APP_DIR/backend/.env.production"
    chmod 600 "$APP_DIR/backend/.env.production"
    
    print_success "Production environment configuration created"
}

# Function to run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    cd "$APP_DIR/backend"
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    prisma generate
    
    print_success "Database migrations completed"
}

# Function to create admin user
create_admin_user() {
    print_status "Creating admin user..."
    
    cd "$APP_DIR/backend"
    
    # Check if admin user creation script exists
    if [ -f "scripts/initAdmin.js" ]; then
        node scripts/initAdmin.js
    elif [ -f "ensureAdminUser.ts" ]; then
        npx ts-node ensureAdminUser.ts
    else
        print_warning "Admin user creation script not found. Please create admin user manually."
    fi
    
    print_success "Admin user setup completed"
}

# Function to build backend
build_backend() {
    print_status "Building backend application..."
    
    cd "$APP_DIR/backend"
    
    # Build TypeScript
    npm run build
    
    print_success "Backend built successfully"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend application..."
    
    cd "$APP_DIR"
    
    # Set environment variables for build
    export NODE_ENV=production
    export VITE_BACKEND_URL=https://$DOMAIN
    
    # Build frontend
    npm run build
    
    # Copy built files to nginx directory
    cp -r dist/* /var/www/html/
    
    print_success "Frontend built successfully"
}

# Function to create PM2 ecosystem configuration
create_pm2_config() {
    print_status "Creating PM2 ecosystem configuration..."
    
    cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: './backend/dist/index.js',
      cwd: '$APP_DIR',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT,
        HOST: '0.0.0.0'
      },
      error_file: '$APP_DIR/logs/backend-error.log',
      out_file: '$APP_DIR/logs/backend-out.log',
      log_file: '$APP_DIR/logs/backend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      node_args: '--max-old-space-size=1024'
    }
  ]
};
EOF

    # Set permissions
    chown www-data:www-data "$APP_DIR/ecosystem.config.js"
    chmod 644 "$APP_DIR/ecosystem.config.js"
    
    print_success "PM2 ecosystem configuration created"
}

# Function to start application with PM2
start_application() {
    print_status "Starting application with PM2..."
    
    cd "$APP_DIR"
    
    # Start the application
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u www-data --hp /var/www
    
    print_success "Application started with PM2"
}

# Function to create application credentials file
create_app_credentials() {
    print_status "Creating application credentials file..."
    
    # Load secrets from environment files
    source "$APP_DIR/backend/.env.production"
    
    cat > "/var/www/mymeds/app-credentials.conf" <<EOF
# MyMeds Application Credentials
# Generated on: $(date)

# Admin Access
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_DASHBOARD_URL=https://$DOMAIN/admin
ADMIN_PASSWORD_HASH=REPLACE_WITH_HASHED_PASSWORD_HERE

# JWT Secret (keep secure)
JWT_SECRET=$JWT_SECRET

# Database
DATABASE_URL=$DATABASE_URL
DB_PASSWORD=$DB_PASSWORD

# Application URLs
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://$DOMAIN/api
WORDPRESS_BLOG_URL=https://blog.$DOMAIN
WORDPRESS_SHOP_URL=https://shop.$DOMAIN

# PM2 Management
PM2_STATUS="pm2 status"
PM2_LOGS="pm2 logs mymeds-backend"
PM2_RESTART="pm2 restart mymeds-backend"
EOF

    chmod 600 /var/www/mymeds/app-credentials.conf
    chown root:root /var/www/mymeds/app-credentials.conf
    
    print_success "Application credentials saved to /var/www/mymeds/app-credentials.conf"
}

# Function to test application
test_application() {
    print_status "Testing application..."
    
    # Test backend health endpoint
    if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_success "Frontend accessibility test passed"
    else
        print_warning "Frontend accessibility test failed"
    fi
    
    # Check PM2 status
    pm2 status mymeds-backend
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds Application Setup"
    echo "  Domain: $DOMAIN"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Install Node.js
    install_nodejs
    
    # Install PM2
    install_pm2
    
    # Setup directory structure
    setup_directory_structure
    
    # Setup application files
    setup_application_files
    
    # Install dependencies
    install_backend_dependencies
    install_frontend_dependencies
    
    # Create production environment
    create_production_env
    
    # Run database migrations
    run_database_migrations
    
    # Create admin user
    create_admin_user
    
    # Build applications
    build_backend
    build_frontend
    
    # Create PM2 configuration
    create_pm2_config
    
    # Start application
    start_application
    
    # Create credentials file
    create_app_credentials
    
    # Test application
    test_application
    
    echo ""
    print_success "MyMeds application setup completed successfully!"
    echo ""
    echo "Application Access:"
    echo "Frontend: https://$DOMAIN"
    echo "Backend API: https://$DOMAIN/api"
    echo "Admin Dashboard: https://$DOMAIN/admin"
    echo ""
    echo "Management Commands:"
    echo "PM2 Status: pm2 status"
    echo "View Logs: pm2 logs mymeds-backend"
    echo "Restart: pm2 restart mymeds-backend"
    echo ""
    echo "Next steps:"
    echo "1. Configure SSL certificates: ./setup-ssl.sh"
    echo "2. Update nginx configuration: ./setup-nginx.sh"
    echo "3. Test all functionality"
}

# Run main function
main "$@"


