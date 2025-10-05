# 🚀 Complete VPS Deployment Commands for MyMeds Pharmacy

**Server:** `72.60.116.253`  
**Domain:** `mymedspharmacyinc.com`  
**Application:** MyMeds Brooklyn Care Pharmacy Management System

---

## 📋 Pre-Deployment Checklist

✅ **DNS Configuration:**
- Point `mymedspharmacyinc.com` → `72.60.116.253`
- Point `www.mymedspharmacyinc.com` → `72.60.116.253`
- Wait for DNS propagation (5-30 minutes)

✅ **Domain Test (before deployment):**
```bash
ping mymedspharmacyinc.com
nslookup mymedspharmacyinc.com
```

---

## 🔧 Step 1: System Dependencies & User Setup

```bash
# Connect to VPS
ssh root@72.60.116.253

# Update system packages
apt-get update && apt-get upgrade -y

# Install essential packages
apt-get install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release software-properties-common

# Add Node.js 20.x repository
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js
apt-get install -y nodejs

# Install npm (if not included)
npm install -g npm@latest

# Install PM2 globally
npm install -g pm2

# Install WP-CLI
curl -O https://raw.githubusercontent.com/wp-cli/wp-cli.phar/main/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Verify installations
mysql --version
node --version
npm --version
pm2 --version
php -v

# Create application user
useradd -m -s /bin/bash myuser
usermod -aG sudo myuser

# Switch to myuser
su - myuser
```

---

## 🗄️ Step 2: MySQL Database Setup

```bash
# Login as root for MySQL setup
sudo mysql -u root

# In MySQL shell, run these commands:
CREATE DATABASE myuser_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE wordpress_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SecurePassword123!';
CREATE USER 'wp_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'WPSecurePassword123!';
GRANT ALL PRIVILEGES ON myuser_user.* TO 'mymeds_user'@'localhost';
GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Verify MySQL service
sudo systemctl status mysql
sudo systemctl enable mysql

# Test database connection
mysql -u myuser_user -p'user_password' -e "SHOW DATABASES;"
mysql -u wp_user -p'WPSecurePassword123!' -e "SHOW DATABASES;"
```

---

## 🐘 Step 3: PHP & Apache Setup for WordPress

```bash
# Install PHP 8.1 and Apache
sudo apt-get update
sudo apt-get install -y php8.1 php8.1-cli php8.1-common php8.1-mysql php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml php8.1-bcmath php8.1-intl php8.1-soap php8.1-xsl php8.1-opcache php8.1-readline php8.1-tidy php8.1-xmlrpc php8.1-xsl php8.1-imagick php8.1-bz2 php8.1-gd php8.1-gmp php8.1-pspell php8.1-recode php8.1-snmp php8.1-sqlite3 php8.1-tidy

# Install Apache
sudo apt-get install -y apache2 libapache2-mod-php8.1

# Enable Apache modules
sudo a2enmod rewrite ssl headers php8.1

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Check Apache status
sudo systemctl status apache2

# Configure PHP
sudo nano /etc/php/8.1/apache2/php.ini
# Set: upload_max_filesize = 64M
# Set: post_max_size = 64M
# Set: max_execution_time = 300
# Set: memory_limit = 512M

# Restart Apache
sudo systemctl restart apache2
```

---

## 🌐 Step 4: WordPress Installation & Configuration

```bash
# Navigate to web directory
cd /var/www/wordpress

# Download WordPress
sudo wp core download --allow-root

# Create WordPress configuration
sudo wp config create --dbname=wordpress_db --dbuser=wp_user --dbpass=WPSecurePassword123! --dbhost=localhost --allow-root

# Install WordPress
sudo wp core install --url="https://mymedspharmacyinc.com" --title="MyMeds Pharmacy Blog" --admin_user=admin --admin_password=AdminSecure2025! --admin_email=admin@mymedspharmacyinc.com --allow-root

# Install WooCommerce plugin
sudo wp plugin install woocommerce --activate --allow-root

# Install additional plugins for SEO and forms
sudo wp plugin install wordpress-seo contact-form-7 --activate --allow-root

# Set proper permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress

# Create .htaccess file with rewrite rules
sudo tee /var/www/wordpress/.htaccess > /dev/null <<EOF
# BEGIN WordPress
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
# END WordPress
EOF

# Restart Apache
sudo systemctl restart apache2

# Test WordPress installation
curl -I http://mymedspharmacyinc.com
```

---

## 📦 Step 5: Upload Application Files

```bash
# Create application directory
sudo mkdir -p /home/myuser/app && sudo chown myuser:myuser /home/myuser/app

# Navigate to user's home directory
cd /home/myuser/app

# Clone your repository (replace with your actual repo URL)
# Option 1: Clone from GitHub/GitLab
# git clone https://github.com/yourusername/mymeds-pharmacy.git myapp --branch production --depth 1

# Option 2: Upload via SCP (from your local machine)
# scp -r mymeds-pharmacy/* root@72.60.116.253:/home/myuser/app/

# Option 3: Manual upload using rsync
# rsync -avz --exclude="node_modules" --exclude=".git" /path/to/local/mymeds-pharmacy/ root@72.60.116.253:/home/myuser/app/

# Example: Direct upload (run this from your local machine)
# rsync -avz --progress --exclude="node_modules" --exclude=".git" --exclude="backend/node_modules" ./ root@72.60.116.253:/home/myuser/app/

# After upload, set proper ownership
sudo chown -R myuser:myuser /home/myuser/app

# Navigate to backend directory
cd /home/myuser/app/backend
```

---

## ⚙️ Step 6: Backend Environment Configuration

```bash
# Create environment file with production settings
cat > .env << EOF
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://mymeds_user:SecurePassword123!@localhost:3306/mymeds_production"
JWT_SECRET="MyMedsPharmacySuperSecureJWTSecretKey2025ProductionMinimum64Characters"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/wp-admin
WOOCOMMERCE_CONSUMER_KEY=ck_auto_generated_key
WOOCOMMERCE_CONSUMER_SECRET=cs_auto_generated_secret
VITE_WORDPRESS_URL=https://mymedspharmacyinc.com/wp-json
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=AdminSecure2025!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@mymedspharmacyinc.com
SMTP_PASS=your-gmail-app-specific-password-here
FROM_EMAIL=support@mymedspharmacyinc.com
FROM_HOST=mymedspharmacyinc.com
FROM_NAME="MyMeds Pharmacy Inc."
TO_EMAIL=admin@mymedspharmacyinc.com
SUBJECT="Message from Website"
ADMIN_EMAIL=admin@mymedspharmacyinc.com/admin
EOF

# Verify environment file
ls -la .env
cat .env
```

---

## 🏗️ Step 7: Build Backend Application

```bash
# Install backend dependencies
npm install

# Generate Prisma client
npx prisma generate

# Check build process
npm run build:check

# Force build (skip if above succeeds)
npm run build:force

# Verify build output
ls -la dist/
ls -la dist/index.js

# Test backend
node dist/index.js

# If successful, stop with Ctrl+C
```

---

## 🗃️ Step 8: Database Migration

```bash
# Run database migrations
npx prisma migrate deploy

# Push database schema
npx prisma db push

# Verify database connection
npx prisma studio --browser none

# If successful, stop with Ctrl+C
```

---

## 🎨 Step 9: Frontend Build

```bash
# Navigate to root directory
cd /home/myuser/app

# Create frontend environment file
cat > .env.production << EOF
VITE_API_URL=https://mymedspharmacyinc.com/api
VITE_WORDPRESS_URL=https://mymedspharmacyinc.com/wp-json
VITE_WOOCOMMERCE_URL=https://mymedspharmacyinc.com/wp-json/wc/v3
EOF

# Install root dependencies
npm install

# Build frontend for production
npm run build

# Verify build output
ls -la dist/
ls -la dist/index.html

# Install serve for serving static files
npm install -g serve

# Test frontend build locally
serve -s dist -l 3000

# If successful, stop with Ctrl+C
```

---

## 🔧 Step 10: Configure Nginx

```bash
# Install Nginx
sudo apt-get install -y nginx

# Copy Nginx configuration
sudo cp /home/myuser/app/deployment/nginx.conf /etc/nginx/sites-available/mymeds-pharmacy

# Enable site
sudo ln -s /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Create custom WordPress location
sudo tee -a /etc/nginx/sites-available/mymeds-pharmacy > /dev/null <<EOF

    # WordPress blog (add this before the closing brace of the server block)
    location /wp-admin {
        root /var/www/html;
        index index.php index.html index.htm;
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ ^(/wp-content|/wp-includes|/wp-json) {
        root /var/www/html;
        index index.php index.html index.htm;
        try_files \$uri \$uri/ /index.php?\$query_string;
    }
    
    location ~ \.php$ {
        root /var/www/html;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
EOF

# Update static root path in nginx config
sudo sed -i 's|root /var/www/html;|root /var/www/wordpress;|g' /etc/nginx/sites-available/mymeds-pharmacy

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

# Verify Nginx status
sudo systemctl status nginx
```

---

## 🔐 Step 11: Setup SSL/HTTPS

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Configure SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# When prompted:
# Email: admin@mymedspharmacyinc.com
# Agree to terms: A
# Newsletter: N
# Redirect: 2

# Verify renewal works
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -

# Test SSL
curl -I https://mymedspharmacyinc.com
```

---

## 🚀 Step 12: Configure PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Run the command that PM2 provides

# Monitor application
pm2 status
pm2 logs mymeds-backend

# Setup auto-restart for PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:log_dir ./logs
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 🔥 Step 13: Configure Firewall

```bash
# Reset firewall to default
sudo ufw --force reset

# Deny by default
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important!)
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow Nginx\ Full

# Allow Node.js backend (if needed)
sudo ufw allow 4000

# Enable firewall
sudo ufw --force enable

# Verify firewall status
sudo ufw status verbose

# List all listening ports
sudo netstat -tlnp
```

---

## ✅ Step 14: Final Testing & Health Checks

```bash
# Test frontend
curl -I http://mymedspharmacyinc.com

# Test HTTPS (after SSL setup)
curl -I https://mymedspharmacyinc.com

# Test backend API
curl http://mymedspharmacyinc.com/api/health

# Test HTTPS backend API
curl https://mymedspharmacyinc.com/api/health

# Check all services status
sudo systemctl status mysql apache2 nginx
pm2 status

# Check application logs
pm2 logs mymeds-backend
tail -f /var/log/nginx/error.log

# Monitor performance
htop
df -h

# Run PHP-FPM tuning
sudo nano /etc/php/8.1/fpm/pool.d/www.conf
# Update these values:
# pm.max_children = 50
# pm.start_servers = 5
# pm.min_spare_servers = 5
# pm.max_spare_servers = 35

# Restart PHP-FPM
sudo systemctl restart php8.1-fpm
```

---

## 📊 Step 15: Performance Optimization

```bash
# Configure swap file
sudo dd if=/dev/zero of=/swapfile bs=1024 count=2097152
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# Optimize Apache
sudo nano /etc/apache2/apache2.conf
# Add:
# ServerTokens Prod
# ServerSignature Off

# Restart Apache
sudo systemctl restart apache2

# Optimize MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
# Add:
# innodb_buffer_pool_size = 128M
# innodb_log_file_size = 32M
# innodb_flush_log_at_trx_commit = 2
# query_cache_size = 32M

# Restart MySQL
sudo systemctl restart mysql

# Setup log rotation
sudo nano /etc/logrotate.d/mymeds
# Add:
# /home/myuser/app/logs/*.log {
#     daily
#     missingok
#     rotate 30
#     compress
#     delaycompress
#     notifempty
#     create 644 myuser myuser
# }
```

---

## 🎯 Access URLs After Deployment

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main Pharmacy Website** | `https://mymedspharmacyinc.com` | - |
| **WordPress Blog** | `https://mymedspharmacyinc.com` | Admin: `admin` / Password: `AdminSecure2025!` |
| **Pharmacy Admin Panel** | `https://mymedspharmacyinc.com/admin` | Email: `admin@mymedspharmacyinc.com` |
| **Website WordPress Admin** | `https://mymedspharmacyinc.com/wp-admin` | Username: `admin` / Password: `AdminSecure2025!` |
| **API Health Check** | `https://mymedspharmacyinc.com/api/health` | - |
| **PHPMyAdmin Database Management** | `https://mymedspharmacyinc.com/phpmyadmin` | MySQL Root / Your MySQL Password |

---

## 🛠️ Commands to Upload Your Files

**From your local machine, run:**

```bash
# Upload all files to VPS
scp -r ./ root@72.60.116.253:/home/myuser/app/

# Or using rsync (recommended)
rsync -avz --exclude="node_modules" --exclude=".git" ./ root@72.60.116.253:/home/myuser/app/

# If Windows PowerShell:
scp -r . root@72.60.116.253:/home/myuser/app/

# For Git clone instead:
ssh root@72.60.116.253
cd /home/myuser/app
git clone https://github.com/yourusername/mymeds-pharmacy.git .
```

---

## 📚 Troubleshooting Commands

```bash
# Check PM2 logs
pm2 logs mymeds-backend --lines 100

# Restart PM2 processes
pm2 restart mymeds-backend
pm2 reload mymeds-backend

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Apache error logs
sudo tail -f /var/log/apache2/error.log

# Check application logs
tail -f /home/myuser/app/logs/combined.log

# Restart all services
sudo systemctl restart mysql nginx apache2
pm2 restart all

# Monitor live traffic
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
sudo netstat -tlnp | grep :4000

# Check domain resolution
nslookup mymedspharmacyinc.com
dig mymedspharmacyinc.com

# Clear browser cache and test
curl -k https://mymedspharmacyinc.com
```

---

## 🚨 Emergency Rollback Commands

```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx apache2 mysql

# Restore from backup (if you have one)
sudo mv /home/myuser/app /home/myuser/app-broken-backup
sudo mv /home/myuser/app-backup /home/myuser/app

# Rollback database (if needed)
mysql -u root -p
DROP DATABASE myuser_user;
CREATE DATABASE myuser_user;
mysql -u myuser_user -p myuser_user < /home/myuser/app-backup/database-backup.sql

# Restart services
pm2 start ecosystem.config.js
sudo systemctl start nginx apache2 mysql
```

---

## ✅ Final Checklist

**All services running:**
- ✅ MySQL Database: `sudo systemctl status mysql`
- ✅ Apache Web Server: `sudo systemctl status apache2`
- ✅ Nginx Proxy: `sudo systemctl status nginx`
- ✅ PHP-FPM: `sudo systemctl status php8.1-fpm`
- ✅ PM2 Backend: `pm2 status`
- ✅ SSL Certificate: `sudo certbot certificates`

**Domain resolution:**
- ✅ `ping mymedspharmacyinc.com` → resolves to `72.60.116.253`
- ✅ DNS propagation complete

**File permissions:**
- ✅ Frontend files: `755` permissions, `www-data` ownership
- ✅ Backend files: `myuser` ownership
- ✅ Log files: proper permissions for PM2

**Firewall configuration:**
- ✅ SSH enabled on default port
- ✅ HTTP/HTTPS traffic allowed
- ✅ MySQL port accessible locally only

**Backup strategy:**
- ✅ Automated database backups
- ✅ File system snapshots
- ✅ Log rotation configured

**Performance monitoring:**
- ✅ PM2 process monitor
- ✅ Resource usage tracking
- ✅ Security headers configured

🎉 **DEPLOYMENT COMPLETE!**

Your pharmacy management system is now live at `https://mymedspharmacyinc.com`



