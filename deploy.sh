#!/bin/bash

# MyMeds Pharmacy VPS Deployment Script
# This script deploys the application to a production VPS

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mymedspharmacyinc.com"
BACKEND_DIR="/var/www/mymeds-backend"
FRONTEND_DIR="/var/www/mymeds-frontend"
NGINX_CONF="/etc/nginx/sites-available/mymeds"
NGINX_ENABLED="/etc/nginx/sites-enabled/mymeds"

echo -e "${BLUE}🚀 MyMeds Pharmacy VPS Deployment${NC}"
echo "======================================"

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
print_status "Installing required packages..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Create application directories
print_status "Creating application directories..."
mkdir -p $BACKEND_DIR
mkdir -p $FRONTEND_DIR
mkdir -p /var/log/mymeds

# Set up firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 4000
ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
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
EOF

systemctl restart fail2ban

# Deploy backend
print_status "Deploying backend..."
cd $BACKEND_DIR

# Clone repository (replace with your actual repo)
# git clone https://github.com/yourusername/mymeds-brooklyn-care.git .

# Install dependencies
npm install

# Build the application
npm run build

# Set up environment variables
print_status "Setting up environment variables..."
cat > .env << EOF
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://mymeds_user:secure_password@localhost:3306/mymeds_db"
JWT_SECRET="your-super-secure-jwt-secret-key-here-minimum-32-characters"
FRONTEND_URL="https://$DOMAIN"
DISABLE_RATE_LIMIT=false
ADMIN_EMAIL="mymedspharmacyinc@gmail.com"
ADMIN_PASSWORD="MyMeds2024!@Pharm"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="mymedspharmacyinc@gmail.com"
SMTP_PASS="your-app-password"
NEW_RELIC_LICENSE_KEY="your-new-relic-key"
EOF

# Set proper permissions
chown -R www-data:www-data $BACKEND_DIR
chmod -R 755 $BACKEND_DIR

# Start backend with PM2
print_status "Starting backend with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Deploy frontend
print_status "Deploying frontend..."
cd $FRONTEND_DIR

# Build frontend (assuming you have the built files)
# For now, we'll create a placeholder
cat > index.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>MyMeds Pharmacy</title>
</head>
<body>
    <h1>MyMeds Pharmacy - Frontend</h1>
    <p>Frontend deployment placeholder</p>
</body>
</html>
EOF

# Set proper permissions
chown -R www-data:www-data $FRONTEND_DIR
chmod -R 755 $FRONTEND_DIR

# Configure nginx
print_status "Configuring nginx..."
cp nginx-production.conf $NGINX_CONF
ln -sf $NGINX_CONF $NGINX_ENABLED

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

# Set up SSL certificate
print_status "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Set up automatic SSL renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create health check script
print_status "Creating health check script..."
cat > /usr/local/bin/mymeds-health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:4000/api/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Backend health check failed, restarting..."
    pm2 restart mymeds-backend
fi
EOF

chmod +x /usr/local/bin/mymeds-health-check.sh

# Set up health check cron job
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/mymeds-health-check.sh") | crontab -

# Create backup script
print_status "Creating backup script..."
cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u mymeds_user -p mymeds_db > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/mymeds-backend /var/www/mymeds-frontend

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/mymeds-backup.sh

# Set up daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mymeds-backup.sh") | crontab -

# Final health check
print_status "Performing final health check..."
sleep 5

# Check if services are running
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
fi

if pm2 list | grep -q "mymeds-backend.*online"; then
    print_status "Backend is running"
else
    print_error "Backend is not running"
fi

# Test API endpoint
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    print_status "API health check passed"
else
    print_error "API health check failed"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update DNS records to point to this server"
echo "2. Configure your domain's SSL certificate"
echo "3. Set up monitoring and alerting"
echo "4. Configure database backups"
echo "5. Test all functionality"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "Frontend: https://$DOMAIN"
echo "Backend API: https://$DOMAIN/api"
echo "Health Check: https://$DOMAIN/api/health"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "PM2 Status: pm2 status"
echo "PM2 Logs: pm2 logs mymeds-backend"
echo "Nginx Status: systemctl status nginx"
echo "Restart Backend: pm2 restart mymeds-backend"
echo "Restart Nginx: systemctl restart nginx"
