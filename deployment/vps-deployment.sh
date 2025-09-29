#!/bin/bash

# MyMeds Pharmacy VPS Deployment Script
# Domain: mymedspharmacyinc.com
# This script will clean previous deployments and set up a fresh production environment

set -e

echo "🚀 Starting MyMeds Pharmacy VPS Deployment..."
echo "Domain: mymedspharmacyinc.com"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-intl php8.1-bcmath php8.1-soap php8.1-imagick php8.1-redis php8.1-memcached php8.1-cli php8.1-common php8.1-opcache php8.1-readline php8.1-sqlite3 php8.1-tidy php8.1-xmlrpc php8.1-xsl php8.1-zip php8.1-json php8.1-ctype php8.1-dom php8.1-fileinfo php8.1-filter php8.1-hash php8.1-iconv php8.1-json php8.1-libxml php8.1-mbstring php8.1-openssl php8.1-pcre php8.1-pdo php8.1-phar php8.1-posix php8.1-reflection php8.1-session php8.1-simplexml php8.1-spl php8.1-standard php8.1-tokenizer php8.1-xml php8.1-xmlreader php8.1-xmlwriter php8.1-zlib

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Certbot for SSL
print_status "Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Clean previous deployment
print_status "Cleaning previous deployment..."
sudo rm -rf /var/www/mymeds*
sudo rm -rf /etc/nginx/sites-available/mymeds*
sudo rm -rf /etc/nginx/sites-enabled/mymeds*

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/mymeds
sudo chown -R $USER:$USER /var/www/mymeds

# Create WordPress directory
print_status "Creating WordPress directory..."
sudo mkdir -p /var/www/wordpress
sudo chown -R $USER:$USER /var/www/wordpress

# Download and install WordPress
print_status "Downloading WordPress..."
cd /var/www/wordpress
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz --strip-components=1
rm latest.tar.gz

# Set WordPress permissions
print_status "Setting WordPress permissions..."
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress

# Configure MySQL
print_status "Configuring MySQL..."
sudo mysql_secure_installation

# Create MySQL databases
print_status "Creating MySQL databases..."
sudo mysql -e "CREATE DATABASE IF NOT EXISTS mymeds_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE DATABASE IF NOT EXISTS wordpress_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'MyMeds2025!SecurePassword';"
sudo mysql -e "CREATE USER IF NOT EXISTS 'wp_user'@'localhost' IDENTIFIED BY 'WordPress2025!SecurePassword';"
sudo mysql -e "GRANT ALL PRIVILEGES ON mymeds_db.* TO 'mymeds_user'@'localhost';"
sudo mysql -e "GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# Configure PHP-FPM
print_status "Configuring PHP-FPM..."
sudo sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.1/fpm/php.ini
sudo systemctl restart php8.1-fpm

# Create Nginx configuration for MyMeds
print_status "Creating Nginx configuration for MyMeds..."
sudo tee /etc/nginx/sites-available/mymeds > /dev/null <<EOF
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # SSL configuration (will be updated after certbot)
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Frontend (React app)
    location / {
        root /var/www/mymeds/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WordPress admin (subdomain)
    location /wp-admin/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WordPress API
    location /wp-json/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Create Nginx configuration for WordPress
print_status "Creating Nginx configuration for WordPress..."
sudo tee /etc/nginx/sites-available/wordpress > /dev/null <<EOF
server {
    listen 8080;
    server_name localhost;
    root /var/www/wordpress;
    index index.php index.html index.htm;
    
    # Security
    location ~ /\.ht {
        deny all;
    }
    
    # WordPress rules
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    # PHP processing
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        include fastcgi_params;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable sites
print_status "Enabling Nginx sites..."
sudo ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/

# Test Nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

# Start services
print_status "Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl start php8.1-fpm
sudo systemctl enable php8.1-fpm

# Create production environment file template
print_status "Creating production environment file template..."
sudo tee /var/www/mymeds/.env.production.template > /dev/null <<EOF
# MyMeds Production Environment Configuration
# Domain: mymedspharmacyinc.com

# Application Settings
NODE_ENV=production
PORT=4000

# Database Configuration
DATABASE_URL="mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"

# Security Configuration
JWT_SECRET="MyMeds2025!JWTSecretKey_Production_Secure_2025!@#$%^&*()"
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_PASSWORD_HASH="REPLACE_WITH_BCRYPT_HASH"
CSRF_SECRET="MyMeds2025!CSRFSecret_Production_Secure_2025!@#$%^&*()"

# Rate Limiting
DISABLE_RATE_LIMIT=false
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WordPress Integration
WORDPRESS_SITE_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="REPLACE_WITH_WP_USERNAME"
WORDPRESS_APPLICATION_PASSWORD="REPLACE_WITH_WP_APP_PASSWORD"

# WooCommerce Integration
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="REPLACE_WITH_WC_CONSUMER_KEY"
WOOCOMMERCE_CONSUMER_SECRET="REPLACE_WITH_WC_CONSUMER_SECRET"

# Email Configuration (Optional)
SMTP_HOST="REPLACE_WITH_SMTP_HOST"
SMTP_PORT="587"
SMTP_USER="REPLACE_WITH_SMTP_USER"
SMTP_PASS="REPLACE_WITH_SMTP_PASS"
SMTP_FROM="noreply@mymedspharmacyinc.com"

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/mymeds/app.log"

# File Uploads
MAX_FILE_SIZE="10MB"
UPLOAD_PATH="/var/www/mymeds/uploads"
EOF

# Create uploads directory
print_status "Creating uploads directory..."
sudo mkdir -p /var/www/mymeds/uploads
sudo chown -R www-data:www-data /var/www/mymeds/uploads

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/mymeds
sudo chown -R $USER:$USER /var/log/mymeds

# Create PM2 ecosystem file
print_status "Creating PM2 ecosystem configuration..."
sudo tee /var/www/mymeds/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: 'dist/index.js',
      cwd: '/var/www/mymeds',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      env_file: '/var/www/mymeds/.env.production',
      log_file: '/var/log/mymeds/backend.log',
      error_file: '/var/log/mymeds/backend-error.log',
      out_file: '/var/log/mymeds/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
EOF

# Create deployment script
print_status "Creating deployment script..."
sudo tee /var/www/mymeds/deploy.sh > /dev/null <<EOF
#!/bin/bash

# MyMeds Deployment Script
set -e

echo "🚀 Deploying MyMeds Pharmacy..."

# Stop PM2 processes
pm2 stop mymeds-backend || true
pm2 delete mymeds-backend || true

# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build frontend
npm run build

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start PM2 processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "Backend: http://localhost:4000"
echo "Frontend: https://mymedspharmacyinc.com"
echo "WordPress: https://mymedspharmacyinc.com/wp-admin"
EOF

sudo chmod +x /var/www/mymeds/deploy.sh

# Create WordPress configuration
print_status "Creating WordPress configuration..."
sudo tee /var/www/wordpress/wp-config.php > /dev/null <<EOF
<?php
define('DB_NAME', 'wordpress_db');
define('DB_USER', 'wp_user');
define('DB_PASSWORD', 'WordPress2025!SecurePassword');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', 'utf8mb4_unicode_ci');

// Authentication unique keys and salts
define('AUTH_KEY',         'MyMeds2025!AuthKey_Production_Secure_2025!@#$%^&*()');
define('SECURE_AUTH_KEY',  'MyMeds2025!SecureAuthKey_Production_Secure_2025!@#$%^&*()');
define('LOGGED_IN_KEY',    'MyMeds2025!LoggedInKey_Production_Secure_2025!@#$%^&*()');
define('NONCE_KEY',        'MyMeds2025!NonceKey_Production_Secure_2025!@#$%^&*()');
define('AUTH_SALT',        'MyMeds2025!AuthSalt_Production_Secure_2025!@#$%^&*()');
define('SECURE_AUTH_SALT', 'MyMeds2025!SecureAuthSalt_Production_Secure_2025!@#$%^&*()');
define('LOGGED_IN_SALT',   'MyMeds2025!LoggedInSalt_Production_Secure_2025!@#$%^&*()');
define('NONCE_SALT',       'MyMeds2025!NonceSalt_Production_Secure_2025!@#$%^&*()');

// WordPress table prefix
\$table_prefix = 'wp_';

// WordPress debugging
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// WordPress URLs
define('WP_HOME', 'https://mymedspharmacyinc.com');
define('WP_SITEURL', 'https://mymedspharmacyinc.com');

// Security
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);
define('FORCE_SSL_ADMIN', true);

// Performance
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('ENFORCE_GZIP', true);

// Memory limits
define('WP_MEMORY_LIMIT', '256M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// File permissions
define('FS_METHOD', 'direct');

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

require_once ABSPATH . 'wp-settings.php';
EOF

# Set WordPress permissions
print_status "Setting WordPress permissions..."
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress

# Create SSL certificate request script
print_status "Creating SSL certificate request script..."
sudo tee /var/www/mymeds/request-ssl.sh > /dev/null <<EOF
#!/bin/bash

# SSL Certificate Request Script
echo "🔒 Requesting SSL certificate for mymedspharmacyinc.com..."

# Request SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com

# Test SSL configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ SSL certificate installed successfully!"
echo "Your site is now available at: https://mymedspharmacyinc.com"
EOF

sudo chmod +x /var/www/mymeds/request-ssl.sh

# Create backup script
print_status "Creating backup script..."
sudo tee /var/www/mymeds/backup.sh > /dev/null <<EOF
#!/bin/bash

# MyMeds Backup Script
BACKUP_DIR="/var/backups/mymeds"
DATE=\$(date +%Y%m%d_%H%M%S)

echo "📦 Creating backup..."

# Create backup directory
mkdir -p \$BACKUP_DIR

# Backup database
mysqldump -u mymeds_user -p'MyMeds2025!SecurePassword' mymeds_db > \$BACKUP_DIR/mymeds_db_\$DATE.sql

# Backup WordPress database
mysqldump -u wp_user -p'WordPress2025!SecurePassword' wordpress_db > \$BACKUP_DIR/wordpress_db_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/mymeds_app_\$DATE.tar.gz /var/www/mymeds

# Backup WordPress files
tar -czf \$BACKUP_DIR/wordpress_\$DATE.tar.gz /var/www/wordpress

# Clean old backups (keep last 7 days)
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completed: \$BACKUP_DIR"
EOF

sudo chmod +x /var/www/mymeds/backup.sh

# Create systemd service for automatic backups
print_status "Creating systemd service for automatic backups..."
sudo tee /etc/systemd/system/mymeds-backup.service > /dev/null <<EOF
[Unit]
Description=MyMeds Backup Service
After=network.target

[Service]
Type=oneshot
User=root
ExecStart=/var/www/mymeds/backup.sh
EOF

sudo tee /etc/systemd/system/mymeds-backup.timer > /dev/null <<EOF
[Unit]
Description=Run MyMeds Backup Daily
Requires=mymeds-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable mymeds-backup.timer
sudo systemctl start mymeds-backup.timer

# Create monitoring script
print_status "Creating monitoring script..."
sudo tee /var/www/mymeds/monitor.sh > /dev/null <<EOF
#!/bin/bash

# MyMeds Monitoring Script
echo "📊 MyMeds System Status"
echo "======================"

# Check services
echo "Services:"
systemctl is-active nginx && echo "✅ Nginx: Active" || echo "❌ Nginx: Inactive"
systemctl is-active mysql && echo "✅ MySQL: Active" || echo "❌ MySQL: Inactive"
systemctl is-active php8.1-fpm && echo "✅ PHP-FPM: Active" || echo "❌ PHP-FPM: Inactive"

# Check PM2 processes
echo -e "\nPM2 Processes:"
pm2 status

# Check disk space
echo -e "\nDisk Usage:"
df -h /var/www

# Check memory usage
echo -e "\nMemory Usage:"
free -h

# Check SSL certificate
echo -e "\nSSL Certificate:"
certbot certificates

# Check logs
echo -e "\nRecent Errors:"
tail -n 10 /var/log/mymeds/backend-error.log 2>/dev/null || echo "No error logs found"
EOF

sudo chmod +x /var/www/mymeds/monitor.sh

# Create README for deployment
print_status "Creating deployment README..."
sudo tee /var/www/mymeds/DEPLOYMENT_README.md > /dev/null <<EOF
# MyMeds Pharmacy VPS Deployment Guide

## 🚀 Quick Start

1. **Upload your code** to `/var/www/mymeds`
2. **Configure environment** variables in `.env.production`
3. **Run deployment**: `./deploy.sh`
4. **Request SSL**: `./request-ssl.sh`

## 📁 Directory Structure

```
/var/www/mymeds/          # MyMeds application
/var/www/wordpress/       # WordPress installation
/var/log/mymeds/          # Application logs
/var/backups/mymeds/      # Backup files
```

## 🔧 Configuration Files

- **Nginx**: `/etc/nginx/sites-available/mymeds`
- **PM2**: `ecosystem.config.js`
- **Environment**: `.env.production`
- **WordPress**: `/var/www/wordpress/wp-config.php`

## 📊 Monitoring

- **System Status**: `./monitor.sh`
- **PM2 Status**: `pm2 status`
- **Nginx Status**: `systemctl status nginx`
- **MySQL Status**: `systemctl status mysql`

## 🔒 SSL Certificate

- **Request**: `./request-ssl.sh`
- **Renewal**: Automatic via certbot
- **Status**: `certbot certificates`

## 💾 Backups

- **Manual**: `./backup.sh`
- **Automatic**: Daily via systemd timer
- **Location**: `/var/backups/mymeds/`

## 🌐 URLs

- **Frontend**: https://mymedspharmacyinc.com
- **Backend API**: https://mymedspharmacyinc.com/api/
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin/
- **WordPress API**: https://mymedspharmacyinc.com/wp-json/

## 🔐 Default Credentials

- **MySQL Root**: Set during installation
- **MyMeds DB User**: mymeds_user
- **WordPress DB User**: wp_user
- **Admin Email**: admin@mymedspharmacyinc.com

## 📝 Environment Variables

Copy `.env.production.template` to `.env.production` and configure:

- Database credentials
- JWT secrets
- WordPress API credentials
- WooCommerce API credentials
- Email SMTP settings

## 🚨 Troubleshooting

- **Check logs**: `/var/log/mymeds/`
- **Check PM2**: `pm2 logs`
- **Check Nginx**: `sudo nginx -t`
- **Check MySQL**: `sudo systemctl status mysql`

## 📞 Support

For issues, check:
1. System logs
2. Application logs
3. Nginx error logs
4. MySQL error logs
EOF

print_success "VPS deployment preparation complete!"
print_status "Next steps:"
echo "1. Upload your MyMeds code to /var/www/mymeds"
echo "2. Configure .env.production with your credentials"
echo "3. Run ./deploy.sh to deploy the application"
echo "4. Run ./request-ssl.sh to get SSL certificate"
echo "5. Access your site at https://mymedspharmacyinc.com"

print_warning "Remember to:"
echo "- Set strong passwords for all services"
echo "- Configure WordPress and WooCommerce integrations"
echo "- Test all features after deployment"
echo "- Set up regular backups"

echo "=================================="
print_success "VPS deployment preparation completed successfully!"
