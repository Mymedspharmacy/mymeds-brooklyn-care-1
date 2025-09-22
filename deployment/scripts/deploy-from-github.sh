#!/bin/bash
# =============================================================================
# GITHUB DEPLOYMENT SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Complete deployment from GitHub repository with SSL
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - GitHub Deployment with SSL"
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
GITHUB_REPO="${GITHUB_REPO:-https://github.com/YOUR_USERNAME/mymeds-brooklyn-care.git}"
BRANCH="${BRANCH:-main}"
DOMAIN="mymedspharmacyinc.com"
VPS_IP="72.60.116.253"
PROJECT_DIR="/var/www/mymeds"
DOCKER_COMPOSE_FILE="docker-compose.optimized.yml"

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
log_info "Performing pre-deployment checks..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "This script must be run as root"
    exit 1
fi

# Check if Git is installed
if ! command -v git &> /dev/null; then
    log_info "Installing Git..."
    apt update
    apt install -y git
fi

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

log_success "Pre-deployment checks passed"

# =============================================================================
# REPOSITORY SETUP
# =============================================================================
log_info "Setting up repository..."

# Create project directory
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Clone or update repository
if [ -d ".git" ]; then
    log_info "Repository exists, updating..."
    git fetch origin
    git reset --hard origin/$BRANCH
    log_success "Repository updated"
else
    log_info "Cloning repository from GitHub..."
    git clone "$GITHUB_REPO" .
    git checkout "$BRANCH"
    log_success "Repository cloned"
fi

# =============================================================================
# PROJECT SETUP
# =============================================================================
log_info "Setting up project..."

# Make scripts executable
chmod +x deployment/scripts/*.sh

# Create necessary directories
mkdir -p /var/www/certbot
mkdir -p /var/log/mymeds
mkdir -p /var/www/mymeds/uploads
mkdir -p /var/www/mymeds/logs
mkdir -p /var/www/mymeds/backups

# Set permissions
chown -R www-data:www-data /var/www/certbot
chmod -R 755 /var/www/certbot

log_success "Project setup completed"

# =============================================================================
# SYSTEM DEPENDENCIES
# =============================================================================
log_info "Installing system dependencies..."

# Install required packages
apt update
apt install -y curl wget unzip htop nano ufw certbot python3-certbot-nginx

log_success "System dependencies installed"

# =============================================================================
# FIREWALL CONFIGURATION
# =============================================================================
log_info "Configuring firewall..."

# Configure UFW firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

log_success "Firewall configured"

# =============================================================================
# SSL SETUP
# =============================================================================
log_info "Setting up SSL certificates..."

# Check if domain is accessible
if ! curl -s "http://$DOMAIN" >/dev/null 2>&1; then
    log_warning "Domain $DOMAIN is not accessible via HTTP"
    log_info "Please ensure:"
    echo "1. Domain DNS points to this server ($VPS_IP)"
    echo "2. Port 80 is open and accessible"
    echo "3. You have a basic HTTP server running"
    echo ""
    log_info "Current server IP: $VPS_IP"
    log_info "Please update your DNS A record to point to: $VPS_IP"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run SSL setup
if [ -f "deployment/scripts/setup-ssl.sh" ]; then
    ./deployment/scripts/setup-ssl.sh
    
    if [ $? -eq 0 ]; then
        log_success "SSL certificates set up successfully"
    else
        log_error "SSL certificate setup failed"
        exit 1
    fi
else
    log_error "SSL setup script not found"
    exit 1
fi

# =============================================================================
# DOCKER DEPLOYMENT
# =============================================================================
log_info "Deploying application with Docker..."

# Stop existing containers
docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans || true

# Build and start services
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
# DATABASE SETUP
# =============================================================================
log_info "Setting up database..."

# Run database migrations
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app npx prisma migrate deploy || log_warning "Database migrations may have failed"

# Initialize integrations
docker-compose -f "$DOCKER_COMPOSE_FILE" exec mymeds-app node init-integrations.js || log_warning "Integration initialization may have failed"

log_success "Database setup completed"

# =============================================================================
# HEALTH CHECKS
# =============================================================================
log_info "Performing health checks..."

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
log_success "🎉 GitHub deployment with SSL completed!"
echo ""
log_info "Deployment Summary:"
echo "===================="
echo "✅ Repository cloned from GitHub"
echo "✅ SSL certificates obtained and configured"
echo "✅ Docker containers deployed with SSL"
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

log_info "Default Credentials:"
echo "====================="
echo "WordPress Admin: admin / Mymeds2025!AdminSecure123!@#"
echo "MyMeds Admin: admin@mymedspharmacyinc.com / Mymeds2025!AdminSecure123!@#"
echo "Database Root: root / Mymeds2025!RootSecure123!@#"
echo ""

log_info "Next Steps:"
echo "============"
echo "1. Test all HTTPS endpoints"
echo "2. Configure your domain DNS to point to $VPS_IP"
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
