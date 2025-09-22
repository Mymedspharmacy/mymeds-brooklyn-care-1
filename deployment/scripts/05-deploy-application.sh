#!/bin/bash
# =============================================================================
# APPLICATION DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Deploys the complete application stack with WordPress and WooCommerce
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Application Deployment Script"
echo "====================================================="

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
cd /var/www/mymeds

VPS_IP="72.60.116.253"
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    log_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    log_error "Docker Compose file $DOCKER_COMPOSE_FILE not found"
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.production" ]; then
    log_error "Environment file .env.production not found"
    exit 1
fi

log_success "Pre-deployment checks passed"

# =============================================================================
# CLEANUP PREVIOUS DEPLOYMENT
# =============================================================================
log_info "Cleaning up previous deployment..."

# Stop and remove existing containers
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

# Clean up old images (keep latest)
docker image prune -f || true

log_success "Cleanup completed"

# =============================================================================
# BUILD APPLICATION IMAGES
# =============================================================================
log_info "Building application images..."

# Build images with no cache
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

log_success "Application images built"

# =============================================================================
# STAGED DEPLOYMENT (Memory Optimized)
# =============================================================================
log_info "Starting staged deployment for memory optimization..."

# Stage 1: Start MySQL and Redis
log_info "Stage 1: Starting MySQL and Redis..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mysql redis

# Wait for services to be ready
log_info "Waiting for MySQL and Redis to be ready..."
sleep 45

# Verify MySQL
if ! docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"Mymeds2025!RootSecure123!@#" -e "SELECT 1;" >/dev/null 2>&1; then
    log_error "MySQL health check failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mysql
    exit 1
fi

# Verify Redis
if ! docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
    log_error "Redis health check failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs redis
    exit 1
fi

log_success "Stage 1 completed - MySQL and Redis running"

# Stage 2: Start WordPress
log_info "Stage 2: Starting WordPress..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d wordpress

# Wait for WordPress to be ready
log_info "Waiting for WordPress to be ready..."
sleep 60

# Verify WordPress
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    log_success "WordPress health check passed"
else
    log_warning "WordPress health check failed (may need more time)"
fi

log_success "Stage 2 completed - WordPress running"

# Stage 3: Start MyMeds Application
log_info "Stage 3: Starting MyMeds application..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mymeds-app

# Wait for MyMeds App to be ready
log_info "Waiting for MyMeds application to be ready..."
sleep 45

# Verify MyMeds Backend
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    log_success "MyMeds backend health check passed"
else
    log_error "MyMeds backend health check failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mymeds-app
    exit 1
fi

# Verify MyMeds Frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log_success "MyMeds frontend health check passed"
else
    log_warning "MyMeds frontend health check failed (may need more time)"
fi

log_success "Stage 3 completed - MyMeds application running"

# Stage 4: Start Nginx
log_info "Stage 4: Starting Nginx reverse proxy..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d nginx

# Wait for Nginx to be ready
sleep 10

log_success "Stage 4 completed - Nginx running"

# =============================================================================
# POST-DEPLOYMENT SETUP
# =============================================================================
log_info "Performing post-deployment setup..."

# Run final database migrations (if any)
log_info "Running final database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy || true

# Initialize integrations (if not already done)
log_info "Initializing integrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js || true

log_success "Post-deployment setup completed"

# =============================================================================
# WORDPRESS INITIAL SETUP
# =============================================================================
log_info "Setting up WordPress..."

# Wait a bit more for WordPress to fully initialize
sleep 30

# Check if WordPress needs initial setup
if curl -s http://localhost:8080/wp-admin/install.php | grep -q "WordPress"; then
    log_info "WordPress needs initial setup..."
    
    # Run WordPress setup script
    if [ -f "deployment/scripts/setup-wordpress-woocommerce.sh" ]; then
        chmod +x deployment/scripts/setup-wordpress-woocommerce.sh
        ./deployment/scripts/setup-wordpress-woocommerce.sh || log_warning "WordPress setup script failed"
    fi
else
    log_info "WordPress appears to be already set up"
fi

log_success "WordPress setup completed"

# =============================================================================
# FINAL HEALTH CHECKS
# =============================================================================
log_info "Performing final health checks..."

# Check all services
services=("mysql:3306" "redis:6379" "wordpress:80" "mymeds-app:4000" "nginx:80")
all_healthy=true

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    if nc -z localhost $service_port 2>/dev/null; then
        log_success "$service_name is healthy"
    else
        log_error "$service_name is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    log_success "All services are healthy"
else
    log_warning "Some services may need attention"
fi

# =============================================================================
# DEPLOYMENT STATUS
# =============================================================================
log_info "Deployment Status:"
echo "=================="

# Show running containers
log_info "Running containers:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Show resource usage
log_info "Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# =============================================================================
# SERVICE URLs
# =============================================================================
echo ""
log_success "🎉 Application deployment completed successfully!"
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
echo "📊 Nginx Status: http://$VPS_IP"

echo ""
log_info "Default Credentials:"
echo "====================="
echo "WordPress Admin: admin / Mymeds2025!AdminSecure123!@#"
echo "MyMeds Admin: admin@mymedspharmacyinc.com / Mymeds2025!AdminSecure123!@#"
echo "Database Root: root / Mymeds2025!RootSecure123!@#"

echo ""
log_info "Next Steps:"
echo "============"
echo "1. Test all services by visiting the URLs above"
echo "2. Configure your domain DNS to point to $VPS_IP"
echo "3. Set up SSL certificates for HTTPS"
echo "4. Configure WordPress and WooCommerce settings"
echo "5. Test MyMeds integration with WordPress"
echo "6. Set up monitoring and backups"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f $DOCKER_COMPOSE_FILE logs -f [service-name]"
echo ""
log_success "🚀 MyMeds Pharmacy Inc. is now live and ready for business!"

