# 🚀 MyMeds Pharmacy - Deployment Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Deployment](#vps-deployment)
3. [Docker Deployment](#docker-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available space
- **CPU**: 2+ cores
- **Network**: Stable internet connection

### Software Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **MySQL**: 8.0 or higher
- **PM2**: For process management
- **Nginx**: For reverse proxy
- **Git**: For version control

### Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

## 🖥️ VPS Deployment

### 1. Server Setup

```bash
# Create application directory
sudo mkdir -p /var/www/mymeds
sudo chown $USER:$USER /var/www/mymeds

# Clone repository
cd /var/www/mymeds
git clone <your-repo-url> .

# Set up environment
cp frontend.env.production .env.local
cp backend/env.production backend/.env
```

### 2. Database Configuration

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
CREATE DATABASE mymeds_production;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'YourSecurePassword2024!';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build applications
cd ..
npm run build:prod
cd backend
npm run build
```

### 4. PM2 Configuration

```bash
# Start backend with PM2
cd /var/www/mymeds/backend
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 startup script
pm2 startup
```

### 5. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mymeds
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/mymeds/dist;
        try_files $uri $uri/ /index.html;
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
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 🐳 Docker Deployment

### 1. Docker Setup

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Environment Configuration

```bash
# Copy environment files
cp deployment/docker/docker.env .env
cp deployment/docker/docker-compose.prod.yml docker-compose.yml
```

### 3. Build and Deploy

```bash
# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## ⚙️ Environment Configuration

### Frontend Environment (`frontend.env.production`)
```env
# API Configuration
VITE_API_URL=https://your-domain.com/api
VITE_BACKEND_URL=https://your-domain.com/api

# External Services
VITE_WOOCOMMERCE_URL=https://your-store.com
VITE_WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_FACEBOOK_PIXEL_ID=your_pixel_id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PWA=true
```

### Backend Environment (`backend/env.production`)
```env
# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=mysql://mymeds_user:YourSecurePassword2024!@localhost:3306/mymeds_production

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WooCommerce Integration
WOOCOMMERCE_URL=https://your-store.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret

# Monitoring
NEW_RELIC_ENABLED=true
NEW_RELIC_APP_NAME=mymeds-backend
NEW_RELIC_LICENSE_KEY=your_new_relic_key

# File Upload
UPLOAD_PATH=/var/www/mymeds/uploads
MAX_FILE_SIZE=10485760
```

## 🗄️ Database Setup

### 1. Prisma Schema
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Your models here...
```

### 2. Migration Commands
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Deploy migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database
npx prisma studio
```

## 📊 Monitoring & Logging

### 1. PM2 Monitoring
```bash
# View application status
pm2 status

# View logs
pm2 logs mymeds-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart mymeds-backend

# Stop application
pm2 stop mymeds-backend
```

### 2. Log Management
```bash
# Create log directory
sudo mkdir -p /var/log/mymeds
sudo chown $USER:$USER /var/log/mymeds

# Configure logrotate
sudo nano /etc/logrotate.d/mymeds
```

```conf
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

### 3. Health Checks
```bash
# Backend health check
curl http://localhost:4000/api/health

# Frontend health check
curl http://localhost:3000

# Database connection test
cd backend
npx prisma db seed
```

## 🔧 Troubleshooting

### Common Issues

#### 1. PM2 Application Not Starting
```bash
# Check PM2 logs
pm2 logs mymeds-backend

# Check if port is in use
sudo netstat -tlnp | grep :4000

# Restart PM2
pm2 restart all
```

#### 2. Database Connection Issues
```bash
# Test database connection
mysql -u mymeds_user -p mymeds_production

# Check Prisma client
cd backend
npx prisma generate
npx prisma db push
```

#### 3. Nginx Configuration Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Check SSL configuration
sudo nginx -t
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_medications_name ON medications(name);
```

#### 2. Application Optimization
```bash
# Enable Gzip compression in Nginx
sudo nano /etc/nginx/nginx.conf
```

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

#### 3. Caching Strategy
```bash
# Configure Redis for caching
sudo apt install redis-server -y

# Update backend to use Redis
npm install redis
```

## 🔄 Update Process

### Automated Updates
```bash
# Update from local machine
npm run update:vps

# Or manually update
cd deployment/scripts
./update-vps.sh
```

### Manual Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build applications
npm run build:prod
cd backend && npm run build && cd ..

# Restart services
pm2 restart mymeds-backend
sudo systemctl reload nginx
```

## 📞 Support

For additional support:
- Check the [API Documentation](API.md)
- Review the [Development Guide](DEVELOPMENT.md)
- Open an issue on GitHub
- Contact the development team

---

**Last Updated**: September 2025
**Version**: 1.0.0
