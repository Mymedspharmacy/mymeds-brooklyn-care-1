#!/bin/bash

# 🏥 MyMeds Pharmacy - Complete Production Deployment Script
# This script deploys the entire MyMeds Pharmacy system to production on a VPS
# From initial setup to final deployment - everything from A to Z

set -e  # Exit on any error

# Configuration
VPS_IP=""
VPS_USER="root"
DOMAIN=""
SSL_EMAIL=""
BACKUP_DIR="/var/backups/mymeds"
DEPLOY_DIR="/var/www/mymeds"
LOG_FILE="/var/log/mymeds-deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
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

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Validate configuration
validate_config() {
    if [[ -z "$VPS_IP" ]]; then
        error "VPS_IP is not set. Please set the VPS IP address."
    fi
    
    if [[ -z "$DOMAIN" ]]; then
        error "DOMAIN is not set. Please set the domain name."
    fi
    
    if [[ -z "$SSL_EMAIL" ]]; then
        error "SSL_EMAIL is not set. Please set the email for SSL certificates."
    fi
    
    log "Configuration validation passed"
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    # Update package lists
    apt update -y
    
    # Upgrade existing packages
    apt upgrade -y
    
    # Install essential packages
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    log "System packages updated successfully"
}

# Install and configure firewall
setup_firewall() {
    log "Setting up firewall..."
    
    # Install UFW if not present
    apt install -y ufw
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80
    ufw allow 443
    
    # Allow Node.js backend port
    ufw allow 4000
    
    # Enable firewall
    ufw --force enable
    
    log "Firewall configured successfully"
}

# Install Node.js and npm
install_nodejs() {
    log "Installing Node.js and npm..."
    
    # Remove any existing Node.js installations
    apt remove -y nodejs npm
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    
    # Install Node.js
    apt install -y nodejs
    
    # Install PM2 globally
    npm install -g pm2
    
    # Verify installation
    node --version
    npm --version
    pm2 --version
    
    log "Node.js, npm, and PM2 installed successfully"
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    # Install Nginx
    apt install -y nginx
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/mymeds << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Frontend
    location / {
        root /var/www/mymeds/dist;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Backend API
    location /api/ {
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
    
    # Security
    location ~ /\. {
        deny all;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    log "Nginx installed and configured successfully"
}

# Install and configure SSL with Let's Encrypt
install_ssl() {
    log "Installing SSL certificates..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$SSL_EMAIL"
    
    # Set up auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log "SSL certificates installed successfully"
}

# Install and configure MySQL
install_mysql() {
    log "Installing and configuring MySQL..."
    
    # Install MySQL
    apt install -y mysql-server
    
    # Secure MySQL installation
    mysql_secure_installation << EOF

y
0
Y
Y
Y
Y
EOF

    # Create database and user
    mysql -u root -p -e "
CREATE DATABASE IF NOT EXISTS mymeds_production;
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'mymeds_secure_password_2024';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
"
    
    log "MySQL installed and configured successfully"
}

# Install Redis for caching
install_redis() {
    log "Installing Redis..."
    
    apt install -y redis-server
    
    # Configure Redis
    sed -i 's/bind 127.0.0.1/bind 127.0.0.1/' /etc/redis/redis.conf
    sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    # Restart Redis
    systemctl restart redis-server
    systemctl enable redis-server
    
    log "Redis installed and configured successfully"
}

# Create deployment directory structure
create_directories() {
    log "Creating deployment directories..."
    
    # Create main directories
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p /var/log/mymeds
    mkdir -p /var/www/mymeds/uploads
    mkdir -p /var/www/mymeds/backups
    
    # Set permissions
    chown -R www-data:www-data "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"
    
    log "Directories created successfully"
}

# Clone and setup application
setup_application() {
    log "Setting up application..."
    
    cd "$DEPLOY_DIR"
    
    # Clone repository (replace with your actual repository URL)
    # git clone https://github.com/your-username/mymeds-pharmacy.git .
    
    # For now, we'll assume the code is already present
    # Copy application files from local directory
    cp -r /path/to/your/local/mymeds/* .
    
    log "Application files copied successfully"
}

# Install frontend dependencies and build
build_frontend() {
    log "Building frontend..."
    
    cd "$DEPLOY_DIR"
    
    # Install dependencies
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
# Frontend Production Environment Variables
VITE_API_URL=https://$DOMAIN/api
VITE_WORDPRESS_URL=https://your-wordpress-site.com
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
VITE_SENTRY_DSN=YOUR_SENTRY_DSN
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=MyMeds Pharmacy
VITE_APP_DESCRIPTION=Complete Pharmacy Management System
VITE_CONTACT_EMAIL=admin@$DOMAIN
VITE_CONTACT_PHONE=+1-555-0123
VITE_ADDRESS=123 Pharmacy Street, City, State 12345
VITE_BUSINESS_HOURS=Mon-Fri: 8AM-8PM, Sat: 9AM-6PM, Sun: 10AM-4PM
VITE_SOCIAL_FACEBOOK=https://facebook.com/mymedspharmacy
VITE_SOCIAL_TWITTER=https://twitter.com/mymedspharmacy
VITE_SOCIAL_INSTAGRAM=https://instagram.com/mymedspharmacy
VITE_SOCIAL_LINKEDIN=https://linkedin.com/company/mymedspharmacy
VITE_PWA_ENABLED=true
VITE_OFFLINE_ENABLED=true
VITE_PUSH_NOTIFICATIONS_ENABLED=true
VITE_ANALYTICS_ENABLED=true
VITE_ERROR_TRACKING_ENABLED=true
VITE_PERFORMANCE_MONITORING_ENABLED=true
VITE_FEATURE_FLAGS={"newFeatures":true,"betaFeatures":false}
VITE_MAINTENANCE_MODE=false
VITE_MAINTENANCE_MESSAGE=We're performing scheduled maintenance. Please check back soon.
EOF

    # Build frontend
    npm run build
    
    log "Frontend built successfully"
}

# Install backend dependencies and setup
setup_backend() {
    log "Setting up backend..."
    
    cd "$DEPLOY_DIR/backend"
    
    # Install dependencies
    npm install
    
    # Create production environment file
    cat > .env.production << EOF
# Backend Production Environment Variables
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://mymeds_user:mymeds_secure_password_2024@localhost:3306/mymeds_production
JWT_SECRET=your_super_secure_jwt_secret_key_2024_make_it_at_least_64_characters_long
ADMIN_EMAIL=admin@$DOMAIN
CORS_ORIGINS=https://$DOMAIN,https://www.$DOMAIN
WOOCOMMERCE_STORE_URL=https://your-woocommerce-store.com
WOOCOMMERCE_CONSUMER_KEY=your_woocommerce_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_woocommerce_consumer_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
OPENFDA_API_URL=https://api.fda.gov
WORDPRESS_SITE_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APPLICATION_PASSWORD=your_wordpress_app_password
NEW_RELIC_LICENSE_KEY=your_newrelic_license_key
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
BACKUP_ENABLED=true
SECURITY_MONITORING_ENABLED=true
REDIS_URL=redis://localhost:6379
SESSION_SECRET=your_session_secret_key_2024
ENCRYPTION_KEY=your_encryption_key_32_characters
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE=/var/log/mymeds/backend.log
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 2 * * *
MONITORING_ENABLED=true
ALERT_EMAIL=alerts@$DOMAIN
HEALTH_CHECK_ENDPOINT=/api/health
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=System maintenance in progress
FEATURE_FLAGS={"newFeatures":true,"betaFeatures":false}
API_VERSION=v1
API_DOCS_ENABLED=true
API_RATE_LIMIT_ENABLED=true
SECURITY_HEADERS_ENABLED=true
CORS_ENABLED=true
COMPRESSION_ENABLED=true
CACHE_ENABLED=true
CACHE_TTL=3600
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
REDIS_TTL=3600
SESSION_TTL=86400000
JWT_EXPIRES_IN=24h
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
ACCOUNT_LOCKOUT_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION=900000
MFA_ENABLED=false
AUDIT_LOGGING_ENABLED=true
PRIVACY_COMPLIANCE_ENABLED=true
GDPR_COMPLIANCE_ENABLED=true
HIPAA_COMPLIANCE_ENABLED=true
DATA_RETENTION_DAYS=2555
AUTO_BACKUP_ENABLED=true
BACKUP_COMPRESSION_ENABLED=true
BACKUP_ENCRYPTION_ENABLED=true
MONITORING_INTERVAL=60000
PERFORMANCE_MONITORING_ENABLED=true
ERROR_TRACKING_ENABLED=true
LOG_ROTATION_ENABLED=true
LOG_ROTATION_MAX_SIZE=10485760
LOG_ROTATION_MAX_FILES=5
EOF

    # Run database migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    npx prisma generate
    
    log "Backend setup completed successfully"
}

# Configure PM2 for process management
setup_pm2() {
    log "Setting up PM2 process manager..."
    
    cd "$DEPLOY_DIR/backend"
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
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
    error_file: '/var/log/mymeds/pm2-error.log',
    out_file: '/var/log/mymeds/pm2-out.log',
    log_file: '/var/log/mymeds/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    exp_backoff_restart_delay: 100,
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    wait_ready: true,
    listen_timeout: 10000,
    kill_timeout: 5000
  }]
};
EOF

    # Start application with PM2
    pm2 start ecosystem.config.js --env production
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup
    
    log "PM2 configured successfully"
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."
    
    # Create logrotate configuration
    cat > /etc/logrotate.d/mymeds << EOF
/var/log/mymeds/*.log {
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

# MyMeds Monitoring Script
LOG_FILE="/var/log/mymeds/monitoring.log"
ALERT_EMAIL="alerts@yourdomain.com"

# Check if backend is running
if ! pm2 list | grep -q "mymeds-backend.*online"; then
    echo "$(date): Backend is down, attempting restart..." >> "$LOG_FILE"
    pm2 restart mymeds-backend
    echo "MyMeds backend is down and has been restarted" | mail -s "MyMeds Alert: Backend Restart" "$ALERT_EMAIL"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> "$LOG_FILE"
    echo "MyMeds disk usage is high: ${DISK_USAGE}%" | mail -s "MyMeds Alert: High Disk Usage" "$ALERT_EMAIL"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "$(date): Memory usage is high: ${MEMORY_USAGE}%" >> "$LOG_FILE"
    echo "MyMeds memory usage is high: ${MEMORY_USAGE}%" | mail -s "MyMeds Alert: High Memory Usage" "$ALERT_EMAIL"
fi
EOF

    chmod +x /usr/local/bin/mymeds-monitor.sh
    
    # Add monitoring to crontab
    echo "*/5 * * * * /usr/local/bin/mymeds-monitor.sh" | crontab -
    
    log "Monitoring setup completed successfully"
}

# Setup backup system
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash

# MyMeds Backup Script
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mymeds_backup_$DATE.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
mysqldump -u mymeds_user -p'mymeds_secure_password_2024' mymeds_production > "$BACKUP_DIR/database_backup_$DATE.sql"

# Backup application files
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    /var/www/mymeds/dist \
    /var/www/mymeds/backend \
    /var/www/mymeds/uploads \
    /etc/nginx/sites-available/mymeds \
    /etc/letsencrypt/live

# Remove old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

    chmod +x /usr/local/bin/mymeds-backup.sh
    
    # Add backup to crontab (daily at 2 AM)
    echo "0 2 * * * /usr/local/bin/mymeds-backup.sh" | crontab -
    
    log "Backup system setup completed successfully"
}

# Setup security measures
setup_security() {
    log "Setting up security measures..."
    
    # Install fail2ban
    apt install -y fail2ban
    
    # Configure fail2ban
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 3

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 3
EOF

    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    # Set up automatic security updates
    apt install -y unattended-upgrades
    
    cat > /etc/apt/apt.conf.d/50unattended-upgrades << EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}";
    "\${distro_id}:\${distro_codename}-security";
    "\${distro_id}ESMApps:\${distro_codename}-apps-security";
    "\${distro_id}ESM:\${distro_codename}-infra-security";
};

Unattended-Upgrade::Package-Blacklist {
};

Unattended-Upgrade::DevRelease "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

    cat > /etc/apt/apt.conf.d/20auto-upgrades << EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

    log "Security measures setup completed successfully"
}

# Final configuration and optimization
final_configuration() {
    log "Performing final configuration..."
    
    # Optimize MySQL
    cat > /etc/mysql/mysql.conf.d/mymeds.cnf << EOF
[mysqld]
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_size = 32M
query_cache_type = 1
max_connections = 200
thread_cache_size = 8
table_open_cache = 400
EOF

    # Restart MySQL
    systemctl restart mysql
    
    # Optimize Nginx
    cat > /etc/nginx/conf.d/mymeds-optimization.conf << EOF
# Nginx optimization for MyMeds
client_max_body_size 10M;
client_body_timeout 30s;
client_header_timeout 30s;
keepalive_timeout 65s;
send_timeout 30s;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private must-revalidate auth;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/x-javascript
    application/xml+rss
    application/javascript
    application/json;
EOF

    # Restart Nginx
    systemctl restart nginx
    
    # Set proper permissions
    chown -R www-data:www-data /var/www/mymeds
    chmod -R 755 /var/www/mymeds
    chmod -R 644 /var/www/mymeds/dist
    
    log "Final configuration completed successfully"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if services are running
    if systemctl is-active --quiet nginx; then
        log "✓ Nginx is running"
    else
        error "✗ Nginx is not running"
    fi
    
    if systemctl is-active --quiet mysql; then
        log "✓ MySQL is running"
    else
        error "✗ MySQL is not running"
    fi
    
    if systemctl is-active --quiet redis-server; then
        log "✓ Redis is running"
    else
        error "✗ Redis is not running"
    fi
    
    if pm2 list | grep -q "mymeds-backend.*online"; then
        log "✓ Backend is running"
    else
        error "✗ Backend is not running"
    fi
    
    # Test website
    if curl -f -s "https://$DOMAIN" > /dev/null; then
        log "✓ Website is accessible"
    else
        error "✗ Website is not accessible"
    fi
    
    # Test API
    if curl -f -s "https://$DOMAIN/api/health" > /dev/null; then
        log "✓ API is accessible"
    else
        error "✗ API is not accessible"
    fi
    
    log "Health check completed successfully"
}

# Display deployment summary
deployment_summary() {
    log "=== DEPLOYMENT SUMMARY ==="
    log "Domain: $DOMAIN"
    log "Backend URL: https://$DOMAIN/api"
    log "Frontend URL: https://$DOMAIN"
    log "Admin Panel: https://$DOMAIN/admin"
    log "Backup Directory: $BACKUP_DIR"
    log "Log Directory: /var/log/mymeds"
    log "Deployment Directory: $DEPLOY_DIR"
    
    log ""
    log "=== IMPORTANT INFORMATION ==="
    log "1. Update environment variables in .env.production files"
    log "2. Configure your domain DNS to point to $VPS_IP"
    log "3. Set up monitoring alerts"
    log "4. Test all functionality"
    log "5. Set up regular backups"
    
    log ""
    log "=== USEFUL COMMANDS ==="
    log "View logs: tail -f /var/log/mymeds/backend.log"
    log "PM2 status: pm2 status"
    log "Restart backend: pm2 restart mymeds-backend"
    log "View Nginx logs: tail -f /var/log/nginx/access.log"
    log "Manual backup: /usr/local/bin/mymeds-backup.sh"
    log "Monitor system: /usr/local/bin/mymeds-monitor.sh"
    
    log ""
    log "=== SECURITY REMINDERS ==="
    log "1. Change default passwords"
    log "2. Keep system updated"
    log "3. Monitor logs regularly"
    log "4. Test backups"
    log "5. Review firewall rules"
}

# Main deployment function
main() {
    log "Starting MyMeds Pharmacy production deployment..."
    
    # Check if running as root
    check_root
    
    # Validate configuration
    validate_config
    
    # Update system
    update_system
    
    # Setup firewall
    setup_firewall
    
    # Install Node.js
    install_nodejs
    
    # Install Nginx
    install_nginx
    
    # Install SSL certificates
    install_ssl
    
    # Install MySQL
    install_mysql
    
    # Install Redis
    install_redis
    
    # Create directories
    create_directories
    
    # Setup application
    setup_application
    
    # Build frontend
    build_frontend
    
    # Setup backend
    setup_backend
    
    # Setup PM2
    setup_pm2
    
    # Setup monitoring
    setup_monitoring
    
    # Setup backup
    setup_backup
    
    # Setup security
    setup_security
    
    # Final configuration
    final_configuration
    
    # Health check
    health_check
    
    # Display summary
    deployment_summary
    
    log "🎉 MyMeds Pharmacy production deployment completed successfully!"
    log "Your application is now live at https://$DOMAIN"
}

# Run main function
main "$@"

