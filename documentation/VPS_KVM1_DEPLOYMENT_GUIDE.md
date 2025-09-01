# 🚀 VPS KVM1 Deployment Guide
## MyMeds Pharmacy Production Deployment

**Target:** Hostinger VPS KVM1  
**Application:** MyMeds Pharmacy (Frontend + Backend + Database)  
**Estimated Time:** 2-3 hours  
**Difficulty:** Intermediate

---

## 🎯 **PRE-DEPLOYMENT CHECKLIST**

### **Prerequisites**
- [ ] VPS KVM1 access (SSH)
- [ ] Domain names configured
- [ ] SSL certificates ready
- [ ] SMTP credentials configured
- [ ] Database credentials prepared
- [ ] Environment variables documented

### **Required Information**
```bash
# VPS Details
VPS_IP=your-vps-ip-address
VPS_USERNAME=root
SSH_KEY_PATH=~/.ssh/your-private-key

# Domain Configuration
FRONTEND_DOMAIN=www.mymedspharmacyinc.com
BACKEND_DOMAIN=api.mymedspharmacyinc.com
STAGING_DOMAIN=staging.mymedspharmacyinc.com

# Database
DB_NAME=mymeds_production
DB_USER=mymeds_user
DB_PASSWORD=your-secure-password

# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
```

---

## 🔧 **PHASE 1: VPS INITIAL SETUP**

### **Step 1: Connect to VPS**
```bash
# Connect to your VPS
ssh -i ~/.ssh/your-private-key root@your-vps-ip

# Update system
apt update && apt upgrade -y
apt install -y curl wget git unzip software-properties-common
```

### **Step 2: Install Required Software**
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install MySQL 8.0
apt install -y mysql-server mysql-client

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install UFW firewall
apt install -y ufw
```

### **Step 3: Configure Firewall**
```bash
# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000
ufw allow 3001
ufw enable
ufw status
```

---

## 🗄️ **PHASE 2: DATABASE SETUP**

### **Step 1: Secure MySQL Installation**
```bash
# Secure MySQL installation
mysql_secure_installation

# Answer the following:
# - Set root password: YES
# - Remove anonymous users: YES
# - Disallow root login remotely: YES
# - Remove test database: YES
# - Reload privilege tables: YES
```

### **Step 2: Create Database and User**
```bash
# Access MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE mymeds_production;
CREATE DATABASE mymeds_staging;

CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
GRANT ALL PRIVILEGES ON mymeds_staging.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

### **Step 3: Test Database Connection**
```bash
# Test connection
mysql -u mymeds_user -p mymeds_production

# Should connect successfully
# Exit
EXIT;
```

---

## 🌐 **PHASE 3: NGINX CONFIGURATION**

### **Step 1: Create Nginx Configuration Files**
```bash
# Create main configuration
nano /etc/nginx/sites-available/mymeds-production
```

**Production Configuration:**
```nginx
server {
    listen 80;
    server_name www.mymedspharmacyinc.com mymedspharmacyinc.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.mymedspharmacyinc.com mymedspharmacyinc.com;
    
    # SSL Configuration (will be added by Certbot)
    
    # Frontend
    location / {
        root /var/www/html/production;
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
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### **Step 2: Create Staging Configuration**
```bash
# Create staging configuration
nano /etc/nginx/sites-available/mymeds-staging
```

**Staging Configuration:**
```nginx
server {
    listen 80;
    server_name staging.mymedspharmacyinc.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging.mymedspharmacyinc.com;
    
    # SSL Configuration (will be added by Certbot)
    
    # Frontend
    location / {
        root /var/www/html/staging;
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
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
```

### **Step 3: Enable Sites and Test Configuration**
```bash
# Enable sites
ln -s /etc/nginx/sites-available/mymeds-production /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/mymeds-staging /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# If successful, reload Nginx
systemctl reload nginx
```

---

## 🔐 **PHASE 4: SSL CERTIFICATE SETUP**

### **Step 1: Obtain SSL Certificates**
```bash
# Get SSL certificates for production
certbot --nginx -d www.mymedspharmacyinc.com -d mymedspharmacyinc.com

# Get SSL certificates for staging
certbot --nginx -d staging.mymedspharmacyinc.com

# Test auto-renewal
certbot renew --dry-run
```

### **Step 2: Verify SSL Configuration**
```bash
# Check SSL status
certbot certificates

# Test SSL configuration
curl -I https://www.mymedspharmacyinc.com
curl -I https://staging.mymedspharmacyinc.com
```

---

## 📁 **PHASE 5: APPLICATION DEPLOYMENT**

### **Step 1: Create Application Directories**
```bash
# Create application directories
mkdir -p /var/www/mymeds-production
mkdir -p /var/www/mymeds-staging
mkdir -p /var/www/html/production
mkdir -p /var/www/html/staging
mkdir -p /var/log/mymeds
mkdir -p /var/log/mymeds/uploads

# Set permissions
chown -R www-data:www-data /var/www/mymeds-production
chown -R www-data:www-data /var/www/mymeds-staging
chown -R www-data:www-data /var/www/html
chown -R www-data:www-data /var/log/mymeds
```

### **Step 2: Clone Application Code**
```bash
# Clone production code
cd /var/www/mymeds-production
git clone https://github.com/your-username/mymeds-brooklyn-care.git .
git checkout main

# Clone staging code
cd /var/www/mymeds-staging
git clone https://github.com/your-username/mymeds-brooklyn-care.git .
git checkout develop
```

### **Step 3: Configure Environment Variables**

**Production Environment:**
```bash
# Create production .env file
nano /var/www/mymeds-production/.env
```

```env
# Production Environment
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="mysql://mymeds_user:your-secure-password@localhost:3306/mymeds_production"
DIRECT_URL="mysql://mymeds_user:your-secure-password@localhost:3306/mymeds_production"

# JWT Secrets
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_REFRESH_SECRET="your-super-secure-jwt-refresh-secret-key-here"

# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Contact Configuration
CONTACT_RECEIVER=admin@mymedspharmacyinc.com
ADMIN_EMAIL=admin@mymedspharmacyinc.com

# URLs
FRONTEND_URL="https://www.mymedspharmacyinc.com"
BACKEND_URL="https://api.mymedspharmacyinc.com"

# Admin User
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Admin User

# File Upload
UPLOAD_DIR=/var/log/mymeds/uploads
MAX_FILE_SIZE=5242880

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

**Staging Environment:**
```bash
# Create staging .env file
nano /var/www/mymeds-staging/.env
```

```env
# Staging Environment
NODE_ENV=staging
PORT=3001

# Database
DATABASE_URL="mysql://mymeds_user:your-secure-password@localhost:3306/mymeds_staging"
DIRECT_URL="mysql://mymeds_user:your-secure-password@localhost:3306/mymeds_staging"

# JWT Secrets
JWT_SECRET="staging-jwt-secret-key-here"
JWT_REFRESH_SECRET="staging-jwt-refresh-secret-key-here"

# SMTP Configuration
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-app-password
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Contact Configuration
CONTACT_RECEIVER=admin@mymedspharmacyinc.com
ADMIN_EMAIL=admin@mymedspharmacyinc.com

# URLs
FRONTEND_URL="https://staging.mymedspharmacyinc.com"
BACKEND_URL="https://api-staging.mymedspharmacyinc.com"

# Admin User
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Admin User

# File Upload
UPLOAD_DIR=/var/log/mymeds/uploads
MAX_FILE_SIZE=5242880

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### **Step 4: Install Dependencies and Build**
```bash
# Production setup
cd /var/www/mymeds-production
npm ci --production
cd backend
npm ci --production
npx prisma generate
npx prisma db push
npm run build

# Staging setup
cd /var/www/mymeds-staging
npm ci --production
cd backend
npm ci --production
npx prisma generate
npx prisma db push
npm run build
```

### **Step 5: Build Frontend**
```bash
# Production frontend
cd /var/www/mymeds-production
npm run build
cp -r dist/* /var/www/html/production/

# Staging frontend
cd /var/www/mymeds-staging
npm run build
cp -r dist/* /var/www/html/staging/

# Set permissions
chown -R www-data:www-data /var/www/html/production
chown -R www-data:www-data /var/www/html/staging
```

---

## 🚀 **PHASE 6: PM2 PROCESS MANAGEMENT**

### **Step 1: Create PM2 Configuration**
```bash
# Create PM2 ecosystem file
nano /var/www/mymeds-production/ecosystem.config.js
```

**Production PM2 Config:**
```javascript
module.exports = {
  apps: [
    {
      name: 'mymeds-production',
      script: './backend/dist/index.js',
      cwd: '/var/www/mymeds-production',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/mymeds/production-error.log',
      out_file: '/var/log/mymeds/production-out.log',
      log_file: '/var/log/mymeds/production-combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
```

**Staging PM2 Config:**
```bash
nano /var/www/mymeds-staging/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'mymeds-staging',
      script: './backend/dist/index.js',
      cwd: '/var/www/mymeds-staging',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 3001
      },
      error_file: '/var/log/mymeds/staging-error.log',
      out_file: '/var/log/mymeds/staging-out.log',
      log_file: '/var/log/mymeds/staging-combined.log',
      time: true,
      max_memory_restart: '512M',
      restart_delay: 4000,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ]
};
```

### **Step 2: Start Applications with PM2**
```bash
# Start production
cd /var/www/mymeds-production
pm2 start ecosystem.config.js

# Start staging
cd /var/www/mymeds-staging
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

# Follow the instructions provided by PM2
```

---

## 🔍 **PHASE 7: TESTING & VERIFICATION**

### **Step 1: Test Backend APIs**
```bash
# Test production backend
curl -I http://localhost:3000/api/health
curl -I http://localhost:3000/api/health/db

# Test staging backend
curl -I http://localhost:3001/api/health
curl -I http://localhost:3001/api/health/db
```

### **Step 2: Test Frontend**
```bash
# Test production frontend
curl -I https://www.mymedspharmacyinc.com

# Test staging frontend
curl -I https://staging.mymedspharmacyinc.com
```

### **Step 3: Test SMTP Service**
```bash
# Run SMTP test on production
cd /var/www/mymeds-production
node test-smtp-service.cjs

# Run SMTP test on staging
cd /var/www/mymeds-staging
node test-smtp-service.cjs
```

---

## 📊 **PHASE 8: MONITORING & MAINTENANCE**

### **Step 1: Setup Log Rotation**
```bash
# Create logrotate configuration
nano /etc/logrotate.d/mymeds
```

**Logrotate Config:**
```
/var/log/mymeds/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### **Step 2: Setup Monitoring Scripts**
```bash
# Create health check script
nano /usr/local/bin/mymeds-health-check.sh
```

**Health Check Script:**
```bash
#!/bin/bash

# Check production backend
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "$(date): Production backend is down, restarting..." >> /var/log/mymeds/health-check.log
    pm2 restart mymeds-production
fi

# Check staging backend
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "$(date): Staging backend is down, restarting..." >> /var/log/mymeds/health-check.log
    pm2 restart mymeds-staging
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> /var/log/mymeds/health-check.log
fi
```

```bash
# Make script executable
chmod +x /usr/local/bin/mymeds-health-check.sh

# Add to crontab
crontab -e

# Add this line:
*/5 * * * * /usr/local/bin/mymeds-health-check.sh
```

### **Step 3: Setup Backup Scripts**
```bash
# Create backup script
nano /usr/local/bin/mymeds-backup.sh
```

**Backup Script:**
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup databases
mysqldump -u mymeds_user -p'your-secure-password' mymeds_production > $BACKUP_DIR/production_db_$DATE.sql
mysqldump -u mymeds_user -p'your-secure-password' mymeds_staging > $BACKUP_DIR/staging_db_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/log/mymeds/uploads

# Backup application code
tar -czf $BACKUP_DIR/production_code_$DATE.tar.gz /var/www/mymeds-production
tar -czf $BACKUP_DIR/staging_code_$DATE.tar.gz /var/www/mymeds-staging

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE" >> /var/log/mymeds/backup.log
```

```bash
# Make script executable
chmod +x /usr/local/bin/mymeds-backup.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /usr/local/bin/mymeds-backup.sh
```

---

## 🎯 **DEPLOYMENT VERIFICATION CHECKLIST**

### **Infrastructure**
- [ ] VPS accessible via SSH
- [ ] Firewall configured and active
- [ ] Node.js 18.x installed
- [ ] MySQL 8.0 running
- [ ] Nginx configured and running
- [ ] SSL certificates installed

### **Applications**
- [ ] Production backend running on port 3000
- [ ] Staging backend running on port 3001
- [ ] Production frontend accessible
- [ ] Staging frontend accessible
- [ ] PM2 managing processes
- [ ] PM2 startup script configured

### **Database**
- [ ] Production database created
- [ ] Staging database created
- [ ] Database user configured
- [ ] Prisma migrations applied
- [ ] Database connection working

### **Services**
- [ ] SMTP service configured
- [ ] Email sending working
- [ ] File uploads functional
- [ ] Health checks passing
- [ ] Monitoring scripts active

### **Security**
- [ ] SSL certificates valid
- [ ] Firewall rules active
- [ ] Database secured
- [ ] Environment variables set
- [ ] File permissions correct

---

## 🚨 **TROUBLESHOOTING COMMON ISSUES**

### **Backend Not Starting**
```bash
# Check logs
pm2 logs mymeds-production
pm2 logs mymeds-staging

# Check environment variables
cd /var/www/mymeds-production
cat .env

# Check database connection
mysql -u mymeds_user -p mymeds_production
```

### **Frontend Not Loading**
```bash
# Check Nginx configuration
nginx -t

# Check file permissions
ls -la /var/www/html/production/
ls -la /var/www/html/staging/

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### **Database Connection Issues**
```bash
# Check MySQL status
systemctl status mysql

# Check user permissions
mysql -u root -p
SHOW GRANTS FOR 'mymeds_user'@'localhost';

# Test connection
mysql -u mymeds_user -p mymeds_production
```

---

## 🎉 **DEPLOYMENT COMPLETE!**

Your MyMeds Pharmacy application is now successfully deployed on VPS KVM1 with:

✅ **Production Environment** - https://www.mymedspharmacyinc.com  
✅ **Staging Environment** - https://staging.mymedspharmacyinc.com  
✅ **Production API** - https://api.mymedspharmacyinc.com  
✅ **Staging API** - https://api-staging.mymedspharmacyinc.com  
✅ **Database** - MySQL with production and staging databases  
✅ **SSL Security** - HTTPS enabled for all domains  
✅ **Process Management** - PM2 with auto-restart  
✅ **Monitoring** - Health checks and automated backups  
✅ **File Uploads** - Secure file handling  
✅ **SMTP Service** - Email functionality working  

**Next Steps:**
1. Test all customer interactions
2. Verify prescription refill forms
3. Test file uploads
4. Confirm email notifications
5. Monitor application performance
6. Set up regular maintenance schedule

**Your pharmacy application is now live and ready to serve customers!** 🚀
