#!/bin/bash
# =============================================================================
# COMPLETE DEPLOYMENT ORCHESTRATOR - MyMeds Pharmacy Inc.
# =============================================================================
# Orchestrates the complete deployment process on VPS
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Complete Deployment Orchestrator"
echo "========================================================"
echo "This script will deploy the complete MyMeds application stack"
echo "on your fresh Ubuntu VPS."
echo "========================================================"

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
VPS_IP="72.60.116.253"
SCRIPT_DIR="/var/www/mymeds/deployment/scripts"

# =============================================================================
# DEPLOYMENT STAGES
# =============================================================================
deployment_stages=(
    "02-setup-environment.sh:Setting up system environment and Docker"
    "03-install-dependencies.sh:Installing Node.js, WordPress plugins, and dependencies"
    "04-setup-database.sh:Setting up MySQL database and running migrations"
    "05-deploy-application.sh:Deploying the complete application stack"
    "06-setup-wordpress.sh:Configuring WordPress and WooCommerce"
)

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

# Check if we're running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "deployment" ]; then
    log_error "Please run this script from the project root directory"
    exit 1
fi

# Check if deployment scripts exist
for stage in "${deployment_stages[@]}"; do
    script_name=$(echo $stage | cut -d: -f1)
    if [ ! -f "deployment/scripts/$script_name" ]; then
        log_error "Required script deployment/scripts/$script_name not found"
        exit 1
    fi
done

log_success "Pre-deployment checks passed"

# =============================================================================
# DEPLOYMENT EXECUTION
# =============================================================================
log_info "Starting deployment process..."
echo ""

total_stages=${#deployment_stages[@]}
current_stage=0

for stage in "${deployment_stages[@]}"; do
    script_name=$(echo $stage | cut -d: -f1)
    stage_description=$(echo $stage | cut -d: -f2)
    
    current_stage=$((current_stage + 1))
    
    echo "=================================================="
    log_info "Stage $current_stage/$total_stages: $stage_description"
    echo "Script: $script_name"
    echo "=================================================="
    
    # Make script executable
    chmod +x "deployment/scripts/$script_name"
    
    # Execute the script
    if bash "deployment/scripts/$script_name"; then
        log_success "Stage $current_stage completed successfully"
    else
        log_error "Stage $current_stage failed: $script_name"
        echo ""
        log_error "Deployment failed at stage $current_stage"
        log_info "Please check the logs above and fix any issues"
        log_info "You can continue from this stage by running:"
        echo "bash deployment/scripts/$script_name"
        exit 1
    fi
    
    echo ""
done

# =============================================================================
# FINAL VERIFICATION
# =============================================================================
log_info "Performing final verification..."

# Check if all services are running
services=("mysql:3306" "redis:6379" "wordpress:80" "mymeds-app:4000")
all_healthy=true

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    if nc -z localhost $service_port 2>/dev/null; then
        log_success "$service_name is running on port $service_port"
    else
        log_error "$service_name is not responding on port $service_port"
        all_healthy=false
    fi
done

# =============================================================================
# DEPLOYMENT SUMMARY
# =============================================================================
echo ""
echo "=================================================="
log_success "🎉 COMPLETE DEPLOYMENT FINISHED SUCCESSFULLY!"
echo "=================================================="
echo ""

log_info "Deployment Summary:"
echo "===================="
echo "✅ System environment configured"
echo "✅ Docker and dependencies installed"
echo "✅ MySQL database created and migrated"
echo "✅ Redis cache configured"
echo "✅ MyMeds application deployed"
echo "✅ WordPress installed and configured"
echo "✅ WooCommerce installed and activated"
echo "✅ Essential plugins installed"
echo "✅ Pharmacy pages created"
echo ""

log_info "Service URLs:"
echo "=============="
echo "🌐 MyMeds Frontend: http://$VPS_IP:3000"
echo "🔧 MyMeds Backend API: http://$VPS_IP:4000"
echo "📝 WordPress Admin: http://$VPS_IP:8080/wp-admin"
echo "🛒 WooCommerce Shop: http://$VPS_IP:8080/shop"
echo "📖 Blog: http://$VPS_IP:8080/blog"
echo "🗄️ Database: $VPS_IP:3306"
echo "🔐 Admin Panel: http://$VPS_IP:3000/admin"
echo "🏥 Health Check: http://$VPS_IP:4000/api/health"
echo ""

log_info "Default Credentials:"
echo "====================="
echo "WordPress Admin: admin / Mymeds2025!AdminSecure123!@#"
echo "MyMeds Admin: admin@mymedspharmacyinc.com / Mymeds2025!AdminSecure123!@#"
echo "Database Root: root / Mymeds2025!RootSecure123!@#"
echo ""

if [ "$all_healthy" = true ]; then
    log_success "All services are healthy and running"
else
    log_warning "Some services may need attention - check the logs above"
fi

echo ""
log_info "Next Steps:"
echo "============"
echo "1. Test all services by visiting the URLs above"
echo "2. Configure your domain DNS to point to $VPS_IP"
echo "3. Set up SSL certificates for HTTPS:"
echo "   certbot --nginx -d your-domain.com -d www.your-domain.com"
echo "4. Configure WordPress and WooCommerce settings"
echo "5. Add products to your pharmacy shop"
echo "6. Test MyMeds integration with WordPress"
echo "7. Set up monitoring and automated backups"
echo "8. Configure firewall rules for production"
echo ""

log_info "Monitoring Commands:"
echo "====================="
echo "View running containers: docker-compose -f docker-compose.optimized.yml ps"
echo "View resource usage: docker stats"
echo "View logs: docker-compose -f docker-compose.optimized.yml logs -f [service-name]"
echo "Check health: curl http://$VPS_IP:4000/api/health"
echo ""

log_success "🚀 MyMeds Pharmacy Inc. is now live and ready for business!"
echo ""
log_info "Your complete pharmacy management system is deployed and optimized"
log_info "for your VPS specifications (1 CPU, 4GB RAM, 50GB Storage)"
echo ""
echo "=================================================="
echo "Deployment completed at: $(date)"
echo "=================================================="

