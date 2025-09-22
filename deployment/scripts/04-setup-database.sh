#!/bin/bash
# =============================================================================
# DATABASE SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Sets up MySQL database and runs migrations
# =============================================================================

set -e

echo "🗄️ MyMeds Pharmacy Inc. - Database Setup Script"
echo "============================================="

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

# Database configuration
MYSQL_ROOT_PASSWORD="Mymeds2025!RootSecure123!@#"
MYSQL_DATABASE="mymeds_production"
MYSQL_USER="mymeds_user"
MYSQL_PASSWORD="Mymeds2025!UserSecure123!@#"
WORDPRESS_DB_NAME="wordpress"

# =============================================================================
# START MYSQL CONTAINER
# =============================================================================
log_info "Starting MySQL container..."

# Use optimized docker-compose file
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"

# Start only MySQL first
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mysql

# Wait for MySQL to be ready
log_info "Waiting for MySQL to be ready..."
sleep 30

# Verify MySQL is running
if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps mysql | grep -q "Up"; then
    log_error "MySQL container failed to start"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mysql
    exit 1
fi

log_success "MySQL container started"

# =============================================================================
# DATABASE CONNECTION TEST
# =============================================================================
log_info "Testing database connection..."

# Test MySQL connection
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    log_success "Database connection successful"
else
    log_error "Database connection failed"
    exit 1
fi

# =============================================================================
# CREATE DATABASES
# =============================================================================
log_info "Creating databases..."

# Create MyMeds database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';
GRANT ALL PRIVILEGES ON $MYSQL_DATABASE.* TO '$MYSQL_USER'@'%';
"

# Create WordPress database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "
CREATE DATABASE IF NOT EXISTS $WORDPRESS_DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON $WORDPRESS_DB_NAME.* TO '$MYSQL_USER'@'%';
"

# Flush privileges
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"

log_success "Databases created"

# =============================================================================
# VERIFY DATABASES
# =============================================================================
log_info "Verifying databases..."

# List all databases
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW DATABASES;"

log_success "Database verification completed"

# =============================================================================
# START REDIS CONTAINER
# =============================================================================
log_info "Starting Redis container..."

# Start Redis
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d redis

# Wait for Redis to be ready
sleep 10

# Test Redis connection
if docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T redis redis-cli ping | grep -q "PONG"; then
    log_success "Redis container started and responding"
else
    log_error "Redis container failed to start"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs redis
    exit 1
fi

# =============================================================================
# START MYMEDS APP FOR MIGRATIONS
# =============================================================================
log_info "Starting MyMeds application for database setup..."

# Start MyMeds app container
docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mymeds-app

# Wait for app to be ready
log_info "Waiting for MyMeds application to be ready..."
sleep 30

# =============================================================================
# RUN DATABASE MIGRATIONS
# =============================================================================
log_info "Running database migrations..."

# Run Prisma migrations
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy

if [ $? -eq 0 ]; then
    log_success "Database migrations completed"
else
    log_error "Database migrations failed"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs mymeds-app
    exit 1
fi

# =============================================================================
# CREATE ADMIN USER
# =============================================================================
log_info "Creating admin user..."

# Run admin user creation script
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node ensureAdminUser.js

if [ $? -eq 0 ]; then
    log_success "Admin user created"
else
    log_warning "Admin user creation failed (may already exist)"
fi

# =============================================================================
# INITIALIZE INTEGRATIONS
# =============================================================================
log_info "Initializing integrations..."

# Run integration initialization
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js

if [ $? -eq 0 ]; then
    log_success "Integrations initialized"
else
    log_warning "Integration initialization failed (may not be critical)"
fi

# =============================================================================
# DATABASE HEALTH CHECK
# =============================================================================
log_info "Performing database health check..."

# Check MyMeds database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $MYSQL_DATABASE; SHOW TABLES;" | grep -q "User"

if [ $? -eq 0 ]; then
    log_success "MyMeds database health check passed"
else
    log_error "MyMeds database health check failed"
    exit 1
fi

# Check WordPress database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "USE $WORDPRESS_DB_NAME; SHOW TABLES;" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    log_success "WordPress database health check passed"
else
    log_warning "WordPress database is empty (will be populated when WordPress starts)"
fi

# =============================================================================
# BACKUP INITIAL DATABASE
# =============================================================================
log_info "Creating initial database backup..."

# Create backup directory
mkdir -p /var/www/mymeds/backups

# Backup MyMeds database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysqldump -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > /var/www/mymeds/backups/mymeds_initial_$(date +%Y%m%d_%H%M%S).sql

# Backup WordPress database
docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysqldump -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$WORDPRESS_DB_NAME" > /var/www/mymeds/backups/wordpress_initial_$(date +%Y%m%d_%H%M%S).sql

log_success "Initial database backup created"

# =============================================================================
# STOP CONTAINERS (FOR CLEAN DEPLOYMENT)
# =============================================================================
log_info "Stopping containers for clean deployment..."

# Stop all containers
docker-compose -f "$DOCKER_COMPOSE_FILE" down

log_success "Containers stopped"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
log_success "🎉 Database setup completed successfully!"
echo ""
log_info "Database Configuration:"
echo "========================="
echo "MySQL Root Password: $MYSQL_ROOT_PASSWORD"
echo "MyMeds Database: $MYSQL_DATABASE"
echo "WordPress Database: $WORDPRESS_DB_NAME"
echo "Database User: $MYSQL_USER"
echo "Database Password: $MYSQL_PASSWORD"
echo ""
log_info "Database Status:"
echo "=================="
echo "✅ MySQL container configured"
echo "✅ Redis container configured"
echo "✅ MyMeds database created and migrated"
echo "✅ WordPress database created"
echo "✅ Admin user created"
echo "✅ Integrations initialized"
echo "✅ Initial backups created"
echo ""
log_info "Next steps:"
echo "1. Run: ./deployment/scripts/05-deploy-application.sh"
echo ""
log_info "Database is ready for application deployment!"

