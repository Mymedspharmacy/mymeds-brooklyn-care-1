#!/bin/bash
# =============================================================================
# OPTIMIZED DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Optimized for VPS: 1 CPU, 4GB RAM, 50GB Storage
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Optimized Deployment for VPS"
echo "===================================================="
echo "VPS Specs: 1 CPU, 4GB RAM, 50GB Storage"
echo "IP: 72.60.116.253"
echo "===================================================="

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
ENVIRONMENT_FILE=".env.production"
VPS_IP="72.60.116.253"

# =============================================================================
# SYSTEM OPTIMIZATION
# =============================================================================
log_info "Optimizing system for VPS deployment..."

# Update system
log_info "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
apt install -y curl wget git unzip htop nano

# Optimize system for low memory
log_info "Optimizing system for 4GB RAM..."
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
sysctl -p

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

if [ ! -f "$ENVIRONMENT_FILE" ]; then
    log_warning "Environment file $ENVIRONMENT_FILE not found. Creating optimized version..."
    cat > "$ENVIRONMENT_FILE" << EOF
# =============================================================================
# OPTIMIZED PRODUCTION ENVIRONMENT - VPS: 72.60.116.253
# =============================================================================

# Database Configuration
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# WordPress Database
WORDPRESS_DB_NAME=wordpress
WORDPRESS_TABLE_PREFIX=wp_

# Application Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# JWT & Authentication
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Credentials
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# CORS Configuration (Domain + VPS IP included)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com,http://${VPS_IP}:8080,http://${VPS_IP}:3000,http://${VPS_IP}:4000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control
CORS_MAX_AGE=86400

# WordPress Integration
WORDPRESS_URL=http://wordpress:80
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE
FEATURE_WORDPRESS_ENABLED=true
WORDPRESS_API_TIMEOUT=10000
WORDPRESS_CACHE_TTL=300

# WooCommerce Integration
WOOCOMMERCE_STORE_URL=http://wordpress:80
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#
FEATURE_WOOCOMMERCE_ENABLED=true
WOOCOMMERCE_API_TIMEOUT=10000
WOOCOMMERCE_CACHE_TTL=300

# Payment Gateway Configuration
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
PAYMENT_GATEWAY_ENABLED=true

# Monitoring & Analytics
SENTRY_DSN=https://YourSentryDSN@sentry.io/project-id
SENTRY_ENABLED=true
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
ANALYTICS_ENABLED=true

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()
BCRYPT_ROUNDS=12
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# Performance Configuration (Optimized for 1 CPU)
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6
CLUSTER_ENABLED=false
CLUSTER_WORKERS=1

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=10485760
LOG_MAX_FILES=5

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=./backups

# Redis Configuration
REDIS_PASSWORD=Mymeds2025!RedisSecure123!@#

# Development Overrides (DISABLE IN PRODUCTION)
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF
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

# Clean up old images and containers
log_info "Cleaning up old Docker resources..."
docker system prune -f || true

# Build new images
log_info "Building optimized Docker images..."
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
if docker-compose -f "$DOCKER_COMPOSE_FILE" exec mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
    log_success "MySQL health check passed"
else
    log_error "MySQL health check failed"
    exit 1
fi

# Check Redis
if docker-compose -f "$DOCKER_COMPOSE_FILE" exec redis redis-cli ping >/dev/null 2>&1; then
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
# POST-DEPLOYMENT SETUP
# =============================================================================
log_info "Performing post-deployment setup..."

# Run database migrations
log_info "Running database migrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy

# Initialize integrations
log_info "Initializing integrations..."
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js

log_success "Post-deployment setup completed"

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
echo "📊 Health Check: http://${VPS_IP}:4000/api/health"

echo ""
log_success "🎉 MyMeds Optimized deployment completed successfully!"
echo ""
log_info "VPS Optimization Summary:"
echo "✅ Memory limits set for all containers"
echo "✅ CPU optimization for single core"
echo "✅ Staged deployment to prevent memory issues"
echo "✅ Redis caching enabled for performance"
echo "✅ Database optimization for 4GB RAM"
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
echo ""
log_warning "Memory Usage Tips:"
echo "- Monitor memory usage regularly"
echo "- Consider upgrading to 8GB RAM for better performance"
echo "- Use 'docker stats' to monitor resource usage"
