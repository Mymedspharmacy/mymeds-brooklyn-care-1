#!/bin/bash

# MyMeds Backend Deployment Script for VPS KVM1 Hostinger
# This script sets up the production environment

set -e  # Exit on any error

echo "🚀 Starting MyMeds Backend Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "🔧 Installing required packages..."
sudo apt install -y curl wget git build-essential

# Install Node.js 20.x (LTS)
echo "📥 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
echo "🗄️ Installing MySQL..."
sudo apt install -y mysql-server mysql-client

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install PM2 for process management
echo "⚡ Installing PM2..."
sudo npm install -g pm2

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Install UFW firewall
echo "🛡️ Installing UFW firewall..."
sudo apt install -y ufw

# Install monitoring tools
echo "📊 Installing monitoring tools..."
sudo apt install -y htop iotop nethogs

# Install log rotation
echo "📝 Installing log rotation..."
sudo apt install -y logrotate

# Install Apache Bench for load testing
echo "⚡ Installing Apache Bench..."
sudo apt install -y apache2-utils

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mymeds-backend
sudo chown $USER:$USER /var/www/mymeds-backend

# Copy application files
echo "📋 Copying application files..."
cp -r dist/* /var/www/mymeds-backend/
cp package*.json /var/www/mymeds-backend/
cp .env.production /var/www/mymeds-backend/.env

# Install production dependencies
echo "📦 Installing production dependencies..."
cd /var/www/mymeds-backend
npm ci --only=production

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Set up MySQL
echo "🗄️ Setting up MySQL..."
sudo mysql_secure_installation

# Create database and user
echo "🗄️ Creating database..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY '$(openssl rand -base64 32)';"
sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Set up Nginx configuration
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/mymeds-backend > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your actual domain

    location / {
        proxy_pass http://localhost:4000;
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
sudo ln -sf /etc/nginx/sites-available/mymeds-backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Set up PM2 ecosystem
echo "⚡ Setting up PM2..."
tee ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'index.js',
    cwd: '/var/www/mymeds-backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/mymeds-backend-error.log',
    out_file: '/var/log/pm2/mymeds-backend-out.log',
    log_file: '/var/log/pm2/mymeds-backend-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Set up firewall
echo "🛡️ Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4000
sudo ufw --force enable

# Set up SSL certificate (if domain is configured)
echo "🔒 Setting up SSL certificate..."
# sudo certbot --nginx -d your-domain.com  # Uncomment and replace with your domain

# Set up monitoring
echo "📊 Setting up monitoring..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Create health check script
echo "💚 Creating health check script..."
tee health-check.sh > /dev/null <<EOF
#!/bin/bash
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
    exit 0
else
    echo "❌ Backend is unhealthy"
    exit 1
fi
EOF

chmod +x health-check.sh

# Set up cron job for health checks
echo "⏰ Setting up health check cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /var/www/mymeds-backend/health-check.sh") | crontab -

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/mymeds-backend > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Set up backup script
echo "💾 Setting up backup script..."
tee backup.sh > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/mymeds"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

# Database backup
mysqldump -u mymeds_user -p mymeds_production > \$BACKUP_DIR/db_\$DATE.sql

# Application backup
tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz /var/www/mymeds-backend

# Cleanup old backups (keep last 7 days)
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF

chmod +x backup.sh

# Set up backup cron job
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/mymeds-backend/backup.sh") | crontab -

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update your domain in Nginx configuration"
echo "2. Run: sudo certbot --nginx -d your-domain.com"
echo "3. Test the application: curl http://localhost:4000/api/health"
echo "4. Monitor with: pm2 monit"
echo "5. Check logs: pm2 logs"
echo ""
echo "🔗 Useful commands:"
echo "- Restart: pm2 restart mymeds-backend"
echo "- Status: pm2 status"
echo "- Monitor: pm2 monit"
echo "- Logs: pm2 logs"
echo "- Health: ./health-check.sh"
