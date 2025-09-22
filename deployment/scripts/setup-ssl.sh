#!/bin/bash
# =============================================================================
# SSL CERTIFICATE SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Sets up Let's Encrypt SSL certificates with automated renewal
# =============================================================================

set -e

echo "🔐 MyMeds Pharmacy Inc. - SSL Certificate Setup"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# CONFIGURATION
# =============================================================================
DOMAIN="mymedspharmacyinc.com"
WWW_DOMAIN="www.mymedspharmacyinc.com"
EMAIL="admin@mymedspharmacyinc.com"
VPS_IP="72.60.116.253"
SSL_DIR="/etc/letsencrypt"
WEBROOT_DIR="/var/www/certbot"
NGINX_CONF_DIR="/etc/nginx/conf.d"
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"

# =============================================================================
# PRE-REQUISITE CHECKS
# =============================================================================
log_info "Performing prerequisite checks..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root"
    exit 1
fi

# Check if domain is accessible
log_info "Checking domain accessibility..."
if ! curl -s "http://$DOMAIN" >/dev/null 2>&1; then
    log_warning "Domain $DOMAIN is not accessible via HTTP"
    log_info "Please ensure:"
    echo "1. Domain DNS points to this server ($VPS_IP)"
    echo "2. Port 80 is open and accessible"
    echo "3. Nginx is running and serving the domain"
    echo ""
    log_info "Current server IP: $VPS_IP"
    log_info "Please update your DNS A record to point to: $VPS_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log_info "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    log_success "Certbot installed"
else
    log_success "Certbot is already installed"
fi

# =============================================================================
# CREATE WEBROOT DIRECTORY
# =============================================================================
log_info "Setting up webroot directory..."

mkdir -p "$WEBROOT_DIR"
chown -R www-data:www-data "$WEBROOT_DIR"
chmod -R 755 "$WEBROOT_DIR"

log_success "Webroot directory created"

# =============================================================================
# CREATE NGINX CONFIGURATION FOR CERTBOT
# =============================================================================
log_info "Creating Nginx configuration for Certbot..."

cat > "$NGINX_CONF_DIR/certbot.conf" << 'EOF'
# Certbot challenge location
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

log_success "Nginx configuration for Certbot created"

# =============================================================================
# RESTART NGINX
# =============================================================================
log_info "Restarting Nginx..."

# Test Nginx configuration
if nginx -t; then
    systemctl reload nginx
    log_success "Nginx reloaded successfully"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

# =============================================================================
# OBTAIN SSL CERTIFICATES
# =============================================================================
log_info "Obtaining SSL certificates from Let's Encrypt..."

# Stop any existing containers that might be using port 80
log_info "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down nginx || true

# Wait a moment for port to be free
sleep 5

# Obtain certificates
certbot certonly \
    --webroot \
    --webroot-path="$WEBROOT_DIR" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN,$WWW_DOMAIN" \
    --non-interactive \
    --expand

if [ $? -eq 0 ]; then
    log_success "SSL certificates obtained successfully"
else
    log_error "Failed to obtain SSL certificates"
    exit 1
fi

# =============================================================================
# CREATE SSL CONFIGURATION FOR NGINX
# =============================================================================
log_info "Creating SSL configuration for Nginx..."

cat > "$NGINX_CONF_DIR/ssl.conf" << 'EOF'
# SSL Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/chain.pem;

# Security headers
add_header Strict-Transport-Security "max-age=63072000" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

log_success "SSL configuration created"

# =============================================================================
# UPDATE MAIN NGINX CONFIGURATION
# =============================================================================
log_info "Updating main Nginx configuration for SSL..."

# Backup original configuration
cp "$NGINX_CONF_DIR/mymeds.conf" "$NGINX_CONF_DIR/mymeds.conf.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true

# Create new SSL-enabled configuration
cat > "$NGINX_CONF_DIR/mymeds.conf" << 'EOF'
# Include SSL configuration
include /etc/nginx/conf.d/ssl.conf;

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name mymedspharmacyinc.com www.mymedspharmacyinc.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mymedspharmacyinc.com/privkey.pem;
    
    # Include SSL configuration
    include /etc/nginx/conf.d/ssl.conf;
    
    # Upstream servers
    upstream mymeds_backend {
        server mymeds-app:4000;
        keepalive 32;
    }
    
    upstream mymeds_frontend {
        server mymeds-app:3000;
        keepalive 32;
    }
    
    upstream wordpress_backend {
        server wordpress:80;
        keepalive 32;
    }
    
    # WordPress Admin & WooCommerce
    location /wp-admin/ {
        proxy_pass http://wordpress_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /wp-json/ {
        proxy_pass http://wordpress_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    location /wp-content/ {
        proxy_pass http://wordpress_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Blog routes
    location /blog/ {
        proxy_pass http://wordpress_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Shop routes
    location /shop/ {
        proxy_pass http://wordpress_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # WooCommerce API
    location /wc-api/ {
        proxy_pass http://wordpress_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # MyMeds API routes
    location /api/ {
        proxy_pass http://mymeds_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://mymeds_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # File uploads
    location /uploads/ {
        proxy_pass http://mymeds_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # MyMeds frontend routes
    location / {
        proxy_pass http://mymeds_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://mymeds_frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }
    
    # Health check
    location /health {
        proxy_pass http://mymeds_backend/api/health;
        access_log off;
    }
    
    # Security
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ /(\.env|\.git|\.htaccess|\.htpasswd) {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(bak|backup|sql|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

log_success "Main Nginx configuration updated for SSL"

# =============================================================================
# TEST NGINX CONFIGURATION
# =============================================================================
log_info "Testing Nginx configuration..."

if nginx -t; then
    log_success "Nginx configuration is valid"
else
    log_error "Nginx configuration test failed"
    exit 1
fi

# =============================================================================
# RESTART NGINX
# =============================================================================
log_info "Restarting Nginx with SSL configuration..."

systemctl restart nginx

if [ $? -eq 0 ]; then
    log_success "Nginx restarted successfully"
else
    log_error "Failed to restart Nginx"
    exit 1
fi

# =============================================================================
# SET UP AUTOMATED RENEWAL
# =============================================================================
log_info "Setting up automated SSL certificate renewal..."

# Create renewal script
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

echo "🔄 Checking SSL certificate renewal..."

# Renew certificates
certbot renew --quiet --webroot --webroot-path=/var/www/certbot

# Check if renewal was successful
if [ $? -eq 0 ]; then
    echo "✅ SSL certificates renewed successfully"
    
    # Test Nginx configuration
    if nginx -t; then
        # Reload Nginx
        systemctl reload nginx
        echo "✅ Nginx reloaded with new certificates"
        
        # Restart Docker containers if they're running
        if docker-compose -f /var/www/mymeds/docker-compose.optimized.yml ps | grep -q "Up"; then
            echo "🔄 Restarting Docker containers..."
            cd /var/www/mymeds
            docker-compose -f docker-compose.optimized.yml restart nginx
            echo "✅ Docker containers restarted"
        fi
    else
        echo "❌ Nginx configuration test failed after renewal"
        exit 1
    fi
else
    echo "❌ SSL certificate renewal failed"
    exit 1
fi

echo "🎉 SSL renewal process completed"
EOF

# Make renewal script executable
chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab (run twice daily)
(crontab -l 2>/dev/null; echo "0 2,14 * * * /usr/local/bin/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1") | crontab -

log_success "Automated renewal configured"

# =============================================================================
# CREATE SSL MONITORING SCRIPT
# =============================================================================
log_info "Creating SSL monitoring script..."

cat > /usr/local/bin/ssl-monitor.sh << 'EOF'
#!/bin/bash
# SSL Certificate Monitoring Script

DOMAIN="mymedspharmacyinc.com"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
LOG_FILE="/var/log/ssl-monitor.log"

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Check if certificate exists
if [ ! -f "$CERT_PATH" ]; then
    log_message "ERROR: SSL certificate not found at $CERT_PATH"
    exit 1
fi

# Get certificate expiration date
EXPIRY_DATE=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))

log_message "SSL certificate expires in $DAYS_UNTIL_EXPIRY days"

# Alert if certificate expires in less than 30 days
if [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
    log_message "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days"
    
    # Send email alert (if configured)
    if [ -n "$ALERT_EMAIL" ]; then
        echo "SSL certificate for $DOMAIN expires in $DAYS_UNTIL_EXPIRY days" | \
        mail -s "SSL Certificate Expiry Warning" "$ALERT_EMAIL"
    fi
fi

# Test SSL connection
if curl -s "https://$DOMAIN" >/dev/null 2>&1; then
    log_message "SSL connection test passed"
else
    log_message "ERROR: SSL connection test failed"
fi
EOF

# Make monitoring script executable
chmod +x /usr/local/bin/ssl-monitor.sh

# Add to crontab (run daily)
(crontab -l 2>/dev/null; echo "0 6 * * * /usr/local/bin/ssl-monitor.sh") | crontab -

log_success "SSL monitoring configured"

# =============================================================================
# UPDATE DOCKER COMPOSE FOR SSL VOLUMES
# =============================================================================
log_info "Updating Docker Compose for SSL volume mounting..."

# Create SSL volume mount configuration
cat > /tmp/ssl-volumes.yml << 'EOF'
# SSL Volume Configuration for Docker Compose
# Add these volumes to your nginx service:

volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - /var/www/certbot:/var/www/certbot:ro
  - /etc/nginx/conf.d:/etc/nginx/conf.d:ro
EOF

log_info "SSL volume configuration created at /tmp/ssl-volumes.yml"
log_info "Please manually add these volumes to your nginx service in docker-compose.optimized.yml"

# =============================================================================
# VERIFY SSL SETUP
# =============================================================================
log_info "Verifying SSL setup..."

# Wait a moment for Nginx to fully start
sleep 5

# Test HTTPS connection
if curl -s "https://$DOMAIN" >/dev/null 2>&1; then
    log_success "HTTPS connection test passed"
else
    log_warning "HTTPS connection test failed - this may be normal if containers aren't running"
fi

# Check certificate details
log_info "SSL Certificate Details:"
openssl x509 -in "$SSL_DIR/live/$DOMAIN/fullchain.pem" -text -noout | grep -E "(Subject:|Not Before|Not After|Issuer:)"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 SSL setup completed successfully!"
echo ""
log_info "SSL Configuration Summary:"
echo "============================="
echo "✅ Let's Encrypt certificates obtained"
echo "✅ Nginx configured for HTTPS"
echo "✅ Automated renewal configured (twice daily)"
echo "✅ SSL monitoring configured (daily)"
echo "✅ Security headers configured"
echo "✅ HTTP to HTTPS redirect configured"
echo ""
log_info "Certificate Details:"
echo "======================"
echo "Domain: $DOMAIN"
echo "WWW Domain: $WWW_DOMAIN"
echo "Certificate Path: $SSL_DIR/live/$DOMAIN/"
echo "Webroot: $WEBROOT_DIR"
echo ""
log_info "Service URLs:"
echo "=============="
echo "🌐 HTTPS Frontend: https://$DOMAIN"
echo "🔧 HTTPS Backend API: https://$DOMAIN/api"
echo "📝 HTTPS WordPress Admin: https://$DOMAIN/wp-admin"
echo "🛒 HTTPS WooCommerce Shop: https://$DOMAIN/shop"
echo "📖 HTTPS Blog: https://$DOMAIN/blog"
echo "📝 HTTPS Blog Admin: https://$DOMAIN/blog/wp-admin"
echo ""
log_info "Next Steps:"
echo "============"
echo "1. Update your Docker Compose file to mount SSL volumes"
echo "2. Restart your Docker containers"
echo "3. Test all HTTPS endpoints"
echo "4. Monitor SSL certificate expiration"
echo "5. Set up email alerts for certificate expiry"
echo ""
log_info "Monitoring Commands:"
echo "======================"
echo "Check certificate status: certbot certificates"
echo "Test renewal: certbot renew --dry-run"
echo "View renewal logs: tail -f /var/log/ssl-renewal.log"
echo "View monitoring logs: tail -f /var/log/ssl-monitor.log"
echo "Check Nginx status: systemctl status nginx"
echo ""
log_success "🔐 Your MyMeds Pharmacy is now secured with SSL!"
