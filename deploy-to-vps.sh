#!/bin/bash

# 🚀 MyMeds Pharmacy VPS Deployment Script
# Run this on your Hostinger VPS KVM

set -e

echo "🚀 Starting MyMeds Pharmacy VPS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="YOUR_VPS_IP_HERE"
DOMAIN="mymedspharmacyinc.com"
DB_PASSWORD="YOUR_DB_PASSWORD_HERE"
JWT_SECRET="YOUR_JWT_SECRET_HERE"
JWT_REFRESH_SECRET="YOUR_JWT_REFRESH_SECRET_HERE"

echo -e "${YELLOW}⚠️  Please update the configuration variables at the top of this script before running!${NC}"
echo "VPS IP: $VPS_IP"
echo "Domain: $DOMAIN"
echo ""

read -p "Have you updated the configuration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update the configuration and run again."
    exit 1
fi

echo -e "${GREEN}✅ Starting deployment...${NC}"

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
apt install -y curl wget git nginx mysql-server mysql-client ufw fail2ban htop

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Install PM2
echo "🚀 Installing PM2..."
npm install -g pm2

# Create application directories
echo "📁 Creating application directories..."
mkdir -p /var/www/mymeds-production
mkdir -p /var/www/mymeds-staging
mkdir -p /var/www/html/production
mkdir -p /var/www/html/staging

# Setup MySQL
echo "🗄️ Setting up MySQL..."
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_production;"
mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_staging;"
mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';"
mysql -e "GRANT ALL PRIVILEGES ON mymeds_staging.* TO 'mymeds_user'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Setup Nginx
echo "🌐 Setting up Nginx..."
cat > /etc/nginx/sites-available/mymeds << 'EOF'
# Production Frontend
server {
    listen 80;
    server_name www.mymedspharmacyinc.com mymedspharmacyinc.com;
    root /var/www/html/production;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Staging Frontend
server {
    listen 80;
    server_name staging.mymedspharmacyinc.com;
    root /var/www/html/staging;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Setup firewall
echo "🔒 Setting up firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup fail2ban
echo "🛡️ Setting up fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

echo -e "${GREEN}✅ VPS setup completed!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Clone your repository: git clone https://github.com/YOUR_USERNAME/mymeds-brooklyn-care.git /var/www/mymeds-production"
echo "2. Setup environment variables"
echo "3. Install dependencies and build"
echo "4. Start with PM2"
echo ""
echo "🌐 Your VPS is ready for deployment!"
echo "IP: $VPS_IP"
echo "Domain: $DOMAIN"

