#!/bin/bash

# Complete VPS Setup Script for MyMeds Pharmacy + WordPress
# VPS IP: 72.60.116.253

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="72.60.116.253"
DOMAIN_NAME=""  # Will be prompted

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

# Function to get domain name
get_domain() {
    echo
    read -p "Enter your domain name (e.g., mymedspharmacyinc.com) or press Enter to skip SSL: " DOMAIN_NAME
    if [ -z "$DOMAIN_NAME" ]; then
        print_warning "No domain provided. Will skip SSL setup."
        DOMAIN_NAME="localhost"
    fi
}

# Update system
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System updated"
}

# Install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    apt install -y \
        curl \
        wget \
        git \
        nginx \
        mysql-server \
        php8.1-fpm \
        php8.1-mysql \
        php8.1-curl \
        php8.1-gd \
        php8.1-intl \
        php8.1-mbstring \
        php8.1-soap \
        php8.1-xml \
        php8.1-zip \
        php8.1-cli \
        nodejs \
        npm \
        pm2 \
        certbot \
        python3-certbot-nginx \
        ufw \
        fail2ban \
        htop \
        unzip \
        build-essential \
        software-properties-common
    
    print_success "Dependencies installed"
}

# Secure MySQL
secure_mysql() {
    print_status "Securing MySQL installation..."
    
    # Start MySQL
    systemctl start mysql
    systemctl enable mysql
    
    # Note: mysql_secure_installation is interactive
    print_warning "MySQL secure installation will start now..."
    print_warning "Follow these prompts:"
    echo "1. Set root password: YES"
    echo "2. Remove anonymous users: YES" 
    echo "3. Disallow root login remotely: YES"
    echo "4. Remove test database: YES"
    echo "5. Reload privilege tables: YES"
    echo
    read -p "Press Enter to continue with MySQL secure installation..."
    
    mysql_secure_installation
}

# Create databases
create_databases() {
    print_status "Creating MySQL databases..."
    
    mysql -u root -p << EOF
-- Create MyMeds database
CREATE DATABASE IF NOT EXISTS mymeds_pharmacy 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create WordPress database
CREATE DATABASE IF NOT EXISTS wordpress_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Create MyMeds user
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'Pharm-23-medS';
GRANT ALL PRIVILEGES ON mymeds_pharmacy.* TO 'mymeds_user'@'localhost';

-- Create WordPress user
CREATE USER IF NOT EXISTS 'wordpress_user'@'localhost' IDENTIFIED BY 'WordPress-2024-Secure';
GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wordpress_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Show databases
SHOW DATABASES;
SELECT 'Users created:' as status;
SELECT User, Host FROM mysql.user WHERE User IN ('mymeds_user', 'wordpress_user');
EOF
    
    print_success "Databases created"
}

# Install and configure WordPress
install_wordpress() {
    print_status "Installing WordPress..."
    
    # Create WordPress directory
    mkdir -p /var/www/wordpress
    cd /tmp
    
    # Download WordPress
    wget -q https://wordpress.org/latest.tar.gz
    tar -xzf latest.tar.gz
    
    # Move WordPress files
    cp -r wordpress/* /var/www/wordpress/
    
    # Set permissions
    chown -R www-data:www-data /var/www/wordpress
    chmod -R 755 /var/www/wordpress
    
    # Configure WordPress
    cp /var/www/wordpress/wp-config-sample.php /var/www/wordpress/wp-config.php
    
    # Update database credentials
    sed -i "s/database_name_here/wordpress_db/g" /var/www/wordpress/wp-config.php
    sed -i "s/username_here/wordpress_user/g" /var/www/wordpress/wp-config.php
    sed -i "s/password_here/WordPress-2024-Secure/g" /var/www/wordpress/wp-config.php
    sed -i "s/localhost/localhost/g" /var/www/wordpress/wp-config.php
    
    # Generate WordPress security keys
    print_status "Generating WordPress security keys..."
    SALT=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/)
    sed -i '/AUTH_KEY\|SECURE_AUTH_KEY\|LOGGED_IN_KEY\|NONCE_KEY\|AUTH_SALT\|SECURE_AUTH_SALT\|LOGGED_IN_SALT\|NONCE_SALT/,+1d' /var/www/wordpress/wp-config.php
    echo "$SALT" >> /var/www/wordpress/wp-config.php
    
    # Clean up
    rm -rf wordpress latest.tar.gz
    
    print_success "WordPress installed and configured"
}

# Configure PHP-FPM
configure_php() {
    print_status "Configuring PHP-FPM..."
    
    # Enable PHP-FPM
    systemctl start php8.1-fpm
    systemctl enable php8.1-fpm
    
    # Update php.ini
    sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 64M/g' /etc/php/8.1/fpm/php.ini
    sed -i 's/post_max_size = 8M/post_max_size = 64M/g' /etc/php/8.1/fpm/php.ini
    sed -i 's/max_execution_time = 30/max_execution_time = 300/g' /etc/php/8.1/fpm/php.ini
    
    # Restart PHP-FPM
    systemctl restart php8.1-fpm
    
    print_success "PHP-FPM configured"
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js..."
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Install PM2 globally
    npm install -g pm2
    
    print_success "Node.js installed"
}

# Configure Nginx
configure_nginx() {
    print_status "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/mymeds-wordpress << EOF
# Main site configuration
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Root for MyMeds
    root / var/www/mymeds/current/dist;
    index index.html index.htm;
    
    # WordPress blog at /blog
    location /blog {
        alias /var/www/wordpress;
        index index.php index.html index.htm;
        try_files \$uri \$uri/ /blog/index.php?\$args;
        
        location ~ \.php\$ {
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME /var/www/wordpress\$fastcgi_script_name;
            fastcgi_pass unix:/run/php/php8.1-fpm.sock;
            fastcgi_index index.php;
        }
    }
    
    # MyMeds frontend
    location / {
        root /var/www/mymeds/current/dist;
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # MyMeds API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:4000/api/health;
        access_log off;
    }
    
    # Security - deny sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql|conf)\$ {
        deny all;
    }
}

# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
EOF
    
    # Enable site
    ln -sf /etc/nginx/sites-available/mymeds-wordpress /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    print_success "Nginx configured"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
    
    print_success "Firewall configured"
}

# Install SSL (if domain provided)
install_ssl() {
    if [ "$DOMAIN_NAME" != "localhost" ]; then
        print_status "Installing SSL certificate..."
        
        certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME
        
        print_success "SSL certificate installed"
    else
        print_warning "Skipping SSL installation (no domain provided)"
    fi
}

# Create initial directory structure for MyMeds
create_mymeds_structure() {
    print_status "Creating MyMeds application structure..."
    
    mkdir -p /var/www/mymeds/{current,backups,logs,uploads}
    
    print_success "MyMeds directories created"
    print_status "Upload your MyMeds project files to: /var/www/mymeds/current/"
}

# Display summary
show_summary() {
    print_success "VPS Setup Complete!"
    echo
    echo "=========================================="
    echo "Setup Summary for VPS: $VPS_IP"
    echo "=========================================="
    
    if [ "$DOMAIN_NAME" != "localhost" ]; then
        echo "Domain: $DOMAIN_NAME"
        echo "WordPress Blog: http://$DOMAIN_NAME/blog"
        echo "MyMeds Site: http://$DOMAIN_NAME"
        echo "Admin Panel: http://$DOMAIN_NAME/admin"
    else
        echo "Domain: IP Only ($VPS_IP)"
        echo "WordPress Blog: http://$VPS_IP/blog"
        echo "MyMeds Site: http://$VPS_IP"
        echo "Admin Panel: http://$VPS_IP/admin"
    fi
    
    echo
    echo "Databases Created:"
    echo "- mymeds_pharmacy (user: mymeds_user)"
    echo "- wordpress_db (user: wordpress_user)"
    echo
    echo "WordPress installed at: /var/www/wordpress"
    echo "MyMeds directory: /var/www/mymeds/current/"
    echo
    echo "Next Steps:"
    echo "1. Upload your MyMeds project to /var/www/mymeds/current/"
    echo "2. Run: cd /var/www/mymeds/current/backend && npm install"
    echo "3. Run: npm run build && pm2 start ecosystem.config.js"
    echo "4. Configure WordPress by visiting /blog"
    echo
    echo "Services Status:"
    systemctl is-active nginx && echo "✓ Nginx: Active" || echo "✗ Nginx: Inactive"
    systemctl is-active mysql && echo "✓ MySQL: Active" || echo "✗ MySQL: Inactive"
    systemctl is-active php8.1-fpm && echo "✓ PHP-FPM: Active" || echo "✗ PHP-FPM: Inactive"
}

# Main function
main() {
    print_status "Starting VPS setup for $VPS_IP..."
    
    get_domain
    update_system
    install_dependencies
    secure_mysql
    create_databases
    install_wordpress
    configure_php
    install_nodejs
    configure_nginx
    configure_firewall
    install_ssl
    create_mymeds_structure
    show_summary
    
    print_success "VPS setup completed successfully!"
}

# Run main function
main "$@"
