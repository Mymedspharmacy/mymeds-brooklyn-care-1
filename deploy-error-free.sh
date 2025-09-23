#!/bin/bash
# =============================================================================
# ERROR-FREE DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Automated deployment with error prevention and rollback capabilities
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
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

# Error handling
handle_error() {
    log_error "Deployment failed at step: $1"
    log_info "Attempting rollback..."
    rollback_deployment
    exit 1
}

# Rollback function
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    
    # Restore from backup if exists
    if [ -f "backup-pre-deployment.tar.gz" ]; then
        log_info "Restoring from backup..."
        tar -xzf backup-pre-deployment.tar.gz
        docker-compose -f docker-compose.prod.yml up -d
    fi
    
    log_warning "Rollback completed. Please check logs and fix issues."
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment file exists
    if [ ! -f ".env.production" ]; then
        log_error "Environment file .env.production not found. Please create it first."
        exit 1
    fi
    
    # Check if docker-compose.prod.yml exists
    if [ ! -f "docker-compose.prod.yml" ]; then
        log_error "docker-compose.prod.yml not found. Please ensure it exists."
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Create backup
create_backup() {
    log_info "Creating pre-deployment backup..."
    
    # Create backup of current state
    tar -czf backup-pre-deployment.tar.gz \
        --exclude=node_modules \
        --exclude=logs \
        --exclude=backups \
        --exclude=*.tar.gz \
        . || true
    
    log_success "Backup created: backup-pre-deployment.tar.gz"
}

# Build application
build_application() {
    log_info "Building application..."
    
    # Build frontend
    log_info "Building frontend..."
    npm run build || handle_error "Frontend build failed"
    
    # Build backend
    log_info "Building backend..."
    cd backend
    npm run build || handle_error "Backend build failed"
    cd ..
    
    log_success "Application built successfully"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Copy environment file
    cp .env.production .env
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true
    
    # Remove old images
    log_info "Cleaning up old images..."
    docker image prune -f || true
    
    # Build new images
    log_info "Building Docker images..."
    docker-compose -f docker-compose.prod.yml build --no-cache || handle_error "Docker build failed"
    
    # Start MySQL first
    log_info "Starting MySQL database..."
    docker-compose -f docker-compose.prod.yml up -d mysql || handle_error "MySQL startup failed"
    
    # Wait for MySQL to be ready
    log_info "Waiting for MySQL to initialize..."
    sleep 30
    
    # Test MySQL connection
    log_info "Testing MySQL connection..."
    docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost || handle_error "MySQL connection failed"
    
    # Start all services
    log_info "Starting all services..."
    docker-compose -f docker-compose.prod.yml up -d || handle_error "Service startup failed"
    
    # Wait for services to be ready
    log_info "Waiting for services to initialize..."
    sleep 60
    
    log_success "Docker deployment completed"
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Create databases
    log_info "Creating databases..."
    docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS mymeds_production;" || handle_error "Database creation failed"
    docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS wordpress;" || handle_error "WordPress database creation failed"
    
    # Run Prisma migrations
    log_info "Running database migrations..."
    docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma migrate deploy || handle_error "Database migration failed"
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    docker-compose -f docker-compose.prod.yml exec mymeds-app npx prisma generate || handle_error "Prisma client generation failed"
    
    # Create admin user
    log_info "Creating admin user..."
    docker-compose -f docker-compose.prod.yml exec mymeds-app node create-admin-user.cjs || handle_error "Admin user creation failed"
    
    log_success "Database setup completed"
}

# Test deployment
test_deployment() {
    log_info "Testing deployment..."
    
    # Test backend health
    log_info "Testing backend health..."
    curl -f http://localhost:4000/api/health || handle_error "Backend health check failed"
    
    # Test frontend
    log_info "Testing frontend..."
    curl -f http://localhost:3000 || handle_error "Frontend test failed"
    
    # Test database
    log_info "Testing database..."
    docker-compose -f docker-compose.prod.yml exec mysql mysqladmin ping -h localhost || handle_error "Database test failed"
    
    # Test API endpoints
    log_info "Testing API endpoints..."
    curl -f http://localhost:4000/api/products || handle_error "Products API test failed"
    curl -f http://localhost:4000/api/blogs || handle_error "Blogs API test failed"
    
    log_success "All tests passed"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create health check script
    cat > health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:4000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
    echo "Health check failed: HTTP $RESPONSE"
    docker-compose -f docker-compose.prod.yml restart mymeds-app
fi
EOF
    
    chmod +x health-check.sh
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u root -p$MYSQL_ROOT_PASSWORD $MYSQL_DATABASE > $BACKUP_DIR/db_backup_$DATE.sql

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
EOF
    
    chmod +x backup.sh
    
    log_success "Monitoring setup completed"
}

# Main deployment function
main() {
    log_info "Starting MyMeds Pharmacy deployment..."
    log_info "======================================"
    
    # Step 1: Pre-deployment checks
    pre_deployment_checks
    
    # Step 2: Create backup
    create_backup
    
    # Step 3: Build application
    build_application
    
    # Step 4: Deploy with Docker
    deploy_docker
    
    # Step 5: Setup database
    setup_database
    
    # Step 6: Test deployment
    test_deployment
    
    # Step 7: Setup monitoring
    setup_monitoring
    
    # Success message
    log_success "======================================"
    log_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    log_success "======================================"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:4000"
    log_info "Health Check: http://localhost:4000/api/health"
    log_info "Admin Panel: http://localhost:3000/admin"
    log_info ""
    log_info "Admin Credentials:"
    log_info "Email: admin@mymedspharmacyinc.com"
    log_info "Password: Mymeds2025!AdminSecure123!@#"
    log_info ""
    log_info "Next steps:"
    log_info "1. Configure your domain DNS"
    log_info "2. Set up SSL certificates"
    log_info "3. Update environment variables with real credentials"
    log_info "4. Test all functionality"
    log_info "5. Go live! 🚀"
}

# Run main function
main "$@"
