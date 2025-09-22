#!/bin/bash
# =============================================================================
# SSL HEALTH CHECK SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Comprehensive SSL certificate monitoring and validation
# =============================================================================

set -e

echo "🔍 MyMeds Pharmacy Inc. - SSL Health Check"
echo "=========================================="

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
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
KEY_PATH="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
CHAIN_PATH="/etc/letsencrypt/live/$DOMAIN/chain.pem"
LOG_FILE="/var/log/ssl-health-check.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@mymedspharmacyinc.com}"

# =============================================================================
# LOGGING FUNCTION
# =============================================================================
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# =============================================================================
# SSL CERTIFICATE VALIDATION
# =============================================================================
check_certificate_exists() {
    log_info "Checking SSL certificate files..."
    
    local all_files_exist=true
    
    if [ ! -f "$CERT_PATH" ]; then
        log_error "Certificate file not found: $CERT_PATH"
        all_files_exist=false
    fi
    
    if [ ! -f "$KEY_PATH" ]; then
        log_error "Private key file not found: $KEY_PATH"
        all_files_exist=false
    fi
    
    if [ ! -f "$CHAIN_PATH" ]; then
        log_error "Chain file not found: $CHAIN_PATH"
        all_files_exist=false
    fi
    
    if [ "$all_files_exist" = true ]; then
        log_success "All SSL certificate files exist"
        return 0
    else
        log_error "Some SSL certificate files are missing"
        return 1
    fi
}

# =============================================================================
# CERTIFICATE EXPIRATION CHECK
# =============================================================================
check_certificate_expiration() {
    log_info "Checking certificate expiration..."
    
    if [ ! -f "$CERT_PATH" ]; then
        log_error "Certificate file not found: $CERT_PATH"
        return 1
    fi
    
    # Get certificate expiration date
    local expiry_date=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
    local expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$expiry_date" +%s 2>/dev/null)
    local current_epoch=$(date +%s)
    local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
    
    log_info "Certificate expires: $expiry_date"
    log_info "Days until expiry: $days_until_expiry"
    
    # Check if certificate is expired
    if [ "$days_until_expiry" -lt 0 ]; then
        log_error "SSL certificate has EXPIRED!"
        return 1
    fi
    
    # Check if certificate expires soon
    if [ "$days_until_expiry" -lt 30 ]; then
        log_warning "SSL certificate expires in $days_until_expiry days"
        
        # Send email alert if configured
        if [ -n "$ALERT_EMAIL" ] && command -v mail >/dev/null 2>&1; then
            echo "SSL certificate for $DOMAIN expires in $days_until_expiry days on $expiry_date" | \
            mail -s "SSL Certificate Expiry Warning - $DOMAIN" "$ALERT_EMAIL"
            log_info "Expiry warning email sent to $ALERT_EMAIL"
        fi
        
        return 2
    fi
    
    log_success "Certificate is valid for $days_until_expiry days"
    return 0
}

# =============================================================================
# SSL CONNECTION TEST
# =============================================================================
test_ssl_connection() {
    log_info "Testing SSL connections..."
    
    local domains=("$DOMAIN" "$WWW_DOMAIN")
    local all_connections_ok=true
    
    for domain in "${domains[@]}"; do
        log_info "Testing HTTPS connection to $domain..."
        
        # Test HTTPS connection
        if curl -s --max-time 30 "https://$domain" >/dev/null 2>&1; then
            log_success "HTTPS connection to $domain: OK"
        else
            log_error "HTTPS connection to $domain: FAILED"
            all_connections_ok=false
        fi
        
        # Test SSL handshake
        if echo | openssl s_client -servername "$domain" -connect "$domain:443" -verify_return_error >/dev/null 2>&1; then
            log_success "SSL handshake with $domain: OK"
        else
            log_error "SSL handshake with $domain: FAILED"
            all_connections_ok=false
        fi
    done
    
    if [ "$all_connections_ok" = true ]; then
        log_success "All SSL connections are working"
        return 0
    else
        log_error "Some SSL connections failed"
        return 1
    fi
}

# =============================================================================
# SSL CONFIGURATION VALIDATION
# =============================================================================
validate_ssl_configuration() {
    log_info "Validating SSL configuration..."
    
    # Check Nginx configuration
    if command -v nginx >/dev/null 2>&1; then
        if nginx -t >/dev/null 2>&1; then
            log_success "Nginx configuration is valid"
        else
            log_error "Nginx configuration is invalid"
            nginx -t
            return 1
        fi
    else
        log_warning "Nginx not found, skipping configuration test"
    fi
    
    # Check if SSL certificates are properly referenced in Nginx config
    if [ -f "/etc/nginx/conf.d/mymeds.conf" ]; then
        if grep -q "ssl_certificate.*$DOMAIN" /etc/nginx/conf.d/mymeds.conf; then
            log_success "SSL certificates properly referenced in Nginx config"
        else
            log_warning "SSL certificates may not be properly referenced in Nginx config"
        fi
    fi
    
    return 0
}

# =============================================================================
# CERTIFICATE DETAILS
# =============================================================================
show_certificate_details() {
    log_info "Certificate Details:"
    echo "===================="
    
    if [ -f "$CERT_PATH" ]; then
        echo "Subject: $(openssl x509 -subject -noout -in "$CERT_PATH" | cut -d= -f2-)"
        echo "Issuer: $(openssl x509 -issuer -noout -in "$CERT_PATH" | cut -d= -f2-)"
        echo "Valid From: $(openssl x509 -startdate -noout -in "$CERT_PATH" | cut -d= -f2)"
        echo "Valid Until: $(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)"
        echo "Serial Number: $(openssl x509 -serial -noout -in "$CERT_PATH" | cut -d= -f2)"
        echo "SHA1 Fingerprint: $(openssl x509 -fingerprint -sha1 -noout -in "$CERT_PATH" | cut -d= -f2)"
        echo "SHA256 Fingerprint: $(openssl x509 -fingerprint -sha256 -noout -in "$CERT_PATH" | cut -d= -f2)"
    else
        log_error "Certificate file not found: $CERT_PATH"
    fi
}

# =============================================================================
# RENEWAL STATUS CHECK
# =============================================================================
check_renewal_status() {
    log_info "Checking certificate renewal status..."
    
    if command -v certbot >/dev/null 2>&1; then
        # Check if renewal is needed
        if certbot certificates | grep -q "$DOMAIN"; then
            log_success "Certificate is registered with Let's Encrypt"
            
            # Test renewal (dry run)
            if certbot renew --dry-run >/dev/null 2>&1; then
                log_success "Certificate renewal test passed"
            else
                log_warning "Certificate renewal test failed"
            fi
        else
            log_error "Certificate not found in Let's Encrypt registry"
        fi
    else
        log_warning "Certbot not found, skipping renewal check"
    fi
}

# =============================================================================
# SECURITY HEADERS CHECK
# =============================================================================
check_security_headers() {
    log_info "Checking security headers..."
    
    local headers_to_check=(
        "Strict-Transport-Security"
        "X-Frame-Options"
        "X-Content-Type-Options"
        "X-XSS-Protection"
        "Referrer-Policy"
        "Content-Security-Policy"
    )
    
    local missing_headers=()
    
    for header in "${headers_to_check[@]}"; do
        if curl -s -I "https://$DOMAIN" | grep -qi "$header"; then
            log_success "Security header $header: Present"
        else
            log_warning "Security header $header: Missing"
            missing_headers+=("$header")
        fi
    done
    
    if [ ${#missing_headers[@]} -eq 0 ]; then
        log_success "All security headers are present"
    else
        log_warning "Missing security headers: ${missing_headers[*]}"
    fi
}

# =============================================================================
# SSL RATING CHECK
# =============================================================================
check_ssl_rating() {
    log_info "Checking SSL rating (if ssllabs.com is accessible)..."
    
    # Check if we can reach SSL Labs API
    if curl -s --max-time 10 "https://api.ssllabs.com/api/v3/info" >/dev/null 2>&1; then
        log_info "SSL Labs API is accessible, checking rating..."
        
        # Note: This is a simplified check. For full SSL Labs integration,
        # you would need to implement the full API workflow
        log_info "SSL rating check would require full SSL Labs API integration"
    else
        log_warning "SSL Labs API not accessible, skipping rating check"
    fi
}

# =============================================================================
# MAIN HEALTH CHECK
# =============================================================================
main() {
    local overall_status=0
    local checks_passed=0
    local total_checks=0
    
    log_with_timestamp "Starting SSL health check for $DOMAIN"
    
    # Run all checks
    total_checks=$((total_checks + 1))
    if check_certificate_exists; then
        checks_passed=$((checks_passed + 1))
    else
        overall_status=1
    fi
    
    total_checks=$((total_checks + 1))
    local expiry_status=0
    check_certificate_expiration
    expiry_status=$?
    if [ $expiry_status -eq 0 ]; then
        checks_passed=$((checks_passed + 1))
    elif [ $expiry_status -eq 2 ]; then
        # Warning, but not critical
        checks_passed=$((checks_passed + 1))
    else
        overall_status=1
    fi
    
    total_checks=$((total_checks + 1))
    if test_ssl_connection; then
        checks_passed=$((checks_passed + 1))
    else
        overall_status=1
    fi
    
    total_checks=$((total_checks + 1))
    if validate_ssl_configuration; then
        checks_passed=$((checks_passed + 1))
    else
        overall_status=1
    fi
    
    check_renewal_status
    check_security_headers
    check_ssl_rating
    
    # Show certificate details
    show_certificate_details
    
    # Summary
    echo ""
    log_info "SSL Health Check Summary:"
    echo "=========================="
    echo "Checks passed: $checks_passed/$total_checks"
    echo "Overall status: $([ $overall_status -eq 0 ] && echo "HEALTHY" || echo "UNHEALTHY")"
    
    if [ $overall_status -eq 0 ]; then
        log_success "🎉 SSL health check completed successfully!"
    else
        log_error "❌ SSL health check found issues that need attention"
    fi
    
    log_with_timestamp "SSL health check completed with status: $overall_status"
    
    return $overall_status
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
