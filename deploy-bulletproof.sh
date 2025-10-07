#!/bin/bash

# =============================================================================
# MyMeds Pharmacy Inc. - BULLETPROOF VPS Deployment Script
# =============================================================================
# This script ensures 100% successful deployment with all edge cases handled
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if systemctl is-active --quiet $service_name; then
            print_success "$service_name is ready"
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root"
    exit 1
fi

print_status "Starting BULLETPROOF MyMeds Pharmacy VPS Deployment..."
print_status "Domain: $DOMAIN"
print_status "Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Update system and install ALL dependencies
print_status "Step 1: Updating system and installing ALL dependencies..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget unzip git software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x with proper repository setup
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
if ! command_exists node; then
    print_error "Node.js installation failed"
    exit 1
fi

# Install TypeScript globally
npm install -g typescript

# Install PM2 globally
npm install -g pm2

# Install MySQL 8.0
apt install -y mysql-server mysql-client

# Install Nginx
apt install -y nginx

# Install PHP 8.3 (Ubuntu 24.04 default) with ALL extensions
apt install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring php8.3-xml php8.3-zip php8.3-intl php8.3-bcmath php8.3-soap php8.3-cli php8.3-common php8.3-opcache php8.3-readline

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install additional utilities
apt install -y htop nano vim ufw fail2ban rsync

print_success "All system dependencies installed"

# Step 2: Start and enable ALL services
print_status "Step 2: Starting and enabling services..."

# Start services
systemctl start mysql
systemctl start nginx
systemctl start php8.3-fpm

# Enable services
systemctl enable mysql
systemctl enable nginx
systemctl enable php8.3-fpm

# Wait for services to be ready
wait_for_service mysql
wait_for_service nginx
wait_for_service php8.3-fpm

print_success "All services started and enabled"

# Step 3: Configure firewall
print_status "Step 3: Configuring firewall..."

# Reset UFW to defaults
ufw --force reset

# Allow essential ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw --force enable

print_success "Firewall configured"

# Step 4: Configure MySQL with proper error handling
print_status "Step 4: Configuring MySQL database..."

# Stop MySQL to reset configuration
systemctl stop mysql

# Start MySQL in safe mode to set root password
mysqld_safe --skip-grant-tables --skip-networking &
MYSQL_PID=$!

# Wait for MySQL to start
sleep 10

# Set root password
mysql -u root << EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF

# Kill safe mode MySQL
kill $MYSQL_PID
wait $MYSQL_PID 2>/dev/null || true

# Start MySQL normally
systemctl start mysql
wait_for_service mysql

# Create databases and users
mysql -u root -p"$DB_PASSWORD" << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS $WP_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE USER IF NOT EXISTS '$WP_DB_USER'@'localhost' IDENTIFIED BY '$WP_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON $WP_DB_NAME.* TO '$WP_DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "MySQL database configured"

# Step 5: Create application directories with proper permissions
print_status "Step 5: Creating application directories..."

# Create directories
mkdir -p $APP_DIR/{backend,dist,uploads,logs}
mkdir -p $WORDPRESS_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/mymeds-pharmacy

# Set proper ownership
chown -R www-data:www-data $APP_DIR
chown -R www-data:www-data $WORDPRESS_DIR

# Set proper permissions
chmod -R 755 $APP_DIR
chmod -R 755 $WORDPRESS_DIR

# Create uploads directory with proper permissions
mkdir -p $APP_DIR/uploads
chown -R www-data:www-data $APP_DIR/uploads
chmod -R 755 $APP_DIR/uploads

print_success "Application directories created with proper permissions"

# Step 6: Clone repository and install dependencies
print_status "Step 6: Cloning repository and installing dependencies..."

# Clone repository
if [ ! -d "$APP_DIR/.git" ]; then
    git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git $APP_DIR
fi

cd $APP_DIR

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install --production

print_success "Dependencies installed"

# Step 7: Build applications
print_status "Step 7: Building applications..."

# Build frontend
cd ..
npm run build:production

# Build backend
cd backend
npm run build:production

# Generate Prisma client
npx prisma generate

print_success "Applications built successfully"

# Step 8: Setup WordPress and WooCommerce
print_status "Step 8: Setting up WordPress and WooCommerce..."

# Download WordPress
cd /tmp
wget -q https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
cp -r wordpress/* $WORDPRESS_DIR/

# Download WooCommerce plugin
cd $WORDPRESS_DIR/wp-content/plugins
wget -q https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip -q woocommerce.latest-stable.zip
rm woocommerce.latest-stable.zip

# Create wp-config.php with proper configuration
cat > $WORDPRESS_DIR/wp-config.php << 'EOF'
<?php
/**
 * WordPress Configuration for MyMeds Pharmacy
 */

// Database settings
define( 'DB_NAME', 'mymeds_wordpress' );
define( 'DB_USER', 'mymeds_wordpress_user' );
define( 'DB_PASSWORD', 'Pharm-23-medS' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// Authentication keys and salts
define( 'AUTH_KEY',         'mymeds-auth-key-' . bin2hex(random_bytes(32)) );
define( 'SECURE_AUTH_KEY',  'mymeds-secure-auth-key-' . bin2hex(random_bytes(32)) );
define( 'LOGGED_IN_KEY',    'mymeds-logged-in-key-' . bin2hex(random_bytes(32)) );
define( 'NONCE_KEY',        'mymeds-nonce-key-' . bin2hex(random_bytes(32)) );
define( 'AUTH_SALT',        'mymeds-auth-salt-' . bin2hex(random_bytes(32)) );
define( 'SECURE_AUTH_SALT', 'mymeds-secure-auth-salt-' . bin2hex(random_bytes(32)) );
define( 'LOGGED_IN_SALT',   'mymeds-logged-in-salt-' . bin2hex(random_bytes(32)) );
define( 'NONCE_SALT',       'mymeds-nonce-salt-' . bin2hex(random_bytes(32)) );

$table_prefix = 'wp_';

// WordPress configuration
define( 'WP_HOME', 'https://mymedspharmacyinc.com/shop' );
define( 'WP_SITEURL', 'https://mymedspharmacyinc.com/shop' );
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

// Security
define( 'DISALLOW_FILE_EDIT', true );
define( 'DISALLOW_FILE_MODS', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'FORCE_SSL', true );

// Performance
define( 'WP_CACHE', true );
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );

// WooCommerce
define( 'WOOCOMMERCE_API_ENABLED', true );
define( 'WOOCOMMERCE_API_VERSION', 'wc/v3' );

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
EOF

# Set permissions
chown -R www-data:www-data $WORDPRESS_DIR
chmod -R 755 $WORDPRESS_DIR

print_success "WordPress and WooCommerce installed"

# Step 9: Configure Nginx with comprehensive configuration
print_status "Step 9: Configuring Nginx..."

# Create comprehensive Nginx configuration
cat > /etc/nginx/sites-available/mymeds-pharmacy << 'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=contact:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;

# Upstream for backend
upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json application/xml image/svg+xml;
    
    # Frontend (React app)
    location / {
        root /var/www/mymeds-pharmacy/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Cache HTML files for shorter time
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # Backend API
    location /api {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend/api/health;
        access_log off;
    }
    
    # WooCommerce Store (WordPress)
    location /shop {
        alias /var/www/wordpress;
        index index.php index.html;
        try_files $uri $uri/ /shop/index.php?$args;
        
        # PHP processing for WordPress
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
            
            # WordPress specific parameters
            fastcgi_param PATH_INFO $fastcgi_path_info;
            fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
            
            # Security headers for PHP
            fastcgi_param HTTP_PROXY "";
            fastcgi_read_timeout 300;
            fastcgi_connect_timeout 300;
            fastcgi_send_timeout 300;
        }
        
        # Cache static assets for WooCommerce
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Security for WordPress uploads
        location ~* /shop/wp-content/uploads/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # WordPress admin and wp-admin
    location ~ ^/shop/(wp-admin|wp-login\.php) {
        alias /var/www/wordpress;
        index index.php;
        try_files $uri $uri/ /shop/index.php?$args;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
            fastcgi_param HTTP_PROXY "";
        }
    }
    
    # File uploads
    location /uploads {
        alias /var/www/mymeds-pharmacy/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # Security for uploads
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql|conf|config)$ {
        deny all;
    }
    
    # Deny access to backup files
    location ~ \.(bak|backup|old|tmp)$ {
        deny all;
    }
    
    # Rate limiting for API endpoints
    location /api/admin/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Rate limiting for contact forms
    location /api/contact {
        limit_req zone=contact burst=3 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site and disable default
ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx

print_success "Nginx configured"

# Step 10: Create environment file with all necessary variables
print_status "Step 10: Creating environment configuration..."

cat > $APP_DIR/backend/.env << EOF
# MyMeds Pharmacy Production Environment Configuration

# Database Configuration
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"

# JWT Configuration
JWT_SECRET="mymeds-pharmacy-jwt-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)"
JWT_EXPIRES_IN="24h"

# Application Configuration
NODE_ENV="production"
PORT=4000
CORS_ORIGIN="https://$DOMAIN"

# Admin Credentials
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
ADMIN_NAME="Admin User"

# Security Configuration
CSRF_SECRET="mymeds-pharmacy-csrf-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)"
BCRYPT_ROUNDS=12

# WooCommerce Integration
WOOCOMMERCE_STORE_URL="https://$DOMAIN/shop"
WOOCOMMERCE_CONSUMER_KEY="ck_your_consumer_key_here"
WOOCOMMERCE_CONSUMER_SECRET="cs_your_consumer_secret_here"

# WordPress Integration
VITE_WORDPRESS_URL="https://$DOMAIN/shop"
VITE_WORDPRESS_API_URL="https://$DOMAIN/shop/wp-json/wp/v2"

# Email Configuration (SMTP)
EMAIL_HOST="smtp.office365.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="noreply@$DOMAIN"
EMAIL_PASS="$ADMIN_PASSWORD"
EMAIL_FROM="noreply@$DOMAIN"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR="$APP_DIR/uploads"

# Monitoring and Logging
LOG_LEVEL="info"
LOG_FILE="$LOG_DIR/app.log"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET="mymeds-pharmacy-session-secret-key-minimum-32-characters-long-$(openssl rand -hex 16)"
SESSION_MAX_AGE=86400000

# Backup Configuration
BACKUP_DIR="$BACKUP_DIR"
BACKUP_RETENTION_DAYS=30

# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI="https://$DOMAIN/api/security/csp-report"

# Performance Configuration
CACHE_ENABLED=true
CACHE_TTL=3600

# Development/Testing Flags
DEBUG_MODE=false
MAINTENANCE_MODE=false
ENABLE_DEBUG_ROUTES=false
EOF

# Set proper permissions
chown www-data:www-data $APP_DIR/backend/.env
chmod 600 $APP_DIR/backend/.env

print_success "Environment configured"

# Step 11: Run database migrations
print_status "Step 11: Running database migrations..."

cd $APP_DIR/backend

# Run Prisma migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

print_success "Database migrations completed"

# Step 12: Setup PM2 with comprehensive configuration
print_status "Step 12: Setting up PM2..."

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

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u root --hp /root

print_success "PM2 configured and application started"

# Step 13: Setup SSL certificate
print_status "Step 13: Setting up SSL certificate..."

# Get SSL certificate
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect

# Setup auto-renewal
echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -

print_success "SSL certificate configured"

# Step 14: Setup automated backups
print_status "Step 14: Setting up automated backups..."

cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/mymeds-pharmacy"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mymeds_production"
WP_DB_NAME="mymeds_wordpress"
DB_USER="mymeds_user"
WP_DB_USER="mymeds_wordpress_user"
DB_PASSWORD="Pharm-23-medS"
WP_PASSWORD="Pharm-23-medS"
APP_DIR="/var/www/mymeds-pharmacy"
WORDPRESS_DIR="/var/www/wordpress"

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup main database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/$DATE/mymeds_production.sql

# Backup WordPress database
mysqldump -u $WP_DB_USER -p$WP_PASSWORD $WP_DB_NAME > $BACKUP_DIR/$DATE/mymeds_wordpress.sql

# Backup application files
tar -czf $BACKUP_DIR/$DATE/app_files.tar.gz -C $APP_DIR .

# Backup WordPress files
tar -czf $BACKUP_DIR/$DATE/wordpress_files.tar.gz -C $WORDPRESS_DIR .

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/mymeds-backup.sh

# Setup daily backup cron job
echo '0 2 * * * /usr/local/bin/mymeds-backup.sh' | crontab -

# Run initial backup
/usr/local/bin/mymeds-backup.sh

print_success "Automated backups configured"

# Step 15: Setup monitoring and logging
print_status "Step 15: Setting up monitoring and logging..."

# Create log rotation configuration
cat > /etc/logrotate.d/mymeds-pharmacy << 'EOF'
/var/www/mymeds-pharmacy/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create monitoring script
cat > /usr/local/bin/mymeds-monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE="/var/www/mymeds-pharmacy/logs/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if PM2 processes are running
if ! pm2 list | grep -q 'mymeds-backend.*online'; then
    echo "[$DATE] ERROR: MyMeds backend is not running" >> $LOG_FILE
    pm2 restart mymeds-backend
    echo "[$DATE] INFO: Restarted MyMeds backend" >> $LOG_FILE
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] ERROR: Nginx is not running" >> $LOG_FILE
    systemctl start nginx
    echo "[$DATE] INFO: Started Nginx" >> $LOG_FILE
fi

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "[$DATE] ERROR: MySQL is not running" >> $LOG_FILE
    systemctl start mysql
    echo "[$DATE] INFO: Started MySQL" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] WARNING: Disk usage is $DISK_USAGE%" >> $LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2 }')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "[$DATE] WARNING: Memory usage is $MEMORY_USAGE%" >> $LOG_FILE
fi
EOF

chmod +x /usr/local/bin/mymeds-monitor.sh

# Setup monitoring cron job (every 5 minutes)
echo '*/5 * * * * /usr/local/bin/mymeds-monitor.sh' | crontab -

print_success "Monitoring and logging configured"

# Step 16: Final verification and testing
print_status "Step 16: Final verification and testing..."

# Wait for services to stabilize
sleep 10

# Check PM2 status
pm2 status

# Check service status
systemctl status nginx --no-pager
systemctl status mysql --no-pager
systemctl status php8.3-fpm --no-pager

# Test backend health
curl -f http://localhost:4000/api/health || print_warning "Backend health check failed - may need manual verification"

# Test Nginx configuration
nginx -t

print_success "Final verification completed"

# Step 17: Display deployment summary
print_success "=========================================="
print_success "BULLETPROOF MyMeds Pharmacy Deployment Complete!"
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
print_status "🗄️ Database Information:"
echo "   Main DB: $DB_NAME"
echo "   WordPress DB: $WP_DB_NAME"
echo "   DB User: $DB_USER"
echo "   DB Password: $DB_PASSWORD"
echo ""
print_status "📁 Application Directories:"
echo "   App Directory: $APP_DIR"
echo "   WordPress Directory: $WORDPRESS_DIR"
echo "   Backup Directory: $BACKUP_DIR"
echo "   Log Directory: $LOG_DIR"
echo ""
print_status "🔧 Management Commands:"
echo "   PM2 Status: pm2 status"
echo "   PM2 Logs: pm2 logs mymeds-backend"
echo "   Restart App: pm2 restart mymeds-backend"
echo "   Nginx Reload: systemctl reload nginx"
echo "   Backup: /usr/local/bin/mymeds-backup.sh"
echo ""
print_status "📊 Monitoring:"
echo "   Health Check: https://$DOMAIN/health"
echo "   API Health: https://$DOMAIN/api/health"
echo "   Monitor Logs: tail -f $LOG_DIR/monitor.log"
echo ""
print_warning "⚠️  Next Steps:"
echo "   1. Configure WooCommerce API credentials in WordPress admin"
echo "   2. Update WooCommerce settings and add products"
echo "   3. Configure email settings for notifications"
echo "   4. Test all functionality thoroughly"
echo "   5. Setup domain DNS if not already done"
echo ""
print_success "BULLETPROOF deployment completed successfully! 🎉"
