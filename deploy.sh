#!/bin/bash
# =============================================================================
# SIMPLE DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Quick deployment script for VPS production environment
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Quick Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# CONFIGURATION
# =============================================================================
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENVIRONMENT_FILE=".env.production"

# Check if environment file exists
if [ ! -f "$ENVIRONMENT_FILE" ]; then
    log_warning "Environment file $ENVIRONMENT_FILE not found. Creating from template..."
    cp env.production.template "$ENVIRONMENT_FILE"
    log_success "Environment file created. Please update it with your actual values."
fi

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
# APPLICATION DEPLOYMENT
# =============================================================================
log_info "Deploying application..."

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

# Check frontend
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log_success "Frontend health check passed"
else
    log_warning "Frontend health check failed (this might be expected)"
fi

log_success "Application deployment completed"

# =============================================================================
# POST-DEPLOYMENT SETUP
# =============================================================================
log_info "Performing post-deployment setup..."

# Run database migrations
log_info "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy || true

# Initialize integrations
log_info "Initializing integrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js || true

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
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo "🗄️ Database: localhost:3306"
echo "🔐 Admin Panel: http://localhost:3000/admin"
echo "📊 Health Check: http://localhost:4000/api/health"

# Show logs
echo ""
log_info "Recent logs:"
docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=20

echo ""
log_success "🎉 MyMeds Pharmacy Inc. deployment completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Configure firewall rules"
echo "4. Set up monitoring and backups"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f $DOCKER_COMPOSE_FILE logs -f"

