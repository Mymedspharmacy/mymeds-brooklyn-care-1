#!/bin/bash

# =============================================================================
# MyMeds Pharmacy Inc. - Simplified VPS Deployment Script
# =============================================================================
# This is a simplified version for manual execution on the VPS
# Run this script directly on your VPS as root user
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Variables
DOMAIN="mymedspharmacyinc.com"
ADMIN_EMAIL="mymedspharmacyinc@gmail.com"
ADMIN_PASSWORD="Pharm-23-medS"
DB_PASSWORD="Pharm-23-medS"
WP_PASSWORD="Pharm-23-medS"

# Application paths
APP_DIR="/var/www/mymeds-pharmacy"
WORDPRESS_DIR="/var/www/wordpress"
BACKUP_DIR="/var/backups/mymeds-pharmacy"
LOG_DIR="/var/www/mymeds-pharmacy/logs"

# Database configuration
DB_NAME="mymeds_production"
WP_DB_NAME="mymeds_wordpress"
DB_USER="mymeds_user"
WP_DB_USER="mymeds_wordpress_user"

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
if [ "$EUID" -ne 0 ]; then
    print_error "Please run this script as root"
    exit 1
fi

print_status "Starting MyMeds Pharmacy VPS Deployment..."
print_status "Domain: $DOMAIN"
print_status "Admin Email: $ADMIN_EMAIL"
echo ""

# Step 1: Update system and install dependencies
print_status "Installing system dependencies..."
apt update && apt upgrade -y
apt install -y curl wget unzip git software-properties-common apt-transport-https ca-certificates gnupg lsb-release
apt install -y mysql-server mysql-client nginx php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-intl php8.1-bcmath php8.1-soap
apt install -y certbot python3-certbot-nginx htop nano vim ufw fail2ban

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 globally
npm install -g pm2

# Start and enable services
systemctl start nginx mysql php8.1-fpm
systemctl enable nginx mysql php8.1-fpm

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_success "System dependencies installed"

# Step 2: Configure MySQL
print_status "Configuring MySQL database..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';"
mysql -e "DELETE FROM mysql.user WHERE User='';" || true
mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" || true
mysql -e "DROP DATABASE IF EXISTS test;" || true
mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" || true
mysql -e "FLUSH PRIVILEGES;"

# Create databases and users
mysql -u root -p"$DB_PASSWORD" -e "
    CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE DATABASE IF NOT EXISTS $WP_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
    CREATE USER IF NOT EXISTS '$WP_DB_USER'@'localhost' IDENTIFIED BY '$WP_PASSWORD';
    GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
    GRANT ALL PRIVILEGES ON $WP_DB_NAME.* TO '$WP_DB_USER'@'localhost';
    FLUSH PRIVILEGES;
"

print_success "Database configured"

# Step 3: Create directories
print_status "Creating application directories..."
mkdir -p $APP_DIR/{backend,dist,uploads,logs}
mkdir -p $WORDPRESS_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/mymeds-pharmacy

chown -R www-data:www-data $APP_DIR
chown -R www-data:www-data $WORDPRESS_DIR
chmod -R 755 $APP_DIR
chmod -R 755 $WORDPRESS_DIR

print_success "Directories created"

# Step 4: Download and setup WordPress
print_status "Installing WordPress and WooCommerce..."
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz
cp -r wordpress/* $WORDPRESS_DIR/

# Create wp-config.php
cat > $WORDPRESS_DIR/wp-config.php << 'EOF'
<?php
define( 'DB_NAME', 'mymeds_wordpress' );
define( 'DB_USER', 'mymeds_wordpress_user' );
define( 'DB_PASSWORD', 'Pharm-23-medS' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

define( 'AUTH_KEY',         'mymeds-auth-key-' . bin2hex(random_bytes(32)) );
define( 'SECURE_AUTH_KEY',  'mymeds-secure-auth-key-' . bin2hex(random_bytes(32)) );
define( 'LOGGED_IN_KEY',    'mymeds-logged-in-key-' . bin2hex(random_bytes(32)) );
define( 'NONCE_KEY',        'mymeds-nonce-key-' . bin2hex(random_bytes(32)) );
define( 'AUTH_SALT',        'mymeds-auth-salt-' . bin2hex(random_bytes(32)) );
define( 'SECURE_AUTH_SALT', 'mymeds-secure-auth-salt-' . bin2hex(random_bytes(32)) );
define( 'LOGGED_IN_SALT',   'mymeds-logged-in-salt-' . bin2hex(random_bytes(32)) );
define( 'NONCE_SALT',       'mymeds-nonce-salt-' . bin2hex(random_bytes(32)) );

$table_prefix = 'wp_';

define( 'WP_HOME', 'https://mymedspharmacyinc.com/shop' );
define( 'WP_SITEURL', 'https://mymedspharmacyinc.com/shop' );
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

define( 'DISALLOW_FILE_EDIT', true );
define( 'DISALLOW_FILE_MODS', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'FORCE_SSL', true );

define( 'WP_CACHE', true );
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );

define( 'WOOCOMMERCE_API_ENABLED', true );
define( 'WOOCOMMERCE_API_VERSION', 'wc/v3' );

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
EOF

# Download WooCommerce plugin
cd $WORDPRESS_DIR/wp-content/plugins
wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip woocommerce.latest-stable.zip
rm woocommerce.latest-stable.zip

chown -R www-data:www-data $WORDPRESS_DIR
chmod -R 755 $WORDPRESS_DIR

print_success "WordPress and WooCommerce installed"

# Step 5: Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/mymeds-pharmacy << 'EOF'
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=contact:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;

upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json application/xml image/svg+xml;
    
    location / {
        root /var/www/mymeds-pharmacy/dist;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    location /api {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    location /health {
        proxy_pass http://backend/api/health;
        access_log off;
    }
    
    location /shop {
        alias /var/www/wordpress;
        index index.php index.html;
        try_files $uri $uri/ /shop/index.php?$args;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
            
            fastcgi_param PATH_INFO $fastcgi_path_info;
            fastcgi_param PATH_TRANSLATED $document_root$fastcgi_path_info;
            
            fastcgi_param HTTP_PROXY "";
            fastcgi_read_timeout 300;
            fastcgi_connect_timeout 300;
            fastcgi_send_timeout 300;
        }
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location ~* /shop/wp-content/uploads/.*\.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    location ~ ^/shop/(wp-admin|wp-login\.php) {
        alias /var/www/wordpress;
        index index.php;
        try_files $uri $uri/ /shop/index.php?$args;
        
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
            fastcgi_param HTTP_PROXY "";
        }
    }
    
    location /uploads {
        alias /var/www/mymeds-pharmacy/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }
    
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql|conf|config)$ {
        deny all;
    }
    
    location ~ \.(bak|backup|old|tmp)$ {
        deny all;
    }
    
    location /api/admin/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/contact {
        limit_req zone=contact burst=3 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

print_success "Nginx configured"

# Step 6: Get SSL certificate
print_status "Setting up SSL certificate..."
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect

# Setup auto-renewal
echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -

print_success "SSL certificate configured"

# Step 7: Create environment file
print_status "Creating environment configuration..."
cat > $APP_DIR/backend/.env << EOF
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
JWT_SECRET="mymeds-pharmacy-jwt-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)"
JWT_EXPIRES_IN="24h"
NODE_ENV="production"
PORT=4000
CORS_ORIGIN="https://$DOMAIN"
ADMIN_EMAIL="$ADMIN_EMAIL"
ADMIN_PASSWORD="$ADMIN_PASSWORD"
ADMIN_NAME="Admin User"
CSRF_SECRET="mymeds-pharmacy-csrf-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)"
BCRYPT_ROUNDS=12
WOOCOMMERCE_STORE_URL="https://$DOMAIN/shop"
WOOCOMMERCE_CONSUMER_KEY="ck_your_consumer_key_here"
WOOCOMMERCE_CONSUMER_SECRET="cs_your_consumer_secret_here"
VITE_WORDPRESS_URL="https://$DOMAIN/shop"
VITE_WORDPRESS_API_URL="https://$DOMAIN/shop/wp-json/wp/v2"
EMAIL_HOST="smtp.office365.com"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER="noreply@$DOMAIN"
EMAIL_PASS="$ADMIN_PASSWORD"
EMAIL_FROM="noreply@$DOMAIN"
MAX_FILE_SIZE=10485760
UPLOAD_DIR="$APP_DIR/uploads"
LOG_LEVEL="info"
LOG_FILE="$LOG_DIR/app.log"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET="mymeds-pharmacy-session-secret-key-minimum-32-characters-long-$(openssl rand -hex 16)"
SESSION_MAX_AGE=86400000
BACKUP_DIR="$BACKUP_DIR"
BACKUP_RETENTION_DAYS=30
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI="https://$DOMAIN/api/security/csp-report"
CACHE_ENABLED=true
CACHE_TTL=3600
DEBUG_MODE=false
MAINTENANCE_MODE=false
ENABLE_DEBUG_ROUTES=false
EOF

chown www-data:www-data $APP_DIR/backend/.env
chmod 600 $APP_DIR/backend/.env

print_success "Environment configured"

# Step 8: Create PM2 configuration
print_status "Setting up PM2..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    cwd: '/var/www/mymeds-pharmacy/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/www/mymeds-pharmacy/logs/error.log',
    out_file: '/var/www/mymeds-pharmacy/logs/out.log',
    log_file: '/var/www/mymeds-pharmacy/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000
  }]
};
EOF

print_success "PM2 configuration created"

# Step 9: Setup backup script
print_status "Setting up automated backups..."
cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/mymeds-pharmacy"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="mymeds_production"
WP_DB_NAME="mymeds_wordpress"
DB_USER="mymeds_user"
WP_DB_USER="mymeds_wordpress_user"
DB_PASSWORD="Pharm-23-medS"
WP_PASSWORD="Pharm-23-medS"
APP_DIR="/var/www/mymeds-pharmacy"
WORDPRESS_DIR="/var/www/wordpress"

mkdir -p $BACKUP_DIR/$DATE

mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/$DATE/mymeds_production.sql
mysqldump -u $WP_DB_USER -p$WP_PASSWORD $WP_DB_NAME > $BACKUP_DIR/$DATE/mymeds_wordpress.sql
tar -czf $BACKUP_DIR/$DATE/app_files.tar.gz -C $APP_DIR .
tar -czf $BACKUP_DIR/$DATE/wordpress_files.tar.gz -C $WORDPRESS_DIR .

find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $DATE"
EOF

chmod +x /usr/local/bin/mymeds-backup.sh
echo '0 2 * * * /usr/local/bin/mymeds-backup.sh' | crontab -

print_success "Backup system configured"

print_success "=========================================="
print_success "VPS Setup Complete!"
print_success "=========================================="
echo ""
print_status "Next steps:"
echo "1. Upload your application files to the VPS:"
echo "   - Copy 'dist/' folder to /var/www/mymeds-pharmacy/dist/"
echo "   - Copy 'backend/' folder to /var/www/mymeds-pharmacy/backend/"
echo ""
echo "2. Install dependencies and start the application:"
echo "   cd /var/www/mymeds-pharmacy/backend"
echo "   npm install --production"
echo "   npm run build:production"
echo "   npx prisma migrate deploy"
echo "   npx prisma generate"
echo "   pm2 start ecosystem.config.js --env production"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "3. Complete WordPress setup:"
echo "   - Visit https://mymedspharmacyinc.com/shop/wp-admin/install.php"
echo "   - Create admin user with email: $ADMIN_EMAIL"
echo "   - Activate WooCommerce plugin"
echo ""
print_status "Admin Credentials:"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
echo ""
print_status "Application URLs:"
echo "Main App: https://$DOMAIN"
echo "WooCommerce Store: https://$DOMAIN/shop"
echo "Admin Panel: https://$DOMAIN/admin"
echo ""
print_success "VPS setup completed! 🎉"


