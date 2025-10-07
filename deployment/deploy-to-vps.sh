#!/bin/bash

# MyMeds Pharmacy VPS Deployment Script
# This script deploys the application to the VPS with proper domain configuration

set -e

echo "🚀 Starting MyMeds Pharmacy VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_USER="root"
VPS_HOST="your-vps-ip"
APP_DIR="/var/www/mymeds-pharmacy"
WORDPRESS_DIR="/var/www/wordpress"
BACKUP_DIR="/var/backups/mymeds-pharmacy"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "VPS Host: $VPS_HOST"
echo "App Directory: $APP_DIR"
echo "WordPress Directory: $WORDPRESS_DIR"
echo ""

# Function to run commands on VPS
run_on_vps() {
    echo -e "${YELLOW}🔧 Running on VPS: $1${NC}"
    ssh $VPS_USER@$VPS_HOST "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    echo -e "${YELLOW}📁 Copying to VPS: $1 -> $2${NC}"
    scp -r "$1" $VPS_USER@$VPS_HOST:"$2"
}

echo -e "${GREEN}✅ Step 1: Preparing VPS environment...${NC}"

# Create directories on VPS
run_on_vps "mkdir -p $APP_DIR $WORDPRESS_DIR $BACKUP_DIR /var/www/mymeds-pharmacy/logs"

# Install required packages
run_on_vps "apt update && apt install -y nginx php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip mysql-server nodejs npm pm2 certbot python3-certbot-nginx"

echo -e "${GREEN}✅ Step 2: Building and deploying frontend...${NC}"

# Build frontend locally
echo "Building React frontend..."
npm run build

# Copy built frontend to VPS
copy_to_vps "dist/" "$APP_DIR/dist/"

echo -e "${GREEN}✅ Step 3: Deploying backend...${NC}"

# Copy backend to VPS
copy_to_vps "backend/" "$APP_DIR/backend/"

# Install backend dependencies on VPS
run_on_vps "cd $APP_DIR/backend && npm install --production"

# Build backend on VPS
run_on_vps "cd $APP_DIR/backend && npm run build"

echo -e "${GREEN}✅ Step 4: Configuring Nginx...${NC}"

# Copy Nginx configuration
copy_to_vps "deployment/nginx.conf" "/etc/nginx/sites-available/mymeds-pharmacy"

# Enable site
run_on_vps "ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/"

# Remove default site
run_on_vps "rm -f /etc/nginx/sites-enabled/default"

# Test Nginx configuration
run_on_vps "nginx -t"

echo -e "${GREEN}✅ Step 5: Setting up WordPress/WooCommerce...${NC}"

# Download and setup WordPress
run_on_vps "cd /tmp && wget https://wordpress.org/latest.tar.gz && tar -xzf latest.tar.gz"
run_on_vps "cp -r /tmp/wordpress/* $WORDPRESS_DIR/"
run_on_vps "chown -R www-data:www-data $WORDPRESS_DIR"
run_on_vps "chmod -R 755 $WORDPRESS_DIR"

# Create WordPress config
run_on_vps "cp $WORDPRESS_DIR/wp-config-sample.php $WORDPRESS_DIR/wp-config.php"

echo -e "${GREEN}✅ Step 6: Configuring PM2...${NC}"

# Copy PM2 configuration
copy_to_vps "deployment/ecosystem.config.js" "$APP_DIR/ecosystem.config.js"

# Start application with PM2
run_on_vps "cd $APP_DIR && pm2 start ecosystem.config.js --env production"

# Save PM2 configuration
run_on_vps "pm2 save"
run_on_vps "pm2 startup"

echo -e "${GREEN}✅ Step 7: Setting up SSL certificate...${NC}"

# Get SSL certificate
run_on_vps "certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com"

echo -e "${GREEN}✅ Step 8: Starting services...${NC}"

# Restart services
run_on_vps "systemctl restart nginx"
run_on_vps "systemctl restart php8.1-fpm"
run_on_vps "systemctl restart mysql"

# Enable services
run_on_vps "systemctl enable nginx"
run_on_vps "systemctl enable php8.1-fpm"
run_on_vps "systemctl enable mysql"

echo -e "${GREEN}✅ Step 9: Final configuration...${NC}"

# Set proper permissions
run_on_vps "chown -R www-data:www-data $APP_DIR"
run_on_vps "chmod -R 755 $APP_DIR"

# Create uploads directory
run_on_vps "mkdir -p $APP_DIR/uploads && chown -R www-data:www-data $APP_DIR/uploads"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Configure your domain DNS to point to the VPS IP"
echo "2. Set up environment variables in $APP_DIR/backend/.env"
echo "3. Configure MySQL database for WordPress"
echo "4. Complete WordPress setup at https://mymedspharmacyinc.com/shop/wp-admin/install.php"
echo "5. Install and configure WooCommerce plugin"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "Main App: https://mymedspharmacyinc.com"
echo "WooCommerce Store: https://mymedspharmacyinc.com/shop"
echo "WordPress Admin: https://mymedspharmacyinc.com/shop/wp-admin"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "Check app status: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
echo "View logs: ssh $VPS_USER@$VPS_HOST 'pm2 logs mymeds-backend'"
echo "Restart app: ssh $VPS_USER@$VPS_HOST 'pm2 restart mymeds-backend'"
echo "Check Nginx: ssh $VPS_USER@$VPS_HOST 'systemctl status nginx'"
