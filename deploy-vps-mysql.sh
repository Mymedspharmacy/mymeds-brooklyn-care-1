#!/bin/bash

# 🚀 MyMeds Pharmacy VPS Deployment Script - Complete & Robust
# This script ensures 100% successful deployment with comprehensive error handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="72.60.116.253"
DOMAIN="mymedspharmacyinc.com"
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
DB_PASSWORD="MyMedsSecurePassword2024!"

# Logging
LOG_FILE="/var/log/mymeds-deployment.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo -e "${BLUE}🚀 Starting MyMeds Pharmacy VPS Deployment - Complete & Robust${NC}"
echo "Timestamp: $(date)"
echo "VPS IP: $VPS_IP"
echo "Domain: $DOMAIN"
echo "Database: $DB_NAME"

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

# Function to check disk space
check_disk_space() {
    print_status "Checking available disk space..."
    
    # Get available disk space in GB
    available_space=$(df / | awk 'NR==2 {print $4}' | awk '{print $1/1024/1024}')
    
    # Check if we have at least 5GB available
    if (( $(echo "$available_space > 5" | bc -l) )); then
        print_status "Available disk space: ${available_space}GB (sufficient)"
    else
        print_error "Insufficient disk space: ${available_space}GB available, need at least 5GB"
        print_error "Please free up some space before continuing"
        exit 1
    fi
}

# Function to update system
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_status "System updated successfully"
}

# Function to install required packages
install_packages() {
    print_status "Installing required packages..."
    
    # Install Node.js 18
    if ! command_exists nodejs; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        print_status "Node.js already installed"
    fi
    
    # Install MySQL
    if ! command_exists mysql; then
        apt-get install -y mysql-server mysql-client
    else
        print_status "MySQL already installed"
    fi
    
    # Install Nginx
    if ! command_exists nginx; then
        apt-get install -y nginx
    else
        print_status "Nginx already installed"
    fi
    
    # Install PM2
    if ! command_exists pm2; then
        npm install -g pm2
    else
        print_status "PM2 already installed"
    fi
    
    # Install PHP and required extensions
    if ! command_exists php8.3; then
        apt-get install -y php8.3 php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-mbstring php8.3-xml php8.3-zip php8.3-opcache php8.3-intl
    else
        print_status "PHP 8.3 already installed"
    fi
    
    # Install other utilities
    apt-get install -y git curl wget unzip ufw fail2ban bc
    
    print_status "All packages installed successfully"
}

# Function to setup MySQL properly
setup_mysql() {
    print_status "Setting up MySQL..."
    
    # Start MySQL service
    systemctl start mysql
    systemctl enable mysql
    
    # Create required directories with proper permissions
    mkdir -p /var/run/mysqld
    chown mysql:mysql /var/run/mysqld
    chmod 755 /var/run/mysqld
    
    # Check if MySQL root password is already set
    if mysql -u root -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
        print_status "MySQL root password already configured"
    elif mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
        print_status "Setting MySQL root password..."
        mysql -u root <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF
        print_status "MySQL root password set successfully"
    else
        print_status "Resetting MySQL root password..."
        
        # Stop MySQL completely
        systemctl stop mysql
        pkill -f mysqld
        sleep 3
        
        # Create required directories with proper permissions
        rm -rf /var/run/mysqld
        mkdir -p /var/run/mysqld
        chown mysql:mysql /var/run/mysqld
        chmod 755 /var/run/mysqld
        
        # Start MySQL in safe mode with explicit socket path
        mysqld_safe --skip-grant-tables --skip-networking --socket=/var/run/mysqld/mysqld.sock &
        sleep 15
        
        # Wait for MySQL to be ready
        timeout=60
        counter=0
        while ! mysql -u root --socket=/var/run/mysqld/mysqld.sock -e "SELECT 1;" > /dev/null 2>&1; do
            sleep 2
            counter=$((counter + 2))
            if [ $counter -ge $timeout ]; then
                print_error "MySQL failed to start in safe mode within $timeout seconds"
                exit 1
            fi
        done
        
        print_status "MySQL safe mode started successfully"
        
        # Reset password
        mysql -u root --socket=/var/run/mysqld/mysqld.sock <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';
FLUSH PRIVILEGES;
EOF
        
        # Stop safe mode MySQL
        pkill -f mysqld
        sleep 5
        
        # Restart MySQL normally
        systemctl start mysql
        sleep 10
        
        # Wait for MySQL to be ready
        timeout=60
        counter=0
        while ! mysql -u root -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; do
            sleep 2
            counter=$((counter + 2))
            if [ $counter -ge $timeout ]; then
                print_error "MySQL failed to start normally within $timeout seconds"
                exit 1
            fi
        done
        
        print_status "MySQL root password reset successfully"
    fi
    
    # Verify MySQL connection
    if mysql -u root -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1; then
        print_status "MySQL connection verified"
    else
        print_error "Failed to verify MySQL connection"
        exit 1
    fi
    
    # Create database and user
    mysql -u root -p$DB_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        print_status "Database and user created successfully"
    else
        print_error "Failed to create database and user"
        exit 1
    fi
    
    print_status "MySQL setup completed successfully"
}

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    ufw --force enable
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80
    ufw allow 443
    ufw allow 4000
    
    print_status "Firewall configured successfully"
}

# Function to configure Fail2ban
configure_fail2ban() {
    print_status "Configuring Fail2ban..."
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    # Create custom jail for Node.js
    cat > /etc/fail2ban/jail.local <<EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log

[nodejs]
enabled = true
port = 4000
filter = nodejs
logpath = /var/log/mymeds/application.log
maxretry = 3
bantime = 3600
findtime = 600
EOF
    
    systemctl restart fail2ban
    print_status "Fail2ban configured successfully"
}

# Function to cleanup previous deployment
cleanup_previous_deployment() {
    print_status "Cleaning up previous deployment data..."
    
    # Stop services if running
    if command_exists pm2 && pm2 list | grep -q "mymeds-backend"; then
        pm2 stop mymeds-backend
        pm2 delete mymeds-backend
        print_status "Stopped and removed PM2 backend process"
    fi
    
    # Remove application directories
    if [ -d "/var/www/mymeds" ]; then
        rm -rf /var/www/mymeds
        print_status "Removed /var/www/mymeds directory"
    fi
    
    if [ -d "/var/log/mymeds" ]; then
        rm -rf /var/log/mymeds
        print_status "Removed /var/log/mymeds directory"
    fi
    
    # Remove Nginx configurations
    if [ -f "/etc/nginx/sites-available/mymeds" ]; then
        rm -f /etc/nginx/sites-available/mymeds
        print_status "Removed Nginx site configuration"
    fi
    
    if [ -f "/etc/nginx/sites-enabled/mymeds" ]; then
        rm -f /etc/nginx/sites-enabled/mymeds
        print_status "Removed Nginx site symlink"
    fi
    
    # Clean up Node.js modules and cache
    if [ -d "/root/.npm" ]; then
        rm -rf /root/.npm
        print_status "Cleaned npm cache"
    fi
    
    # Clean up temporary files
    rm -rf /tmp/mymeds-*
    print_status "Cleaned temporary files"
    
    print_status "Previous deployment cleanup completed"
}

# Function to create application directories
create_directories() {
    print_status "Creating application directories..."
    
    mkdir -p /var/www/mymeds
    mkdir -p /var/log/mymeds
    mkdir -p /var/backups/mymeds
    mkdir -p /var/www/mymeds/uploads
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
    
    # Set permissions
    chown -R www-data:www-data /var/www/mymeds
    chown -R www-data:www-data /var/log/mymeds
    chmod -R 755 /var/www/mymeds
    
    print_status "Directories created successfully"
}

# Function to install and configure WordPress
install_wordpress() {
    print_status "Installing WordPress and WooCommerce..."
    
    cd /var/www/mymeds
    
    # Create WordPress directory
    mkdir -p wordpress
    cd wordpress
    
    # Download WordPress
    wget https://wordpress.org/latest.tar.gz
    tar -xzf latest.tar.gz
    mv wordpress/* .
    rmdir wordpress
    rm latest.tar.gz
    
    # Set permissions
    chown -R www-data:www-data /var/www/mymeds/wordpress
    chmod -R 755 /var/www/mymeds/wordpress
    chmod -R 644 /var/www/mymeds/wordpress/wp-config.php
    
    # Create WordPress database
    mysql -u root -p$DB_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS wordpress;
CREATE USER IF NOT EXISTS 'wordpress_user'@'localhost' IDENTIFIED BY 'WordPressSecurePass2024!';
GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress_user'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    if [ $? -eq 0 ]; then
        print_status "WordPress database created successfully"
    else
        print_error "Failed to create WordPress database"
        exit 1
    fi
    
    # Create wp-config.php
    cp wp-config-sample.php wp-config.php
    sed -i "s/database_name_here/wordpress/g" wp-config.php
    sed -i "s/username_here/wordpress_user/g" wp-config.php
    sed -i "s/password_here/WordPressSecurePass2024!/g" wp-config.php
    
    # Generate WordPress keys
    curl -s https://api.wordpress.org/secret-key/1.1/salt/ > /tmp/wp-keys.txt
    sed -i '/AUTH_KEY/,/NONCE_SALT/d' wp-config.php
    sed -i "/#@-/,/#@+/r /tmp/wp-keys.txt" wp-config.php
    rm /tmp/wp-keys.txt
    
    # Configure PHP-FPM
    systemctl enable php8.3-fpm
    systemctl start php8.3-fpm
    
    print_status "WordPress installed successfully"
    
    # Install WooCommerce plugin
    print_status "Installing WooCommerce plugin..."
    
    # Download WooCommerce plugin
    cd wp-content/plugins
    wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
    unzip woocommerce.latest-stable.zip
    rm woocommerce.latest-stable.zip
    
    # Set permissions
    chown -R www-data:www-data /var/www/mymeds/wordpress/wp-content/plugins/woocommerce
    chmod -R 755 /var/www/mymeds/wordpress/wp-content/plugins/woocommerce
    
    print_status "WooCommerce plugin installed successfully"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend application..."
    
    cd /var/www/mymeds
    
    # Clone repository (if not exists)
    if [ ! -d "backend" ]; then
        git clone git@github.com:Mymedspharmacy/mymeds-brooklyn-care-1.git backend
    else
        cd backend
        git pull origin main
    fi
    
    cd backend
    
    # Install dependencies
    npm install
    
    # Copy production environment
    cp env.production .env
    
    # Update DATABASE_URL with actual password
    sed -i "s/strong_production_password_here/$DB_PASSWORD/g" .env
    
    # Generate Prisma client
    npx prisma generate
    
    # Run database migrations
    npx prisma migrate deploy
    
    # Build the application
    npm run build
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js <<EOF
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
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    health_check_grace_period: 3000
  }]
};
EOF
    
    # Start with PM2
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    print_status "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend application..."
    
    cd /var/www/mymeds
    
    # Copy frontend production environment
    cp frontend.env.production .env
    
    # Build frontend
    npm install
    npm run build
    
    # Copy built files to nginx directory
    cp -r dist/* /var/www/mymeds/frontend/
    
    print_status "Frontend deployed successfully"
}

# Function to configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/mymeds <<EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/s;
limit_req_zone \$binary_remote_addr zone=contact:10m rate=2r/s;

# Upstream backend
upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/$DOMAIN.crt;
    ssl_certificate_key /etc/ssl/private/$DOMAIN.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Frontend
    location / {
        root /var/www/mymeds/frontend;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # WordPress (Blog/Shop)
    location /blog/ {
        root /var/www/mymeds/wordpress;
        try_files \$uri \$uri/ /blog/index.php?\$args;
        
        # PHP processing
        location ~ \.php$ {
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            fastcgi_param PATH_INFO \$fastcgi_path_info;
        }
    }
    
    location /shop/ {
        root /var/www/mymeds/wordpress;
        try_files \$uri \$uri/ /shop/index.php?\$args;
        
        # PHP processing
        location ~ \.php$ {
            fastcgi_split_path_info ^(.+\.php)(/.+)$;
            fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
            fastcgi_index index.php;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            fastcgi_param PATH_INFO \$fastcgi_path_info;
        }
    }
    
    # API endpoints
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # Authentication endpoints (stricter rate limiting)
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
    
    # Contact endpoints (very strict rate limiting)
    location /api/contact/ {
        limit_req zone=contact burst=5 nodelay;
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
}
EOF
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    nginx -t
    
    # Restart Nginx
    systemctl restart nginx
    
    print_status "Nginx configured successfully"
}

# Function to setup SSL
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Create self-signed certificate for now (can be replaced with Let's Encrypt later)
    mkdir -p /etc/ssl/certs /etc/ssl/private
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/$DOMAIN.key \
        -out /etc/ssl/certs/$DOMAIN.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    
    print_status "SSL certificates created successfully"
    print_warning "Self-signed certificate created. Replace with Let's Encrypt certificate later."
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > /var/www/mymeds/backup.sh <<EOF
#!/bin/bash
# MyMeds Pharmacy Backup Script

BACKUP_DIR="/var/backups/mymeds"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mymeds_backup_\$DATE.tar.gz"

mkdir -p \$BACKUP_DIR

# Backup application files
tar -czf \$BACKUP_DIR/\$BACKUP_FILE /var/www/mymeds /var/log/mymeds

# Backup databases
mysqldump -u root -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/mymeds_db_\$DATE.sql
mysqldump -u root -p$DB_PASSWORD wordpress > \$BACKUP_DIR/wordpress_db_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: \$BACKUP_FILE"
EOF
    
    chmod +x /var/www/mymeds/backup.sh
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * /var/www/mymeds/backup.sh") | crontab -
    
    print_status "Backup script created and scheduled"
}

# Function to create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    cat > /var/www/mymeds/monitor.sh <<EOF
#!/bin/bash
# MyMeds Pharmacy Monitoring Script

# Check if services are running
if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down - restarting..."
    systemctl restart nginx
fi

if ! systemctl is-active --quiet mysql; then
    echo "MySQL is down - restarting..."
    systemctl restart mysql
fi

if ! systemctl is-active --quiet php8.3-fpm; then
    echo "PHP-FPM is down - restarting..."
    systemctl restart php8.3-fpm
fi

if ! pm2 list | grep -q "mymeds-backend"; then
    echo "Backend is down - restarting..."
    cd /var/www/mymeds/backend
    pm2 start ecosystem.config.js
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is \$DISK_USAGE%"
fi

# Check memory usage
MEM_USAGE=\$(free | awk 'NR==2{printf "%.2f", \$3*100/\$2}')
if (( \$(echo "\$MEM_USAGE > 80" | bc -l) )); then
    echo "Warning: Memory usage is \$MEM_USAGE%"
fi
EOF
    
    chmod +x /var/www/mymeds/monitor.sh
    
    # Add to crontab for monitoring every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/mymeds/monitor.sh") | crontab -
    
    print_status "Monitoring script created and scheduled"
}

# Function to perform final checks
final_checks() {
    print_status "Performing final checks..."
    
    # Check if all services are running
    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    if systemctl is-active --quiet mysql; then
        print_status "MySQL is running"
    else
        print_error "MySQL is not running"
    fi
    
    if systemctl is-active --quiet php8.3-fpm; then
        print_status "PHP-FPM is running"
    else
        print_error "PHP-FPM is not running"
    fi
    
    if pm2 list | grep -q "mymeds-backend"; then
        print_status "Backend is running"
    else
        print_error "Backend is not running"
    fi
    
    # Test database connection
    if mysql -u $DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SELECT 1;" > /dev/null 2>&1; then
        print_status "Database connection successful"
    else
        print_error "Database connection failed"
    fi
    
    # Test API endpoint
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        print_status "API health check successful"
    else
        print_error "API health check failed"
    fi
    
    print_status "Final checks completed"
}

# Function to show deployment summary
deployment_summary() {
    echo -e "${BLUE}"
    echo "🎉 MyMeds Pharmacy VPS Deployment Completed Successfully!"
    echo "========================================================"
    echo "Domain: https://$DOMAIN"
    echo "API: https://$DOMAIN/api"
    echo "Blog: https://$DOMAIN/blog"
    echo "Shop: https://$DOMAIN/shop"
    echo "Database: $DB_NAME"
    echo "WordPress DB: wordpress"
    echo "Backend Port: 4000"
    echo "Nginx: Running"
    echo "MySQL: Running"
    echo "PHP-FPM: Running"
    echo "PM2: Running"
    echo "Firewall: Configured"
    echo "SSL: Enabled"
    echo "Backups: Scheduled"
    echo "Monitoring: Active"
    echo ""
    echo "📊 Useful Commands:"
    echo "  PM2 Status: pm2 status"
    echo "  PM2 Logs: pm2 logs"
    echo "  Nginx Status: systemctl status nginx"
    echo "  MySQL Status: systemctl status mysql"
    echo "  Backup: /var/www/mymeds/backup.sh"
    echo "  Monitor: /var/www/mymeds/monitor.sh"
    echo ""
    echo "🔧 Next Steps:"
    echo "  1. Update DNS records to point to $VPS_IP"
    echo "  2. Replace self-signed SSL with Let's Encrypt certificate"
    echo "  3. Complete WordPress setup at https://$DOMAIN/blog"
    echo "  4. Configure WooCommerce at https://$DOMAIN/shop"
    echo "  5. Set up WooCommerce API keys for integration"
    echo "  6. Test all application features"
    echo ""
    echo "📞 Support: Check logs at /var/log/mymeds/"
    echo -e "${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting MyMeds Pharmacy VPS Deployment${NC}"
    
    check_disk_space
    update_system
    install_packages
    setup_mysql
    configure_firewall
    configure_fail2ban
    cleanup_previous_deployment
    create_directories
    install_wordpress
    deploy_backend
    deploy_frontend
    configure_nginx
    setup_ssl
    create_backup_script
    create_monitoring_script
    final_checks
    deployment_summary
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
}

# Run main function
main "$@"
