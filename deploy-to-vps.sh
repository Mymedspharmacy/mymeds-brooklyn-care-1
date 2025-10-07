#!/bin/bash

# =============================================================================
# MyMeds Pharmacy Inc. - Complete VPS Deployment Script
# =============================================================================
# This script deploys the entire MyMeds Pharmacy system to a VPS
# Including: React Frontend, Node.js Backend, MySQL Database, WordPress/WooCommerce, Nginx, SSL
# =============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration Variables
VPS_IP="72.60.116.253"
VPS_USER="root"
VPS_PASSWORD="Pharm-23-medS"
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

# Function to run commands on VPS
run_vps_command() {
    sshpass -p "$VPS_PASSWORD" ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_IP" "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    sshpass -p "$VPS_PASSWORD" scp -o StrictHostKeyChecking=no -r "$1" "$VPS_USER@$VPS_IP:$2"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists sshpass; then
        print_error "sshpass is not installed. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command_exists brew; then
                brew install hudochenkov/sshpass/sshpass
            else
                print_error "Please install Homebrew first: https://brew.sh/"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            sudo apt-get update && sudo apt-get install -y sshpass
        else
            print_error "Please install sshpass manually for your OS"
            exit 1
        fi
    fi
    
    if ! command_exists rsync; then
        print_error "rsync is not installed. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install rsync
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get install -y rsync
        fi
    fi
    
    print_success "Prerequisites check completed"
}

# Step 1: Update VPS and install system dependencies
setup_system_dependencies() {
    print_status "Setting up system dependencies on VPS..."
    
    run_vps_command "
        # Update system
        apt update && apt upgrade -y
        
        # Install essential packages
        apt install -y curl wget unzip git software-properties-common apt-transport-https ca-certificates gnupg lsb-release
        
        # Install Node.js 18.x
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
        
        # Install MySQL 8.0
        apt install -y mysql-server mysql-client
        
        # Install Nginx
        apt install -y nginx
        
        # Install PHP 8.1 and extensions
        apt install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-mbstring php8.1-xml php8.1-zip php8.1-intl php8.1-bcmath php8.1-soap
        
        # Install PM2 globally
        npm install -g pm2
        
        # Install Certbot for SSL
        apt install -y certbot python3-certbot-nginx
        
        # Install additional utilities
        apt install -y htop nano vim ufw fail2ban
        
        # Start and enable services
        systemctl start nginx mysql php8.1-fpm
        systemctl enable nginx mysql php8.1-fpm
        
        # Configure firewall
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        
        echo 'System dependencies installed successfully'
    "
    
    print_success "System dependencies installed"
}

# Step 2: Configure MySQL Database
configure_database() {
    print_status "Configuring MySQL database..."
    
    run_vps_command "
        # Secure MySQL installation
        mysql -e \"ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';\"
        mysql -e \"DELETE FROM mysql.user WHERE User='';\" || true
        mysql -e \"DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');\" || true
        mysql -e \"DROP DATABASE IF EXISTS test;\" || true
        mysql -e \"DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';\" || true
        mysql -e \"FLUSH PRIVILEGES;\"
        
        # Create databases and users
        mysql -u root -p'$DB_PASSWORD' -e \"
            CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            CREATE DATABASE IF NOT EXISTS $WP_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
            CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
            CREATE USER IF NOT EXISTS '$WP_DB_USER'@'localhost' IDENTIFIED BY '$WP_PASSWORD';
            GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
            GRANT ALL PRIVILEGES ON $WP_DB_NAME.* TO '$WP_DB_USER'@'localhost';
            FLUSH PRIVILEGES;
        \"
        
        # Optimize MySQL configuration
        cat > /etc/mysql/mysql.conf.d/mymeds.cnf << 'EOF'
[mysqld]
# MyMeds Pharmacy MySQL Configuration
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
max_connections = 100
query_cache_size = 32M
query_cache_type = 1
tmp_table_size = 32M
max_heap_table_size = 32M
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
EOF
        
        systemctl restart mysql
        echo 'Database configured successfully'
    "
    
    print_success "Database configured"
}

# Step 3: Create application directories and set permissions
setup_directories() {
    print_status "Setting up application directories..."
    
    run_vps_command "
        # Create directories
        mkdir -p $APP_DIR/{backend,dist,uploads,logs}
        mkdir -p $WORDPRESS_DIR
        mkdir -p $BACKUP_DIR
        mkdir -p /var/log/mymeds-pharmacy
        
        # Set proper permissions
        chown -R www-data:www-data $APP_DIR
        chown -R www-data:www-data $WORDPRESS_DIR
        chmod -R 755 $APP_DIR
        chmod -R 755 $WORDPRESS_DIR
        
        # Create uploads directory with proper permissions
        mkdir -p $APP_DIR/uploads
        chown -R www-data:www-data $APP_DIR/uploads
        chmod -R 755 $APP_DIR/uploads
        
        echo 'Directories created successfully'
    "
    
    print_success "Application directories created"
}

# Step 4: Build and deploy frontend
deploy_frontend() {
    print_status "Building and deploying frontend..."
    
    # Build the React app locally
    print_status "Building React application..."
    npm run build:production
    
    # Copy built files to VPS
    print_status "Copying frontend files to VPS..."
    copy_to_vps "dist/*" "$APP_DIR/dist/"
    
    # Copy static assets
    copy_to_vps "public/*" "$APP_DIR/dist/"
    
    print_success "Frontend deployed"
}

# Step 5: Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    # Copy backend files
    print_status "Copying backend files to VPS..."
    copy_to_vps "backend/*" "$APP_DIR/backend/"
    
    # Install dependencies and build on VPS
    run_vps_command "
        cd $APP_DIR/backend
        
        # Install dependencies
        npm install --production
        
        # Build TypeScript
        npm run build:production
        
        # Generate Prisma client
        npx prisma generate
        
        echo 'Backend built successfully'
    "
    
    print_success "Backend deployed"
}

# Step 6: Setup WordPress and WooCommerce
setup_wordpress_woocommerce() {
    print_status "Setting up WordPress and WooCommerce..."
    
    run_vps_command "
        cd /tmp
        
        # Download WordPress
        wget https://wordpress.org/latest.tar.gz
        tar -xzf latest.tar.gz
        
        # Copy WordPress files
        cp -r wordpress/* $WORDPRESS_DIR/
        
        # Set permissions
        chown -R www-data:www-data $WORDPRESS_DIR
        chmod -R 755 $WORDPRESS_DIR
        
        # Create wp-config.php
        cat > $WORDPRESS_DIR/wp-config.php << 'EOF'
<?php
/**
 * WordPress Configuration for MyMeds Pharmacy
 */

// Database settings
define( 'DB_NAME', '$WP_DB_NAME' );
define( 'DB_USER', '$WP_DB_USER' );
define( 'DB_PASSWORD', '$WP_PASSWORD' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// Authentication keys and salts
define( 'AUTH_KEY',         'mymeds-auth-key-$(openssl rand -hex 32)' );
define( 'SECURE_AUTH_KEY',  'mymeds-secure-auth-key-$(openssl rand -hex 32)' );
define( 'LOGGED_IN_KEY',    'mymeds-logged-in-key-$(openssl rand -hex 32)' );
define( 'NONCE_KEY',        'mymeds-nonce-key-$(openssl rand -hex 32)' );
define( 'AUTH_SALT',        'mymeds-auth-salt-$(openssl rand -hex 32)' );
define( 'SECURE_AUTH_SALT', 'mymeds-secure-auth-salt-$(openssl rand -hex 32)' );
define( 'LOGGED_IN_SALT',   'mymeds-logged-in-salt-$(openssl rand -hex 32)' );
define( 'NONCE_SALT',       'mymeds-nonce-salt-$(openssl rand -hex 32)' );

\$table_prefix = 'wp_';

// WordPress configuration
define( 'WP_HOME', 'https://$DOMAIN/shop' );
define( 'WP_SITEURL', 'https://$DOMAIN/shop' );
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

// Security
define( 'DISALLOW_FILE_EDIT', true );
define( 'DISALLOW_FILE_MODS', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'FORCE_SSL', true );

// Performance
define( 'WP_CACHE', true );
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );

// WooCommerce
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
        
        # Set permissions
        chown -R www-data:www-data $WORDPRESS_DIR
        chmod -R 755 $WORDPRESS_DIR
        
        echo 'WordPress and WooCommerce installed successfully'
    "
    
    print_success "WordPress and WooCommerce installed"
}

# Step 7: Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    run_vps_command "
        # Create Nginx configuration
        cat > /etc/nginx/sites-available/mymeds-pharmacy << 'EOF'
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=contact:10m rate=3r/m;
limit_req_zone \$binary_remote_addr zone=general:10m rate=100r/m;

# Upstream for backend
upstream backend {
    server 127.0.0.1:4000;
    keepalive 32;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
    add_header Strict-Transport-Security \"max-age=31536000; includeSubDomains\" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json application/xml image/svg+xml;
    
    # Frontend (React app)
    location / {
        root $APP_DIR/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
        
        # Cache HTML files for shorter time
        location ~* \\.html\$ {
            expires 1h;
            add_header Cache-Control \"public\";
        }
    }
    
    # Backend API
    location /api {
        limit_req zone=general burst=20 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://backend/api/health;
        access_log off;
    }
    
    # WooCommerce Store (WordPress)
    location /shop {
        alias $WORDPRESS_DIR;
        index index.php index.html;
        try_files \$uri \$uri/ /shop/index.php?\$args;
        
        # PHP processing for WordPress
        location ~ \\.php\$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            include fastcgi_params;
            
            # WordPress specific parameters
            fastcgi_param PATH_INFO \$fastcgi_path_info;
            fastcgi_param PATH_TRANSLATED \$document_root\$fastcgi_path_info;
            
            # Security headers for PHP
            fastcgi_param HTTP_PROXY \"\";
            fastcgi_read_timeout 300;
            fastcgi_connect_timeout 300;
            fastcgi_send_timeout 300;
        }
        
        # Cache static assets for WooCommerce
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
        }
        
        # Security for WordPress uploads
        location ~* /shop/wp-content/uploads/.*\\.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }
    
    # WordPress admin and wp-admin
    location ~ ^/shop/(wp-admin|wp-login\\.php) {
        alias $WORDPRESS_DIR;
        index index.php;
        try_files \$uri \$uri/ /shop/index.php?\$args;
        
        location ~ \\.php\$ {
            fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$request_filename;
            include fastcgi_params;
            fastcgi_param HTTP_PROXY \"\";
        }
    }
    
    # File uploads
    location /uploads {
        alias $APP_DIR/uploads;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        
        # Security for uploads
        location ~* \\.(php|pl|py|jsp|asp|sh|cgi)\$ {
            deny all;
        }
    }
    
    # Deny access to sensitive files
    location ~ /\\. {
        deny all;
    }
    
    location ~ \\.(env|log|sql|conf|config)\$ {
        deny all;
    }
    
    # Deny access to backup files
    location ~ \\.(bak|backup|old|tmp)\$ {
        deny all;
    }
    
    # Rate limiting for API endpoints
    location /api/admin/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Rate limiting for contact forms
    location /api/contact {
        limit_req zone=contact burst=3 nodelay;
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        # Enable site and disable default
        ln -sf /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # Test configuration
        nginx -t
        
        # Restart Nginx
        systemctl restart nginx
        
        echo 'Nginx configured successfully'
    "
    
    print_success "Nginx configured"
}

# Step 8: Setup SSL certificates
setup_ssl_certificates() {
    print_status "Setting up SSL certificates..."
    
    run_vps_command "
        # Get SSL certificate
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $ADMIN_EMAIL --redirect
        
        # Setup auto-renewal
        echo '0 12 * * * /usr/bin/certbot renew --quiet' | crontab -
        
        echo 'SSL certificates configured successfully'
    "
    
    print_success "SSL certificates configured"
}

# Step 9: Configure environment variables
configure_environment() {
    print_status "Configuring environment variables..."
    
    run_vps_command "
        # Create production environment file
        cat > $APP_DIR/backend/.env << 'EOF'
# MyMeds Pharmacy Production Environment Configuration

# Database Configuration
DATABASE_URL=\"mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME\"

# JWT Configuration
JWT_SECRET=\"mymeds-pharmacy-jwt-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)\"
JWT_EXPIRES_IN=\"24h\"

# Application Configuration
NODE_ENV=\"production\"
PORT=4000
CORS_ORIGIN=\"https://$DOMAIN\"

# Admin Credentials
ADMIN_EMAIL=\"$ADMIN_EMAIL\"
ADMIN_PASSWORD=\"$ADMIN_PASSWORD\"
ADMIN_NAME=\"Admin User\"

# Security Configuration
CSRF_SECRET=\"mymeds-pharmacy-csrf-secret-key-minimum-32-characters-long-for-security-production-$(openssl rand -hex 16)\"
BCRYPT_ROUNDS=12

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=\"https://$DOMAIN/shop\"
WOOCOMMERCE_CONSUMER_KEY=\"ck_your_consumer_key_here\"
WOOCOMMERCE_CONSUMER_SECRET=\"cs_your_consumer_secret_here\"

# WordPress Integration
VITE_WORDPRESS_URL=\"https://$DOMAIN/shop\"
VITE_WORDPRESS_API_URL=\"https://$DOMAIN/shop/wp-json/wp/v2\"

# Email Configuration (SMTP)
EMAIL_HOST=\"smtp.office365.com\"
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=\"noreply@$DOMAIN\"
EMAIL_PASS=\"$ADMIN_PASSWORD\"
EMAIL_FROM=\"noreply@$DOMAIN\"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=\"$APP_DIR/uploads\"

# Monitoring and Logging
LOG_LEVEL=\"info\"
LOG_FILE=\"$LOG_DIR/app.log\"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=\"mymeds-pharmacy-session-secret-key-minimum-32-characters-long-$(openssl rand -hex 16)\"
SESSION_MAX_AGE=86400000

# Backup Configuration
BACKUP_DIR=\"$BACKUP_DIR\"
BACKUP_RETENTION_DAYS=30

# Security Headers
SECURITY_HEADERS_ENABLED=true
CSP_REPORT_URI=\"https://$DOMAIN/api/security/csp-report\"

# Performance Configuration
CACHE_ENABLED=true
CACHE_TTL=3600

# Development/Testing Flags
DEBUG_MODE=false
MAINTENANCE_MODE=false
ENABLE_DEBUG_ROUTES=false
EOF
        
        # Set proper permissions
        chown www-data:www-data $APP_DIR/backend/.env
        chmod 600 $APP_DIR/backend/.env
        
        echo 'Environment variables configured successfully'
    "
    
    print_success "Environment variables configured"
}

# Step 10: Setup PM2 process management
setup_pm2() {
    print_status "Setting up PM2 process management..."
    
    run_vps_command "
        # Create PM2 ecosystem file
        cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    cwd: '$APP_DIR/backend',
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
    error_file: '$LOG_DIR/error.log',
    out_file: '$LOG_DIR/out.log',
    log_file: '$LOG_DIR/combined.log',
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
        
        # Start application with PM2
        cd $APP_DIR
        pm2 start ecosystem.config.js --env production
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup script
        pm2 startup systemd -u www-data --hp /var/www
        
        echo 'PM2 configured successfully'
    "
    
    print_success "PM2 configured"
}

# Step 11: Run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    run_vps_command "
        cd $APP_DIR/backend
        
        # Run Prisma migrations
        npx prisma migrate deploy
        
        # Generate Prisma client
        npx prisma generate
        
        echo 'Database migrations completed successfully'
    "
    
    print_success "Database migrations completed"
}

# Step 12: Setup WordPress admin user
setup_wordpress_admin() {
    print_status "Setting up WordPress admin user..."
    
    run_vps_command "
        # Create WordPress admin user via WP-CLI
        cd $WORDPRESS_DIR
        
        # Install WP-CLI
        curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/gh-pages/phar/wp-cli.phar
        chmod +x wp-cli.phar
        mv wp-cli.phar /usr/local/bin/wp
        
        # Create admin user
        wp user create admin $ADMIN_EMAIL --role=administrator --user_pass=$ADMIN_PASSWORD --display_name='Admin User' --first_name='Admin' --last_name='User'
        
        # Activate WooCommerce plugin
        wp plugin activate woocommerce
        
        # Set WooCommerce settings
        wp option update woocommerce_store_address '123 Main Street'
        wp option update woocommerce_store_city 'Brooklyn'
        wp option update woocommerce_store_postcode '11201'
        wp option update woocommerce_default_country 'US:NY'
        wp option update woocommerce_currency 'USD'
        wp option update woocommerce_price_thousand_sep ','
        wp option update woocommerce_price_decimal_sep '.'
        wp option update woocommerce_price_num_decimals 2
        
        echo 'WordPress admin user created successfully'
    "
    
    print_success "WordPress admin user created"
}

# Step 13: Setup automated backups
setup_backups() {
    print_status "Setting up automated backups..."
    
    run_vps_command "
        # Create backup script
        cat > /usr/local/bin/mymeds-backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR=\"$BACKUP_DIR\"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_NAME=\"$DB_NAME\"
WP_DB_NAME=\"$WP_DB_NAME\"
DB_USER=\"$DB_USER\"
WP_DB_USER=\"$WP_DB_USER\"
DB_PASSWORD=\"$DB_PASSWORD\"
WP_PASSWORD=\"$WP_PASSWORD\"
APP_DIR=\"$APP_DIR\"
WORDPRESS_DIR=\"$WORDPRESS_DIR\"

# Create backup directory
mkdir -p \$BACKUP_DIR/\$DATE

# Backup main database
mysqldump -u \$DB_USER -p\$DB_PASSWORD \$DB_NAME > \$BACKUP_DIR/\$DATE/mymeds_production.sql

# Backup WordPress database
mysqldump -u \$WP_DB_USER -p\$WP_PASSWORD \$WP_DB_NAME > \$BACKUP_DIR/\$DATE/mymeds_wordpress.sql

# Backup application files
tar -czf \$BACKUP_DIR/\$DATE/app_files.tar.gz -C \$APP_DIR .

# Backup WordPress files
tar -czf \$BACKUP_DIR/\$DATE/wordpress_files.tar.gz -C \$WORDPRESS_DIR .

# Remove old backups (keep last 7 days)
find \$BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo \"Backup completed: \$DATE\"
EOF
        
        chmod +x /usr/local/bin/mymeds-backup.sh
        
        # Setup daily backup cron job
        echo '0 2 * * * /usr/local/bin/mymeds-backup.sh' | crontab -
        
        # Run initial backup
        /usr/local/bin/mymeds-backup.sh
        
        echo 'Automated backups configured successfully'
    "
    
    print_success "Automated backups configured"
}

# Step 14: Setup monitoring and logging
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    run_vps_command "
        # Create log rotation configuration
        cat > /etc/logrotate.d/mymeds-pharmacy << 'EOF'
$LOG_DIR/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
        
        # Create monitoring script
        cat > /usr/local/bin/mymeds-monitor.sh << 'EOF'
#!/bin/bash

LOG_FILE=\"$LOG_DIR/monitor.log\"
DATE=\$(date '+%Y-%m-%d %H:%M:%S')

# Check if PM2 processes are running
if ! pm2 list | grep -q 'mymeds-backend.*online'; then
    echo \"[\$DATE] ERROR: MyMeds backend is not running\" >> \$LOG_FILE
    pm2 restart mymeds-backend
    echo \"[\$DATE] INFO: Restarted MyMeds backend\" >> \$LOG_FILE
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo \"[\$DATE] ERROR: Nginx is not running\" >> \$LOG_FILE
    systemctl start nginx
    echo \"[\$DATE] INFO: Started Nginx\" >> \$LOG_FILE
fi

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo \"[\$DATE] ERROR: MySQL is not running\" >> \$LOG_FILE
    systemctl start mysql
    echo \"[\$DATE] INFO: Started MySQL\" >> \$LOG_FILE
fi

# Check disk space
DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ \$DISK_USAGE -gt 80 ]; then
    echo \"[\$DATE] WARNING: Disk usage is \$DISK_USAGE%\" >> \$LOG_FILE
fi

# Check memory usage
MEMORY_USAGE=\$(free | awk 'NR==2{printf \"%.2f\", \$3*100/\$2 }')
if (( \$(echo \"\$MEMORY_USAGE > 80\" | bc -l) )); then
    echo \"[\$DATE] WARNING: Memory usage is \$MEMORY_USAGE%\" >> \$LOG_FILE
fi
EOF
        
        chmod +x /usr/local/bin/mymeds-monitor.sh
        
        # Setup monitoring cron job (every 5 minutes)
        echo '*/5 * * * * /usr/local/bin/mymeds-monitor.sh' | crontab -
        
        echo 'Monitoring and logging configured successfully'
    "
    
    print_success "Monitoring and logging configured"
}

# Step 15: Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Wait for services to start
    sleep 30
    
    run_vps_command "
        # Test backend health
        curl -f http://localhost:4000/api/health || echo 'Backend health check failed'
        
        # Test Nginx configuration
        nginx -t
        
        # Check PM2 status
        pm2 status
        
        # Check service status
        systemctl status nginx --no-pager
        systemctl status mysql --no-pager
        systemctl status php8.1-fpm --no-pager
        
        echo 'Deployment tests completed'
    "
    
    print_success "Deployment tests completed"
}

# Step 16: Display deployment summary
display_summary() {
    print_success "=========================================="
    print_success "MyMeds Pharmacy Deployment Complete!"
    print_success "=========================================="
    echo ""
    print_status "🌐 Website URLs:"
    echo "   Main Application: https://$DOMAIN"
    echo "   WooCommerce Store: https://$DOMAIN/shop"
    echo "   Admin Panel: https://$DOMAIN/admin"
    echo "   WordPress Admin: https://$DOMAIN/shop/wp-admin"
    echo ""
    print_status "🔐 Admin Credentials:"
    echo "   Email: $ADMIN_EMAIL"
    echo "   Password: $ADMIN_PASSWORD"
    echo ""
    print_status "🗄️ Database Information:"
    echo "   Main DB: $DB_NAME"
    echo "   WordPress DB: $WP_DB_NAME"
    echo "   DB User: $DB_USER"
    echo "   DB Password: $DB_PASSWORD"
    echo ""
    print_status "📁 Application Directories:"
    echo "   App Directory: $APP_DIR"
    echo "   WordPress Directory: $WORDPRESS_DIR"
    echo "   Backup Directory: $BACKUP_DIR"
    echo "   Log Directory: $LOG_DIR"
    echo ""
    print_status "🔧 Management Commands:"
    echo "   PM2 Status: pm2 status"
    echo "   PM2 Logs: pm2 logs mymeds-backend"
    echo "   Restart App: pm2 restart mymeds-backend"
    echo "   Nginx Reload: systemctl reload nginx"
    echo "   Backup: /usr/local/bin/mymeds-backup.sh"
    echo ""
    print_status "📊 Monitoring:"
    echo "   Health Check: https://$DOMAIN/health"
    echo "   API Health: https://$DOMAIN/api/health"
    echo "   Monitor Logs: tail -f $LOG_DIR/monitor.log"
    echo ""
    print_warning "⚠️  Next Steps:"
    echo "   1. Configure WooCommerce API credentials in WordPress admin"
    echo "   2. Update WooCommerce settings and add products"
    echo "   3. Configure email settings for notifications"
    echo "   4. Test all functionality thoroughly"
    echo "   5. Setup domain DNS if not already done"
    echo ""
    print_success "Deployment completed successfully! 🎉"
}

# Main deployment function
main() {
    print_status "Starting MyMeds Pharmacy VPS Deployment..."
    print_status "VPS IP: $VPS_IP"
    print_status "Domain: $DOMAIN"
    print_status "Admin Email: $ADMIN_EMAIL"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Execute deployment steps
    setup_system_dependencies
    configure_database
    setup_directories
    deploy_frontend
    deploy_backend
    setup_wordpress_woocommerce
    configure_nginx
    setup_ssl_certificates
    configure_environment
    setup_pm2
    run_database_migrations
    setup_wordpress_admin
    setup_backups
    setup_monitoring
    test_deployment
    
    # Display summary
    display_summary
}

# Run main function
main "$@"
