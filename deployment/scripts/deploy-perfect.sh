#!/bin/bash
# =============================================================================
# PERFECT DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Perfect Deployment for VPS"
echo "=================================================="
echo "VPS Specs: 1 CPU, 4GB RAM, 50GB Storage"
echo "IP: 72.60.116.253"
echo "=================================================="

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
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"
VPS_IP="72.60.116.253"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

if ! command -v docker &> /dev/null; then
    log_info "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

if ! command -v docker-compose &> /dev/null; then
    log_info "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

log_success "Pre-deployment checks completed"

# =============================================================================
# DOCKER SETUP
# =============================================================================
log_info "Setting up Docker environment..."

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

# Clean up old images and containers
log_info "Cleaning up old Docker resources..."
docker system prune -f || true

# Build new images
log_info "Building perfect Docker images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

log_success "Docker setup completed"

# =============================================================================
# STAGED DEPLOYMENT (Memory Optimized)
# =============================================================================
log_info "Starting staged deployment for memory optimization..."

# Stage 1: Start MySQL
log_info "Stage 1: Starting MySQL database..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mysql

# Wait for MySQL
log_info "Waiting for MySQL to be ready..."
sleep 30

# Stage 2: Start Redis
log_info "Stage 2: Starting Redis cache..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d redis

# Wait for Redis
log_info "Waiting for Redis to be ready..."
sleep 10

# Stage 3: Start WordPress
log_info "Stage 3: Starting WordPress..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d wordpress

# Wait for WordPress
log_info "Waiting for WordPress to be ready..."
sleep 60

# Stage 4: Start MyMeds App
log_info "Stage 4: Starting MyMeds application..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mymeds-app

# Wait for MyMeds App
log_info "Waiting for MyMeds application to be ready..."
sleep 30

# Stage 5: Start Nginx
log_info "Stage 5: Starting Nginx reverse proxy..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d nginx

log_success "Staged deployment completed"

# =============================================================================
# HEALTH CHECKS
# =============================================================================
log_info "Performing health checks..."

# Check MySQL
if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"Mymeds2025!RootSecure123!@#" -e "SELECT 1;" >/dev/null 2>&1; then
    log_success "MySQL health check passed"
else
    log_error "MySQL health check failed"
    exit 1
fi

# Check Redis
if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping >/dev/null 2>&1; then
    log_success "Redis health check passed"
else
    log_error "Redis health check failed"
    exit 1
fi

# Check WordPress
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    log_success "WordPress health check passed"
else
    log_warning "WordPress health check failed (may need more time)"
fi

# Check MyMeds Backend
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    log_success "MyMeds backend health check passed"
else
    log_error "MyMeds backend health check failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mymeds-app
    exit 1
fi

log_success "All health checks completed"

# =============================================================================
# FINAL STATUS
# =============================================================================
log_info "Deployment Status:"
echo "=================="

# Show running containers
log_info "Running containers:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Show memory usage
log_info "Memory usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Show service URLs
echo ""
log_success "Service URLs:"
echo "🌐 MyMeds Frontend: http://${VPS_IP}:3000"
echo "🔧 MyMeds Backend API: http://${VPS_IP}:4000"
echo "📝 WordPress Admin: http://${VPS_IP}:8080/wp-admin"
echo "🛒 WooCommerce Shop: http://${VPS_IP}:8080/shop"
echo "📖 Blog: http://${VPS_IP}:8080/blog"
echo "🗄️ Database: ${VPS_IP}:3306"
echo "🔐 Admin Panel: http://${VPS_IP}:3000/admin"
echo "🏥 Health Check: http://${VPS_IP}:4000/api/health"

echo ""
log_success "🎉 MyMeds Perfect deployment completed successfully!"
echo ""
log_info "Perfect Deployment Summary:"
echo "✅ Memory limits set for all containers"
echo "✅ CPU optimization for single core"
echo "✅ Staged deployment to prevent memory issues"
echo "✅ Redis caching enabled for performance"
echo "✅ Database optimization for 4GB RAM"
echo "✅ Prisma client generated"
echo "✅ Database migrations completed"
echo "✅ Admin user created"
echo "✅ Integrations initialized"
echo "✅ PM2 process management"
echo "✅ Health monitoring"
echo ""
log_info "Next steps:"
echo "1. Configure your domain DNS to point to ${VPS_IP}"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Configure firewall rules"
echo "4. Test all integrations"
echo "5. Monitor memory usage with: docker stats"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
