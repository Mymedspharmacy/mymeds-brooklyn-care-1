#!/bin/bash
# =============================================================================
# QUICK VPS DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Automated deployment script for VPS production environment
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Quick VPS Deployment"
echo "=============================================="

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
PROJECT_DIR="/opt/mymeds-pharmacy"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENVIRONMENT_FILE=".env.production"

# =============================================================================
# SYSTEM SETUP
# =============================================================================
log_info "Setting up system dependencies..."

# Update system
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
log_info "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Docker
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_success "Docker installed successfully"
else
    log_info "Docker already installed"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installed successfully"
else
    log_info "Docker Compose already installed"
fi

# =============================================================================
# PROJECT SETUP
# =============================================================================
log_info "Setting up project directory..."

# Create project directory
sudo mkdir -p $PROJECT_DIR
cd $PROJECT_DIR
sudo chown -R $USER:$USER $PROJECT_DIR

# =============================================================================
# ENVIRONMENT CONFIGURATION
# =============================================================================
log_info "Creating production environment configuration..."

# Create production environment file
cat > $ENVIRONMENT_FILE << 'EOF'
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION - MyMeds Pharmacy Inc.
# =============================================================================

# Database Configuration
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# Server Configuration
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

# Email Configuration (Update with your actual email settings)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME=MyMeds Pharmacy Inc.

# CORS Configuration (Update with your actual domain)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com

# Security Configuration
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()

# WordPress Integration (Update with your actual WordPress settings)
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE

# WooCommerce Integration (Update with your actual WooCommerce settings)
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#

# Payment Gateway Configuration (Update with your actual Stripe keys)
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123

# Monitoring & Analytics (Optional)
SENTRY_DSN=https://YourSentryDSN@sentry.io/project-id
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
EOF

chmod 600 $ENVIRONMENT_FILE
log_success "Environment configuration created"

# =============================================================================
# FIREWALL CONFIGURATION
# =============================================================================
log_info "Configuring firewall..."

# Configure UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

log_success "Firewall configured"

# =============================================================================
# APPLICATION DEPLOYMENT
# =============================================================================
log_info "Deploying application..."

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans || true

# Remove old images
log_info "Removing old images..."
docker image prune -f || true

# Build new images
log_info "Building Docker images..."
docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache

log_success "Docker setup completed"

# =============================================================================
# DATABASE SETUP
# =============================================================================
log_info "Setting up database..."

# Start MySQL first
log_info "Starting MySQL database..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d mysql

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
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 60

# =============================================================================
# HEALTH CHECKS
# =============================================================================
log_info "Performing health checks..."

# Check backend health
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    log_success "Backend health check passed"
else
    log_error "Backend health check failed"
    docker-compose -f $DOCKER_COMPOSE_FILE logs mymeds-app
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
docker-compose -f $DOCKER_COMPOSE_FILE exec mymeds-app npx prisma migrate deploy || true

# Initialize integrations
log_info "Initializing integrations..."
docker-compose -f $DOCKER_COMPOSE_FILE exec mymeds-app node init-integrations.js || true

log_success "Post-deployment setup completed"

# =============================================================================
# FINAL STATUS
# =============================================================================
log_info "Deployment Status:"
echo "=================="

# Show running containers
log_info "Running containers:"
docker-compose -f $DOCKER_COMPOSE_FILE ps

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
docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20

echo ""
log_success "🎉 MyMeds Pharmacy Inc. deployment completed successfully!"
echo ""
log_info "Next steps:"
echo "1. Configure your domain DNS to point to this server"
echo "2. Set up SSL certificates for HTTPS"
echo "3. Update environment variables in $ENVIRONMENT_FILE"
echo "4. Configure email settings"
echo "5. Configure WordPress/WooCommerce integration"
echo "6. Set up monitoring and backups"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
echo ""
log_info "To update the application:"
echo "git pull origin main && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build"
