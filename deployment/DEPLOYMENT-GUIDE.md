# MyMeds Pharmacy VPS Deployment Guide

This guide will help you deploy the MyMeds Pharmacy application to your VPS with the main domain serving the React app and `/shop` serving the WooCommerce store.

## 🎯 Domain Structure

- **Main Domain**: `https://mymedspharmacyinc.com` → React Application
- **WooCommerce Store**: `https://mymedspharmacyinc.com/shop` → WordPress/WooCommerce
- **API Endpoints**: `https://mymedspharmacyinc.com/api/*` → Node.js Backend

## 📋 Prerequisites

1. **VPS Requirements**:
   - Ubuntu 20.04+ or CentOS 8+
   - Minimum 2GB RAM, 2 CPU cores
   - 20GB+ storage space
   - Root access or sudo privileges

2. **Domain Setup**:
   - Domain `mymedspharmacyinc.com` pointing to VPS IP
   - DNS A record configured

3. **Required Software**:
   - Node.js 18+
   - MySQL 8.0+
   - Nginx
   - PHP 8.1+
   - PM2

## 🚀 Deployment Steps

### Step 1: Prepare VPS Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-curl \
    php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip nodejs npm pm2 \
    certbot python3-certbot-nginx unzip curl wget

# Start and enable services
sudo systemctl start nginx mysql php8.1-fpm
sudo systemctl enable nginx mysql php8.1-fpm
```

### Step 2: Configure MySQL Database

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create databases
sudo mysql -u root -p << EOF
CREATE DATABASE mymeds_production;
CREATE DATABASE mymeds_wordpress;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'secure_password';
CREATE USER 'mymeds_wordpress_user'@'localhost' IDENTIFIED BY 'secure_wordpress_password';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
GRANT ALL PRIVILEGES ON mymeds_wordpress.* TO 'mymeds_wordpress_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

### Step 3: Deploy Application Files

```bash
# Create application directories
sudo mkdir -p /var/www/mymeds-pharmacy/{backend,dist,uploads,logs}
sudo mkdir -p /var/www/wordpress
sudo mkdir -p /var/backups/mymeds-pharmacy

# Set proper permissions
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/
```

### Step 4: Build and Deploy Frontend

```bash
# On your local machine, build the React app
npm run build

# Copy built files to VPS
scp -r dist/ root@your-vps-ip:/var/www/mymeds-pharmacy/dist/
```

### Step 5: Deploy Backend

```bash
# Copy backend files
scp -r backend/ root@your-vps-ip:/var/www/mymeds-pharmacy/backend/

# On VPS, install dependencies and build
ssh root@your-vps-ip
cd /var/www/mymeds-pharmacy/backend
npm install --production
npm run build
```

### Step 6: Configure Environment Variables

```bash
# Copy production environment file
scp deployment/env.production.example root@your-vps-ip:/var/www/mymeds-pharmacy/backend/.env

# Edit environment variables
ssh root@your-vps-ip
nano /var/www/mymeds-pharmacy/backend/.env
```

Update the following critical variables:
- `DATABASE_URL`: Your MySQL connection string
- `WOOCOMMERCE_CONSUMER_KEY`: Your WooCommerce API consumer key
- `WOOCOMMERCE_CONSUMER_SECRET`: Your WooCommerce API consumer secret
- `EMAIL_PASS`: Your email password for notifications

### Step 7: Setup WordPress/WooCommerce

```bash
# Download and setup WordPress
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
sudo cp -r wordpress/* /var/www/wordpress/

# Copy WordPress configuration
sudo cp deployment/wordpress-config.php /var/www/wordpress/wp-config.php

# Set permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress
```

### Step 8: Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/mymeds-pharmacy

# Enable site
sudo ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 9: Setup PM2 for Backend

```bash
# Copy PM2 configuration
sudo cp deployment/ecosystem.config.js /var/www/mymeds-pharmacy/

# Start application
cd /var/www/mymeds-pharmacy
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

### Step 10: Setup SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com \
    --non-interactive --agree-tos --email admin@mymedspharmacyinc.com
```

### Step 11: Initialize Database

```bash
# Run Prisma migrations
cd /var/www/mymeds-pharmacy/backend
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Step 12: Complete WordPress Setup

1. Visit `https://mymedspharmacyinc.com/shop/wp-admin/install.php`
2. Complete WordPress installation
3. Install WooCommerce plugin
4. Configure WooCommerce settings
5. Set up WooCommerce API credentials

## 🔧 Configuration Details

### Nginx Configuration

The Nginx configuration handles:
- **Main app**: Serves React app from root domain
- **API**: Proxies `/api/*` to Node.js backend
- **WooCommerce**: Serves WordPress from `/shop` subdirectory
- **Static files**: Optimized caching for assets
- **Security**: Rate limiting, security headers

### Domain Routing

```
mymedspharmacyinc.com/           → React App (Frontend)
mymedspharmacyinc.com/api/*      → Node.js Backend
mymedspharmacyinc.com/shop/*     → WordPress/WooCommerce
mymedspharmacyinc.com/uploads/*  → File uploads
```

### Environment Variables

Critical production variables:
- `NODE_ENV=production`
- `DATABASE_URL=mysql://...`
- `JWT_SECRET=...` (32+ characters)
- `WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop`
- `ADMIN_EMAIL=mymedspharmacy@outlook.com`

## 🧪 Testing Deployment

### 1. Test Main Application
```bash
curl -I https://mymedspharmacyinc.com
# Should return 200 OK
```

### 2. Test API Endpoints
```bash
curl -I https://mymedspharmacyinc.com/api/health
# Should return 200 OK
```

### 3. Test WooCommerce Store
```bash
curl -I https://mymedspharmacyinc.com/shop
# Should return 200 OK
```

### 4. Test Admin Panel
- Visit `https://mymedspharmacyinc.com/admin`
- Login with admin credentials
- Verify all functionality works

## 🔍 Monitoring and Maintenance

### PM2 Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs mymeds-backend

# Restart application
pm2 restart mymeds-backend

# Monitor resources
pm2 monit
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### Database Maintenance
```bash
# Backup database
mysqldump -u mymeds_user -p mymeds_production > backup.sql

# Restore database
mysql -u mymeds_user -p mymeds_production < backup.sql
```

## 🚨 Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend is running: `pm2 status`
   - Check backend logs: `pm2 logs mymeds-backend`
   - Verify port 4000 is not blocked

2. **WordPress 404 Errors**
   - Check Nginx configuration: `sudo nginx -t`
   - Verify WordPress files are in correct location
   - Check file permissions

3. **Database Connection Issues**
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check database credentials in `.env`
   - Test database connection

4. **SSL Certificate Issues**
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

### Log Locations
- **Application logs**: `/var/www/mymeds-pharmacy/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **PM2 logs**: `~/.pm2/logs/`
- **WordPress logs**: `/var/www/wordpress/wp-content/debug.log`

## 🔄 Updates and Maintenance

### Deploying Updates
1. Build new version locally
2. Copy files to VPS
3. Run `npm install --production` in backend
4. Run `npm run build` in backend
5. Restart with `pm2 restart mymeds-backend`

### Automated Backups
Set up cron jobs for:
- Database backups
- File uploads backup
- Application configuration backup

### Security Updates
- Regularly update system packages
- Monitor security logs
- Keep WordPress and plugins updated
- Review and rotate API keys

## 📞 Support

For deployment issues:
1. Check logs in `/var/www/mymeds-pharmacy/logs/`
2. Verify all services are running
3. Test individual components
4. Review this guide for missed steps

---

**Deployment completed successfully!** 🎉

Your MyMeds Pharmacy application is now live at:
- **Main App**: https://mymedspharmacyinc.com
- **WooCommerce Store**: https://mymedspharmacyinc.com/shop
- **Admin Panel**: https://mymedspharmacyinc.com/admin
