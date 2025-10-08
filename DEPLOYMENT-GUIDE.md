# 🚀 MyMeds Pharmacy - Production Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **✅ Cleanup Complete**
- ✅ Test files removed
- ✅ Test scripts removed
- ✅ Unnecessary documentation removed
- ✅ Local development files cleaned up

---

## 🎯 **Deployment Overview**

This guide will walk you through deploying the MyMeds Pharmacy application to production.

### **System Architecture:**
- **Frontend**: React + Vite (Static Site)
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL (Production) / SQLite (Development)
- **Integrations**: WooCommerce, WordPress

---

## 📦 **Step 1: Prepare Production Environment**

### **1.1 Create Production Environment File**

**Backend** (`backend/.env.production`):
```env
NODE_ENV=production
PORT=4000

# Database (MySQL)
DATABASE_URL="mysql://username:password@host:3306/database_name"
DB_MAX_CONNECTIONS=20
DB_CONNECTION_TIMEOUT=30000

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-min-32-characters"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_AUTH=100
RATE_LIMIT_CONTACT=200
RATE_LIMIT_GENERAL=10000

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=MyMeds Pharmacy <noreply@yourdomain.com>

# WooCommerce (Optional - Configure via Admin)
WOOCOMMERCE_URL=
WOOCOMMERCE_CONSUMER_KEY=
WOOCOMMERCE_CONSUMER_SECRET=

# WordPress (Optional - Configure via Admin)
WORDPRESS_URL=
WORDPRESS_USERNAME=
WORDPRESS_APP_PASSWORD=

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_INITIAL_PASSWORD=ChangeMeImmediately123!

# Security
SECURE_COOKIES=true
SESSION_SECRET=your-session-secret-min-32-chars

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

**Frontend** (`.env.production`):
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_BACKEND_URL=https://api.yourdomain.com/api
VITE_WORDPRESS_URL=https://yourblog.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🗄️ **Step 2: Set Up Production Database**

### **2.1 Create MySQL Database**

```sql
CREATE DATABASE mymeds_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
```

### **2.2 Run Database Migrations**

```bash
cd backend

# Set production environment
export NODE_ENV=production
export DATABASE_URL="mysql://mymeds_user:password@localhost:3306/mymeds_pharmacy"

# Run Prisma migrations (use production schema)
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=./prisma/schema.prisma

# (Optional) Seed database with initial data
npx tsx prisma/seed.ts
```

---

## 🏗️ **Step 3: Build for Production**

### **3.1 Build Backend**

```bash
cd backend

# Install production dependencies only
npm ci --production=false

# Build TypeScript
npm run build

# This creates a dist/ folder with compiled JavaScript
```

### **3.2 Build Frontend**

```bash
# Return to root
cd ..

# Install dependencies
npm ci

# Build for production
npm run build

# This creates a dist/ folder with static files
```

---

## 🌐 **Step 4: Deployment Options**

### **Option A: Deploy to VPS (DigitalOcean, AWS EC2, etc.)**

#### **4.1 Server Setup**

```bash
# SSH into your server
ssh user@yourserver.com

# Install Node.js (v18 or later)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx

# Install MySQL
sudo apt-get install mysql-server
```

#### **4.2 Upload Files**

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.git' \
  ./ user@yourserver.com:/var/www/mymeds/
```

#### **4.3 Backend Deployment**

```bash
# On server
cd /var/www/mymeds/backend

# Install dependencies
npm ci --production

# Start with PM2
pm2 start dist/index.js --name mymeds-backend \
  --env production \
  --time \
  --max-memory-restart 500M

# Save PM2 configuration
pm2 save
pm2 startup
```

#### **4.4 Frontend Deployment**

```bash
# Configure Nginx
sudo nano /etc/nginx/sites-available/mymeds

# Add this configuration:
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    root /var/www/mymeds/dist;
    index index.html;

    # Enable gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

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
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for Socket.IO
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### **4.5 SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

---

### **Option B: Deploy to Vercel (Frontend) + Railway/Render (Backend)**

#### **Frontend to Vercel:**

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`

2. **Add Environment Variables**
   - Add all `.env.production` variables in Vercel dashboard

3. **Deploy**
   - Vercel will auto-deploy on every push to main

#### **Backend to Railway:**

1. **Connect GitHub Repository**
   - Go to [railway.app](https://railway.app)
   - Create new project from GitHub
   - Select your repository

2. **Configure Service**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `node dist/index.js`

3. **Add Environment Variables**
   - Add all production environment variables

4. **Add MySQL Database**
   - Click "New" → "Database" → "MySQL"
   - Copy `DATABASE_URL` to environment variables

5. **Deploy**
   - Railway will auto-deploy

---

## ✅ **Step 5: Post-Deployment Checklist**

### **5.1 Verify Backend**

```bash
# Test health endpoint
curl https://api.yourdomain.com/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2025-10-08T...",
  "database": "connected"
}
```

### **5.2 Verify Frontend**

1. Visit https://yourdomain.com
2. Check all pages load
3. Verify API calls work
4. Test form submissions

### **5.3 Admin Panel Setup**

1. Go to https://yourdomain.com/admin
2. Login with initial admin credentials
3. **IMMEDIATELY change password**
4. Configure:
   - WooCommerce integration (if needed)
   - WordPress integration (if needed)
   - SMTP settings for emails
   - Location information
   - Contact details

### **5.4 Security Checklist**

- ✅ SSL certificate installed
- ✅ Admin password changed
- ✅ JWT secret is unique and strong
- ✅ Database credentials are secure
- ✅ CORS is properly configured
- ✅ Rate limiting is enabled
- ✅ File upload limits are set
- ✅ Environment variables are not exposed

### **5.5 Monitoring**

```bash
# Set up PM2 monitoring (if using VPS)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs mymeds-backend

# Monitor status
pm2 status
pm2 monit
```

---

## 🔧 **Step 6: Maintenance**

### **Updates:**

```bash
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
# Nginx will serve new static files automatically
```

### **Database Backups:**

```bash
# Create backup script
sudo nano /usr/local/bin/backup-mymeds-db

# Add:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u mymeds_user -p mymeds_pharmacy > /backups/mymeds_$DATE.sql
find /backups -name "mymeds_*.sql" -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-mymeds-db

# Add to cron (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-mymeds-db
```

---

## 📊 **Step 7: Performance Optimization**

### **Frontend:**
- ✅ Code splitting (already configured in Vite)
- ✅ Asset compression (Nginx gzip)
- ✅ CDN for static assets (optional)
- ✅ Image optimization
- ✅ Lazy loading

### **Backend:**
- ✅ Database connection pooling
- ✅ Caching (Redis optional)
- ✅ Rate limiting
- ✅ Query optimization
- ✅ PM2 cluster mode (optional)

---

## 🐛 **Troubleshooting**

### **Backend won't start:**
```bash
# Check logs
pm2 logs mymeds-backend

# Check if port 4000 is free
sudo lsof -i :4000

# Verify database connection
npx prisma db pull --schema=./prisma/schema.prisma
```

### **Frontend shows API errors:**
```bash
# Check CORS configuration
# Check API_URL in .env.production
# Verify Nginx proxy configuration
sudo nginx -t
sudo systemctl status nginx
```

### **Database connection errors:**
```bash
# Test database connection
mysql -u mymeds_user -p mymeds_pharmacy

# Check DATABASE_URL format
# Format: mysql://user:password@host:port/database
```

---

## 📞 **Support**

For deployment issues:
1. Check logs: `pm2 logs` or `vercel logs`
2. Verify environment variables
3. Check server resources (disk, memory, CPU)
4. Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

---

**Deployment guide complete! Follow these steps carefully for a successful production deployment.** 🚀

