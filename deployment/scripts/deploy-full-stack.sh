#!/bin/bash
# =============================================================================
# FULL STACK DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Complete deployment with WordPress + WooCommerce + MyMeds App
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Full Stack Deployment"
echo "================================================"

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
DOCKER_COMPOSE_FILE="docker-compose.full-stack.yml"
ENVIRONMENT_FILE=".env.production"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if [ ! -f "$ENVIRONMENT_FILE" ]; then
    log_warning "Environment file $ENVIRONMENT_FILE not found. Creating from template..."
    cp env.production.template "$ENVIRONMENT_FILE"
fi

log_success "Pre-deployment checks completed"

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================
log_info "Setting up environment..."
export $(cat "$ENVIRONMENT_FILE" | grep -v '^#' | xargs)
log_success "Environment variables loaded"

# =============================================================================
# DOCKER SETUP
# =============================================================================
log_info "Setting up Docker environment..."

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

# Remove old images
log_info "Removing old images..."
docker image prune -f || true

# Build new images
log_info "Building Docker images..."
docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache

log_success "Docker setup completed"

# =============================================================================
# DATABASE SETUP
# =============================================================================
log_info "Setting up database..."

# Start MySQL first
log_info "Starting MySQL database..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mysql

# Wait for MySQL to be ready
log_info "Waiting for MySQL to be ready..."
sleep 30

log_success "Database setup completed"

# =============================================================================
# WORDPRESS SETUP
# =============================================================================
log_info "Setting up WordPress..."

# Start WordPress
log_info "Starting WordPress..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d wordpress

# Wait for WordPress to be ready
log_info "Waiting for WordPress to be ready..."
sleep 60

log_success "WordPress setup completed"

# =============================================================================
# REDIS SETUP
# =============================================================================
log_info "Setting up Redis cache..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d redis
log_success "Redis setup completed"

# =============================================================================
# APPLICATION DEPLOYMENT
# =============================================================================
log_info "Deploying MyMeds application..."

# Start all services
log_info "Starting all services..."
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 60

# Health check
log_info "Performing health checks..."

# Check backend health
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    log_success "Backend health check passed"
else
    log_error "Backend health check failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mymeds-app
    exit 1
fi

# Check WordPress
if curl -f http://localhost:8080 >/dev/null 2>&1; then
    log_success "WordPress health check passed"
else
    log_warning "WordPress health check failed"
fi

log_success "Application deployment completed"

# =============================================================================
# POST-DEPLOYMENT SETUP
# =============================================================================
log_info "Performing post-deployment setup..."

# Run database migrations
log_info "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy

# Initialize integrations
log_info "Initializing integrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js

# Setup WordPress and WooCommerce
log_info "Setting up WordPress and WooCommerce..."
chmod +x deployment/scripts/setup-wordpress-woocommerce.sh
./deployment/scripts/setup-wordpress-woocommerce.sh

log_success "Post-deployment setup completed"

# =============================================================================
# FINAL STATUS
# =============================================================================
log_info "Deployment Status:"
echo "=================="

# Show running containers
log_info "Running containers:"
docker-compose -f "$DOCKER_COMPOSE_FILE" ps

# Show service URLs
echo ""
log_success "Service URLs:"
echo "🌐 MyMeds Frontend: http://localhost:3000"
echo "🔧 MyMeds Backend API: http://localhost:4000"
echo "📝 WordPress Admin: http://localhost:8080/wp-admin"
echo "🛒 WooCommerce Shop: http://localhost:8080/shop"
echo "📖 Blog: http://localhost:8080/blog"
echo "🗄️ Database: localhost:3306"
echo "🔐 Admin Panel: http://localhost:3000/admin"
echo "📊 Health Check: http://localhost:4000/api/health"

echo ""
log_success "🎉 MyMeds Full Stack deployment completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Configure firewall rules"
echo "4. Set up monitoring and backups"
echo "5. Test all integrations"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
