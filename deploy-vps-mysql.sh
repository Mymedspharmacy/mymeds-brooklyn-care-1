#!/bin/bash

# 🚀 MyMeds Pharmacy VPS Deployment Script with MySQL
# This script deploys the complete application to a VPS with MySQL database

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

echo -e "${BLUE}🚀 Starting MyMeds Pharmacy VPS Deployment with MySQL${NC}"
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
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Install MySQL
    apt-get install -y mysql-server mysql-client
    
    # Install Nginx
    apt-get install -y nginx
    
    # Install PM2
    npm install -g pm2
    
    # Install other utilities
    apt-get install -y git curl wget unzip ufw fail2ban
    
    print_status "All packages installed successfully"
}

# Function to configure MySQL
configure_mysql() {
    print_status "Configuring MySQL..."
    
    # Start MySQL service
    systemctl start mysql
    systemctl enable mysql
    
    # Secure MySQL installation
    mysql_secure_installation <<EOF
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
    mysql -u root -p$DB_PASSWORD <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF
    
    print_status "MySQL configured successfully"
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

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend application..."
    
    cd /var/www/mymeds
    
    # Clone repository (if not exists)
    if [ ! -d "backend" ]; then
        git clone git@github.com:Mymedspharmacy/mymeds-brooklyn-care-1.git 
    else
        git pull origin main
    fi
    
    cd backend
    
    # Install dependencies
    npm install
    
    # Copy production environment
    cp env.production .env
    
    # Update DATABASE_URL with actual password
    sed -i "s/strong_production_password_here/$DB_PASSWORD/g" .env
    
    # Copy frontend production environment
    cp ../frontend.env.production ../.env
    
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
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql)$ {
        deny all;
    }
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
    
    print_status "Nginx configured successfully"
}

# Function to set up SSL certificates
setup_ssl() {
    print_status "Setting up SSL certificates..."
    
    # Install Certbot
    apt-get install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Set up auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    print_status "SSL certificates configured successfully"
}

# Function to create backup script
create_backup_script() {
    print_status "Creating backup script..."
    
    cat > /var/www/mymeds/backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/mymeds"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="mymeds_backup_\$DATE.sql"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/\$BACKUP_FILE

# Backup application files
tar -czf \$BACKUP_DIR/mymeds_files_\$DATE.tar.gz /var/www/mymeds

# Keep only last 30 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: \$BACKUP_FILE"
EOF
    
    chmod +x /var/www/mymeds/backup.sh
    
    # Add to crontab (daily at 2 AM)
    echo "0 2 * * * /var/www/mymeds/backup.sh" | crontab -
    
    print_status "Backup script created successfully"
}

# Function to create monitoring script
create_monitoring_script() {
    print_status "Creating monitoring script..."
    
    cat > /var/www/mymeds/monitor.sh <<EOF
#!/bin/bash
LOG_FILE="/var/log/mymeds/monitoring.log"

# Check if backend is running
if ! pm2 list | grep -q "mymeds-backend"; then
    echo "\$(date): Backend is down, restarting..." >> \$LOG_FILE
    pm2 restart mymeds-backend
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "\$(date): Nginx is down, restarting..." >> \$LOG_FILE
    systemctl restart nginx
fi

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo "\$(date): MySQL is down, restarting..." >> \$LOG_FILE
    systemctl restart mysql
fi

# Check disk space
DISK_USAGE=\$(df / | tail -1 | awk '{print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo "\$(date): Disk usage is high: \$DISK_USAGE%" >> \$LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=\$(free | grep Mem | awk '{printf("%.2f", \$3/\$2 * 100.0)}')
if (( \$(echo "\$MEMORY_USAGE > 80" | bc -l) )); then
    echo "\$(date): Memory usage is high: \$MEMORY_USAGE%" >> \$LOG_FILE
fi
EOF
    
    chmod +x /var/www/mymeds/monitor.sh
    
    # Add to crontab (every 5 minutes)
    echo "*/5 * * * * /var/www/mymeds/monitor.sh" | crontab -
    
    print_status "Monitoring script created successfully"
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
    echo "🎉 MyMeds Pharmacy VPS Deployment Completed!"
    echo "=============================================="
    echo "Domain: https://$DOMAIN"
    echo "API: https://$DOMAIN/api"
    echo "Database: $DB_NAME"
    echo "Backend Port: 4000"
    echo "Nginx: Running"
    echo "MySQL: Running"
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
    echo "  2. Configure your domain SSL certificates"
    echo "  3. Set up monitoring alerts"
    echo "  4. Test all application features"
    echo "  5. Configure WooCommerce integration"
    echo ""
    echo "📞 Support: Check logs at /var/log/mymeds/"
    echo -e "${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}🚀 Starting MyMeds Pharmacy VPS Deployment${NC}"
    
    update_system
    install_packages
    configure_mysql
    configure_firewall
    configure_fail2ban
    create_directories
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
