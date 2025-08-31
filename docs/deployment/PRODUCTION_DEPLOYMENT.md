# 🚀 Production Deployment Guide

## 🎯 **Complete Production Deployment for MyMeds Pharmacy**

This guide covers everything needed to deploy MyMeds Pharmacy to production, including server setup, SSL configuration, monitoring, and maintenance.

---

## 📋 **Pre-Deployment Checklist**

### **✅ System Requirements**
- [ ] **Server**: VPS with minimum 2GB RAM, 2 CPU cores
- [ ] **Domain**: Registered domain with DNS access
- [ ] **SSL Certificate**: Let's Encrypt or commercial certificate
- [ ] **Database**: MySQL 8.0+ or PostgreSQL 13+
- [ ] **Node.js**: Version 18+ installed
- [ ] **PM2**: Process manager installed
- [ ] **Nginx**: Web server installed

### **✅ Code Preparation**
- [ ] **Environment Variables**: Production `.env` configured
- [ ] **Database Migrations**: All migrations tested locally
- [ ] **Build Process**: `npm run build` successful
- [ ] **Tests**: All tests passing
- [ ] **Security Audit**: Dependencies updated, vulnerabilities fixed
- [ ] **Performance**: Lighthouse score > 90

### **✅ Infrastructure Setup**
- [ ] **Server Security**: Firewall configured, SSH keys set up
- [ ] **Database**: Production database created and secured
- [ ] **Backup Strategy**: Automated backups configured
- [ ] **Monitoring**: Health checks and alerting set up
- [ ] **SSL/TLS**: HTTPS certificates installed
- [ ] **CDN**: Content delivery network configured (optional)

---

## 🏗️ **Server Setup**

### **1. Initial Server Configuration**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git nginx mysql-server ufw fail2ban

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PM2 startup script
pm2 startup
```

### **2. Security Configuration**
```bash
# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 4000
sudo ufw enable

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Secure SSH (edit /etc/ssh/sshd_config)
# - Disable root login
# - Change default port (optional)
# - Use key-based authentication
sudo systemctl restart ssh
```

### **3. Database Setup**
```bash
# MySQL setup
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
CREATE DATABASE mymeds_production;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔧 **Application Deployment**

### **1. Clone and Setup**
```bash
# Create application directory
sudo mkdir -p /var/www/mymeds
sudo chown $USER:$USER /var/www/mymeds

# Clone repository
cd /var/www/mymeds
git clone https://github.com/yourusername/mymeds-brooklyn-care-1.git .

# Install dependencies
npm install
cd backend && npm install
```

### **2. Environment Configuration**
```bash
# Create production environment file
cd backend
cat > .env << EOF
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=mysql://mymeds_user:StrongPassword123!@localhost:3306/mymeds_production

# Security
JWT_SECRET=your-super-secure-jwt-secret-here-change-this-in-production-minimum-32-chars
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-here-change-this-in-production-minimum-32-chars

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=SecureAdmin123!
ADMIN_NAME=Production Administrator

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# WooCommerce
WOOCOMMERCE_URL=https://yourdomain.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# WordPress
WORDPRESS_URL=https://yourdomain.com
WORDPRESS_APPLICATION_PASSWORD=your_app_password

# Monitoring
ENABLE_MONITORING=true
LOG_LEVEL=info
EOF
```

### **3. Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (if needed)
npx prisma db seed
```

### **4. Build and Start**
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
pm2 logs mymeds-backend
```

---

## 🌐 **Nginx Configuration**

### **1. Create Nginx Site Configuration**
```bash
sudo nano /etc/nginx/sites-available/mymeds
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Frontend (React)
    location / {
        root /var/www/mymeds/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
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
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:4000/api/health;
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

### **2. Enable Site and Test**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔐 **SSL Certificate Setup**

### **1. Install Certbot**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### **2. Auto-renewal Setup**
```bash
# Create renewal script
sudo nano /etc/cron.daily/ssl-renewal

#!/bin/bash
certbot renew --quiet --nginx
```

```bash
# Make executable
sudo chmod +x /etc/cron.daily/ssl-renewal
```

---

## 📊 **Monitoring and Health Checks**

### **1. PM2 Monitoring**
```bash
# Enable PM2 monitoring
pm2 install pm2-server-monit

# Monitor application
pm2 monit

# View logs
pm2 logs mymeds-backend --lines 100
```

### **2. Health Check Endpoint**
```bash
# Test health endpoint
curl https://yourdomain.com/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-12-01T10:00:00Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

### **3. System Monitoring**
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

---

## 💾 **Backup Strategy**

### **1. Database Backup**
```bash
# Create backup script
sudo nano /usr/local/bin/backup-database

#!/bin/bash
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mymeds_production"

mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u mymeds_user -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: db_$DATE.sql.gz"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-database

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-database
```

### **2. Application Backup**
```bash
# Create application backup script
sudo nano /usr/local/bin/backup-application

#!/bin/bash
BACKUP_DIR="/var/backups/mymeds"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/mymeds"

mkdir -p $BACKUP_DIR

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: app_$DATE.tar.gz"
```

---

## 🔄 **Deployment Automation**

### **1. Deployment Script**
```bash
# Create deployment script
sudo nano /usr/local/bin/deploy-mymeds

#!/bin/bash
set -e

echo "🚀 Starting MyMeds deployment..."

# Navigate to application directory
cd /var/www/mymeds

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd backend && npm install

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build application
echo "🔨 Building application..."
npm run build

# Reload PM2
echo "🔄 Reloading PM2..."
pm2 reload ecosystem.config.js --env production

# Clear Nginx cache
echo "🧹 Clearing Nginx cache..."
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "🌐 Application available at: https://yourdomain.com"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/deploy-mymeds
```

### **2. GitHub Actions (Optional)**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.KEY }}
          script: |
            /usr/local/bin/deploy-mymeds
```

---

## 🧪 **Post-Deployment Testing**

### **1. Functionality Tests**
```bash
# Test API endpoints
curl -X GET https://yourdomain.com/api/health
curl -X POST https://yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourdomain.com","password":"SecureAdmin123!"}'

# Test frontend
curl -I https://yourdomain.com
```

### **2. Performance Tests**
```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Load test API
ab -n 1000 -c 10 https://yourdomain.com/api/health

# Load test frontend
ab -n 1000 -c 10 https://yourdomain.com/
```

### **3. Security Tests**
```bash
# Test SSL configuration
curl -I https://yourdomain.com

# Test security headers
curl -I https://yourdomain.com | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection|Strict-Transport-Security)"
```

---

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. Application Won't Start**
```bash
# Check PM2 logs
pm2 logs mymeds-backend

# Check environment variables
cd /var/www/mymeds/backend
cat .env

# Check database connection
npx prisma db push --preview-feature
```

#### **2. Nginx Errors**
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx status
sudo systemctl status nginx
```

#### **3. Database Connection Issues**
```bash
# Test database connection
mysql -u mymeds_user -p -h localhost mymeds_production

# Check MySQL status
sudo systemctl status mysql

# Check MySQL logs
sudo tail -f /var/log/mysql/error.log
```

---

## 📚 **Additional Resources**

- **[VPS Deployment Guide](VPS_DEPLOYMENT.md)** - Detailed VPS setup
- **[SSL Setup Guide](SSL_SETUP.md)** - SSL configuration details
- **[Monitoring Guide](MONITORING.md)** - System monitoring setup
- **[Backup Guide](BACKUP.md)** - Backup strategy implementation

---

## 🆘 **Need Help?**

- **Deployment Issues**: Check troubleshooting section
- **Configuration Problems**: Review environment variables
- **Performance Issues**: Check monitoring and logs
- **Security Concerns**: Review security configuration

---

**🚀 Deployment Version**: 2.0.0  
**🔧 Last Updated**: December 2024  
**👥 Maintained By**: MyMeds DevOps Team
