# 🚀 Complete VPS Deployment Commands - Step by Step

## 📋 **Your VPS Details**
- **Server**: srv983203.hstgr.cloud
- **IP**: 72.60.116.253
- **SSH**: root@srv983203.hstgr.cloud
- **OS**: Ubuntu 24.04 LTS

---

## 🎯 **STEP 1: Connect to VPS**

```bash
ssh root@72.60.116.253
```

**Expected Output:**
```
Welcome to Ubuntu 24.04 LTS
root@srv983203:~#
```

---

## 🎯 **STEP 2: Update System**

```bash
apt update && apt upgrade -y
```

**Expected Output:**
```
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease
...
Setting up libc6:amd64 (2.39-0ubuntu8.1) ...
Setting up libc6-dev:amd64 (2.39-0ubuntu8.1) ...
```

---

## 🎯 **STEP 3: Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
```

**Verify Installation:**
```bash
node --version
npm --version
```

**Expected Output:**
```
v18.19.0
10.2.3
```

---

## 🎯 **STEP 4: Install MySQL**

```bash
apt install mysql-server -y
systemctl start mysql
systemctl enable mysql
```

**Secure MySQL:**
```bash
mysql_secure_installation
```

**During mysql_secure_installation:**
- Press Enter for current password (no password set)
- Type `Y` to set root password
- Enter a strong password (save it!)
- Type `Y` for all other questions

---

## 🎯 **STEP 5: Create Database**

```bash
mysql -u root -p
```

**In MySQL console, run these commands:**
```sql
CREATE DATABASE mymeds_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2024!Secure';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Replace `MyMeds2024!Secure` with your own strong password!**

---

## 🎯 **STEP 6: Install Nginx**

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
systemctl status nginx
```

**Expected Output:**
```
● nginx.service - A high performance web server and a reverse proxy server
     Active: active (running)
```

---

## 🎯 **STEP 7: Install PM2**

```bash
npm install -g pm2
pm2 --version
```

**Expected Output:**
```
5.3.0
```

---

## 🎯 **STEP 8: Clone Repository**

```bash
cd /var/www
git clone https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git
cd mymeds-brooklyn-care-1
ls -la
```

**Expected Output:**
```
total 48
drwxr-xr-x 8 root root 4096 Oct  8 20:45 .
drwxr-xr-x 8 root root 4096 Oct  8 20:45 ..
drwxr-xr-x 8 root root 4096 Oct  8 20:45 backend
drwxr-xr-x 8 root root 4096 Oct  8 20:45 src
drwxr-xr-x 2 root root 4096 Oct  8 20:45 public
...
```

---

## 🎯 **STEP 9: Set Up Backend**

```bash
cd backend
npm ci --production
```

**Create production environment file:**
```bash
nano .env.production
```

**Add this content (replace passwords with your actual passwords):**
```env
NODE_ENV=production
PORT=4000

# Database (replace password with your actual password)
DATABASE_URL="mysql://mymeds_user:MyMeds2024!Secure@localhost:3306/mymeds_pharmacy"
DB_MAX_CONNECTIONS=20
DB_CONNECTION_TIMEOUT=30000

# JWT Configuration
JWT_SECRET="mymeds-pharmacy-super-secret-jwt-key-2024-production-min-32-chars"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_AUTH=100
RATE_LIMIT_CONTACT=200
RATE_LIMIT_GENERAL=10000

# CORS (replace with your actual domain)
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
SESSION_SECRET=mymeds-pharmacy-session-secret-2024-production-min-32-chars

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## 🎯 **STEP 10: Set Up Database Schema**

```bash
export NODE_ENV=production
export DATABASE_URL="mysql://mymeds_user:MyMeds2024!Secure@localhost:3306/mymeds_pharmacy"

# Run Prisma migrations (use production schema)
npx prisma migrate deploy --schema=./prisma/schema.prisma

# Generate Prisma client
npx prisma generate --schema=./prisma/schema.prisma

# Build the application
npm run build
```

**Expected Output:**
```
✅ Prisma schema loaded from prisma/schema.prisma
✅ Database migrations applied successfully
✅ Prisma client generated
✅ TypeScript compiled successfully
```

---

## 🎯 **STEP 11: Create PM2 Configuration**

```bash
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

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

## 🎯 **STEP 12: Start Backend with PM2**

```bash
mkdir -p logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**Follow the instructions PM2 gives you for startup command!**

**Check status:**
```bash
pm2 status
pm2 logs mymeds-backend
```

**Expected Output:**
```
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0   │ mymeds-backend  │ default     │ 1.0.0   │ fork    │ 1234     │ 0s     │ 0    │ online    │ 0%       │ 45.2mb   │ root     │ disabled │
└─────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 🎯 **STEP 13: Set Up Frontend**

```bash
cd /var/www/mymeds-brooklyn-care-1-6
npm ci
```

**Create production environment file:**
```bash
nano .env.production
```

**Add this content:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com/api
VITE_WORDPRESS_URL=https://yourblog.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Build for production:**
```bash
npm run build
```

**Expected Output:**
```
✓ built in 2.34s
```

---

## 🎯 **STEP 14: Configure Nginx**

```bash
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

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Enable the site:**
```bash
ln -s /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**Expected Output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## 🎯 **STEP 15: Configure Firewall**

```bash
apt install ufw -y
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
ufw status
```

**Expected Output:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
Nginx Full                 ALLOW       Anywhere
22/tcp (v6)                ALLOW       Anywhere (v6)
Nginx Full (v6)            ALLOW       Anywhere (v6)
```

---

## 🎯 **STEP 16: Test Your Deployment**

```bash
curl http://localhost:4000/api/health
curl http://localhost
pm2 status
systemctl status nginx
```

**Expected Outputs:**
```json
// Backend health check
{
  "status": "ok",
  "timestamp": "2025-10-08T...",
  "database": "connected"
}

// Frontend should return HTML
<!DOCTYPE html>
<html lang="en">
...
```

---

## 🎯 **STEP 17: Set Up SSL Certificate (Optional but Recommended)**

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot renew --dry-run
```

---

## ✅ **Deployment Complete!**

### **Your Application is Now Running:**
- **Frontend**: http://72.60.116.253 (or your domain)
- **Backend**: http://72.60.116.253/api (or your domain/api)
- **Admin**: http://72.60.116.253/admin (or your domain/admin)

### **Useful Commands:**

**Backend Management:**
```bash
pm2 logs mymeds-backend
pm2 restart mymeds-backend
pm2 stop mymeds-backend
pm2 status
```

**Frontend Updates:**
```bash
cd /var/www/mymeds-brooklyn-care-1-6
git pull origin latest
npm ci
npm run build
```

**Database Management:**
```bash
mysql -u mymeds_user -p mymeds_pharmacy
mysqldump -u mymeds_user -p mymeds_pharmacy > backup.sql
```

---

## 🎉 **Congratulations!**

Your MyMeds Pharmacy application is now successfully deployed on your Hostinger VPS!

**Access your application at:** http://72.60.116.253

**Admin panel at:** http://72.60.116.253/admin

---

**Next Steps:**
1. Configure your domain DNS to point to 72.60.116.253
2. Update CORS_ORIGIN in `.env.production`
3. Restart backend: `pm2 restart mymeds-backend`
4. Login to admin panel and change password
5. Configure integrations (WooCommerce, WordPress, etc.)
