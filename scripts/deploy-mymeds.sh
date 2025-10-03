#!/bin/bash

# =============================================================================
# Complete MyMeds Pharmacy Deployment Script
# =============================================================================
# This is the master deployment script that orchestrates all setup components
# Domain: myarmedspharmaceuticals.com
# VPS: Your VPS IP
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mymedspharmaceuticals.com"
VPS_IP="72.60.116.253"
APP_NAME="MyMeds Pharmacy Inc."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Deployment steps configuration
STEPS=(
    "system_update:System Update and Dependencies"
    "database_setup:Database Setup (MySQL)"
    "wordpress_setup:WordPress Installation (Blog & WooCommerce)"
    "application_setup:MyMeds Application Setup"
    "ssl_setup:SSL Certificate Setup"
    "nginx_setup:Nginx Web Server Configuration"
    "firewall_setup:Firewall and Security Configuration"
    "monitoring_setup:Monitoring and Logging Setup"
    "final_testing:Final Testing and Verification"
)

# Status tracking
COMPLETED_STEPS=()
FAILED_STEPS=()
SKIPPED_STEPS=()

print_header() {
    echo ""
    echo -e "${PURPLE}=========================================="
    echo -e "  $APP_NAME Deployment Script"
    echo -e "  Domain: $DOMAIN"
    echo -e "  VPS IP: $VPS_IP"
    echo -e "  Date: $(date)"
    echo -e "==========================================${NC}"
}

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

print_step() {
    echo ""
    echo -e "${CYAN}[STEP $(printf %02d $1)/$(printf %02d ${#STEPS[@]})]${NC} $2"
    echo -e "${CYAN}===========================================${NC}"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_status "Running as root ✓"
    else
        print_error "This script must be run as root"
        exit 1
    fi
}

# Function to check VPS connectivity
check_vps_connectivity() {
    print_status "Checking VPS connectivity..."
    
    if ping -c 3 8.8.8.8 > /dev/null 2>&1; then
        print_success \"Internet connectivity available\"
    else
        print_error "No internet connectivity. Please check network settings."
        exit 1
    fi
}

# Function to execute deployment step
execute_step() {
    local step_code="$1"
    local step_name="$2"
    
    case $step_code in
        "system_update")
            execute_system_update
            ;;
        "database_setup")
            execute_database_setup
            ;;
        "wordpress_setup")
            execute_wordpress_setup
            ;;
        "application_setup")
            execute_application_setup
            ;;
        "ssl_setup")
            execute_ssl_setup
            ;;
        
        "nginx_setup")
            execute_nginx_setup
            ;;
        "firewall_setup")
            execute_firewall_setup
            ;;
        "monitoring_setup")
            execute_monitoring_setup
            ;;
        "final_testing")
            execute_final_testing
            ;;
        *)
            print_error "Unknown step: $step_code"
            return 1
            ;;
    esac
}

# System update step
execute_system_update() {
    print_status "Updating system and installing base dependencies..."
    
    # Update package list
    apt update -y
    apt upgrade -y
    
    # Install essential packages
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Install Git (if not installed)
    apt install -y git
    
    # Install zip/unzip for backups
    apt install -y zip unzip
    
    # Clean up
    apt autoremove -y
    apt autoclean
    
    print_success "System update completed"
}

# Database setup step
execute_database_setup() {
    print_status "Setting up database..."
    
    if [ -x "$SCRIPT_DIR/setup-database.sh" ]; then
        chmod +x "$SCRIPT_DIR/setup-database.sh"
        "$SCRIPT_DIR/setup-database.sh"
        print_success "Database setup completed"
    else
        print_error "setup-database.sh script not found or not executable"
        return 1
    fi
}

# WordPress setup step
execute_wordpress_setup() {
    print_status "Setting up WordPress..."
    
    if [ -x "$SCRIPT_DIR/setup-wordpress.sh" ]; then
        chmod +x "$SCRIPT_DIR/setup-wordpress.sh"
        "$SCRIPT_DIR/setup-wordpress.sh"
        print_success "WordPress setup completed"
    else
        print_error "setup-wordpress.sh script not found or not executable"
        return 1
    fi
}

# Application setup step
execute_application_setup() {
    print_status "Setting up MyMeds application..."
    
    if [ -x "$SCRIPT_DIR/setup-application.sh" ]; then
        chmod +x "$SCRIPT_DIR/setup-application.sh"
        "$SCRIPT_DIR/setup-application.sh"
        print_success "Application setup completed"
    else
        print_error "setup-application.sh script not found or not executable"
        return 1
    fi
}

# SSL setup step
execute_ssl_setup() {
    print_status "Setting up SSL certificates..."
    
    if [ -x "$SCRIPT_DIR/setup-ssl.sh" ]; then
        chmod +x "$SCRIPT_DIR/setup-ssl.sh"
        "$SCRIPT_DIR/setup-ssl.sh"
        print_success "SSL setup completed"
    else
        print_error "setup-ssl.sh script not found or not executable"
        return 1
    fi
}

# Nginx setup step
execute_nginx_setup() {
    print_status "Configuring Nginx..."
    
    # Install Nginx
    apt install -y nginx
    
    # Create main configuration file from template
    if [ -f "/var/www/mymeds/nginx-combined-config.conf" ]; then
        cp /var/www/mymeds/nginx-combined-config.conf /etc/nginx/sites-available/mymeds
        
        # Enable MyMeds site
        ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
        
        # Remove default site
        rm -f /etc/nginx/sites-enabled/default
        
        # Test configuration
        nginx -t
        
        # Start and enable Nginx
        systemctl start nginx
        systemctl enable nginx
        
        # Reload configuration
        systemctl reload nginx
        
        print_success "Nginx configured successfully"
    else
        print_warning "Nginx configuration template not found. Creating basic configuration..."
        
        # Create basic nginx configuration
        cat > /etc/nginx/sites-available/mymeds <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root /var/www/html;
    index index.html index.htm;
    
    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF
        
        ln -sf /etc/nginx/sites-available/mymeds /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        nginx -t
        systemctl start nginx
        systemctl enable nginx
        
        print_success "Basic Nginx configuration created"
    fi
}

# Firewall setup step
execute_firewall_setup() {
    print_status "Configuring firewall..."
    
    # Install UFW if not installed
    apt install -y ufw
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (be careful!)
    ufw allow ssh
    ufw allow 2222/tcp  # Alternative SSH port
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow MySQL (localhost only)
    ufw allow from 127.0.0.1 to any port 3306
    
    # Enable UFW
    ufw --force enable
    
    # Show status
    ufw status numbered
    
    print_success "Firewall configured"
}

# Monitoring setup step
execute_monitoring_setup() {
    print_status "Setting up monitoring and logging..."
    
    # Create log directories
    mkdir -p /var/log/mymeds
    mkdir -p /backups/{mysql,ssl,app}
    
    # Install logrotate for log management
    apt install -y logrotate
    
    # Create logrotate configuration for MyMeds
    cat > /etc/logrotate.d/mymeds <<EOF
/var/log/mymeds/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}

/var/log/mysql/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 640 mysql mysql
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 640 nginx nginx
}
EOF
    
    # Install system monitoring tools
    apt install -y htop iotop nethogs
  
    # Create system health check script
    cat > /usr/local/bin/mymeds-health-check.sh <<EOF
#!/bin/bash
# MyMeds Health Check Script

echo "\$(date): MyMeds Health Check"
echo "================================"

# Check services
echo "Service Status:"
systemctl is-active nginx mysql php8.1-fpm pm2 > /tmp/services_status.txt

# Check disk space
echo ""
echo "Disk Usage:"
df -h | grep -E '/(root|$)'

# Check memory usage
echo ""
echo "Memory Usage:"
free -h

# Check SSL certificates
echo ""
echo "SSL Certificate Status:"
certbot certificates

# Check application health
echo ""
echo "Application Health:"
curl -sf http://localhost/api/health || echo "Backend health check failed"

echo ""
echo "Health check completed at \$(date)"
EOF

    chmod +x /usr/local/bin/mymeds-health-check.sh
    
    # Add daily health check to cron
    echo "0 6 * * * /usr/local/bin/mymeds-health-check.sh >> /var/log/mymeds-health.log" | crontab -
    
    print_success "Monitoring and logging configured"
}

# Final testing step
execute_final_testing() {
    print_status "Performing final testing..."
    
    # Test services
    print_status "Testing services..."
    systemctl is-active nginx > /dev/null && print_success "Nginx: Running" || print_error "Nginx: Failed"
    systemctl is-active mysql > /dev/null && print_success "MySQL: Running" || print_error "MySQL: Failed"
    systemctl is-active php8.1-fpm > /dev/null && print_success "PHP-FPM: Running" || print_error "PHP-FPM: Failed"
    
    # Test PM2
    if command -v pm2 >/dev/null 2>&1; then
        if pm2 list | grep -q "mymeds-backend"; then
            print_success "PM2: MyMeds backend running"
        else
            print_warning "PM2: MyMeds backend not found"
        fi
    fi
    
    # Test web endpoints
    print_status "Testing web endpoints..."
    
    if curl -sf https://$DOMAIN > /dev/null; then
        print_success "Main domain HTTPS: Working"
    else
        print_warning "Main domain HTTPS: Check manually"
    fi
    
    if curl -sf https://www.$DOMAIN > /dev/null; then
        print_success "WWW subdomain HTTPS: Working"
    else
        print_warning "WWW subdomain HTTPS: Check manually"
    fi
    
    # Test API endpoint
    if curl -sf https://$DOMAIN/api/health > /dev/null; then
        print_success "API endpoint: Working"
    else
        print_warning "API endpoint: Check manually"
    fi
    
    # Run health check
    print_status "Running system health check..."
    /usr/local/bin/mymeds-health-check.sh
    
    print_success "Final testing completed"
}

# Function to create deployment summary
create_deployment_summary() {
    print_status "Creating deployment summary..."
    
    cat > /var/www/mymeds/DEPLOYMENT-SUMMARY.md <<EOF
# MyMeds Pharmacy Deployment Summary

**Deployment Date:** $(date)
**Domain:** $DOMAIN
**VPS IP:** $VPS_IP

## Completed Steps
EOF

    for step in "${COMPLETED_STEPS[@]}"; do
        echo "- ✅ $step" >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md
    done

    echo "" >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md
    echo "## Failed Steps" >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md
    
    if [ ${#FAILED_STEPS[@]} -eq 0 ]; then
        echo "- None" >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md
    else
        for step in "${FAILED_STEPS[@]}"; do
            echo "- ❌ $step" >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md
        done
    fi

    cat >> /var/www/mymeds/DEPLOYMENT-SUMMARY.md <<EOF

## Access Information

### Web Applications
- **Main Site:** https://$DOMAIN
- **Admin Dashboard:** https://$DOMAIN/admin
- **Blog:** https://blog.$DOMAIN
- **Shop:** https://shop.$DOMAIN

### Admin Access
- **MyMeds Admin:** Check /var/www/mymeds/app-credentials.conf
- **WordPress Admin:** Check /var/www/mymeds/wp-credentials.conf

### Database
- **Credentials:** /var/www/mymeds/db-credentials.conf

### Management Commands
- **PM2 Status:** pm2 status
- **Service Status:** systemctl status nginx mysql php8.1-fpm pm2
- **SSL Certificates:** certbot certificates
- **Health Check:** /usr/local/bin/mymeds-health-check.sh

### Logs
- **Application Logs:** pm2 logs mymeds-backend
- **Nginx Logs:** /var/log/nginx/
- **MySQL Logs:** /var/log/mysql/
- **System Health:** /var/log/mymeds-health.log

## Next Steps
1. Test all functionality manually
2. Configure email settings in application
3. Set up regular backups
4. Configure WordPress and WooCommerce settings
5. Update DNS records if not already done

## Support
For issues, check the troubleshooting guide in DEPLOYMENT-MYMEDS.md
EOF

    print_success "Deployment summary created at /var/www/mymeds/DEPLOYMENT-SUMMARY.md"
}

# Function to run pre-deployment checks
pre_deployment_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if running on correct system
    if [ ! -f /etc/os-release ]; then
        print_error "Cannot determine OS version"
        exit 1
    fi
    
    . /etc/os-release
    print_status "Operating System: $PRETTY_NAME"
    
    # Check available disk space
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -lt 80 ]; then
        print_success "Disk space sufficient (${DISK_USAGE}% used)"
    else
        print_warning "Low disk space (${DISK_USAGE}% used)"
    fi
    
    # Check memory
    MEMORY_MB=$(free -m | awk 'NR==2{print $2}')
    print_status "Available memory: ${MEMORY_MB}MB"
    
    if [ $MEMORY_MB -lt 2048 ]; then
        print_warning "Low memory detected. Consider upgrading VPS."
    else
        print_success "Memory sufficient"
    fi
    
    print_success "Pre-deployment checks completed"
}

# Main deployment function
main() {
    print_header
    
    # Pre-deployment checks
    pre_deployment_checks
    
    # Deployment confirmation
    echo ""
    print_warning "This script will deploy MyMeds Pharmacy to your VPS."
    print_warning "Please ensure your domain DNS is pointing to IP: $VPS_IP"
    echo ""
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user"
        exit 0
    fi
    
    # Execute deployment steps
    step_number=1
    for step in "${STEPS[@]}"; do
        IFS=':' read -r step_code step_name <<< "$step"
        
        print_step $step_number "$step_name"
        
        if execute_step "$step_code" "$step_name"; then
            COMPLETED_STEPS+=("$step_name")
            print_success "Step $step_number completed successfully"
            ((step_number++))
        else
            FAILED_STEPS+=("$step_name")
            print_error "Step $step_number failed"
            ((step_number++))
            
            # Ask whether to continue
            echo ""
            read -p "Step failed. Continue with remaining steps? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_status "Deployment stopped by user"
                break
            fi
        fi
        
        # Add small delay between steps
        sleep 2
    done
    
    # Create deployment summary
    create_deployment_summary
    
    # Final report
    echo ""
    echo -e "${PURPLE}=========================================="
    echo -e "          DEPLOYMENT COMPLETED"
    echo -e "==========================================${NC}"
    echo ""
    echo -e "${GREEN}✅ Completed Steps: ${#COMPLETED_STEPS[@]}${NC}"
    for step in "${COMPLETED_STEPS[@]}"; do
        echo -e "   • $step"
    done
    
    if [ ${#FAILED_STEPS[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}❌ Failed Steps: ${#FAILED_STEPS[@]}${NC}"
        for step in "${FAILED_STEPS[@]}"; do
            echo -e "   • $step"
        done
    fi
    
    echo ""
    if [ ${#FAILED_STEPS[@]} -eq 0 ]; then
        print_success "🎉 Deployment completed successfully!"
        echo ""
        echo -e "${CYAN}Access Your Application:${NC}"
        echo "• Main Site: https://$DOMAIN"
        echo "• Admin Panel: https://$DOMAIN/admin"
        echo "• Blog: https://blog.$DOMAIN"
        echo "• Shop: https://shop.$DOMAIN"
    else
        print_warning "⚠️  Deployment completed with errors."
        echo "Please check the failed steps and re-run them manually."
    fi
    
    echo ""
    echo -e "${CYAN}📋 Deployment Summary:${NC}"
    echo "• Report: /var/www/mymeds/DEPLOYMENT-SUMMARY.md"
    echo "• Credentials: /var/www/mymeds/*-credentials.conf"
    echo "• Health Check: /usr/local/bin/mymeds-health-check.sh"
    echo ""
}

# Run main function
main "$@"

