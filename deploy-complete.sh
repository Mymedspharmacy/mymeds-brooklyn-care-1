#!/bin/bash

# 🚀 MyMeds Pharmacy - Complete Deployment Script
# Deploy from 0 to 100% in a single go
# Author: MyMeds Pharmacy Team
# Version: 2.0.0

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mymedspharmacyinc.com"
VPS_IP="72.60.116.253"
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
DB_PASSWORD="MyMeds2024!@Pharm"
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_PASSWORD="MyMeds2024!@Pharm"

# Directories
APP_DIR="/var/www/mymeds"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOGS_DIR="$APP_DIR/logs"
BACKUPS_DIR="$APP_DIR/backups"

# Logging
LOG_FILE="$LOGS_DIR/deployment-$(date +%Y%m%d-%H%M%S).log"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
    fi
}

# Function to update system
update_system() {
    log "🔄 Updating system packages..."
    apt update -y
    apt upgrade -y
    success "System updated successfully"
}

# Function to install required packages
install_packages() {
    log "📦 Installing required packages..."
    
    # Essential packages
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Nginx
    apt install -y nginx
    
    # MySQL
    apt install -y mysql-server mysql-client
    
    # Certbot for SSL
    apt install -y certbot python3-certbot-nginx
    
    # PM2 for process management
    npm install -g pm2
    
    # Additional tools
    apt install -y ufw fail2ban htop nload
    
    success "All packages installed successfully"
}

# Function to configure firewall
configure_firewall() {
    log "🔥 Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
    
    success "Firewall configured successfully"
}

# Function to configure fail2ban
configure_fail2ban() {
    log "🛡️ Configuring fail2ban..."
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Create custom jail for nginx
    cat > /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/access.log
EOF
    
    systemctl restart fail2ban
    success "Fail2ban configured successfully"
}

# Function to configure MySQL
configure_mysql() {
    log "🗄️ Configuring MySQL..."
    
    # Secure MySQL installation
    mysql_secure_installation << EOF
y
0
$DB_PASSWORD
$DB_PASSWORD
y
y
y
y
EOF
    
    # Create database and user
    mysql -u root -p$DB_PASSWORD << EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    success "MySQL configured successfully"
}

# Function to create application directories
create_directories() {
    log "📁 Creating application directories..."
    
    mkdir -p "$APP_DIR"
    mkdir -p "$BACKEND_DIR"
    mkdir -p "$FRONTEND_DIR"
    mkdir -p "$LOGS_DIR"
    mkdir -p "$BACKUPS_DIR"
    mkdir -p "$BACKEND_DIR/logs"
    mkdir -p "$BACKEND_DIR/uploads"
    mkdir -p "$BACKEND_DIR/uploads/images"
    mkdir -p "$BACKEND_DIR/uploads/documents"
    mkdir -p "$BACKEND_DIR/uploads/backups"
    
    # Set permissions
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    
    success "Directories created successfully"
}

# Function to deploy backend
deploy_backend() {
    log "🔧 Deploying backend..."
    
    cd "$BACKEND_DIR"
    
    # Copy backend files (assuming they're in the current directory)
    cp -r ./* "$BACKEND_DIR/"
    
    # Install dependencies
    npm install --production
    
    # Generate Prisma client
    npx prisma generate
    
    # Create production environment file
    cat > .env << EOF
# 🚀 MyMeds Pharmacy Production Environment
# =============================================================================
# 🌍 PRODUCTION CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# =============================================================================
# 🗄️ PRODUCTION DATABASE
# =============================================================================
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
DIRECT_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"

# =============================================================================
# 🔐 PRODUCTION JWT SECRETS
# =============================================================================
JWT_SECRET=MyMeds2024!@PharmJWTSecretKey32CharsMinimumRequired
JWT_REFRESH_SECRET=MyMeds2024!@PharmJWTRefreshSecretKey32CharsMinimumRequired

# =============================================================================
# 👤 ADMIN USER
# =============================================================================
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_PASSWORD=$ADMIN_PASSWORD
ADMIN_NAME=MyMeds Admin

# =============================================================================
# 🌐 PRODUCTION URLs
# =============================================================================
FRONTEND_URL="https://www.$DOMAIN"
BACKEND_URL="https://api.$DOMAIN"
VITE_API_URL=https://api.$DOMAIN
VITE_BACKEND_URL=https://api.$DOMAIN

# =============================================================================
# 🔒 PRODUCTION SECURITY
# =============================================================================
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN,https://api.$DOMAIN
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY_STRICT=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true
HSTS_PRELOAD=true
VITE_ENABLE_HTTPS=true
VITE_STRICT_MODE=true

# =============================================================================
# 🚦 RATE LIMITING
# =============================================================================
RATE_LIMITING_ENABLED=true
DISABLE_RATE_LIMIT=false
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_CONTACT_MAX=50
RATE_LIMIT_CONTACT_WINDOW=3600000
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW=900000

# =============================================================================
# 💳 PRODUCTION STRIPE
# =============================================================================
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_CURRENCY=usd
STRIPE_PAYMENT_METHODS=card
STRIPE_CAPTURE_METHOD=automatic
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key

# =============================================================================
# 📧 PRODUCTION EMAIL
# =============================================================================
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=$ADMIN_EMAIL
SMTP_PASS=PRODUCTION_EMAIL_APP_PASSWORD
SMTP_FROM=noreply@$DOMAIN
EMAIL_USER=$ADMIN_EMAIL
EMAIL_PASS=PRODUCTION_EMAIL_APP_PASSWORD
EMAIL_VERIFICATION_ENABLED=true

# =============================================================================
# 📊 PRODUCTION ANALYTICS
# =============================================================================
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=123456789012345

# =============================================================================
# 📁 PRODUCTION UPLOADS
# =============================================================================
UPLOAD_DIR=/var/www/mymeds/backend/uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# =============================================================================
# 📊 MONITORING
# =============================================================================
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key_here
NEW_RELIC_APP_NAME=MyMeds Pharmacy Production

# =============================================================================
# 📝 LOGGING
# =============================================================================
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log
DEBUG=false
SHOW_ERROR_DETAILS=false
ENABLE_SQL_LOGGING=false

# =============================================================================
# ⚡ PERFORMANCE
# =============================================================================
CACHE_TTL=300000
COMPRESSION_ENABLED=true
    
    # Run database migrations
    npx prisma migrate deploy
    
    # Build the application
    npm run build
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Performance
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      
      // Monitoring
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health check
      health_check_grace_period: 3000,
      
      // Environment variables
      env_file: '.env'
    }
  ]
};
EOF
    
    # Start the application with PM2
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    
    success "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    log "🎨 Deploying frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Copy frontend files (assuming they're in the current directory)
    cp -r ./* "$FRONTEND_DIR/"
    
    # Install dependencies
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
# 🚀 MyMeds Pharmacy Frontend Production Environment
# =============================================================================
# 🌍 PRODUCTION CONFIGURATION
# =============================================================================
VITE_NODE_ENV=production

# =============================================================================
# 🌐 PRODUCTION URLs
# =============================================================================
VITE_API_BASE_URL=https://api.$DOMAIN
VITE_API_URL=https://api.$DOMAIN
VITE_BACKEND_URL=https://api.$DOMAIN
VITE_FRONTEND_URL=https://www.$DOMAIN

# =============================================================================
# 📱 APPLICATION INFO
# =============================================================================
VITE_APP_NAME=MyMeds Pharmacy
VITE_APP_VERSION=2.0.0

# =============================================================================
# 💳 PRODUCTION STRIPE
# =============================================================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key

# =============================================================================
# 📊 PRODUCTION ANALYTICS
# =============================================================================
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=123456789012345

# =============================================================================
# 🔒 PRODUCTION SECURITY
# =============================================================================
VITE_ENABLE_HTTPS=true
VITE_STRICT_MODE=true
EOF
    
    # Build the application
    npm run build
    
    # Set permissions
    chown -R www-data:www-data "$FRONTEND_DIR"
    chmod -R 755 "$FRONTEND_DIR"
    
    success "Frontend deployed successfully"
}

# Function to configure Nginx
configure_nginx() {
    log "🌐 Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/mymeds << EOF
# MyMeds Pharmacy Production Nginx Configuration
# Optimized for security and performance

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/s;

# Upstream backend servers
upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

# Main server block
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server block
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Client max body size
    client_max_body_size 10M;
    
    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    # Frontend static files
    location / {
        root $FRONTEND_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API endpoints with rate limiting
    location /api/ {
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        
        # Proxy to backend
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Authentication endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)\$ {
        deny all;
    }
    
    # Security: Deny access to backup files
    location ~ ~\$ {
        deny all;
    }
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    success "Nginx configured successfully"
}

# Function to setup SSL certificates
setup_ssl() {
    log "🔒 Setting up SSL certificates..."
    
    # Stop Nginx temporarily
    systemctl stop nginx
    
    # Get SSL certificate
    certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$ADMIN_EMAIL"
    
    # Start Nginx
    systemctl start nginx
    
    # Setup automatic renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    success "SSL certificates configured successfully"
}

# Function to create health check script
create_health_check() {
    log "🏥 Creating health check script..."
    
    cat > /usr/local/bin/mymeds-health-check.sh << 'EOF'
#!/bin/bash

# MyMeds Pharmacy Health Check Script
LOG_FILE="/var/www/mymeds/logs/health-check.log"

# Check if backend is running
if ! curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "$(date): Backend health check failed" >> "$LOG_FILE"
    pm2 restart mymeds-backend
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "$(date): Nginx is not running" >> "$LOG_FILE"
    systemctl restart nginx
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> "$LOG_FILE"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "$(date): Memory usage is high: ${MEMORY_USAGE}%" >> "$LOG_FILE"
fi
EOF
    
    chmod +x /usr/local/bin/mymeds-health-check.sh
    
    # Add to crontab (run every 5 minutes)
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/mymeds-health-check.sh") | crontab -
    
    success "Health check script created successfully"
}

# Function to create backup script
create_backup_script() {
    log "💾 Creating backup script..."
    
    cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash

# MyMeds Pharmacy Backup Script
BACKUP_DIR="/var/www/mymeds/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mymeds_backup_$DATE.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
mysqldump -u mymeds_user -p'MyMeds2024!@Pharm' mymeds_production > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup application files
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    /var/www/mymeds/backend \
    /var/www/mymeds/frontend \
    /var/www/mymeds/logs \
    /etc/nginx/sites-available/mymeds \
    /etc/letsencrypt/live/mymedspharmacyinc.com

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF
    
    chmod +x /usr/local/bin/mymeds-backup.sh
    
    # Add to crontab (run daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mymeds-backup.sh") | crontab -
    
    success "Backup script created successfully"
}

# Function to perform final checks
final_checks() {
    log "🔍 Performing final checks..."
    
    # Check if services are running
    if systemctl is-active --quiet nginx; then
        success "Nginx is running"
    else
        error "Nginx is not running"
    fi
    
    if pm2 list | grep -q "mymeds-backend"; then
        success "Backend is running"
    else
        error "Backend is not running"
    fi
    
    if systemctl is-active --quiet mysql; then
        success "MySQL is running"
    else
        error "MySQL is not running"
    fi
    
    # Test API endpoints
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        success "API health check passed"
    else
        error "API health check failed"
    fi
    
    # Test frontend
    if curl -f http://localhost > /dev/null 2>&1; then
        success "Frontend is accessible"
    else
        error "Frontend is not accessible"
    fi
    
    success "All final checks passed"
}

# Function to display deployment summary
deployment_summary() {
    log "🎉 Deployment completed successfully!"
    echo
    echo "=========================================="
    echo "🚀 MyMeds Pharmacy - Deployment Summary"
    echo "=========================================="
    echo
    echo "🌐 Domain: https://$DOMAIN"
    echo "🔧 Backend: http://localhost:4000"
    echo "🎨 Frontend: https://$DOMAIN"
    echo "🗄️ Database: MySQL ($DB_NAME)"
    echo "🔒 SSL: Let's Encrypt"
    echo "🛡️ Firewall: UFW + Fail2ban"
    echo "📊 Monitoring: PM2 + Health Checks"
    echo "💾 Backups: Daily automated"
    echo
    echo "📋 Admin Credentials:"
    echo "   Email: $ADMIN_EMAIL"
    echo "   Password: $ADMIN_PASSWORD"
    echo
    echo "🔧 Useful Commands:"
    echo "   View logs: tail -f $LOGS_DIR/deployment-*.log"
    echo "   PM2 status: pm2 status"
    echo "   Nginx status: systemctl status nginx"
    echo "   MySQL status: systemctl status mysql"
    echo "   Manual backup: /usr/local/bin/mymeds-backup.sh"
    echo "   Health check: /usr/local/bin/mymeds-health-check.sh"
    echo
    echo "⚠️ Important Notes:"
    echo "   1. Update Stripe keys in backend/.env"
    echo "   2. Update SMTP password in backend/.env"
    echo "   3. Update New Relic license key"
    echo "   4. Configure Google Analytics"
    echo "   5. Test all functionality"
    echo
    echo "✅ Your MyMeds Pharmacy is now live!"
    echo "=========================================="
}

# Main deployment function
main() {
    echo
    echo "🚀 MyMeds Pharmacy - Complete Deployment Script"
    echo "================================================"
    echo "This script will deploy your entire application"
    echo "from 0 to 100% in a single go."
    echo
    echo "Target Domain: $DOMAIN"
    echo "VPS IP: $VPS_IP"
    echo "Database: $DB_NAME"
    echo
    echo "Press Enter to continue or Ctrl+C to abort..."
    read
    
    # Create log directory
    mkdir -p "$LOGS_DIR"
    
    # Start deployment
    log "Starting complete deployment..."
    
    check_root
    update_system
    install_packages
    configure_firewall
    configure_fail2ban
    configure_mysql
    create_directories
    deploy_backend
    deploy_frontend
    configure_nginx
    setup_ssl
    create_health_check
    create_backup_script
    final_checks
    deployment_summary
    
    log "Deployment completed successfully!"
}

# Run main function
main "$@"
