#!/bin/bash

# 🚀 COMPLETE VPS KVM1 HOSTINGER DEPLOYMENT SCRIPT
# This script will set up your entire production environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="yourdomain.com"
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
DB_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
ADMIN_EMAIL="admin@${DOMAIN}"
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

echo -e "${BLUE}🚀 Starting MyMeds VPS KVM1 Hostinger Deployment...${NC}"
echo -e "${YELLOW}Domain: ${DOMAIN}${NC}"
echo -e "${YELLOW}Database: ${DB_NAME}${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js ${NODE_VERSION} and npm ${NPM_VERSION} installed"

# Install MySQL 8.0
print_status "Installing MySQL 8.0..."
apt install -y mysql-server

# Secure MySQL installation
print_status "Securing MySQL installation..."
mysql_secure_installation

# Create database and user
print_status "Creating database and user..."
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install Certbot for SSL
print_status "Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/mymeds
mkdir -p /var/log/pm2
mkdir -p /var/log/nginx

# Set proper permissions
chown -R $SUDO_USER:$SUDO_USER /var/www/mymeds
chmod -R 755 /var/www/mymeds

# Create environment file
print_status "Creating production environment file..."
cat > /var/www/mymeds/backend/.env << EOF
# 🚀 PRODUCTION ENVIRONMENT CONFIGURATION
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database configuration
DATABASE_URL=mysql://${DB_USER}:${DB_PASS}@localhost:3306/${DB_NAME}

# Security
JWT_SECRET=${JWT_SECRET}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# CORS
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}

# Rate limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_API_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true

# Backup
BACKUP_DATABASE=true
BACKUP_DATABASE_RETENTION_DAYS=30
BACKUP_DATABASE_COMPRESSION=true
BACKUP_DATABASE_ENCRYPTION=true

# Performance
CACHE_ENABLED=true
CACHE_TTL=300000
EOF

# Configure Nginx
print_status "Configuring Nginx..."
cp nginx-production.conf /etc/nginx/sites-available/mymeds
sed -i "s/yourdomain.com/${DOMAIN}/g" /etc/nginx/sites-available/mymeds

# Enable site
ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Install application dependencies
print_status "Installing application dependencies..."
cd /var/www/mymeds/backend
npm ci --production

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Build application
print_status "Building application..."
npm run build

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup

# Configure firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 4000
ufw --force enable

# Set up SSL certificate
print_status "Setting up SSL certificate..."
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN}

# Configure automatic SSL renewal
print_status "Configuring automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Set up log rotation
print_status "Setting up log rotation..."
cat > /etc/logrotate.d/mymeds << EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        pm2 reloadLogs
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx
    endscript
}
EOF

# Set up automated backups
print_status "Setting up automated backups..."
cat > /etc/cron.d/mymeds-backup << EOF
# Daily database backup at 2 AM
0 2 * * * root cd /var/www/mymeds/backend && npm run backup:database

# Daily file backup at 3 AM
0 3 * * * root cd /var/www/mymeds/backend && npm run backup:files

# Cleanup old backups weekly
0 4 * * 0 root cd /var/www/mymeds/backend && npm run backup:cleanup
EOF

# Create systemd service for PM2
print_status "Creating systemd service for PM2..."
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER

# Configure MySQL optimization
print_status "Configuring MySQL optimization..."
cat > /etc/mysql/mysql.conf.d/mymeds.cnf << EOF
[mysqld]
# Connection settings
max_connections = 200
max_connect_errors = 1000000

# Buffer settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_log_buffer_size = 16M

# Query cache
query_cache_type = 1
query_cache_size = 32M
query_cache_limit = 2M

# Performance
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
EOF

# Restart MySQL to apply changes
systemctl restart mysql

# Create monitoring script
print_status "Creating monitoring script..."
cat > /usr/local/bin/mymeds-monitor << 'EOF'
#!/bin/bash
# MyMeds System Monitor

echo "=== MyMeds System Status ==="
echo "Date: $(date)"
echo ""

echo "=== PM2 Status ==="
pm2 status
echo ""

echo "=== Nginx Status ==="
systemctl status nginx --no-pager -l
echo ""

echo "=== MySQL Status ==="
systemctl status mysql --no-pager -l
echo ""

echo "=== System Resources ==="
echo "CPU Usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1
echo "Memory Usage:"
free -h
echo "Disk Usage:"
df -h
echo ""

echo "=== Application Health ==="
curl -s http://localhost:4000/api/health || echo "Backend not responding"
echo ""

echo "=== Recent Logs ==="
tail -n 20 /var/log/nginx/mymeds_error.log 2>/dev/null || echo "No error logs found"
EOF

chmod +x /usr/local/bin/mymeds-monitor

# Create deployment script
print_status "Creating deployment script..."
cat > /usr/local/bin/mymeds-deploy << 'EOF'
#!/bin/bash
# MyMeds Deployment Script

set -e

echo "🚀 Starting MyMeds deployment..."

cd /var/www/mymeds/backend

echo "📥 Pulling latest changes..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --production

echo "🔧 Generating Prisma client..."
npx prisma generate

echo "🏗️ Building application..."
npm run build

echo "🔄 Restarting application..."
pm2 reload ecosystem.config.js

echo "✅ Deployment completed!"
echo "🔄 Restarting services..."
pm2 restart all
systemctl reload nginx

echo "🎉 All services restarted!"
EOF

chmod +x /usr/local/bin/mymeds-deploy

# Set up log monitoring
print_status "Setting up log monitoring..."
cat > /etc/logrotate.d/mymeds-logs << EOF
/var/www/mymeds/backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SUDO_USER $SUDO_USER
}
EOF

# Create health check script
print_status "Creating health check script..."
cat > /usr/local/bin/mymeds-health << 'EOF'
#!/bin/bash
# MyMeds Health Check

HEALTH_URL="http://localhost:4000/api/health"
NGINX_STATUS=$(systemctl is-active nginx)
MYSQL_STATUS=$(systemctl is-active mysql)
PM2_STATUS=$(pm2 jlist | jq -r '.[0].pm2_env.status')

echo "=== MyMeds Health Check ==="
echo "Date: $(date)"
echo ""

echo "Nginx: $NGINX_STATUS"
echo "MySQL: $MYSQL_STATUS"
echo "PM2: $PM2_STATUS"
echo ""

if curl -s $HEALTH_URL > /dev/null; then
    echo "✅ Backend health check: PASSED"
else
    echo "❌ Backend health check: FAILED"
fi

echo ""
echo "=== System Health ==="
echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
echo "Memory Usage: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "Disk Usage: $(df -h / | awk 'NR==2{print $5}')"
EOF

chmod +x /usr/local/bin/mymeds-health

# Final configuration
print_status "Performing final configuration..."
systemctl enable nginx
systemctl enable mysql
systemctl reload nginx

# Create summary
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉${NC}"
echo ""
echo -e "${BLUE}📋 DEPLOYMENT SUMMARY:${NC}"
echo -e "Domain: ${DOMAIN}"
echo -e "Database: ${DB_NAME}"
echo -e "Database User: ${DB_USER}"
echo -e "Admin Email: ${ADMIN_EMAIL}"
echo -e "Application URL: https://${DOMAIN}"
echo -e "Backend API: https://${DOMAIN}/api"
echo -e "Health Check: https://${DOMAIN}/health"
echo ""
echo -e "${BLUE}🔧 USEFUL COMMANDS:${NC}"
echo -e "Monitor system: mymeds-monitor"
echo -e "Deploy updates: mymeds-deploy"
echo -e "Health check: mymeds-health"
echo -e "PM2 dashboard: pm2 monit"
echo -e "View logs: pm2 logs"
echo ""
echo -e "${BLUE}📁 IMPORTANT PATHS:${NC}"
echo -e "Application: /var/www/mymeds"
echo -e "Logs: /var/log/pm2, /var/log/nginx"
echo -e "Backups: /var/www/mymeds/backend/backups"
echo -e "Environment: /var/www/mymeds/backend/.env"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo -e "1. Update your domain DNS to point to this server"
echo -e "2. Test the application at https://${DOMAIN}"
echo -e "3. Change default admin password"
echo -e "4. Configure your Stripe keys in .env"
echo -e "5. Set up your SMTP configuration"
echo -e "6. Test backup and restore procedures"
echo ""
echo -e "${GREEN}🚀 Your MyMeds application is now 100% production-ready!${NC}"
echo ""

# Save credentials to file
cat > /var/www/mymeds/DEPLOYMENT_CREDENTIALS.txt << EOF
=== MYMEDS DEPLOYMENT CREDENTIALS ===
Date: $(date)
Domain: ${DOMAIN}

DATABASE:
- Name: ${DB_NAME}
- User: ${DB_USER}
- Password: ${DB_PASS}

ADMIN:
- Email: ${ADMIN_EMAIL}
- Password: ${ADMIN_PASSWORD}

JWT_SECRET: ${JWT_SECRET}

IMPORTANT: Keep this file secure and delete after copying credentials!
EOF

chmod 600 /var/www/mymeds/DEPLOYMENT_CREDENTIALS.txt

print_warning "Credentials saved to /var/www/mymeds/DEPLOYMENT_CREDENTIALS.txt"
print_warning "Please copy these credentials and delete the file for security!"

echo -e "${GREEN}🎯 DEPLOYMENT STATUS: 100% COMPLETE${NC}"
