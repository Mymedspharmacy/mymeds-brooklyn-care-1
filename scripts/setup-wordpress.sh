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
DOMAIN="mymedspharmacyinc.com"
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


#!/bin/bash

# Incremental Deployment Script for MyMeds Pharmacy
# This script handles incremental deployments with minimal downtime

set -e

# Configuration
VPS_HOST="${VPS_HOST:-72.60.116.253}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
DEPLOY_PATH="/var/www/mymeds-pharmacy"
BACKUP_PATH="/var/backups/mymeds-pharmacy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        if [ -d 'current' ]; then
            BACKUP_DIR=\"$BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S)\"
            sudo mkdir -p \$BACKUP_DIR
            sudo cp -r current/* \$BACKUP_DIR/
            echo \"✅ Backup created at \$BACKUP_DIR\"
        else
            echo \"⚠️  No current deployment found to backup\"
        fi
    "
}

# Function to deploy frontend changes
deploy_frontend() {
    log "Deploying frontend changes..."
    
    # Build frontend
    npm run build:prod
    
    # Upload built files
    rsync -avz --delete -e "ssh -p $VPS_PORT" \
        dist/ $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/public/
    
    success "Frontend deployed successfully"
}

# Function to deploy backend changes
deploy_backend() {
    log "Deploying backend changes..."
    
    # Build backend
    cd backend
    npm run build
    cd ..
    
    # Upload backend files
    rsync -avz --delete -e "ssh -p $VPS_PORT" \
        backend/dist/ $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/backend/dist/
    
    # Upload package.json and other necessary files
    rsync -avz -e "ssh -p $VPS_PORT" \
        backend/package.json $VPS_USER@$VPS_HOST:$DEPLOY_PATH/current/backend/
    
    success "Backend deployed successfully"
}

# Function to update dependencies
update_dependencies() {
    log "Updating dependencies..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH/current
        
        # Update frontend dependencies
        npm ci --production
        
        # Update backend dependencies
        cd backend
        npm ci --production
        cd ..
        
        echo \"✅ Dependencies updated\"
    "
}

# Function to run database migrations
run_migrations() {
    log "Running database migrations..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH/current/backend
        npm run prisma:migrate
        echo \"✅ Database migrations completed\"
    "
}

# Function to restart services
restart_services() {
    log "Restarting services..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Restart backend
        sudo pm2 restart mymeds-backend
        
        # Reload nginx
        sudo systemctl reload nginx
        
        echo \"✅ Services restarted\"
    "
}

# Function to perform health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    if ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "curl -f http://localhost:4000/api/health > /dev/null 2>&1"; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "curl -f http://localhost > /dev/null 2>&1"; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
        return 1
    fi
}

# Function to rollback deployment
rollback() {
    warning "Rolling back to previous version..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        
        # Find latest backup
        LATEST_BACKUP=\$(ls -t $BACKUP_PATH/backup-* 2>/dev/null | head -n1)
        
        if [ -n \"\$LATEST_BACKUP\" ]; then
            sudo rm -rf current
            sudo cp -r \$LATEST_BACKUP current
            sudo pm2 restart mymeds-backend
            sudo systemctl reload nginx
            echo \"✅ Rolled back to \$LATEST_BACKUP\"
        else
            echo \"❌ No backup found for rollback\"
            exit 1
        fi
    "
}

# Function to show deployment status
show_status() {
    log "Current deployment status:"
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd $DEPLOY_PATH
        
        echo \"📁 Current deployment:\"
        ls -la current/ 2>/dev/null || echo \"No current deployment\"
        
        echo \"\n📦 PM2 processes:\"
        sudo pm2 list
        
        echo \"\n🌐 Nginx status:\"
        sudo systemctl status nginx --no-pager -l
        
        echo \"\n💾 Available backups:\"
        ls -la $BACKUP_PATH/ 2>/dev/null || echo \"No backups available\"
    "
}

# Main deployment function
deploy() {
    local deploy_type="${1:-full}"
    
    log "Starting $deploy_type deployment..."
    
    case $deploy_type in
        "frontend")
            create_backup
            deploy_frontend
            restart_services
            health_check
            ;;
        "backend")
            create_backup
            deploy_backend
            update_dependencies
            run_migrations
            restart_services
            health_check
            ;;
        "full")
            create_backup
            deploy_frontend
            deploy_backend
            update_dependencies
            run_migrations
            restart_services
            health_check
            ;;
        *)
            error "Invalid deployment type: $deploy_type"
            echo "Usage: $0 [frontend|backend|full]"
            exit 1
            ;;
    esac
    
    success "Deployment completed successfully!"
}

# Function to setup deployment environment
setup() {
    log "Setting up deployment environment..."
    
    # Check required tools
    if ! command_exists rsync; then
        error "rsync is required but not installed"
        exit 1
    fi
    
    if ! command_exists ssh; then
        error "ssh is required but not installed"
        exit 1
    fi
    
    # Create SSH key if it doesn't exist
    if [ ! -f ~/.ssh/id_rsa ]; then
        log "Generating SSH key..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        success "SSH key generated"
        warning "Please add the public key to your VPS: cat ~/.ssh/id_rsa.pub"
    fi
    
    # Test SSH connection
    log "Testing SSH connection..."
    if ssh -p $VPS_PORT -o ConnectTimeout=10 $VPS_USER@$VPS_HOST "echo 'SSH connection successful'"; then
        success "SSH connection successful"
    else
        error "SSH connection failed"
        exit 1
    fi
    
    success "Setup completed successfully!"
}

# Main script logic
case "${1:-deploy}" in
    "setup")
        setup
        ;;
    "deploy")
        deploy "${2:-full}"
        ;;
    "rollback")
        rollback
        ;;
    "status")
        show_status
        ;;
    "health")
        health_check
        ;;
    *)
        echo "MyMeds Pharmacy Deployment Script"
        echo ""
        echo "Usage: $0 [command] [options]"
        echo ""
        echo "Commands:"
        echo "  setup                    Setup deployment environment"
        echo "  deploy [type]           Deploy application (frontend|backend|full)"
        echo "  rollback                Rollback to previous version"
        echo "  status                  Show deployment status"
        echo "  health                  Perform health check"
        echo ""
        echo "Examples:"
        echo "  $0 setup"
        echo "  $0 deploy frontend"
        echo "  $0 deploy backend"
        echo "  $0 deploy full"
        echo "  $0 rollback"
        echo "  $0 status"
        echo ""
        echo "Environment Variables:"
        echo "  VPS_HOST                VPS IP address (default: your-vps-ip)"
        echo "  VPS_USER                VPS username (default: root)"
        echo "  VPS_PORT                VPS SSH port (default: 22)"
        ;;
esac
#!/bin/bash

# =============================================================================
# MyMeds Application Setup Script
# =============================================================================
# This script sets up the MyMeds Pharmacy React/Node.js application
# Domain: mymedspharmacyinc.com
# VPS: 72.60.116.253
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
NODE_VERSION="18"
APP_DIR="/var/www/mymeds"
BACKEND_PORT="4000"
FRONTEND_PORT="3000"

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

# Function to generate secure passwords/keys
generate_secret() {
    openssl rand -base64 64 | tr -d "=+/" | cut -c1-64
}

generate_jwt_secret() {
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js $NODE_VERSION..."
    
    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    
    # Install Node.js
    apt-get install -y nodejs
    
    # Verify installation
    node_version=$(node --version)
    npm_version=$(npm --version)
    
    print_success "Node.js installed: $node_version"
    print_success "NPM installed: $npm_version"
}

# Function to install PM2 globally
install_pm2() {
    print_status "Installing PM2 process manager..."
    
    npm install -g pm2 pm2-logrotate
    
    # Configure PM2
    pm2 install pm2-logrotate
    pm2 set pm2-logrotate:max_size 10M
    pm2 set pm2-logrotate:retain 30
    
    print_success "PM2 installed and configured"
}

# Function to setup application directory structure
setup_directory_structure() {
    print_status "Setting up application directory structure..."
    
    # Create directories
    mkdir -p "$APP_DIR"/{backend,frontend,logs,uploads,scripts}
    mkdir -p "$APP_DIR"/backend/{dist,logs,uploads}
    mkdir -p "$APP_DIR"/frontend/dist
    
    # Set ownership
    chown -R www-data:www-data "$APP_DIR"
    
    print_success "Directory structure created"
}

# Function to clone or copy application files
setup_application_files() {
    print_status "Setting up application files..."
    
    # If git repository is available
    if [ -d ".git" ]; then
        print_status "Copying files from current repository..."
        cp -r . "$APP_DIR/"
    else
        print_status "Creating placeholder files..."
        cat > "$APP_DIR/package.json" <<EOF
{
  "name": "mymeds-pharmacy",
  "version": "1.0.0",
  "description": "MyMeds Pharmacy Inc. Application",
  "scripts": {
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "npm run build:frontend",
    "start": "pm2 start ecosystem.config.js",
    "stop": "pm2 stop ecosystem.config.js",
    "restart": "pm2 restart ecosystem.config.js"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF
    fi
    
    # Set permissions
    chown -R www-data:www-data "$APP_DIR"
    
    print_success "Application files prepared"
}

# Function to install backend dependencies
install_backend_dependencies() {
    print_status "Installing backend dependencies..."
    
    cd "$APP_DIR/backend"
    
    # Install dependencies
    npm install --production
    
    # Install Prisma CLI
    npm install -g prisma
    
    print_success "Backend dependencies installed"
}

# Function to install frontend dependencies
install_frontend_dependencies() {
    print_status "Installing frontend dependencies..."
    
    cd "$APP_DIR"
    
    # Install dependencies
    npm install --production
    
    print_success "Frontend dependencies installed"
}

# Function to create production environment file
create_production_env() {
    print_status "Creating production environment configuration..."
    
    # Load database credentials
    if [ -f "/var/www/mymeds/db-credentials.conf" ]; then
        source /var/www/mymeds/db-credentials.conf
    else
        print_error "Database credentials not found. Run setup-database.sh first."
        exit 1
    fi
    
    # Load WordPress credentials
    if [ -f "/var/www/mymeds/wp-credentials.conf" ]; then
        source /var/www/mymeds/wp-credentials.conf
    fi
    
    # Generate secrets
    JWT_SECRET=$(generate_jwt_secret)
    SESSION_SECRET=$(generate_secret)
    CSRF_SECRET=$(generate_secret)
    
    cat > "$APP_DIR/backend/.env.production" <<EOF
# =============================================================================
# MyMeds Production Environment Configuration
# Generated on: $(date)
# =============================================================================

# Basic server configuration
NODE_ENV=production
PORT=$BACKEND_PORT
HOST=0.0.0.0

# Database configuration
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"

# MySQL configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=$DB_NAME
MYSQL_USER=$DB_USER
MYSQL_PASSWORD=$DB_PASSWORD
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

# Authentication & Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=<｜tool▁calls▁end｜>24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=$SESSION_SECRET
BCRYPT_ROUNDS=12
CSRF_SECRET=$CSRF_SECRET

# Admin account
ADMIN_EMAIL=admin@$DOMAIN
ADMIN_PASSWORD_HASH=REPLACE_WITH_HASHED_ADMIN_PASSWORD_HERE
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=admin@$DOMAIN
EMAIL_PASSWORD=REPLACE_WITH_GMAIL_APP_PASSWORD_HERE
EMAIL_FROM=admin@$DOMAIN
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# WordPress integration
WORDPRESS_URL=https://$WP_BLOG_URL
WORDPRESS_USERNAME=$WP_ADMIN_USER
WORDPRESS_APP_PASSWORD=REPLACE_WITH_BLOG_APP_PASSWORD
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce integration
WOOCOMMERCE_STORE_URL=https://$WP_SHOP_URL
WOOCOMMERCE_CONSUMER_KEY=ck_REPLACE_WITH_CONSUMER_KEY_HERE
WOOCOMMERCE_CONSUMER_SECRET=cs_REPLACE_WITH_CONSUMER_SECRET_HERE
WOOCOMMERCE_WEBHOOK_SECRET=REPLACE_WITH_WEBHOOK_SECRET_HERE
FEATURE_WOOCOMMERCE_ENABLED=true

# Frontend environment variables
VITE_BACKEND_URL=https://$DOMAIN
VITE_API_BASE_URL=/api
VITE_WORDPRESS_URL=https://$WP_BLOG_URL
VITE_WOOCOMMERCE_URL=https://$WP_SHOP_URL
VITE_WOOCOMMERCE_STORE_URL=https://$WP_SHOP_URL
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_REPLACE_WITH_CONSUMER_KEY_HERE
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_REPLACE_WITH_CONSUMER_SECRET_HERE

# Feature flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# Contact information
VITE_PHONE_NUMBER=+123456789
VITE_CONTACT_EMAIL=contact@$DOMAIN
VITE_PHARMACY_ADDRESS="1234 Pharmacy Avenue, Brooklyn, NY 11201"
VITE_PHARMACY_HOURS="Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM"
VITE_GOOGLE_MAPS_URL=https://www.google.com/maps/YOUR_LOCATION_URL

# CORS configuration
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN,https://$WP_BLOG_URL,https://$WP_SHOP_URL
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# Production settings
RATE_LIMIT_ENABLED=true
HELMET_ENABLED=true
COMPRESSION_ENABLED=true
DEBUG_MODE=false
VERBOSE_LOGGING=false
ENABLE_-dev-TOOLS=false
LOG_LEVEL=info
LOG_FILE_PATH=$APP_DIR/logs/production.log

# Security headers
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# External API keys (replace with actual values)
GOOGLE_MAPS_API_KEY=REPLACE_WITH_GOOGLE_MAPS_API_KEY_HERE
SENTRY_DSN=REPLACE_WITH_SENTRY_DSN_HERE
GOOGLE_ANALYTICS_ID=REPLACE_WITH_GA_TRACKING_ID_HERE
FACEBOOK_PIXEL_ID=REPLACE_WITH_FACEBOOK_PIXEL_ID_HERE
EOF

    # Create .env link for development
    ln -sf "$APP_DIR/backend/.env.production" "$APP_DIR/backend/.env"
    
    # Secure the environment file
    chown www-data:www-data "$APP_DIR/backend/.env.production"
    chmod 600 "$APP_DIR/backend/.env.production"
    
    print_success "Production environment configuration created"
}

# Function to run database migrations
run_database_migrations() {
    print_status "Running database migrations..."
    
    cd "$APP_DIR/backend"
    
    # Run Prisma migrations
    npx prisma migrate deploy
    
    # Generate Prisma client
    prisma generate
    
    print_success "Database migrations completed"
}

# Function to create admin user
create_admin_user() {
    print_status "Creating admin user..."
    
    cd "$APP_DIR/backend"
    
    # Check if admin user creation script exists
    if [ -f "scripts/initAdmin.js" ]; then
        node scripts/initAdmin.js
    elif [ -f "ensureAdminUser.ts" ]; then
        npx ts-node ensureAdminUser.ts
    else
        print_warning "Admin user creation script not found. Please create admin user manually."
    fi
    
    print_success "Admin user setup completed"
}

# Function to build backend
build_backend() {
    print_status "Building backend application..."
    
    cd "$APP_DIR/backend"
    
    # Build TypeScript
    npm run build
    
    print_success "Backend built successfully"
}

# Function to build frontend
build_frontend() {
    print_status "Building frontend application..."
    
    cd "$APP_DIR"
    
    # Set environment variables for build
    export NODE_ENV=production
    export VITE_BACKEND_URL=https://$DOMAIN
    
    # Build frontend
    npm run build
    
    # Copy built files to nginx directory
    cp -r dist/* /var/www/html/
    
    print_success "Frontend built successfully"
}

# Function to create PM2 ecosystem configuration
create_pm2_config() {
    print_status "Creating PM2 ecosystem configuration..."
    
    cat > "$APP_DIR/ecosystem.config.js" <<EOF
module.exports = {
  apps: [
    {
      name: 'mymeds-backend',
      script: './backend/dist/index.js',
      cwd: '$APP_DIR',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT,
        HOST: '0.0.0.0'
      },
      error_file: '$APP_DIR/logs/backend-error.log',
      out_file: '$APP_DIR/logs/backend-out.log',
      log_file: '$APP_DIR/logs/backend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      node_args: '--max-old-space-size=1024'
    }
  ]
};
EOF

    # Set permissions
    chown www-data:www-data "$APP_DIR/ecosystem.config.js"
    chmod 644 "$APP_DIR/ecosystem.config.js"
    
    print_success "PM2 ecosystem configuration created"
}

# Function to start application with PM2
start_application() {
    print_status "Starting application with PM2..."
    
    cd "$APP_DIR"
    
    # Start the application
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u www-data --hp /var/www
    
    print_success "Application started with PM2"
}

# Function to create application credentials file
create_app_credentials() {
    print_status "Creating application credentials file..."
    
    # Load secrets from environment files
    source "$APP_DIR/backend/.env.production"
    
    cat > "/var/www/mymeds/app-credentials.conf" <<EOF
# MyMeds Application Credentials
# Generated on: $(date)

# Admin Access
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_DASHBOARD_URL=https://$DOMAIN/admin
ADMIN_PASSWORD_HASH=REPLACE_WITH_HASHED_PASSWORD_HERE

# JWT Secret (keep secure)
JWT_SECRET=$JWT_SECRET

# Database
DATABASE_URL=$DATABASE_URL
DB_PASSWORD=$DB_PASSWORD

# Application URLs
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://$DOMAIN/api
WORDPRESS_BLOG_URL=https://blog.$DOMAIN
WORDPRESS_SHOP_URL=https://shop.$DOMAIN

# PM2 Management
PM2_STATUS="pm2 status"
PM2_LOGS="pm2 logs mymeds-backend"
PM2_RESTART="pm2 restart mymeds-backend"
EOF

    chmod 600 /var/www/mymeds/app-credentials.conf
    chown root:root /var/www/mymeds/app-credentials.conf
    
    print_success "Application credentials saved to /var/www/mymeds/app-credentials.conf"
}

# Function to test application
test_application() {
    print_status "Testing application..."
    
    # Test backend health endpoint
    if curl -f http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
        print_success "Backend health check passed"
    else
        print_warning "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f http://localhost:80 > /dev/null 2>&1; then
        print_success "Frontend accessibility test passed"
    else
        print_warning "Frontend accessibility test failed"
    fi
    
    # Check PM2 status
    pm2 status mymeds-backend
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds Application Setup"
    echo "  Domain: $DOMAIN"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Install Node.js
    install_nodejs
    
    # Install PM2
    install_pm2
    
    # Setup directory structure
    setup_directory_structure
    
    # Setup application files
    setup_application_files
    
    # Install dependencies
    install_backend_dependencies
    install_frontend_dependencies
    
    # Create production environment
    create_production_env
    
    # Run database migrations
    run_database_migrations
    
    # Create admin user
    create_admin_user
    
    # Build applications
    build_backend
    build_frontend
    
    # Create PM2 configuration
    create_pm2_config
    
    # Start application
    start_application
    
    # Create credentials file
    create_app_credentials
    
    # Test application
    test_application
    
    echo ""
    print_success "MyMeds application setup completed successfully!"
    echo ""
    echo "Application Access:"
    echo "Frontend: https://$DOMAIN"
    echo "Backend API: https://$DOMAIN/api"
    echo "Admin Dashboard: https://$DOMAIN/admin"
    echo ""
    echo "Management Commands:"
    echo "PM2 Status: pm2 status"
    echo "View Logs: pm2 logs mymeds-backend"
    echo "Restart: pm2 restart mymeds-backend"
    echo ""
    echo "Next steps:"
    echo "1. Configure SSL certificates: ./setup-ssl.sh"
    echo "2. Update nginx configuration: ./setup-nginx.sh"
    echo "3. Test all functionality"
}

# Run main function
main "$@"


#!/bin/bash

# CI/CD Setup Script for MyMeds Pharmacy
# This script sets up the complete CI/CD pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_HOST="${VPS_HOST:-72.60.116.253}"
VPS_USER="${VPS_USER:-root}"
VPS_PORT="${VPS_PORT:-22}"
WEBHOOK_PORT="${WEBHOOK_PORT:-3001}"
WEBHOOK_SECRET="${WEBHOOK_SECRET:-MyMeds-Webhook-Secret-2024-Pharmacy-Deploy}"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup GitHub repository
setup_github() {
    log "Setting up GitHub repository..."
    
    # Check if git is initialized
    if [ ! -d ".git" ]; then
        log "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit"
    fi
    
    # Check if remote exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        warning "No GitHub remote found. Please add your GitHub repository:"
        echo "git remote add origin https://github.com/yourusername/mymeds-pharmacy.git"
        echo "git push -u origin main"
        return 1
    fi
    
    success "GitHub repository configured"
}

# Function to setup GitHub Actions secrets
setup_github_secrets() {
    log "Setting up GitHub Actions secrets..."
    
    echo "Please add the following secrets to your GitHub repository:"
    echo "Go to: https://github.com/yourusername/mymeds-pharmacy/settings/secrets/actions"
    echo ""
    echo "Required secrets:"
    echo "  VPS_HOST: $VPS_HOST"
    echo "  VPS_USERNAME: $VPS_USER"
    echo "  VPS_PORT: $VPS_PORT"
    echo "  VPS_SSH_KEY: [Your private SSH key content]"
    echo "  WEBHOOK_SECRET: $WEBHOOK_SECRET"
    echo ""
    
    # Generate SSH key if it doesn't exist
    if [ ! -f ~/.ssh/id_rsa ]; then
        log "Generating SSH key..."
        ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
        success "SSH key generated"
    fi
    
    echo "Your public SSH key (add to VPS authorized_keys):"
    cat ~/.ssh/id_rsa.pub
    echo ""
    
    warning "Please add the public key to your VPS and the private key to GitHub secrets"
}

# Function to setup VPS for CI/CD
setup_vps() {
    log "Setting up VPS for CI/CD..."
    
    # Create deployment directory structure
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create deployment directory
        sudo mkdir -p /var/www/mymeds-pharmacy
        sudo mkdir -p /var/backups/mymeds-pharmacy
        sudo mkdir -p /var/log/mymeds-pharmacy
        
        # Set permissions
        sudo chown -R $VPS_USER:$VPS_USER /var/www/mymeds-pharmacy
        sudo chown -R $VPS_USER:$VPS_USER /var/backups/mymeds-pharmacy
        sudo chown -R $VPS_USER:$VPS_USER /var/log/mymeds-pharmacy
        
        # Install required packages
        sudo apt update
        sudo apt install -y rsync curl git nginx pm2
        
        # Setup PM2
        pm2 startup
        sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $VPS_USER --hp /home/$VPS_USER
        
        echo '✅ VPS setup completed'
    "
    
    success "VPS setup completed"
}

# Function to setup webhook server
setup_webhook_server() {
    log "Setting up webhook server..."
    
    # Create webhook server directory
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create webhook directory
        sudo mkdir -p /opt/webhook-deploy
        sudo chown -R $VPS_USER:$VPS_USER /opt/webhook-deploy
        
        # Create webhook server package.json
        cat > /opt/webhook-deploy/package.json << 'EOF'
{
  \"name\": \"webhook-deploy\",
  \"version\": \"1.0.0\",
  \"description\": \"Webhook deployment server\",
  \"main\": \"webhook-deploy.js\",
  \"scripts\": {
    \"start\": \"node webhook-deploy.js\",
    \"dev\": \"nodemon webhook-deploy.js\"
  },
  \"dependencies\": {
    \"express\": \"^4.18.2\"
  },
  \"devDependencies\": {
    \"nodemon\": \"^3.0.1\"
  }
}
EOF
        
        # Install dependencies
        cd /opt/webhook-deploy
        npm install
        
        echo '✅ Webhook server setup completed'
    "
    
    # Copy webhook server files
    scp -P $VPS_PORT scripts/webhook-deploy.js $VPS_USER@$VPS_HOST:/opt/webhook-deploy/
    scp -P $VPS_PORT scripts/incremental-deploy.sh $VPS_USER@$VPS_HOST:/opt/webhook-deploy/
    
    # Make deploy script executable
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "chmod +x /opt/webhook-deploy/incremental-deploy.sh"
    
    # Create systemd service for webhook server
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        sudo tee /etc/systemd/system/webhook-deploy.service > /dev/null << EOF
[Unit]
Description=Webhook Deployment Server
After=network.target

[Service]
Type=simple
User=$VPS_USER
WorkingDirectory=/opt/webhook-deploy
ExecStart=/usr/bin/node webhook-deploy.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=WEBHOOK_PORT=$WEBHOOK_PORT
Environment=WEBHOOK_SECRET=$WEBHOOK_SECRET
Environment=VPS_HOST=$VPS_HOST
Environment=VPS_USER=$VPS_USER
Environment=VPS_PORT=$VPS_PORT

[Install]
WantedBy=multi-user.target
EOF
        
        # Enable and start webhook service
        sudo systemctl daemon-reload
        sudo systemctl enable webhook-deploy
        sudo systemctl start webhook-deploy
        
        echo '✅ Webhook service started'
    "
    
    success "Webhook server setup completed"
}

# Function to setup nginx for webhook
setup_nginx_webhook() {
    log "Setting up nginx for webhook..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create nginx configuration for webhook
        sudo tee /etc/nginx/sites-available/webhook-deploy > /dev/null << EOF
server {
    listen 80;
    server_name $VPS_HOST;
    
    location /webhook {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /deploy {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /status {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        
        # Enable webhook site
        sudo ln -sf /etc/nginx/sites-available/webhook-deploy /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        sudo nginx -t
        
        # Reload nginx
        sudo systemctl reload nginx
        
        echo '✅ Nginx webhook configuration completed'
    "
    
    success "Nginx webhook setup completed"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        # Create monitoring script
        sudo tee /opt/monitor-deployment.sh > /dev/null << 'EOF'
#!/bin/bash

# Deployment monitoring script
LOG_FILE=\"/var/log/mymeds-pharmacy/deployment.log\"
WEBHOOK_URL=\"http://localhost:3001/health\"

# Function to log messages
log() {
    echo \"[\$(date +'%Y-%m-%d %H:%M:%S')] \$1\" >> \$LOG_FILE
}

# Check webhook server health
if curl -f \$WEBHOOK_URL > /dev/null 2>&1; then
    log \"Webhook server is healthy\"
else
    log \"Webhook server is down - restarting\"
    sudo systemctl restart webhook-deploy
fi

# Check backend health
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    log \"Backend is healthy\"
else
    log \"Backend is down - restarting\"
    sudo pm2 restart mymeds-backend
fi

# Check nginx health
if sudo systemctl is-active --quiet nginx; then
    log \"Nginx is healthy\"
else
    log \"Nginx is down - restarting\"
    sudo systemctl restart nginx
fi
EOF
        
        # Make monitoring script executable
        sudo chmod +x /opt/monitor-deployment.sh
        
        # Create cron job for monitoring
        echo \"*/5 * * * * /opt/monitor-deployment.sh\" | sudo crontab -
        
        echo '✅ Monitoring setup completed'
    "
    
    success "Monitoring setup completed"
}

# Function to test CI/CD setup
test_setup() {
    log "Testing CI/CD setup..."
    
    # Test webhook server
    if curl -f http://$VPS_HOST/webhook/health > /dev/null 2>&1; then
        success "Webhook server is accessible"
    else
        error "Webhook server is not accessible"
        return 1
    fi
    
    # Test deployment script
    ssh -p $VPS_PORT $VPS_USER@$VPS_HOST "
        cd /opt/webhook-deploy
        if [ -f incremental-deploy.sh ]; then
            echo '✅ Deployment script found'
        else
            echo '❌ Deployment script not found'
            exit 1
        fi
    "
    
    success "CI/CD setup test completed"
}

# Main setup function
main() {
    log "Starting CI/CD setup for MyMeds Pharmacy..."
    
    # Check required tools
    if ! command_exists ssh; then
        error "SSH is required but not installed"
        exit 1
    fi
    
    if ! command_exists curl; then
        error "curl is required but not installed"
        exit 1
    fi
    
    # Setup steps
    setup_github
    setup_github_secrets
    setup_vps
    setup_webhook_server
    setup_nginx_webhook
    setup_monitoring
    test_setup
    
    success "CI/CD setup completed successfully!"
    
    echo ""
    echo "🎉 CI/CD Pipeline Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Add the GitHub secrets as shown above"
    echo "2. Push your code to GitHub: git push origin main"
    echo "3. The deployment will trigger automatically"
    echo ""
    echo "Webhook URL: http://$VPS_HOST/webhook"
    echo "Health check: http://$VPS_HOST/webhook/health"
    echo "Manual deploy: http://$VPS_HOST/deploy/[frontend|backend|full]"
    echo "Status: http://$VPS_HOST/status"
    echo ""
    echo "Webhook secret: $WEBHOOK_SECRET"
    echo "Add this to your GitHub repository webhook settings"
    echo ""
}

# Run main function
main "$@"
#!/bin/bash

# =============================================================================
# MyMeds Database Setup Script
# =============================================================================
# This script sets up MySQL database for MyMeds Pharmacy Inc.
# Domain: mymedspharmacyinc.com
# VPS: 72.60.116.253
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="mymeds_production"
DB_USER="mymeds_user"
MYSQL_ROOT_PASSWORD=""
DB_PASSWORD=""

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

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Function to check if MySQL is installed
check_mysql() {
    if command -v mysql >/dev/null 2>&1; then
        print_success "MySQL is already installed"
        return 0
    else
        print_status "MySQL not found. Installing..."
        return 1
    fi
}

# Function to install MySQL
install_mysql() {
    print_status "Installing MySQL Server..."
    
    # Update package list
    apt-get update
    
    # Set password for MySQL root user (non-interactive)
    echo "mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD" | debconf-set-selections
    echo "mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD" | debconf-set-selections
    
    # Install MySQL
    apt-get install -y mysql-server mysql-client
    
    # Start and enable MySQL
    systemctl start mysql
    systemctl enable mysql
    
    print_success "MySQL installed successfully"
}

# Function to secure MySQL installation
secure_mysql() {
    print_status "Securing MySQL installation..."
    
    # Run mysql_secure_installation equivalent
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$MYSQL_ROOT_PASSWORD';
FLUSH PRIVILEGES;
EOF
    
    print_success "MySQL secured successfully"
}

# Function to create database and user
create_database_and_user() {
    print_status "Creating database and user..."
    
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
CREATE USER IF NOT EXISTS 'wp_mymeds'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
CREATE DATABASE IF NOT EXISTS wp_mymeds CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON wp_mymeds.* TO 'wp_mymeds'@'localhost';
FLUSH PRIVILEGES;
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User IN ('$DB_USER', 'wp_mymeds');
EOF
    
    print_success "Database and users created successfully"
}

# Function to create database credentials file
create_db_credentials() {
    print_status "Creating database credentials file..."
    
    cat > /var/www/mymeds/db-credentials.conf <<EOF
# MySQL Database Credentials for MyMeds Pharmacy Inc.
# Generated on: $(date)

# MyMeds Application Database
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# WordPress Database
WP_DB_NAME=wp_mymeds
WP_DB_USER=wp_mymeds
WP_DB_PASSWORD=$DB_PASSWORD

# MySQL Root Password
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD

# Connection URLs
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
WP_DATABASE_URL="mysql://wp_mymeds:$DB_PASSWORD@localhost:3306/wp_mymeds"
EOF
    
    # Secure the credentials file
    chmod 600 /var/www/mymeds/db-credentials.conf
    chown root:root /var/www/mymeds/db-credentials.conf
    
    print_success "Database credentials saved to /var/www/mymeds/db-credentials.conf"
}

# Function to setup database backup
setup_db_backup() {
    print_status "Setting up automated database backup..."
    
    # Create backup directory
    mkdir -p /backups/mysql
    
    # Create backup script
    cat > /usr/local/bin/mymeds-db-backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=\$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/mymeds-backup.log"

echo "\$(date): Starting MyMeds database backup" >> \$LOG_FILE

# Backup MyMeds database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > \$BACKUP_DIR/mymeds_\$DATE.sql

# Backup WordPress database
mysqldump -u wp_mymeds -p$DB_PASSWORD wp_mymeds > \$BACKUP_DIR/wp_mymeds_\$DATE.sql

# Compress backups
gzip \$BACKUP_DIR/mymeds_\$DATE.sql
gzip \$BACKUP_DIR/wp_mymeds_\$DATE.sql

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "\$(date): Database backup completed" >> \$LOG_FILE
EOF
    
    chmod +x /usr/local/bin/mymeds-db-backup.sh
    
    # Setup cron job for daily backups at 2 AM
    echo "0 2 * * * /usr/local/bin/mymeds-db-backup.sh" | crontab -
    
    # Test backup
    /usr/local/bin/mymeds-db-backup.sh
    
    print_success "Database backup system configured"
}

# Function to test database connection
test_connection() {
    print_status "Testing database connections..."
    
    # Test MyMeds database
    mysql -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "MyMeds database connection successful"
    else
        print_error "MyMeds database connection failed"
        exit 1
    fi
    
    # Test WordPress database
    mysql -u "wp_mymeds" -p"$DB_PASSWORD" -e "USE wp_mymeds; SHOW TABLES;" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "WordPress database connection successful"
    else
        print_error "WordPress database connection failed"
        exit 1
    fi
}

# Main execution
main() {
    echo "=========================================="
    echo "  MyMeds Database Setup Script"
    echo "  Domain: mymedspharmacyinc.com"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Generate secure passwords
    MYSQL_ROOT_PASSWORD=$(generate_password)
    DB_PASSWORD=$(generate_password)
    
    print_status "Generated secure passwords"
    print_warning "Save these passwords securely:"
    echo "MySQL Root Password: $MYSQL_ROOT_PASSWORD"
    echo "Database Password: $DB_PASSWORD"
    echo ""
    
    # Create application directory
    mkdir -p /var/www/mymeds
    
    # Check and install MySQL
    if ! check_mysql; then
        install_mysql
    fi
    
    # Secure MySQL
    secure_mysql
    
    # Create database and user
    create_database_and_user
    
    # Create credentials file
    create_db_credentials
    
    # Setup backup system
    setup_db_backup
    
    # Test connections
    test_connection
    
    echo ""
    print_success "Database setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Run the WordPress setup script: ./setup-wordpress.sh"
    echo "2. Run the application setup script: ./setup-application.sh"
    echo "3. Configure SSL certificates: ./setup-ssl.sh"
}

# Run main function
main "$@"


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


#!/bin/bash

# =============================================================================
# WordPress Setup Script for MyMeds - Blog & WooCommerce
# =============================================================================
# This script sets up WordPress with WooCommerce for MyMeds Pharmacy Inc.
# Domain: mymedspharmacyinc.com
# Blog: blog.mymedspharmacyinc.com
# Shop: shop.mymedspharmacyinc.com
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
BLOG_SUBDOMAIN="blog"
SHOP_SUBDOMAIN="shop"
WP_VERSION="6.4"
WP_ADMIN_USER="mymeds_admin"
WP_ADMIN_PASS=""
WP_ADMIN_EMAIL="admin@mymedspharmacyinc.com"
WP_SITE_TITLE="MyMeds Pharmacy Inc."
WP_BLOG_DESCRIPTION="Professional Pharmacy Services"
WP_SHOP_DESCRIPTION="Quality Medications & Health Products"

# WordPress directories
WP_BLOG_DIR="/var/www/wordpress/blog"
WP_SHOP_DIR="/var/www/wordpress/shop"
WP_CONFIG_DIR="/var/www/wordpress/config"

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

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-20
}

# Function to generate auth keys
generate_auth_keys() {
    print_status "Generating WordPress security keys..."
    
    SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    SECURE_AUTH_KEY=$(openssl rand -bas64 64 | tr -d "=+/" | cut -c1-60)
    LOGGED_IN_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    NONCE_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    SECURE_AUTH_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    LOGGED_IN_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    NONCE_SALT=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-60)
    
    echo "SECRET_KEY=$SECRET_KEY"
    echo "SECURE_AUTH_KEY=$SECURE_AUTH_KEY"
    echo "LOGGED_IN_KEY=$LOGGED_IN_KEY"
    echo "NONCE_KEY=$NONCE_KEY"
    echo "SECURE_AUTH_SALT=$SECURE_AUTH_SALT"
    echo "LOGGED_IN_SALT=$LOGGED_IN_SALT"
    echo "NONCE_SALT=$NONCE_SALT"
}

# Function to install PHP and extensions
install_php() {
    print_status "Installing PHP 8.1 and extensions..."
    
    # Add PHP repository
    add-apt-repository ppa:ondrej/php -y
    apt update
    
    # Install PHP and extensions
    apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-gd \
                   php8.1-curl php8.1-zip php8.1-mbstring php8.1-opcache \
                   php8.1-bcmath php8.1-soap php8.1-intl php8.1-imagick
    
    # Configure PHP
    sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 100M/' /etc/php/8.1/fpm/php.ini
    sed -i 's/post_max_size = 8M/post_max_size = 100M/' /etc/php/8.1/fpm/php.ini
    sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.1/fpm/php.ini
    sed -i 's/max_input_vars = 1000/max_input_vars = 3000/' /etc/php/8.1/fpm/php.ini
    
    # Start and enable PHP-FPM
    systemctl start php8.1-fpm
    systemctl enable php8.1-fpm
    
    print_success "PHP 8.1 installed and configured"
}

# Function to download WordPress
download_wordpress() {
    local wp_dir="$1"
    local site_type="$2"
    
    print_status "Downloading WordPress for $site_type..."
    
    # Create directory
    mkdir -p "$wp_dir"
    cd "$wp_dir"
    
    # Download WordPress
    wget https://wordpress.org/wordpress-$WP_VERSION.tar.gz
    tar -xzf wordpress-$WP_VERSION.tar.gz --strip-components=1
    rm.wordpress-$WP_VERSION.tar.gz
    
    # Set permissions
    chown -R www-data:www-data "$wp_dir"
    chmod -R 755 "$wp_dir"
    
    print_success "WordPress downloaded to $wp_dir"
}

# Function to create wp-config.php
create_wp_config() {
    local wp_dir="$1"
    local db_name="$2"
    local db_user="$3"
    local db_pass="$4"
    local site_type="$5"
    
    print_status "Creating wp-config.php for $site_type..."
    
    # Generate auth keys
    local keys=$(generate_auth_keys)
    
    cat > "$wp_dir/wp-config.php" <<EOF
<?php
/**
 * WordPress configuration file for MyMeds $site_type
 * Generated on: $(date)
 */

// Database configuration
define('DB_NAME', '$db_name');
define('DB_USER', '$db_user');
define('DB_PASSWORD', '$db_pass');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// WordPress authentication keys
EOF

    # Add generated keys
    while IFS='=' read -r key value; do
        echo "define('$key', '$value');" >> "$wp_dir/wp-config.php"
    done <<< "$keys"

    cat >> "$wp_dir/wp-config.php" <<EOF

// WordPress salts
define('AUTH_SALT',        '$SECURE_AUTH_SALT');
define('SECURE_AUTH_SALT', '$SECURE_AUTH_SALT');
define('LOGGED_IN_SALT',   '$LOGGED_IN_SALT');
define('NONCE_SALT',       '$NONCE_SALT');

// WordPress configuration
define('WP_TABLE_PREFIX', 'wp_');
\$table_prefix = 'wp_';

// WordPress URLs
define('WP_HOME', 'https://$site_type.$DOMAIN');
define('WP_SITEURL', 'https://$site_type.$DOMAIN');

// Security settings
define('DISALLOW_FILE_EDIT', true);
define('WP_POST_REVISIONS', 5);
define('AUTOMATIC_UPDATER_DISABLED', true);
define('WP_AUTO_UPDATE_CORE', false);

// Performance settings
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('CONCATENATE_SCRIPTS', true);

// File permissions
define('FS_METHOD', 'direct');
define('FTP_BASE', '/var/www/wordpress/$site_type');
define('FTP_CONTENT_DIR', '/var/www/wordpress/$site_type/wp-content/');

// Memory limits
ini_set('memory_limit', '256M');

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/wordpress-$site_type-errors.log');

/** Absolute path to the WordPress directory. */
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF

    # Secure the config file
    chown www-data:www-data "$wp_dir/wp-config.php"
    chmod 600 "$wp_dir/wp-config.php"
    
    print_success "wp-config.php created for $site_type"
}

# Function to install WordPress via WP-CLI
install_wordpress_wpcli() {
    local wp_dir="$1"
    local site_title="$2"
    local description="$3"
    local admin_user="$4"
    local admin_email="$5"
    local site_type="$6"
    
    print_status "Installing WordPress for $site_type..."
    
    # Install WP-CLI if not installed
    if ! command -v wp >/dev/null 2>&1; then
        print_status "Installing WP-CLI..."
        curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
        chmod +x wp-cli.phar
        mv wp-cli.phar /usr/local/bin/wp
        
        # Install PHP required extensions for WP-CLI
        apt install -y php8.1-cli php8.1-curl
    fi
    
    cd "$wp_dir"
    
    # Install WordPress
    sudo -u www-data wp core install \
        --url="$site_type.$DOMAIN" \
        --title="$site_title" \
        --admin_user="$admin_user" \
        --admin_password="$WP_ADMIN_PASS" \
        --admin_email="$admin_email" \
        --skip-email
    
    # Configure WordPress
    sudo -u www-data wp option update blogdescription "$description"
    sudo -u www-data wp option update timezone_string "America/New_York"
    sudo -u www-data wp option update date_format "F j, Y"
    sudo -u www-data wp option update time_format "g:i A"
    
    print_success "WordPress installed for $site_type"
}

# Function to install WooCommerce
install_woocommerce() {
    local wp_dir="$1"
    
    print_status "Installing WooCommerce..."
    
    cd "$wp_dir"
    
    # Install WooCommerce plugin
    sudo -u www-data wp plugin install woocommerce --activate
    
    # Configure WooCommerce basics
    sudo -u www-data wp option update woocommerce_store_address "1234 Pharmacy Ave"
    sudo -u www-data wp option update woocommerce_store_address_2 ""
    sudo -u www-data wp option update woocommerce_store_city "Brooklyn"
    sudo -u www-data wp option update woocommerce_default_country "US:NY"
    sudo -u www-data wp option update woocommerce_store_postcode "11201"
    sudo -u www-data wp option update woocommerce_currency "USD"
    sudo -u www-data wp option update woocommerce_allowed_countries "specific"
    sudo -u www-data wp option update woocommerce_specific_allowed_countries "US"
    sudo -u www-data wp option update woocommerce_store_phone ""
    sudo -u www-data wp option update woocommerce_email_from_address "admin@$DOMAIN"
    sudo -u www-data wp option update woocommerce_email_from_name "MyMeds Pharmacy"
    
    # Install WooCommerce pages
    sudo -u www-data wp import-plugin woocommerce-demo --activate
    
    print_success "WooCommerce installed and configured"
}

# Function to install additional plugins
install_plugins() {
    local wp_dir="$1"
    local site_type="$2"
    
    print_status "Installing plugins for $site_type..."
    
    cd "$wp_dir"
    
    if [ "$site_type" = "blog" ]; then
        # Blog-specific plugins
        sudo -u www-data wp plugin install wp-super-cache --activate
        sudo -u www-data wp plugin install wp-mail-smtp --activate
        sudo -u www-data wp plugin install wordpress-seo --activate
        sudo -u www-data wp plugin install really-simple-ssl --activate
        
    elif [ "$site_type" = "shop" ]; then
        # Shop-specific plugins
        sudo -u www-data wp plugin install wp-super-cache --activate
        sudo -u www-data wp plugin install wp-mail-smtp --activate
        sudo -u www-data wp plugin install wordpress-seo --activate
        sudo -u www-data wp plugin install really-simple-ssl --activate
        sudo -u www-data wp plugin install woocommerce-single-product-page-builder --activate
        sudo -u www-data wp plugin install woo-commerce-perfect-brand --activate
    fi
    
    print_success "Plugins installed for $site_type"
}

# Function to create WordPress credentials file
create_wp_credentials() {
    print_status "Creating WordPress credentials file..."
    
    cat > /var/www/mymeds/wp-credentials.conf <<EOF
# WordPress Credentials for MyMeds Pharmacy Inc.
# Generated on: $(date)

# Admin Credentials
WP_ADMIN_USER=$WP_ADMIN_USER
WP_ADMIN_PASS=$WP_ADMIN_PASS
WP_ADMIN_EMAIL=$WP_ADMIN_EMAIL

# WordPress URLs
WP_BLOG_URL=https://blog.$DOMAIN
WP_SHOP_URL=https://shop.$DOMAIN

# WordPress Directories
WP_BLOG_DIR=$WP_BLOG_DIR
WP_SHOP_DIR=$WP_SHOP_DIR

# Application passwords for API access
WP_BLOG_APP_PASSWORD=REPLACE_WITH_BLOG_APP_PASSWORD
WP_SHOP_APP_PASSWORD=REPLACE_WITH_SHOP_APP_PASSWORD
EOF

    chmod 600 /var/www/mymeds/wp-credentials.conf
    chown root:root /var/www/mymeds/wp-credentials.conf
    
    print_success "WordPress credentials saved to /var/www/mymeds/wp-credentials.conf"
}

# Function to setup WordPress security
setup_wordpress_security() {
    print_status "Setting up WordPress security..."
    
    # Hide wp-config.php
    cat > /etc/apache2/conf-available/wordpress-security.conf <<EOF
<Directory /var/www/wordpress/>
    <Files wp-config.php>
        Require all denied
    </Files>
    <Files wp-config-sample.php>
        Require all denied
    </Files>
    <Files .htaccess>
        Require all denied
    </Files>
    <Files readme.html>
        Require all denied
    </Files>
    <Files license.txt>
        Require all denied
    </Files>
</Directory>
EOF

    # Create .htaccess for security
    cat > /var/www/wordpress/blog/.htaccess <<EOF
# Security Headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Block access to sensitive files
<Files wp-config.php>
    Require all denied
</Files>
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^wp-admin/admin-ajax.php$ - [L]
    RewriteRule ^wp-.* - [F]
</IfModule>
EOF

    cp /var/www/wordpress/blog/.htaccess /var/www/wordpress/shop/.htaccess
    
    print_success "WordPress security configured"
}

# Main execution
main() {
    echo "=========================================="
    echo "  WordPress Setup for MyMeds Pharmacy"
    echo "  Domain: $DOMAIN"
    echo "  Date: $(date)"
    echo "=========================================="
    
    # Load database credentials
    if [ -f "/var/www/mymeds/db-credentials.conf" ]; then
        source /var/www/mymeds/db-credentials.conf
    else
        print_error "Database credentials not found. Run setup-database.sh first."
        exit 1
    fi
    
    # Generate admin password
    WP_ADMIN_PASS=$(generate_password)
    
    print_status "Generated WordPress admin password: $WP_ADMIN_PASS"
    
    # Install PHP
    install_php
    
    # Download WordPress for blog
    download_wordpress "$WP_BLOG_DIR" "blog"
    
    # Download WordPress for shop
    download_wordpress "$WP_SHOP_DIR" "shop"
    
    # Create wp-config for blog
    create_wp_config "$WP_BLOG_DIR" "$DB_NAME" "wp_mymeds" "$DB_PASSWORD" "blog"
    
    # Create wp-config for shop
    create_wp_config "$WP_SHOP_DIR" "$DB_NAME" "wp_mymeds" "$DB_PASSWORD" "shop"
    
    # Install WordPress for blog
    install_wordpress_wpcli "$WP_BLOG_DIR" "$WP_SITE_TITLE" "$WP_BLOG_DESCRIPTION" "$WP_ADMIN_USER" "$WP_ADMIN_EMAIL" "blog"
    
    # Install WordPress for shop
    install_wordpress_wpcli "$WP_SHOP_DIR" "$WP_SITE_TITLE" "$WP_SHOP_DESCRIPTION" "$WP_ADMIN_USER" "$WP_ADMIN_EMAIL" "shop"
    
    # Install WooCommerce on shop
    install_woocommerce "$WP_SHOP_DIR"
    
    # Install plugins
    install_plugins "$WP_BLOG_DIR" "blog"
    install_plugins "$WP_SHOP_DIR" "shop"
    
    # Create credentials file
    create_wp_credentials
    
    # Setup security
    setup_wordpress_security
    
    echo ""
    print_success "WordPress setup completed successfully!"
    echo ""
    echo "WordPress Admin Access:"
    echo "Blog Admin: https://blog.$DOMAIN/wp-admin"
    echo "Shop Admin: https://shop.$DOMAIN/wp-admin"
    echo "Username: $WP_ADMIN_USER"
    echo "Password: $WP_ADMIN_PASS"
    echo ""
    echo "Next steps:"
    echo "1. Run the application setup script: ./setup-application.sh"
    echo "2. Configure SSL certificates: ./setup-ssl.sh"
    echo "3. Update nginx configuration: ./setup-nginx.sh"
}

# Run main function
main "$@"




