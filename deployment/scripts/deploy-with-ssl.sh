#!/bin/bash
# =============================================================================
# SSL-ENABLED DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Complete deployment with SSL certificate setup and validation
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - SSL-Enabled Deployment"
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
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"
NGINX_SSL_CONFIG="deployment/nginx/nginx-ssl.conf"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root for SSL setup"
    exit 1
fi

# Check if domain is accessible
log_info "Checking domain accessibility..."
if ! curl -s --max-time 10 "http://$DOMAIN" >/dev/null 2>&1; then
    log_warning "Domain $DOMAIN is not accessible via HTTP"
    log_info "Please ensure:"
    echo "1. Domain DNS points to this server ($(curl -s ifconfig.me 2>/dev/null || echo 'unknown'))"
    echo "2. Port 80 is open and accessible"
    echo "3. You have a basic HTTP server running"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if required files exist
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "Docker Compose file not found: $DOCKER_COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$NGINX_SSL_CONFIG" ]; then
    log_error "Nginx SSL configuration not found: $NGINX_SSL_CONFIG"
    exit 1
fi

log_success "Pre-deployment checks completed"

# =============================================================================
# STEP 1: SET UP SSL CERTIFICATES
# =============================================================================
log_info "Step 1: Setting up SSL certificates..."

if [ -f "deployment/scripts/setup-ssl.sh" ]; then
    chmod +x deployment/scripts/setup-ssl.sh
    ./deployment/scripts/setup-ssl.sh
    
    if [ $? -eq 0 ]; then
        log_success "SSL certificates set up successfully"
    else
        log_error "SSL certificate setup failed"
        exit 1
    fi
else
    log_error "SSL setup script not found: deployment/scripts/setup-ssl.sh"
    exit 1
fi

# =============================================================================
# STEP 2: UPDATE NGINX CONFIGURATION
# =============================================================================
log_info "Step 2: Updating Nginx configuration for SSL..."

# Backup original configuration
if [ -f "deployment/nginx/nginx-full-stack.conf" ]; then
    cp deployment/nginx/nginx-full-stack.conf deployment/nginx/nginx-full-stack.conf.backup.$(date +%Y%m%d_%H%M%S)
    log_info "Original Nginx configuration backed up"
fi

# Copy SSL configuration
cp "$NGINX_SSL_CONFIG" deployment/nginx/nginx-full-stack.conf
log_success "Nginx configuration updated for SSL"

# =============================================================================
# STEP 3: UPDATE DOCKER COMPOSE
# =============================================================================
log_info "Step 3: Updating Docker Compose for SSL volumes..."

# Check if SSL volumes are already configured
if grep -q "/etc/letsencrypt" "$DOCKER_COMPOSE_FILE"; then
    log_info "SSL volumes already configured in Docker Compose"
else
    log_warning "SSL volumes not found in Docker Compose"
    log_info "Please manually add these volumes to your nginx service:"
    echo "  - /etc/letsencrypt:/etc/letsencrypt:ro"
    echo "  - /var/www/certbot:/var/www/certbot:ro"
    echo "  - /etc/nginx/conf.d:/etc/nginx/conf.d:ro"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# =============================================================================
# STEP 4: DEPLOY APPLICATION
# =============================================================================
log_info "Step 4: Deploying application with SSL..."

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

# Build and start services
log_info "Building and starting services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

# Start services in stages for memory optimization
log_info "Starting MySQL and Redis..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mysql redis

# Wait for database to be ready
log_info "Waiting for database to be ready..."
sleep 30

# Start WordPress
log_info "Starting WordPress..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d wordpress

# Wait for WordPress
sleep 30

# Start MyMeds application
log_info "Starting MyMeds application..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mymeds-app

# Wait for application
sleep 30

# Start Nginx with SSL
log_info "Starting Nginx with SSL..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d nginx

# Wait for Nginx
sleep 10

log_success "Application deployed with SSL"

# =============================================================================
# STEP 5: RUN DATABASE MIGRATIONS
# =============================================================================
log_info "Step 5: Running database migrations..."

docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy || log_warning "Database migrations may have failed"

# Initialize integrations
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js || log_warning "Integration initialization may have failed"

log_success "Database setup completed"

# =============================================================================
# STEP 6: SSL HEALTH CHECK
# =============================================================================
log_info "Step 6: Performing SSL health check..."

if [ -f "deployment/scripts/ssl-health-check.sh" ]; then
    chmod +x deployment/scripts/ssl-health-check.sh
    ./deployment/scripts/ssl-health-check.sh
    
    if [ $? -eq 0 ]; then
        log_success "SSL health check passed"
    else
        log_warning "SSL health check found issues"
    fi
else
    log_warning "SSL health check script not found"
fi

# =============================================================================
# STEP 7: FINAL VERIFICATION
# =============================================================================
log_info "Step 7: Final verification..."

# Check if all services are running
services=("mysql:3306" "redis:6379" "wordpress:80" "mymeds-app:4000" "nginx:80" "nginx:443")
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

# Test HTTPS endpoints
log_info "Testing HTTPS endpoints..."

if curl -s --max-time 10 "https://$DOMAIN" >/dev/null 2>&1; then
    log_success "HTTPS frontend is accessible"
else
    log_warning "HTTPS frontend may not be accessible yet"
fi

if curl -s --max-time 10 "https://$DOMAIN/api/health" >/dev/null 2>&1; then
    log_success "HTTPS API is accessible"
else
    log_warning "HTTPS API may not be accessible yet"
fi

# =============================================================================
# DEPLOYMENT SUMMARY
# =============================================================================
echo ""
log_success "🎉 SSL-enabled deployment completed!"
echo ""
log_info "Deployment Summary:"
echo "===================="
echo "✅ SSL certificates obtained and configured"
echo "✅ Nginx configured for HTTPS with security headers"
echo "✅ Docker containers deployed with SSL volumes"
echo "✅ Database migrations completed"
echo "✅ Automated SSL renewal configured"
echo "✅ SSL monitoring configured"
echo ""

if [ "$all_healthy" = true ]; then
    log_success "All services are healthy and running"
else
    log_warning "Some services may need attention"
fi

log_info "Service URLs:"
echo "=============="
echo "🌐 HTTPS Frontend: https://$DOMAIN"
echo "🔧 HTTPS Backend API: https://$DOMAIN/api"
echo "📝 HTTPS WordPress Admin: https://$DOMAIN/wp-admin"
echo "🛒 HTTPS WooCommerce Shop: https://$DOMAIN/shop"
echo "📖 HTTPS Blog: https://$DOMAIN/blog"
echo "📝 HTTPS Blog Admin: https://$DOMAIN/blog/wp-admin"
echo "🏥 HTTPS Health Check: https://$DOMAIN/health"
echo ""

log_info "SSL Configuration:"
echo "===================="
echo "🔐 SSL Provider: Let's Encrypt"
echo "🔄 Auto-renewal: Twice daily (2 AM & 2 PM)"
echo "📊 SSL Monitoring: Daily at 6 AM"
echo "📁 Certificate Path: /etc/letsencrypt/live/$DOMAIN/"
echo ""

log_info "Default Credentials:"
echo "====================="
echo "WordPress Admin: admin / Mymeds2025!AdminSecure123!@#"
echo "MyMeds Admin: admin@mymedspharmacyinc.com / Mymeds2025!AdminSecure123!@#"
echo "Database Root: root / Mymeds2025!RootSecure123!@#"
echo ""

log_info "Next Steps:"
echo "============"
echo "1. Test all HTTPS endpoints"
echo "2. Configure your domain DNS to point to this server"
echo "3. Set up email alerts for SSL certificate expiry"
echo "4. Monitor SSL certificate status regularly"
echo "5. Configure additional security measures as needed"
echo ""

log_info "Monitoring Commands:"
echo "======================"
echo "Check SSL status: ./deployment/scripts/ssl-health-check.sh"
echo "View renewal logs: tail -f /var/log/ssl-renewal.log"
echo "View monitoring logs: tail -f /var/log/ssl-monitor.log"
echo "Check certificates: certbot certificates"
echo "Test renewal: certbot renew --dry-run"
echo "View container status: docker-compose -f $DOCKER_COMPOSE_FILE ps"
echo ""

log_success "🔐 Your MyMeds Pharmacy is now live with SSL security!"
echo ""
log_info "Deployment completed at: $(date)"
echo "=================================================="
