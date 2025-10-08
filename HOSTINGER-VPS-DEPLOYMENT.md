# 🚀 MyMeds Pharmacy - Hostinger VPS Deployment Guide

## 📋 **Your VPS Details**

- **Provider**: Hostinger
- **Server**: srv983203.hstgr.cloud
- **IP Address**: 72.60.116.253
- **OS**: Ubuntu 24.04 LTS
- **SSH Username**: root
- **Specs**: 1 CPU, 4GB RAM, 50GB Disk
- **Location**: United States - Boston

---

## 🎯 **Deployment Plan**

### **Step 1: Connect to Your VPS**
```bash
ssh root@72.60.116.253
```

### **Step 2: Install Required Software**
- Node.js (v18+)
- MySQL
- Nginx
- PM2 (Process Manager)
- Git

### **Step 3: Set Up Database**
- Install MySQL
- Create database and user
- Configure security

### **Step 4: Deploy Application**
- Upload your code
- Install dependencies
- Build for production
- Configure PM2

### **Step 5: Configure Nginx**
- Set up reverse proxy
- Configure SSL
- Set up static file serving

---

## 🛠️ **Step-by-Step Deployment**

### **Step 1: Connect to VPS**

```bash
# Connect to your VPS
ssh root@72.60.116.253

# Update system
apt update && apt upgrade -y
```

### **Step 2: Install Node.js**

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### **Step 3: Install MySQL**

```bash
# Install MySQL
apt install mysql-server -y

# Secure MySQL installation
mysql_secure_installation

# Start and enable MySQL
systemctl start mysql
systemctl enable mysql
```

### **Step 4: Create Database**

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE mymeds_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **Step 5: Install Nginx**

```bash
# Install Nginx
apt install nginx -y

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### **Step 6: Install PM2**

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

### **Step 7: Upload Your Code**

**Option A: Using Git (Recommended)**
```bash
# Install Git
apt install git -y

# Clone your repository
cd /var/www
git clone https://github.com/yourusername/mymeds-brooklyn-care-1-6.git
cd mymeds-brooklyn-care-1-6
```

**Option B: Using SCP (Alternative)**
```bash
# From your local machine
scp -r ./mymeds-brooklyn-care-1-6 root@72.60.116.253:/var/www/
```

### **Step 8: Set Up Backend**

```bash
cd /var/www/mymeds-brooklyn-care-1-6/backend

# Install dependencies
npm ci --production

# Create production environment file
nano .env.production
```

**Add this content to `.env.production`:**
```env
NODE_ENV=production
PORT=4000

# Database (replace with your actual password)
DATABASE_URL="mysql://mymeds_user:YourStrongPassword123!@localhost:3306/mymeds_pharmacy"
DB_MAX_CONNECTIONS=20
DB_CONNECTION_TIMEOUT=30000

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-min-32-characters-long-123456789"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_AUTH=100
RATE_LIMIT_CONTACT=200
RATE_LIMIT_GENERAL=10000

# CORS (replace with your domain)
CORS_ORIGIN=https://yourdomain.com

# Email (SMTP) - Configure with your email provider
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=MyMeds Pharmacy <noreply@yourdomain.com>

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_INITIAL_PASSWORD=ChangeMeImmediately123!

# Security
SECURE_COOKIES=true
SESSION_SECRET=your-session-secret-min-32-chars-long-123456789

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

### **Step 9: Set Up Database Schema**

```bash
cd /var/www/mymeds-brooklyn-care-1-6/backend

# Set environment variables
export NODE_ENV=production
export DATABASE_URL="mysql://mymeds_user:YourStrongPassword123!@localhost:3306/mymeds_pharmacy"

# Run Prisma migrations (use production schema)
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=./prisma/schema.prisma

# Build the application
npm run build
```

### **Step 10: Start Backend with PM2**

```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

**Add this content:**
```javascript
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

```bash
# Start the application
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# Follow the instructions it gives you

# Check status
pm2 status
pm2 logs mymeds-backend
```

### **Step 11: Set Up Frontend**

```bash
cd /var/www/mymeds-brooklyn-care-1-6

# Install dependencies
npm ci

# Create production environment file
nano .env.production
```

**Add this content to `.env.production`:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com/api
VITE_WORDPRESS_URL=https://yourblog.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

```bash
# Build for production
npm run build

# The built files will be in the dist/ directory
```

### **Step 12: Configure Nginx**

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/mymeds
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /var/www/mymeds-brooklyn-care-1-6/dist;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend routes (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support for Socket.IO
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security - deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)$ {
        deny all;
    }
}
```

```bash
# Enable the site
ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### **Step 13: Set Up SSL Certificate**

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace with your domain)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

### **Step 14: Configure Firewall**

```bash
# Install UFW
apt install ufw -y

# Allow SSH, HTTP, HTTPS
ufw allow ssh
ufw allow 'Nginx Full'

# Enable firewall
ufw --force enable

# Check status
ufw status
```

---

## ✅ **Post-Deployment Checklist**

### **1. Verify Backend**
```bash
# Check if backend is running
pm2 status

# Test health endpoint
curl http://localhost:4000/api/health

# Check logs
pm2 logs mymeds-backend
```

### **2. Verify Frontend**
- Visit https://yourdomain.com
- Check all pages load correctly
- Test API calls work
- Verify forms submit properly

### **3. Admin Panel Setup**
1. Go to https://yourdomain.com/admin
2. Login with initial credentials
3. **IMMEDIATELY change password**
4. Configure integrations

### **4. Set Up Monitoring**

```bash
# Install PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Set up log monitoring
pm2 logs --lines 100
```

---

## 🔧 **Maintenance Commands**

### **Update Application**
```bash
cd /var/www/mymeds-brooklyn-care-1-6

# Pull latest changes
git pull origin main

# Backend
cd backend
npm ci --production
npm run build
pm2 restart mymeds-backend

# Frontend
cd ..
npm ci
npm run build
# Nginx will serve new files automatically
```

### **Database Backup**
```bash
# Create backup script
nano /usr/local/bin/backup-mymeds-db

# Add:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u mymeds_user -p mymeds_pharmacy > /var/backups/mymeds_$DATE.sql
find /var/backups -name "mymeds_*.sql" -mtime +7 -delete

# Make executable
chmod +x /usr/local/bin/backup-mymeds-db

# Add to cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-mymeds-db
```

---

## 🐛 **Troubleshooting**

### **Backend Issues**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs mymeds-backend

# Restart if needed
pm2 restart mymeds-backend

# Check if port 4000 is in use
netstat -tlnp | grep :4000
```

### **Frontend Issues**
```bash
# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### **Database Issues**
```bash
# Test database connection
mysql -u mymeds_user -p mymeds_pharmacy

# Check MySQL status
systemctl status mysql

# View MySQL logs
tail -f /var/log/mysql/error.log
```

---

## 📊 **Performance Optimization**

### **For Your 4GB RAM VPS:**

1. **PM2 Configuration**
   - Single instance (not cluster mode)
   - Memory restart at 500MB
   - Proper restart delays

2. **Nginx Optimization**
   - Gzip compression enabled
   - Static file caching
   - Proper proxy settings

3. **Database Optimization**
   - Connection pooling (20 max connections)
   - Proper indexing
   - Regular backups

---

## 🎉 **Deployment Complete!**

Your MyMeds Pharmacy application should now be running on:
- **Frontend**: https://yourdomain.com
- **Backend**: https://yourdomain.com/api
- **Admin**: https://yourdomain.com/admin

**Next Steps:**
1. Configure your domain DNS to point to 72.60.116.253
2. Set up SSL certificate with your actual domain
3. Configure admin panel
4. Set up monitoring and backups

---

**Your Hostinger VPS is ready for production! 🚀**
