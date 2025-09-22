#!/bin/bash
# =============================================================================
# SSL RENEWAL MONITOR SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Monitors SSL certificate renewal and sends alerts
# =============================================================================

set -e

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
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
LOG_FILE="/var/log/ssl-renewal-monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@mymedspharmacyinc.com}"
ALERT_THRESHOLD_DAYS=30

# =============================================================================
# LOGGING FUNCTION
# =============================================================================
log_with_timestamp() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# =============================================================================
# SEND EMAIL ALERT
# =============================================================================
send_alert() {
    local subject="$1"
    local message="$2"
    
    if [ -n "$ALERT_EMAIL" ] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
        log_info "Alert email sent to $ALERT_EMAIL"
    else
        log_warning "Email alert not configured or mail command not available"
    fi
}

# =============================================================================
# CHECK CERTIFICATE EXPIRATION
# =============================================================================
check_certificate_expiration() {
    log_with_timestamp "Checking certificate expiration for $DOMAIN"
    
    if [ ! -f "$CERT_PATH" ]; then
        log_error "Certificate file not found: $CERT_PATH"
        send_alert "SSL Certificate Missing - $DOMAIN" "SSL certificate file not found at $CERT_PATH"
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
        send_alert "SSL Certificate EXPIRED - $DOMAIN" "SSL certificate for $DOMAIN has EXPIRED on $expiry_date. Immediate action required!"
        return 1
    fi
    
    # Check if certificate expires soon
    if [ "$days_until_expiry" -lt $ALERT_THRESHOLD_DAYS ]; then
        log_warning "SSL certificate expires in $days_until_expiry days"
        
        if [ "$days_until_expiry" -lt 7 ]; then
            # Critical alert for certificates expiring in less than 7 days
            send_alert "URGENT: SSL Certificate Expiring Soon - $DOMAIN" "SSL certificate for $DOMAIN expires in $days_until_expiry days on $expiry_date. URGENT action required!"
        else
            # Warning alert for certificates expiring in less than 30 days
            send_alert "SSL Certificate Expiry Warning - $DOMAIN" "SSL certificate for $DOMAIN expires in $days_until_expiry days on $expiry_date. Please renew soon."
        fi
    fi
    
    return 0
}

# =============================================================================
# TEST RENEWAL PROCESS
# =============================================================================
test_renewal_process() {
    log_with_timestamp "Testing SSL certificate renewal process"
    
    if command -v certbot >/dev/null 2>&1; then
        # Test renewal (dry run)
        if certbot renew --dry-run >/dev/null 2>&1; then
            log_success "Certificate renewal test passed"
            return 0
        else
            log_error "Certificate renewal test failed"
            send_alert "SSL Renewal Test Failed - $DOMAIN" "SSL certificate renewal test failed for $DOMAIN. Please check the renewal configuration."
            return 1
        fi
    else
        log_error "Certbot not found"
        send_alert "Certbot Not Found - $DOMAIN" "Certbot is not installed or not in PATH. SSL certificate renewal may fail."
        return 1
    fi
}

# =============================================================================
# CHECK RENEWAL LOGS
# =============================================================================
check_renewal_logs() {
    log_with_timestamp "Checking SSL renewal logs"
    
    local renewal_log="/var/log/ssl-renewal.log"
    
    if [ -f "$renewal_log" ]; then
        # Check for recent errors in renewal logs
        local recent_errors=$(tail -n 50 "$renewal_log" | grep -i "error\|failed\|exception" | wc -l)
        
        if [ "$recent_errors" -gt 0 ]; then
            log_warning "Found $recent_errors recent errors in renewal logs"
            local error_details=$(tail -n 50 "$renewal_log" | grep -i "error\|failed\|exception" | tail -n 5)
            send_alert "SSL Renewal Errors Detected - $DOMAIN" "Recent errors found in SSL renewal logs:\n\n$error_details"
        else
            log_success "No recent errors found in renewal logs"
        fi
    else
        log_warning "Renewal log file not found: $renewal_log"
    fi
}

# =============================================================================
# CHECK NGINX CONFIGURATION
# =============================================================================
check_nginx_configuration() {
    log_with_timestamp "Checking Nginx configuration"
    
    if command -v nginx >/dev/null 2>&1; then
        if nginx -t >/dev/null 2>&1; then
            log_success "Nginx configuration is valid"
        else
            log_error "Nginx configuration is invalid"
            local nginx_errors=$(nginx -t 2>&1)
            send_alert "Nginx Configuration Error - $DOMAIN" "Nginx configuration test failed:\n\n$nginx_errors"
            return 1
        fi
    else
        log_warning "Nginx not found, skipping configuration check"
    fi
    
    return 0
}

# =============================================================================
# CHECK SSL CONNECTIVITY
# =============================================================================
check_ssl_connectivity() {
    log_with_timestamp "Checking SSL connectivity"
    
    # Test HTTPS connection
    if curl -s --max-time 30 "https://$DOMAIN" >/dev/null 2>&1; then
        log_success "HTTPS connection test passed"
    else
        log_error "HTTPS connection test failed"
        send_alert "HTTPS Connection Failed - $DOMAIN" "HTTPS connection to $DOMAIN failed. SSL certificate may be invalid or server may be down."
        return 1
    fi
    
    # Test SSL handshake
    if echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" -verify_return_error >/dev/null 2>&1; then
        log_success "SSL handshake test passed"
    else
        log_error "SSL handshake test failed"
        send_alert "SSL Handshake Failed - $DOMAIN" "SSL handshake with $DOMAIN failed. Certificate may be invalid or misconfigured."
        return 1
    fi
    
    return 0
}

# =============================================================================
# MAIN MONITORING FUNCTION
# =============================================================================
main() {
    log_with_timestamp "Starting SSL renewal monitoring for $DOMAIN"
    
    local overall_status=0
    
    # Run all checks
    check_certificate_expiration || overall_status=1
    test_renewal_process || overall_status=1
    check_renewal_logs
    check_nginx_configuration || overall_status=1
    check_ssl_connectivity || overall_status=1
    
    # Summary
    if [ $overall_status -eq 0 ]; then
        log_success "SSL renewal monitoring completed successfully"
    else
        log_error "SSL renewal monitoring found issues"
    fi
    
    log_with_timestamp "SSL renewal monitoring completed with status: $overall_status"
    
    return $overall_status
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
