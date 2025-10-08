# 🚀 Complete VPS Deployment Commands WITH WordPress Setup

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

**Wait for completion, then continue.**

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

**Secure MySQL (IMPORTANT - Save the password you create!):**
```bash
mysql_secure_installation
```

**During mysql_secure_installation:**
- Press Enter for current password (no password set)
- Type `Y` to set root password
- Enter a strong password (SAVE THIS PASSWORD!)
- Type `Y` for all other questions

---

## 🎯 **STEP 5: Create Database**

```bash
mysql -u root -p
```

**Enter the MySQL root password you just created, then run these SQL commands:**

```sql
CREATE DATABASE mymeds_pharmacy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2024!Secure';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**⚠️ IMPORTANT: Replace `MyMeds2024!Secure` with your own strong password!**

---

## 🎯 **STEP 6: Install Nginx**

```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

**Check Status:**
```bash
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
```

**Verify Installation:**
```bash
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
```

**Verify Files:**
```bash
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

**Create Production Environment File:**
```bash
nano .env.production
```

**Add this content (REPLACE PASSWORDS WITH YOUR ACTUAL PASSWORDS):**
```env
NODE_ENV=production
PORT=4000

# Database (REPLACE PASSWORD WITH YOUR ACTUAL PASSWORD)
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

# CORS (REPLACE WITH YOUR ACTUAL DOMAIN)
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

# WordPress Integration (ADD THESE LINES)
WORDPRESS_URL=https://yourwordpresssite.com
WORDPRESS_USERNAME=your_wp_username
WORDPRESS_APP_PASSWORD=your_wp_app_password

# WooCommerce Integration (ADD THESE LINES)
WOOCOMMERCE_URL=https://yourwoocommercesite.com
WOOCOMMERCE_CONSUMER_KEY=your_woo_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_woo_consumer_secret
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

**Follow the instructions PM2 gives you for startup command! It will look like:**
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

**Run that command, then:**
```bash
pm2 save
```

**Check Status:**
```bash
pm2 status
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

**Create Production Environment File:**
```bash
nano .env.production
```

**Add this content:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_BACKEND_URL=https://yourdomain.com/api
VITE_WORDPRESS_URL=https://yourwordpresssite.com
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

**Build for Production:**
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

**Enable the Site:**
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

**Backend Health Check:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-08T...",
  "database": "connected"
}
```

**Frontend (should return HTML):**
```html
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

## 🎯 **STEP 18: Configure WordPress Integration**

### **18.1: Access Admin Panel**

```bash
# Your application is now running at:
# http://72.60.116.253/admin
```

**Login with initial credentials:**
- **Email**: admin@yourdomain.com
- **Password**: ChangeMeImmediately123!

**⚠️ IMPORTANT: Change this password immediately!**

### **18.2: Get WordPress Application Password**

**If you have a WordPress site, get the application password:**

1. **Login to WordPress Admin** (`https://yourwordpresssite.com/wp-admin`)
2. **Go to Users → Profile**
3. **Scroll to "Application Passwords"**
4. **Enter Application Name**: "MyMeds Pharmacy"
5. **Click "Add New Application Password"**
6. **Copy the generated password** (save it securely!)

### **18.3: Configure WordPress in Admin Panel**

1. **Go to Settings Tab** in admin panel
2. **Find WordPress Section**
3. **Click "Configure WordPress"**
4. **Enter credentials:**
   - **Site URL**: `https://yourwordpresssite.com`
   - **Username**: `your_wp_username`
   - **Application Password**: `your_wp_app_password`
   - **Enable Integration**: ✅ Checked
5. **Click "Save Settings"**
6. **Click "Test Connection"**

### **18.4: Update Environment Variables (Alternative Method)**

**If you prefer to configure via environment variables:**

```bash
nano /var/www/mymeds-brooklyn-care-1-6/backend/.env.production
```

**Add/Update WordPress settings:**
```env
# WordPress Integration
WORDPRESS_URL=https://yourwordpresssite.com
WORDPRESS_USERNAME=your_wp_username
WORDPRESS_APP_PASSWORD=your_wp_app_password
```

**Restart backend:**
```bash
pm2 restart mymeds-backend
```

---

## 🎯 **STEP 19: Configure WooCommerce Integration**

### **19.1: Get WooCommerce API Credentials**

**If you have a WooCommerce store:**

1. **Login to WordPress Admin** (`https://yourwoocommercesite.com/wp-admin`)
2. **Go to WooCommerce → Settings → Advanced → REST API**
3. **Click "Add Key"**
4. **Enter Description**: "MyMeds Pharmacy"
5. **Select User**: Admin user
6. **Set Permissions**: Read/Write
7. **Click "Generate API Key"**
8. **Copy Consumer Key and Consumer Secret**

### **19.2: Configure WooCommerce in Admin Panel**

1. **Go to Settings Tab** in admin panel
2. **Find WooCommerce Section**
3. **Click "Configure WooCommerce"**
4. **Enter credentials:**
   - **Store URL**: `https://yourwoocommercesite.com`
   - **Consumer Key**: `your_woo_consumer_key`
   - **Consumer Secret**: `your_woo_consumer_secret`
   - **Enable Integration**: ✅ Checked
5. **Click "Save Settings"**
6. **Click "Test Connection"**

### **19.3: Update Environment Variables (Alternative Method)**

```bash
nano /var/www/mymeds-brooklyn-care-1-6/backend/.env.production
```

**Add/Update WooCommerce settings:**
```env
# WooCommerce Integration
WOOCOMMERCE_URL=https://yourwoocommercesite.com
WOOCOMMERCE_CONSUMER_KEY=your_woo_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_woo_consumer_secret
```

**Restart backend:**
```bash
pm2 restart mymeds-backend
```

---

## ✅ **Deployment Complete!**

### **Your Application is Now Running:**
- **Frontend**: http://72.60.116.253 (or your domain)
- **Backend**: http://72.60.116.253/api (or your domain/api)
- **Admin**: http://72.60.116.253/admin (or your domain/admin)

### **Admin Panel Access:**
- **URL**: http://72.60.116.253/admin
- **Email**: admin@yourdomain.com
- **Password**: ChangeMeImmediately123!

**⚠️ IMPORTANT: Change the admin password immediately!**

### **WordPress Panel Access:**
- **URL**: http://72.60.116.253/admin → Settings → WordPress
- **Features**: Connection management, post sync, content creation

### **WooCommerce Panel Access:**
- **URL**: http://72.60.116.253/admin → Settings → WooCommerce
- **Features**: Order management, product sync, store integration

---

## 🔧 **Useful Commands After Deployment**

### **Backend Management:**
```bash
# View logs
pm2 logs mymeds-backend

# Restart backend
pm2 restart mymeds-backend

# Check status
pm2 status
```

### **WordPress Management:**
```bash
# Test WordPress connection
curl -X GET "http://72.60.116.253/api/wordpress/test-connection" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Sync WordPress posts
curl -X POST "http://72.60.116.253/api/wordpress/sync-posts" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### **WooCommerce Management:**
```bash
# Test WooCommerce connection
curl -X GET "http://72.60.116.253/api/woocommerce/test-connection" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Sync WooCommerce products
curl -X POST "http://72.60.116.253/api/woocommerce/sync-products" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🎉 **Congratulations!**

Your MyMeds Pharmacy application is now successfully deployed with **WordPress and WooCommerce integration**!

**Access your application at:** http://72.60.116.253

**Admin panel at:** http://72.60.116.253/admin

**WordPress panel at:** http://72.60.116.253/admin → Settings → WordPress

**WooCommerce panel at:** http://72.60.116.253/admin → Settings → WooCommerce

---

## 📋 **Next Steps After Deployment**

### **1. Configure Admin Panel**
- Login to admin panel
- Change default password
- Configure WordPress integration
- Configure WooCommerce integration

### **2. Set Up Domain (if you have one)**
- Point your domain DNS to 72.60.116.253
- Update CORS_ORIGIN in `.env.production`
- Restart backend: `pm2 restart mymeds-backend`

### **3. Test All Integrations**
- Test WordPress connection and post sync
- Test WooCommerce connection and order management
- Test contact forms
- Test prescription forms
- Test shop functionality

### **4. Content Management**
- Create blog posts in WordPress (they'll sync to pharmacy website)
- Add products to WooCommerce store (they'll sync to pharmacy shop)
- Configure email notifications
- Set up location information

---

**Your complete MyMeds Pharmacy system with WordPress and WooCommerce integration is now live! 🚀**
