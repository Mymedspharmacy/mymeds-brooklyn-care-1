#!/bin/bash

# =============================================================================
# Nginx Setup Script for MyMeds Pharmacy
# =============================================================================
# This script configures Nginx web server with SSL and security settings
# Domain: mymedspharmacyinc.com
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mymedspharmacyinc.com"
APP_DIR="/var/www/mymeds"
BACKEND_PORT="4000"

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

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    apt update
    apt install -y nginx
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    print_success "Nginx installed successfully"
}

# Function to create main Nginx configuration
create_nginx_config() {
    print_status "Creating main Nginx configuration..."
    
    cat > /etc/nginx/sites-available/mymeds <<'EOF'
# MyMeds Pharmacy Inc. - Comprehensive Nginx Configuration
# Domain: mymedspharmacyinc.com

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/m;

# Main MyMeds Site - HTTP (redirects to HTTPS)
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

# WordPress Blog Subdomain - HTTP
server {
    listen 80;
    server_name blog.mymedspharmacyinc.com;
    return 301 https://blog.$server_name$request_uri;
}

# WooCommerce Shop Subdomain - HTTP
server {
    listen 80;
    server_name shop.mymedspharmacyinc.com;
    return 301 https://shop.$server_name$request_uri;
}

# HTTPS - Main MyMeds Site
server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # Include SSL configuration
    include /etc/nginx/snippets/ssl-mymeds.conf;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Root directory for MyMeds frontend
    root /var/www/html;
    index index.html index.htm;
    
    # Main site location
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # MyMeds Backend API
    location /api {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://localhost:4000/api/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/api/health;
        access_log off;
    }
    
    # File uploads
    location /uploads {
        alias /var/www/mymeds/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|sql|conf)$ {
        deny all;
    }
}

# HTTPS - WordPress Blog
server {
    listen 443 ssl http2;
    server_name blog.mymedspharmacyinc.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # Include SSL configuration
    include /etc/nginx/snippets/ssl-mymeds.conf;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # WordPress Blog root directory
    root /var/www/wordpress/blog;
    index index.php index.html index.htm;
    
    # Main blog location
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    # PHP processing
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_index index.php;
        
        # Security for PHP
        fastcgi_hide_header X-Powered-By;
    }
    
    # WordPress media files
    location ~* \.(css|gif|ico|jpeg|jpg|js|png)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to sensitive files
    location ~ /\.ht {
        deny all;
    }
    
    location ~ /wp-config.php {
        deny all;
    }
    
    location ~ /readme.html {
        deny all;
    }
}

# HTTPS - WooCommerce Shop
server {
        listen 443 ssl http2;
        server_name shop.mymedspharmacyinc.com;
    
        # SSL Configuration
        ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # Include SSL configuration
    include /etc/nginx/snippets/ssl-mymeds.conf;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # WooCommerce Shop root directory
    root /var/www/wordpress/shop;
    index index.php index.html index.htm;
    
    # Main shop location
    location / {
        try_files $uri $uri/ /index.php?$args;
    }
    
    # PHP processing for WooCommerce
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_index index.php;
        
        # Security for PHP
        fastcgi_hide_header X-Powered-By;
        
        # WooCommerce specific settings
        fastcgi_read_timeout 300;
        fastcgi_send_timeout 300;
    }
    
    # WooCommerce assets
    location ~* \.(css|gif|ico|jpeg|jpg|js|png|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # WooCommerce uploads
    location /wp-content/uploads/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security - deny access to sensitive files
    location ~ /\.ht {
        deny all;
    }
    
    location ~ /wp-config.ph$ {
        deny all;
    }
    
    # WooCommerce security headers
    location /wp-admin/ {
        add_header X-Robots-Tag "noindex, nofollow" always;
    }
}
EOF

    print_success "Nginx configuration created"
}

# Function to create SSL configuration snippet
create_ssl_snippet() {
    print_status "Creating SSL configuration snippet..."
    
    cat > /etc/nginx/snippets/ssl-mymeds.conf <<'EOF'
# SSL Configuration for MyMeds Pharmacy
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Strong DH parameters (if available)
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
EOF

    # Create DH parameters if they don't exist
    if [ ! -f /etc/ssl/certs/dhparam.pem ]; then
        print_status "Generating DH parameters (this may take several minutes)..."
        openssl dhparam -out /etc/ssl/certs/dhparam.pem 4096
        chmod 644 /etc/ssl/certs/dhparam.pem
        print_success "DH parameters generated"
    else
        print_success "DH parameters already exist"
    fi
    
    print_success "SSL snippet configuration created"
}

# Function to enable MyMeds site
enable_mymeds_site() {
    print_status "Enabling MyMeds site..."
    
    # Create symbolic link to enable site
    ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    print_success "MyMeds site enabled"
}

# Function to optimize Nginx settings
optimize_nginx() {
    print_status "Optimizing Nginx settings..."
    
    # Backup original configuration
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    
    # Update main nginx configuration
    sed -i '/worker_processes/c\worker_processes auto;' /etc/nginx/nginx.conf
    
    # Add optimization settings
    cat >> /etc/nginx/nginx.conf <<'EOF'

# MyMeds Optimizations
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    keepalive_requests 100;
    client_max_body_size 100M;
    
    # Open file cache
    open_file_cache max=100000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
EOF

    print_success "Nginx optimized"
}

# Function to setup log rotation
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    # Create logrotate configuration for Nginx
    cat > /etc/logrotate.d/mymeds-nginx <<'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
    
    print_success "Log rotation configured"
}

# Function to restart and test Nginx
restart_nginx() {
    print_status "Restarting and testing Nginx..."
    
    # Reload configuration
    systemctl reload nginx
    
    # Test if Nginx is running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx failed to start"
        systemctl status nginx
        return 1
    fi
    
    # Test configuration
    nginx -t
    print_success "Nginx configuration test passed"
}

# Function to create Nginx management script
create_nginx_management_script() {
    print_status "Creating Nginx management script..."
    
    cat > /usr/local/bin/mymeds-nginx.sh <<'EOF'
#!/bin/bash
# MyMeds Nginx Management Script

case "$1" in
    status)
        echo "Nginx Status:"
        systemctl status nginx --no-pager
        ;;
    restart)
        echo "Restarting Nginx..."
        systemctl restart nginx
        ;;
    reload)
        echo "Reloading Nginx configuration..."
        nginx -t && systemctl reload nginx
        ;;
    test)
        echo "Testing Nginx configuration..."
        nginx -t
        ;;
    logs)
        echo "Recent Nginx error logs:"
        tail -n 50 /var/log/nginx/error.log
        ;;
    access)
        echo "Recent Nginx access logs:"
        tail -n 50 /var/log/nginx/access.log
        ;;
    *)
        echo "Usage: $0 {status|restart|reload|test|logs|access}"
        echo "  status  - Show Nginx status"
        echo "  restart - Restart Nginx service"
        echo "  reload  - Reload configuration"
        echo "  test    - Test configuration"
        echo "  logs    - Show error logs"
        echo "  access  - Show access logs"
        exit 1
        ;;
esac
EOF

    chmod +x /usr/local/bin/mymeds-nginx.sh
    
    print_success "Nginx management script created at /usr/local/bin/mymeds-nginx.sh"
}

# Function to create deployment test
test_deployment() {
    print_status "Testing deployment..."
    
    # Test HTTP redirects
    if curl -s -I http://$DOMAIN | grep -q "301\|302"; then
        print_success "HTTP to HTTPS redirect working"
    else
        print_warning "HTTP to HTTPS redirect not working properly"
    fi
    
    # Test domain accessibility
    if curl -s -I https://$DOMAIN > /dev/null; then
        print_success "Main domain accessible via HTTPS"
    else
        print_warning "Main domain not accessible via HTTPS"
    fi
    
    print_success "Deployment testing completed"
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds Nginx Setup Script"
    echo "  Domain: $DOMAIN"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Install Nginx
    install_nginx
    
    # Create main configuration
    create_nginx_config
    
    # Create SSL snippet
    create_ssl_snippet
    
    # Enable site
    enable_mymeds_site
    
    # Optimize Nginx
    optimize_nginx
    
    # Setup log rotation
    setup_log_rotation
    
    # Restart and test
    restart_nginx
    
    # Create management script
    create_nginx_management_script
    
    # Test deployment
    test_deployment
    
    echo ""
    print_success "Nginx setup completed successfully!"
    echo ""
    echo "Nginx Management:"
    echo "• Status: mymeds-nginx.sh status"
    echo "• Restart: mymeds-nginx.sh restart"
    echo "• Reload: mymeds-nginx.sh reload"
    echo "• Test: mymeds-nginx.sh test"
    echo "• Logs: mymeds-nginx.sh logs"
    echo ""
    echo "Configuration Files:"
    echo "• Main config: /etc/nginx/sites-available/mymeds"
    echo "• SSL snippet: /etc/nginx/snippets/ssl-mymeds.conf"
    echo ""
    echo "Sites:"
    echo "• Main site: https://$DOMAIN"
    echo "• Blog: https://blog.$DOMAIN"
    echo "• Shop: https://shop.$DOMAIN"
    echo ""
    print_warning "Note: SSL certificates must be installed before HTTPS will work."
    print_warning "Run './setup-ssl.sh' to obtain SSL certificates."
}

# Run main function
main "$@"




