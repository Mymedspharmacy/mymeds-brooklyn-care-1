#!/bin/bash

# MyMeds Pharmacy Complete VPS Deployment Script
# This script will deploy the entire project on your VPS

set -e  # Exit on any error

echo "🚀 Starting MyMeds Pharmacy VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
print_status "Installing MySQL..."
apt install -y mysql-server

# Secure MySQL installation
print_status "Securing MySQL installation..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'MyMedsRootPassword2024!';"
mysql -e "DELETE FROM mysql.user WHERE User='';"
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
mysql -e "DROP DATABASE IF EXISTS test;"
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
mysql -e "FLUSH PRIVILEGES;"

# Create MySQL database and user
print_status "Creating MySQL database and user..."
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'mymeds_secure_password_2024';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install PM2 for process management
print_status "Installing PM2..."
npm install -g pm2

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/mymeds
cd /var/www/mymeds

# Clone or copy your project (you'll need to upload your project files)
print_status "Setting up project structure..."
mkdir -p backend frontend logs uploads

# Create environment files
print_status "Creating environment configuration files..."

# Backend environment file
cat > /var/www/mymeds/backend/.env << 'EOF'
# 🚀 PRODUCTION ENVIRONMENT CONFIGURATION
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# DATABASE CONFIGURATION
DATABASE_URL="mysql://mymeds_user:mymeds_secure_password_2024@localhost:3306/mymeds_production"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=mymeds_production
DATABASE_USER=mymeds_user
DATABASE_PASSWORD=mymeds_secure_password_2024

# SECURITY & AUTHENTICATION
JWT_SECRET=mymeds_production_jwt_secret_2024_secure_key_64_chars_minimum_required_for_production_environment
JWT_REFRESH_SECRET=mymeds_production_jwt_refresh_secret_2024_secure_key_64_chars_minimum
JWT_EXPIRES_IN=7d
SESSION_SECRET=mymeds_production_session_secret_2024_secure_key
SESSION_TIMEOUT=3600000

# Admin user credentials
ADMIN_EMAIL=a.mymeds03@gmail.com
ADMIN_NAME=MyMeds Pharmacy Admin
ADMIN_PASSWORD=AdminSecurePassword2024!

# Password policy
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true

# CORS & SECURITY
CORS_ORIGINS=https://mymedspharmacyinc.com,https://www.mymedspharmacyinc.com,http://localhost:3000,http://72.60.116.253
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY_STRICT=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true

# RATE LIMITING
RATE_LIMITING_ENABLED=true
DISABLE_RATE_LIMIT=false
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_API_MAX=500
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_CONTACT_MAX=20
RATE_LIMIT_CONTACT_WINDOW=3600000

# EMAIL CONFIGURATION (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=mymedspharmacyinc@gmail.com
SMTP_PASS=your_gmail_app_password_here
SMTP_FROM=noreply@mymedspharmacyinc.com

# Alternative Email Variables
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASS=your_gmail_app_password_here
CONTACT_RECEIVER=contact@mymedspharmacyinc.com
ALERT_EMAIL=alerts@mymedspharmacyinc.com

# Email Features
EMAIL_VERIFICATION_ENABLED=true
EMAIL_RESET_PASSWORD_ENABLED=true
EMAIL_NOTIFICATIONS_ENABLED=true

# WOOCOMMERCE INTEGRATION
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com
WOOCOMMERCE_CONSUMER_KEY=your_production_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_production_consumer_secret_here
WOOCOMMERCE_CURRENCY=usd
WOOCOMMERCE_PAYMENT_METHODS=card,paypal
WOOCOMMERCE_WEBHOOK_SECRET=your_production_webhook_secret_here

# WORDPRESS INTEGRATION
WORDPRESS_SITE_URL=https://mymedspharmacyinc.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APPLICATION_PASSWORD=your_wordpress_app_password

# EXTERNAL SERVICES
OPENFDA_API_URL=https://api.fda.gov
WEBHOOK_URL=your_webhook_url_for_alerts

# LOGGING & DEBUGGING
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=/var/log/mymeds/app.log
DEBUG=false
SHOW_ERROR_DETAILS=false
ENABLE_SQL_LOGGING=false

# FILE UPLOADS
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_PATH=/var/www/mymeds/uploads

# FRONTEND URL
FRONTEND_URL=https://mymedspharmacyinc.com

# MONITORING & HEALTH CHECKS
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=300000
MONITORING_ENABLED=true

# BACKUP & MAINTENANCE
BACKUP_ENABLED=true
BACKUP_INTERVAL=86400000
BACKUP_RETENTION_DAYS=30
MAINTENANCE_MODE=false

# Database Backup
BACKUP_DATABASE=true
BACKUP_DATABASE_SCHEDULE=0 2 * * *
BACKUP_COMPRESSION=true
BACKUP_ENCRYPTION=true
BACKUP_ENCRYPTION_PASSWORD=mymeds_backup_encryption_password_2024

# File Backup
BACKUP_FILES=true
BACKUP_FILES_SCHEDULE=0 3 * * *
BACKUP_FILES_RETENTION_DAYS=7
BACKUP_INCLUDE_PATHS=uploads,logs,config
BACKUP_EXCLUDE_PATHS=node_modules,temp,.git

# Backup Storage
BACKUP_LOCAL=true
BACKUP_LOCAL_PATH=/var/backups/mymeds

# AWS S3 Backup (optional)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_backup_bucket
AWS_REGION=us-east-1

# FTP Backup (optional)
FTP_HOST=your_ftp_host
FTP_PORT=21
FTP_USERNAME=your_ftp_username
FTP_PASSWORD=your_ftp_password
FTP_PATH=/backups
EOF

# Create logs directory
mkdir -p /var/log/mymeds
mkdir -p /var/backups/mymeds

# Set proper permissions
chown -R www-data:www-data /var/www/mymeds
chown -R www-data:www-data /var/log/mymeds
chown -R www-data:www-data /var/backups/mymeds

# Create PM2 ecosystem file
cat > /var/www/mymeds/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mymeds/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      error_file: '/var/log/mymeds/backend-error.log',
      out_file: '/var/log/mymeds/backend-out.log',
      log_file: '/var/log/mymeds/backend-combined.log',
      time: true
    }
  ]
};
EOF

# Create Nginx configuration for frontend
cat > /etc/nginx/sites-available/mymeds << 'EOF'
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com 72.60.116.253;
    
    # Frontend
    location / {
        root /var/www/mymeds/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=31536000";
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Uploads
    location /uploads {
        alias /var/www/mymeds/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx

print_success "System setup completed!"
print_status "Next steps:"
print_status "1. Upload your project files to /var/www/mymeds/"
print_status "2. Install dependencies and build the project"
print_status "3. Run database migrations"
print_status "4. Start the application with PM2"

echo "🎉 VPS deployment setup completed!"
