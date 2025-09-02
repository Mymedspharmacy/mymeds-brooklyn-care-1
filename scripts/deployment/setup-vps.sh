#!/bin/bash

# 🏥 MyMeds Pharmacy - VPS Setup Script
# This script prepares a fresh VPS for MyMeds Pharmacy deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=${1:-"mymedspharmacyinc.com"}
SSL_EMAIL=${2:-"admin@mymedspharmacyinc.com"}
VPS_USER=${3:-"root"}

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

log "🚀 Starting VPS setup for MyMeds Pharmacy..."

# Update system
log "📦 Updating system packages..."
apt update -y
apt upgrade -y

# Install essential packages
log "📦 Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Setup firewall
log "🔥 Setting up firewall..."
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 4000
ufw --force enable

# Install Node.js
log "📦 Installing Node.js and npm..."
apt remove -y nodejs npm || true
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
npm install -g pm2

# Install Nginx
log "📦 Installing and configuring Nginx..."
apt install -y nginx

# Create Nginx configuration
log "⚙️ Creating Nginx configuration..."
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

# Enable Nginx site
ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# Install SSL certificates
log "🔒 Installing SSL certificates..."
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $SSL_EMAIL
echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -

# Install MySQL
log "📦 Installing and configuring MySQL..."
apt install -y mysql-server

# Secure MySQL
log "🔐 Securing MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'mymeds_secure_password_2024';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install Redis
log "📦 Installing Redis..."
apt install -y redis-server
systemctl restart redis-server
systemctl enable redis-server

# Create directories
log "📁 Creating deployment directories..."
mkdir -p /var/www/mymeds /var/backups/mymeds /var/log/mymeds /var/www/mymeds/uploads /var/www/mymeds/backups
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds

# Setup monitoring
log "📊 Setting up monitoring..."
apt install -y fail2ban
systemctl restart fail2ban
systemctl enable fail2ban

# Create monitoring script
cat > /usr/local/bin/mymeds-monitor.sh << 'EOF'
#!/bin/bash
# MyMeds Pharmacy monitoring script

LOG_FILE="/var/log/mymeds/monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Check if services are running
check_service() {
    local service=$1
    if systemctl is-active --quiet $service; then
        echo "[$DATE] ✅ $service is running" >> $LOG_FILE
    else
        echo "[$DATE] ❌ $service is not running" >> $LOG_FILE
        systemctl restart $service
    fi
}

# Check PM2 processes
check_pm2() {
    if pm2 list | grep -q "mymeds-backend.*online"; then
        echo "[$DATE] ✅ PM2 mymeds-backend is running" >> $LOG_FILE
    else
        echo "[$DATE] ❌ PM2 mymeds-backend is not running" >> $LOG_FILE
        pm2 restart mymeds-backend
    fi
}

# Check disk space
check_disk() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        echo "[$DATE] ⚠️ Disk usage is high: ${usage}%" >> $LOG_FILE
    fi
}

# Run checks
check_service nginx
check_service mysql
check_service redis-server
check_pm2
check_disk

# Keep only last 1000 lines of log
tail -n 1000 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
EOF

chmod +x /usr/local/bin/mymeds-monitor.sh

# Setup backup script
cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash
# MyMeds Pharmacy backup script

BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/mymeds/backup.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..." >> $LOG_FILE

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u mymeds_user -p'mymeds_secure_password_2024' mymeds_production > $BACKUP_DIR/database_$DATE.sql

# File backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C /var/www/mymeds .

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed" >> $LOG_FILE
EOF

chmod +x /usr/local/bin/mymeds-backup.sh

# Setup cron jobs
log "⏰ Setting up cron jobs..."
echo '*/5 * * * * /usr/local/bin/mymeds-monitor.sh' | crontab -
echo '0 2 * * * /usr/local/bin/mymeds-backup.sh' | crontab -

# Create deployment user (optional)
log "👤 Creating deployment user..."
if [ "$VPS_USER" != "root" ]; then
    useradd -m -s /bin/bash $VPS_USER
    usermod -aG sudo $VPS_USER
    usermod -aG www-data $VPS_USER
    mkdir -p /home/$VPS_USER/.ssh
    chmod 700 /home/$VPS_USER/.ssh
    chown -R $VPS_USER:$VPS_USER /home/$VPS_USER/.ssh
fi

# Final configuration
log "🔧 Performing final configuration..."
systemctl restart nginx
systemctl restart mysql
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds

# Health check
log "🏥 Performing health check..."
services=("nginx" "mysql" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        log "✅ $service is running"
    else
        error "❌ $service is not running"
    fi
done

# Display setup summary
log "=== VPS SETUP SUMMARY ==="
log "Domain: $DOMAIN"
log "SSL Email: $SSL_EMAIL"
log "Deployment User: $VPS_USER"
log "Backup Directory: /var/backups/mymeds"
log "Log Directory: /var/log/mymeds"
log "Deployment Directory: /var/www/mymeds"

log ""
log "=== IMPORTANT INFORMATION ==="
log "1. Update your domain DNS to point to this server's IP"
log "2. Configure GitHub secrets with your VPS details"
log "3. Test the deployment pipeline"
log "4. Monitor logs regularly"

log ""
log "=== USEFUL COMMANDS ==="
log "View logs: tail -f /var/log/mymeds/monitor.log"
log "Check services: systemctl status nginx mysql redis-server"
log "View backups: ls -la /var/backups/mymeds/"
log "Monitor PM2: pm2 status"

log ""
log "=== SECURITY REMINDERS ==="
log "1. Change default passwords"
log "2. Keep system updated"
log "3. Monitor logs regularly"
log "4. Test backups"
log "5. Review firewall rules"

log "🎉 VPS setup completed successfully!"
log "Your server is ready for MyMeds Pharmacy deployment"
