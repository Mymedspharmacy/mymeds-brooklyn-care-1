#!/bin/bash

# =============================================================================
# SSL Certificate Setup Script for MyMeds Pharmacy
# =============================================================================
# This script automates SSL certificate setup with Let's Encrypt
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
DOMAINS=(
    "mymedspharmacyinc.com"
    "www.mymedspharmacyinc.com"
    "blog.mymedspharmacyinc.com"
    "shop.mymedspharmacyinc.com"
)
EMAIL="admin@mymedspharmacyinc.com"
WEBROOT="/var/www/html"

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

# Function to install Certbot
install_certbot() {
    print_status "Installing Certbot and Nginx plugin..."
    
    # Update package list
    apt update
    
    # Install Certbot with Nginx plugin
    apt install -y certbot python3-certbot-nginx
    
    print_success "Certbot installed successfully"
}

# Function to setup webroot directory
setup_webroot() {
    print_status "Setting up webroot directory..."
    
    # Create webroot directory
    mkdir -p "$WEBROOT"
    
    # Create a simple index.html for domain validation
    cat > "$WEBROOT/index.html" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>MyMeds Pharmacy Inc.</title>
</head>
<body>
    <h1>MyMeds Pharmacy Inc.</h1>
    <p>Setting up SSL certificates...</p>
    <p>This page is temporary during SSL setup.</p>
</body>
</html>
EOF
    
    # Ensure proper permissions
    chown -R www-data:www-data "$WEBROOT"
    chmod -R 755 "$WEBROOT"
    
    print_success "Webroot directory set up"
}

# Function to check DNS resolution
check_dnsesolution() {
    print_status "Checking DNS resolution for domains..."
    
    for domain in "${DOMAINS[@]}"; do
        if nslookup "$domain" > /dev/null 2>&1; then
            print_success "DNS resolved for $domain"
        else
            print_warning "DNS not resolved for $domain"
            print_warning "Please ensure DNS records are configured before proceeding"
        fi
    done
}

# Function to temporarily configure nginx for SSL validation
setup_nginx_temp() {
    print_status "Setting up temporary Nginx configuration for SSL validation..."
    
    # Create basic nginx configuration for SSL validation
    cat > /etc/nginx/sites-available/ssl-temp <<EOF
server {
    listen 80;
    server_name ${DOMAINS[0]} ${DOMAINS[1]};
    
    root $WEBROOT;
    index index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
    
    location ~ /\.well-known/acme-challenge {
        root /var/www/html;
        try_files \$uri =404;
    }
}

server {
    listen 80;
    server_name ${DOMAINS[2]};
    
    root /var/www/wordpress/blog;
    index index.php index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_index index.php;
    }
    
    location ~ /\.well-known/acme-challenge {
        root /var/www/html;
        try_files \$uri =404;
    }
}

server {
    listen 80;
    server_name ${DOMAINS[3]};
    
    root /var/www/wordpress/shop;
    index index.php index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ /index.php?\$args;
    }
    
    location ~ \.php$ {
        include fastcégi_params;
        fastcgi_pass unix:/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
        fastcgi_index index.php;
    }
    
    location ~ /\.well-known/acme-challenge {
        root /var/www/html;
        try_files \$uri =404;
    }
}
EOF
    
    # Enable the temporary configuration
    ln -sf /etc/nginx/sites-available/ssl-temp /etc/nginx/sites-enabled/
    
    # Remove other configurations temporarily
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    
    # Reload nginx
    systemctl reload nginx
    
    print_success "Temporary Nginx configuration applied"
}

# Function to obtain SSL certificates
obtain_ssl_certificates() {
    print_status "Obtaining SSL certificates..."
    
    # Build domain list for certbot
    DOMAIN_ARGS=""
    for domain in "${DOMAINS[@]}"; do
        DOMAIN_ARGS="$DOMAIN_ARGS -d $domain"
    done
    
    # Obtain certificate
    certbot certonly \
        --webroot \
        --webroot-path="$WEBROOT" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        $DOMAIN_ARGS
    
    print_success "SSL certificates obtained successfully"
}

# Function to configure auto-renewal
setup_auto_renewal() {
    print_status "Setting up automatic SSL certificate renewal..."
    
    # Create renewal hook script
    cat > /etc/letsencrypt/renewal-hooks/post/mymeds-renewal.sh <<EOF
#!/bin/bash
# MyMeds SSL renewal hook

# Reload nginx after renewal
systemctl reload nginx

# Log renewal
echo "\$(date): SSL certificate renewed for MyMeds" >> /var/log/ssl-renewal.log
EOF
    
    chmod +x /etc/letsencrypt/renewal-hooks/post/mymeds-renewal.sh
    
    # Add cron job for renewal check
    echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'" | crontab -
    
    # Test renewal
    certbot renew --dry-run
    
    print_success "SSL certificate auto-renewal configured"
}

# Function to verify SSL certificates
verify_ssl_certificates() {
    print_status "Verifying SSL certificates..."
    
    for domain in "${DOMAINS[@]}"; do
        if nslookup "$domain" > /dev/null 2>&1; then
            # Test HTTPS connection
            if curl -s -k "https://$domain" > /dev/null 2>&1; then
                print_success "SSL verification passed for $domain"
            else
                print_warning "SSL verification failed for $domain"
            fi
        fi
    done
    
    # Show certificate information
    certbot certificates
}

# Function to update nginx with SSL
update_nginx_ssl() {
    print_status "Updating Nginx configuration with SSL..."
    
    # Remove temporary configuration
    rm -f /etc/nginx/sites-enabled/ssl-temp
    
    # Copy the main MyMeds nginx configuration
    cp /var/www/mymeds/nginx-combined-config.conf /etc/nginx/sites-available/mymeds
    
    # Enable MyMeds site
    ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    nginx -t
    
    # Reload nginx
    systemctl reload nginx
    
    print_success "Nginx updated with SSL configuration"
}

# Function to create SSL monitoring script
create_ssl_monitoring() {
    print_status "Creating SSL certificate monitoring..."
    
    cat > /usr/local/bin/mymeds-ssl-check.sh <<EOF
#!/bin/bash
# MyMeds SSL Certificate Monitoring

DOMAINS=(
    "mymedspharmacyinc.com"
    "www.mymedspharmacyinc.com"
    "blog.mymedspharmacyinc.com"
    "shop.mymedspharmacyinc.com"
)

LOG_FILE="/var/log/mymeds-ssl-monitor.log"

check_ssl_expiry() {
    local domain=\$1
    local expiry_date=\$(echo | openssl s_client -servername \$domain -connect \$domain:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [ -n "\$expiry_date" ]; then
        local expiry_epoch=\$(date -d "\$expiry_date" +%s)
        local current_epoch=\$(date +%s)
        local days_until_expiry=\$(( (\$expiry_epoch - \$current_epoch) / 86400 ))
        
        if [ \$days_until_expiry -le 30 ]; then
            echo "\$(date): WARNING - SSL certificate for \$domain expires in \$days_until_expiry days" >> \$LOG_FILE
        else
            echo "\$(date): SSL certificate for \$domain expires in \$days_until_expiry days" >> \$LOG_FILE
        fi
    else
        echo "\$(date): ERROR - Could not check SSL expiry for \$domain" >> \$LOG_FILE
    fi
}

# Check all domains
for domain in "\${DOMAINS[@]}"; do
    check_ssl_expiry \$domain
done
EOF
    
    chmod +x /usr/local/bin/mymeds-ssl-check.sh
    
    # Add weekly SSL check to cron
    echo "0 9 * * 1 /usr/local/bin/mymeds-ssl-check.sh" | crontab -
    
    print_success "SSL monitoring configured"
}

# Function to setup SSL security headers
setup_ssl_security() {
    print_status "Setting up SSL security configurations..."
    
    # Generate strong DH parameters (this takes time but is important for security)
    print_status "Generating DH parameters (this may take several minutes)..."
    openssl dhparam -out /etc/ssl/certs/dhparam.pem 4096
    
    # Create SSL configuration file
    cat > /etc/nginx/snippets/ssl-mymeds.conf <<EOF
# SSL Configuration for MyMeds Pharmacy
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# Security headers
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;

# Use strong DH parameters
ssl_dhparam /etc/ssl/certs/dhparam.pem;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/mymedspharmacyinc.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
EOF
    
    print_success "SSL security configurations applied"
}

# Function to create SSL certificate backup
create_ssl_backup() {
    print_status "Creating SSL certificate backup..."
    
    # Create backup script
    cat > /usr/local/bin/mymeds-ssl-backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/backups/ssl/\$(date +%Y%m)"
mkdir -p \$BACKUP_DIR

# Backup certificates
cp -r /etc/letsencrypt/live/\*/ \$BACKUP_DIR/
cp -r /etc/letsencrypt/archive/\*/ \$BACKUP_DIR/

# Compress backup
tar -czf \$BACKUP_DIR/mymeds-ssl-backup-\$(date +%Y%m%d).tar.gz -C \$BACKUP_DIR .

# Keep only last 3 months of backups
find /backups/ssl -name "*.tar.gz" -mtime +90 -delete

echo "\$(date): SSL certificates backed up" >> /var/log/mymeds-backup.log
EOF
    
    chmod +x /usr/local/bin/mymeds-ssl-backup.sh
    
    # Add monthly backup to cron
    echo "0 2 1 * * /usr/local/bin/mymeds-ssl-backup.sh" | crontab -
    
    # Run initial backup
    /usr/local/bin/mymeds-ssl-backup.sh
    
    print_success "SSL certificate backup configured"
}

# Function to test SSL configuration
test_ssl_configuration() {
    print_status "Testing SSL configuration..."
    
    # Test HTTPS connection for main domain
    if curl -s "https://${DOMAINS[0]}" > /dev/null; then
        print_success "HTTPS connection working for ${DOMAINS[0]}"
    else
        print_warning "HTTPS connection failed for ${DOMAINS[0]}"
    fi
    
    # Test certificate validity
    if openssl x509 -in /etc/letsencrypt/live/${DOMAINS[0]}/cert.pem -text -noout | grep -q "MyMeds"; then
        print_success "Certificate information looks correct"
    fi
    
    # Test nginx SSL configuration
    nginx -t
    
    print_success "SSL configuration testing completed"
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds SSL Setup Script"
    echo "  Domains: ${DOMAINS[*]}"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Install Certbot
    install_certbot
    
    # Setup webroot
    setup_webroot
    
    # Check DNS resolution
    check_dnsesolution
    
    read -p "Press Enter to continue with SSL certificate setup..."
    
    # Setup temporary nginx configuration
    setup_nginx_temp
    
    # Obtain SSL certificates
    obtain_ssl_certificates
    
    # Configure auto-renewal
    setup_auto_renewal
    
    # Update nginx with SSL
    update_nginx_ssl
    
    # Setup SSL security
    setup_ssl_security
    
    # Create SSL monitoring
    create_ssl_monitoring
    
    # Create SSL backup
    create_ssl_backup
    
    # Test SSL configuration
    test_ssl_configuration
    
    # Verify certificates
    verify_ssl_certificates
    
    echo ""
    print_success "SSL setup completed successfully!"
    echo ""
    echo "SSL Certificates installed for:"
    for domain in "${DOMAINS[@]}"; do
        echo "  - https://$domain"
    done
    echo ""
    echo "SSL Management:"
    echo "  - View certificates: certbot certificates"
    echo "  - Manual renewal: certbot renew"
    echo "  - SSL check logs: tail -f /var/log/mymeds-ssl-monitor.log"
    echo ""
    echo "Next steps:"
    echo "1. Update DNS to point domains to your VPS"
    echo "2. Test all HTTPS endpoints"
    echo "3. Run the main deployment script: ./deploy-mymeds.sh"
}

# Run main function
main "$@"




