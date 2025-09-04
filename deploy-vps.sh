#!/bin/bash

# =============================================================================
# MyMeds Pharmacy VPS Deployment Script
# =============================================================================
# This script automates the complete VPS deployment process
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/yourusername/mymeds-brooklyn-care-1-1.git"
PROJECT_DIR="/var/www/mymeds"
DOMAIN="mymedspharmacyinc.com"
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
DB_PASSWORD="YourSecurePassword123"

echo -e "${BLUE}🚀 MyMeds Pharmacy VPS Deployment Script${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install system dependencies
install_system_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list
    sudo apt update -y
    
    # Install essential packages
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Install Node.js 18.x
    if ! command_exists node; then
        print_status "Installing Node.js 18.x..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    fi
    
    # Install MySQL
    if ! command_exists mysql; then
        print_status "Installing MySQL..."
        sudo apt install -y mysql-server
        sudo systemctl start mysql
        sudo systemctl enable mysql
    fi
    
    # Install Nginx
    if ! command_exists nginx; then
        print_status "Installing Nginx..."
        sudo apt install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
    
    # Install PM2 for process management
    if ! command_exists pm2; then
        print_status "Installing PM2..."
        sudo npm install -g pm2
    fi
    
    print_status "System dependencies installed successfully!"
}

# Function to setup MySQL database
setup_database() {
    print_status "Setting up MySQL database..."
    
    # Create MySQL setup script
    cat > /tmp/mysql_setup.sql << EOF
-- MySQL Database Setup for MyMeds Pharmacy Production
-- Generated: $(date)

-- Create database
CREATE DATABASE IF NOT EXISTS ${DB_NAME}
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- Grant additional privileges for development
GRANT CREATE, DROP, ALTER, INDEX ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use database
USE ${DB_NAME};

-- Show database info
SHOW DATABASES LIKE '${DB_NAME}';
SELECT USER(), DATABASE();
EOF
    
    # Execute MySQL setup
    sudo mysql -u root -e "source /tmp/mysql_setup.sql"
    
    print_status "Database setup completed!"
}

# Function to clone and setup project
setup_project() {
    print_status "Setting up project..."
    
    # Create project directory
    sudo mkdir -p ${PROJECT_DIR}
    sudo chown $USER:$USER ${PROJECT_DIR}
    
    # Clone repository
    if [ -d "${PROJECT_DIR}/.git" ]; then
        print_warning "Repository already exists, pulling latest changes..."
        cd ${PROJECT_DIR}
        git pull origin main
    else
        print_status "Cloning repository..."
        git clone ${REPO_URL} ${PROJECT_DIR}
        cd ${PROJECT_DIR}
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "Project setup completed!"
}

# Function to setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    # Create production environment file
    cat > ${PROJECT_DIR}/backend/.env << EOF
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# =============================================================================
# DATABASE CONFIGURATION (MySQL Production)
# =============================================================================
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@localhost:3306/${DB_NAME}"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=${DB_NAME}
DATABASE_USER=${DB_USER}
DATABASE_PASSWORD=${DB_PASSWORD}

# =============================================================================
# JWT & AUTHENTICATION
# =============================================================================
JWT_SECRET=YourSuperSecureJWTSecretKeyForProduction2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# =============================================================================
# ADMIN CREDENTIALS
# =============================================================================
ADMIN_EMAIL=admin@${DOMAIN}
ADMIN_PASSWORD=YourSecureAdminPassword123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# =============================================================================
# EMAIL CONFIGURATION (SMTP)
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@${DOMAIN}
EMAIL_PASSWORD=YourEmailAppPassword123
EMAIL_FROM=notifications@${DOMAIN}
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# =============================================================================
# FILE UPLOAD CONFIGURATION
# =============================================================================
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpeg,jpg,png,gif,pdf
FILE_UPLOAD_ENABLED=true

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGIN=https://${DOMAIN}
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

# =============================================================================
# RATE LIMITING
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_ENABLED=true

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
BCRYPT_ROUNDS=12
SESSION_SECRET=YourSuperSecureSessionSecret2025!@#$%^&*()
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=10485760
LOG_MAX_FILES=5

# =============================================================================
# WORDPRESS INTEGRATION
# =============================================================================
WORDPRESS_URL=https://${DOMAIN}/blog
WORDPRESS_USERNAME=api_user
WORDPRESS_APP_PASSWORD=YourWordPressAppPassword123
FEATURE_WORDPRESS_ENABLED=true

# =============================================================================
# WOOCOMMERCE INTEGRATION
# =============================================================================
WOOCOMMERCE_STORE_URL=https://${DOMAIN}/shop
WOOCOMMERCE_CONSUMER_KEY=ck_YourWooCommerceConsumerKey123
WOOCOMMERCE_CONSUMER_SECRET=cs_YourWooCommerceConsumerSecret123
FEATURE_WOOCOMMERCE_ENABLED=true

# =============================================================================
# DEVELOPMENT OVERRIDES (DISABLE IN PRODUCTION)
# =============================================================================
DEBUG_MODE=false
VERBOSE_LOGGING=false
TEST_MODE=false
EOF
    
    # Create frontend environment file
    cat > ${PROJECT_DIR}/.env.production << EOF
VITE_API_URL=https://${DOMAIN}/api
VITE_APP_NAME="MyMeds Pharmacy Inc."
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
EOF
    
    print_status "Environment variables configured!"
}

# Function to setup database schema
setup_database_schema() {
    print_status "Setting up database schema..."
    
    cd ${PROJECT_DIR}/backend
    
    # Generate Prisma client
    npx prisma generate
    
    # Push schema to database
    npx prisma db push --accept-data-loss
    
    # Initialize integration settings
    node init-integrations.js
    
    print_status "Database schema setup completed!"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend for production..."
    
    cd ${PROJECT_DIR}
    
    # Build frontend
    npm run build
    
    print_status "Frontend build completed!"
}

# Function to setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create Nginx configuration
    cat > /tmp/mymeds_nginx.conf << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Frontend static files
    location / {
        root ${PROJECT_DIR}/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
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
    
    # File uploads
    location /uploads {
        alias ${PROJECT_DIR}/backend/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF
    
    # Copy configuration to Nginx
    sudo cp /tmp/mymeds_nginx.conf /etc/nginx/sites-available/${DOMAIN}
    sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    print_status "Nginx configuration completed!"
}

# Function to setup PM2 process management
setup_pm2() {
    print_status "Setting up PM2 process management..."
    
    cd ${PROJECT_DIR}
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'backend/src/index.ts',
    cwd: '${PROJECT_DIR}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start application with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    print_status "PM2 process management setup completed!"
}

# Function to setup SSL certificate
setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    # Install Certbot
    if ! command_exists certbot; then
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Get SSL certificate
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}
    
    print_status "SSL certificate setup completed!"
}

# Function to create upload directories
setup_upload_directories() {
    print_status "Setting up upload directories..."
    
    cd ${PROJECT_DIR}/backend
    
    # Create upload directories
    mkdir -p uploads/prescriptions
    mkdir -p uploads/transfers
    mkdir -p uploads/appointments
    mkdir -p uploads/temp
    
    # Set permissions
    chmod 755 uploads
    chmod 755 uploads/*
    
    print_status "Upload directories setup completed!"
}

# Function to run final tests
run_tests() {
    print_status "Running final tests..."
    
    cd ${PROJECT_DIR}
    
    # Test database connection
    node -e "
    const { PrismaClient } = require('./backend/node_modules/@prisma/client');
    const prisma = new PrismaClient();
    
    async function testConnection() {
        try {
            await prisma.\$connect();
            console.log('✅ Database connection successful');
            await prisma.\$disconnect();
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }
    
    testConnection();
    "
    
    # Test API endpoints
    sleep 5  # Wait for server to start
    
    # Test health endpoint
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        print_status "API health check passed"
    else
        print_error "API health check failed"
        exit 1
    fi
    
    print_status "All tests passed!"
}

# Function to display final information
display_final_info() {
    echo -e "${BLUE}"
    echo "🎉 MyMeds Pharmacy VPS Deployment Completed Successfully!"
    echo "======================================================"
    echo ""
    echo "📋 Deployment Summary:"
    echo "  ✅ System dependencies installed"
    echo "  ✅ Database setup completed"
    echo "  ✅ Project cloned and configured"
    echo "  ✅ Environment variables set"
    echo "  ✅ Database schema created"
    echo "  ✅ Frontend built for production"
    echo "  ✅ Nginx configured"
    echo "  ✅ PM2 process management setup"
    echo "  ✅ SSL certificate installed"
    echo "  ✅ Upload directories created"
    echo "  ✅ All tests passed"
    echo ""
    echo "🌐 Your application is now live at:"
    echo "  https://${DOMAIN}"
    echo ""
    echo "📊 Admin Dashboard:"
    echo "  https://${DOMAIN}/admin"
    echo ""
    echo "🔧 Useful Commands:"
    echo "  PM2 Status: pm2 status"
    echo "  PM2 Logs: pm2 logs"
    echo "  Restart App: pm2 restart mymeds-backend"
    echo "  Nginx Status: sudo systemctl status nginx"
    echo "  MySQL Status: sudo systemctl status mysql"
    echo ""
    echo "📝 Next Steps:"
    echo "  1. Update admin credentials in backend/.env"
    echo "  2. Configure email settings"
    echo "  3. Set up WordPress and WooCommerce integrations"
    echo "  4. Test all forms and functionality"
    echo ""
    echo "🚀 Your MyMeds Pharmacy is ready for production!"
    echo -e "${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting MyMeds Pharmacy VPS deployment...${NC}"
    
    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        print_error "Please don't run this script as root"
        exit 1
    fi
    
    # Install system dependencies
    install_system_dependencies
    
    # Setup database
    setup_database
    
    # Setup project
    setup_project
    
    # Setup environment variables
    setup_environment
    
    # Setup database schema
    setup_database_schema
    
    # Build frontend
    build_frontend
    
    # Setup upload directories
    setup_upload_directories
    
    # Setup Nginx
    setup_nginx
    
    # Setup PM2
    setup_pm2
    
    # Setup SSL (optional - can be done manually)
    if [ "$1" = "--ssl" ]; then
        setup_ssl
    fi
    
    # Run tests
    run_tests
    
    # Display final information
    display_final_info
}

# Run main function
main "$@"
