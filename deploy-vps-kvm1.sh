#!/bin/bash

# MyMeds Pharmacy VPS KVM1 Hostinger Deployment Script
# Optimized for scalability and performance

set -e  # Exit on any error

echo "🚀 Starting MyMeds Pharmacy VPS KVM1 Hostinger Deployment..."

# Configuration
VPS_IP="your-vps-ip"
VPS_USER="root"
PROJECT_NAME="mymeds-pharmacy"
BACKEND_DIR="/var/www/mymeds-backend"
FRONTEND_DIR="/var/www/mymeds-frontend"
NGINX_CONF="/etc/nginx/sites-available/mymeds-pharmacy"
NGINX_ENABLED="/etc/nginx/sites-enabled/mymeds-pharmacy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    nginx \
    mysql-server \
    redis-server \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    nginx-extras

# Install Node.js 18.x (LTS)
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directories
print_status "Creating application directories..."
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $FRONTEND_DIR
sudo mkdir -p /var/log/mymeds
sudo mkdir -p /var/log/nginx

# Set proper permissions
sudo chown -R $USER:$USER $BACKEND_DIR
sudo chown -R $USER:$USER $FRONTEND_DIR
sudo chmod -R 755 $BACKEND_DIR
sudo chmod -R 755 $FRONTEND_DIR

# Clone or update repository
if [ -d "$PROJECT_NAME" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_NAME
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/your-username/$PROJECT_NAME.git
    cd $PROJECT_NAME
fi

# Build frontend
print_status "Building frontend application..."
npm install
npm run build

# Copy frontend files
print_status "Copying frontend files to web directory..."
sudo cp -r dist/* $FRONTEND_DIR/

# Build backend
print_status "Building backend application..."
cd backend
npm install
npm run build

# Copy backend files
print_status "Copying backend files..."
sudo cp -r dist/* $BACKEND_DIR/
sudo cp package*.json $BACKEND_DIR/
sudo cp ecosystem.config.js $BACKEND_DIR/

# Install backend dependencies
print_status "Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production

# Create environment file
print_status "Creating environment configuration..."
sudo tee $BACKEND_DIR/.env > /dev/null <<EOF
NODE_ENV=production
PORT=4000
DATABASE_URL=mysql://username:password@localhost/mymeds_db
JWT_SECRET=your-super-secret-jwt-key-here
WOOCOMMERCE_STORE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your-consumer-key
WOOCOMMERCE_CONSUMER_SECRET=your-consumer-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
NEWRELIC_LICENSE_KEY=your-newrelic-key
EOF

# Set proper permissions for environment file
sudo chown $USER:$USER $BACKEND_DIR/.env
sudo chmod 600 $BACKEND_DIR/.env

# Configure MySQL
print_status "Configuring MySQL database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'your-secure-password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_db.* TO 'mymeds_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure Redis
print_status "Configuring Redis..."
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Configure Nginx
print_status "Configuring Nginx..."
sudo cp nginx-vps-config.conf $NGINX_CONF

# Replace placeholder values in Nginx config
sudo sed -i "s/your-domain.com/$(hostname -f)/g" $NGINX_CONF
sudo sed -i "s/your-vps-ip/$VPS_IP/g" $NGINX_CONF

# Enable site
sudo ln -sf $NGINX_CONF $NGINX_ENABLED
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4000

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Start application with PM2
print_status "Starting application with PM2..."
cd $BACKEND_DIR
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Configure log rotation
print_status "Configuring log rotation..."
sudo tee /etc/logrotate.d/mymeds > /dev/null <<EOF
$BACKEND_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Setup SSL certificate with Let's Encrypt
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d $(hostname -f) --non-interactive --agree-tos --email your-email@example.com

# Create monitoring script
print_status "Creating monitoring script..."
sudo tee /usr/local/bin/mymeds-monitor.sh > /dev/null <<'EOF'
#!/bin/bash
# MyMeds Pharmacy Monitoring Script

LOG_FILE="/var/log/mymeds/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check PM2 processes
if ! pm2 list | grep -q "online"; then
    echo "[$DATE] PM2 processes are down, restarting..." >> $LOG_FILE
    pm2 restart all
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    echo "[$DATE] Nginx is down, restarting..." >> $LOG_FILE
    sudo systemctl restart nginx
fi

# Check MySQL
if ! systemctl is-active --quiet mysql; then
    echo "[$DATE] MySQL is down, restarting..." >> $LOG_FILE
    sudo systemctl restart mysql
fi

# Check Redis
if ! systemctl is-active --quiet redis-server; then
    echo "[$DATE] Redis is down, restarting..." >> $LOG_FILE
    sudo systemctl restart redis-server
fi

# Memory usage check
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "[$DATE] High memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi

# Disk usage check
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "[$DATE] High disk usage: ${DISK_USAGE}%" >> $LOG_FILE
fi
EOF

sudo chmod +x /usr/local/bin/mymeds-monitor.sh

# Setup cron job for monitoring
print_status "Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/mymeds-monitor.sh") | crontab -

# Create backup script
print_status "Creating backup script..."
sudo tee /usr/local/bin/mymeds-backup.sh > /dev/null <<'EOF'
#!/bin/bash
# MyMeds Pharmacy Backup Script

BACKUP_DIR="/var/backups/mymeds"
DATE=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="mymeds_backup_$DATE.tar.gz"

mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u mymeds_user -p'your-secure-password' mymeds_db > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/$BACKUP_FILE -C /var/www .

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

sudo chmod +x /usr/local/bin/mymeds-backup.sh

# Setup daily backup cron job
print_status "Setting up daily backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/mymeds-backup.sh") | crontab -

# Final status check
print_status "Performing final status check..."
sleep 5

if pm2 list | grep -q "online"; then
    print_status "✅ Application is running successfully!"
else
    print_error "❌ Application failed to start properly"
    pm2 logs
    exit 1
fi

if systemctl is-active --quiet nginx; then
    print_status "✅ Nginx is running successfully!"
else
    print_error "❌ Nginx failed to start properly"
    exit 1
fi

# Display deployment summary
echo ""
echo "🎉 MyMeds Pharmacy VPS KVM1 Hostinger Deployment Completed!"
echo ""
echo "📋 Deployment Summary:"
echo "   • Frontend: $FRONTEND_DIR"
echo "   • Backend: $BACKEND_DIR"
echo "   • Database: MySQL (mymeds_db)"
echo "   • Cache: Redis"
echo "   • Process Manager: PM2 (2 instances)"
echo "   • Web Server: Nginx with SSL"
echo "   • Monitoring: Fail2ban + Custom scripts"
echo "   • Backups: Daily automated backups"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs: pm2 logs"
echo "   • Restart app: pm2 restart all"
echo "   • Monitor: pm2 monit"
echo "   • Check status: pm2 status"
echo "   • View Nginx logs: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "🌐 Your application should be accessible at:"
echo "   • HTTP: http://$VPS_IP"
echo "   • HTTPS: https://$VPS_IP"
echo ""
echo "⚠️  IMPORTANT: Update the .env file with your actual credentials!"
echo "⚠️  IMPORTANT: Update the Nginx configuration with your domain!"
echo ""
print_status "Deployment completed successfully! 🚀"
