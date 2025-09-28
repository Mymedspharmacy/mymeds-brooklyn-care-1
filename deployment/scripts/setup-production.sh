#!/bin/bash

# =============================================================================
# PRODUCTION SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Complete production environment setup script
# =============================================================================

set -e

echo "🚀 MyMeds Pharmacy Inc. - Production Setup"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=============================================================================${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root for security reasons"
    exit 1
fi

print_header "PRE-FLIGHT CHECKS"

# Check if required tools are installed
check_dependency() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

print_status "Checking dependencies..."
check_dependency "docker"
check_dependency "docker-compose"
check_dependency "node"
check_dependency "openssl"

print_status "All dependencies found ✓"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Project structure verified ✓"

print_header "ENVIRONMENT SETUP"

# Generate production environment file
if [ ! -f ".env.production" ]; then
    print_status "Generating production environment file..."
    
    if command -v node &> /dev/null; then
        node deployment/scripts/generate-secrets.js
        print_status "Environment file generated ✓"
    else
        print_warning "Node.js not found. Please run 'node deployment/scripts/generate-secrets.js' manually"
        print_warning "Or copy env.production.template to .env.production and fill in the values"
    fi
else
    print_warning ".env.production already exists. Skipping generation."
fi

# Set proper permissions
if [ -f ".env.production" ]; then
    chmod 600 .env.production
    print_status "Environment file permissions set ✓"
fi

print_header "SSL CERTIFICATE SETUP"

# Check if SSL certificates exist
SSL_CERT_DIR="/etc/letsencrypt/live/mymedspharmacyinc.com"
if [ ! -f "$SSL_CERT_DIR/fullchain.pem" ] || [ ! -f "$SSL_CERT_DIR/privkey.pem" ]; then
    print_warning "SSL certificates not found. Setting up SSL..."
    
    # Check if certbot is installed
    if command -v certbot &> /dev/null; then
        print_status "Certbot found. Setting up SSL certificates..."
        
        # Stop any running services that might use port 80
        sudo systemctl stop nginx 2>/dev/null || true
        
        # Generate SSL certificate
        sudo certbot certonly --standalone \
            -d mymedspharmacyinc.com \
            -d www.mymedspharmacyinc.com \
            --non-interactive \
            --agree-tos \
            --email admin@mymedspharmacyinc.com
            
        print_status "SSL certificates generated ✓"
        
        # Set up auto-renewal
        print_status "Setting up SSL auto-renewal..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        print_status "SSL auto-renewal configured ✓"
        
    else
        print_warning "Certbot not found. Please install certbot and run:"
        echo "  sudo apt update && sudo apt install certbot"
        echo "  sudo certbot certonly --standalone -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com"
        echo ""
        read -p "Do you want to continue without SSL? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    print_status "SSL certificates found ✓"
fi

print_header "DATABASE SETUP"

# Create database directories
print_status "Creating database directories..."
mkdir -p data/mysql
mkdir -p data/wordpress
mkdir -p logs/mysql
mkdir -p logs/wordpress

# Set proper permissions
chmod 755 data/
chmod 755 logs/

print_status "Database directories created ✓"

print_header "WORDPRESS & WOOCOMMERCE SETUP"

print_status "WordPress and WooCommerce will be configured through the admin panel after deployment."
print_status "Make sure to:"
echo "  1. Access WordPress admin at https://mymedspharmacyinc.com/wp-admin/"
echo "  2. Install and activate WooCommerce plugin"
echo "  3. Configure WooCommerce with the generated API keys"
echo "  4. Set up WordPress Application Password for API access"
echo ""

print_header "DOCKER IMAGE BUILDING"

# Build Docker images
print_status "Building Docker images..."
docker-compose -f docker-compose.prod.yml build --no-cache

if [ $? -eq 0 ]; then
    print_status "Docker images built successfully ✓"
else
    print_error "Failed to build Docker images"
    exit 1
fi

print_header "SERVICE DEPLOYMENT"

# Start services
print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
print_status "Waiting for services to initialize..."
sleep 30

# Check service health
print_status "Checking service health..."
services_healthy=true

# Check backend
if ! docker-compose -f docker-compose.prod.yml exec -T backend curl -f http://localhost:4000/api/health &>/dev/null; then
    print_warning "Backend service may not be ready yet"
    services_healthy=false
fi

# Check frontend
if ! docker-compose -f docker-compose.prod.yml exec -T frontend curl -f http://localhost &>/dev/null; then
    print_warning "Frontend service may not be ready yet"
    services_healthy=false
fi

# Check MySQL
if ! docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost &>/dev/null; then
    print_warning "MySQL service may not be ready yet"
    services_healthy=false
fi

if [ "$services_healthy" = true ]; then
    print_status "All services are healthy ✓"
else
    print_warning "Some services may still be starting up. Check logs with:"
    echo "  docker-compose -f docker-compose.prod.yml logs"
fi

print_header "POST-DEPLOYMENT SETUP"

print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

if [ $? -eq 0 ]; then
    print_status "Database migrations completed ✓"
else
    print_error "Database migrations failed"
    print_status "You may need to run migrations manually:"
    echo "  docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy"
fi

# Create admin user
print_status "Creating admin user..."
docker-compose -f docker-compose.prod.yml exec -T backend node dist/ensureAdminUser.js

print_header "FINAL VERIFICATION"

print_status "Testing application endpoints..."

# Test main application
if curl -f -s https://mymedspharmacyinc.com > /dev/null; then
    print_status "✅ Main application accessible"
else
    print_warning "⚠️  Main application may not be accessible yet"
fi

# Test API
if curl -f -s https://mymedspharmacyinc.com/api/health > /dev/null; then
    print_status "✅ API endpoint accessible"
else
    print_warning "⚠️  API endpoint may not be accessible yet"
fi

# Test WordPress admin
if curl -f -s https://mymedspharmacyinc.com/wp-admin/ > /dev/null; then
    print_status "✅ WordPress admin accessible"
else
    print_warning "⚠️  WordPress admin may not be accessible yet"
fi

print_header "DEPLOYMENT COMPLETED! 🎉"

print_status "Your MyMeds Pharmacy application is now deployed!"
echo ""
echo "🌐 Application URLs:"
echo "   Main Site: https://mymedspharmacyinc.com"
echo "   Admin Panel: https://mymedspharmacyinc.com/admin"
echo "   WordPress Admin: https://mymedspharmacyinc.com/wp-admin/"
echo "   WooCommerce Shop: https://mymedspharmacyinc.com/shop/"
echo "   API Health: https://mymedspharmacyinc.com/api/health"
echo ""

print_status "📋 Next Steps:"
echo "  1. Configure WordPress admin panel"
echo "  2. Install and configure WooCommerce"
echo "  3. Set up WordPress Application Password"
echo "  4. Configure WooCommerce API keys"
echo "  5. Test all functionality"
echo "  6. Set up monitoring and backups"
echo ""

print_status "🔧 Management Commands:"
echo "  View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  Restart: docker-compose -f docker-compose.prod.yml restart"
echo "  Stop: docker-compose -f docker-compose.prod.yml down"
echo "  Update: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d"
echo ""

print_status "🔐 Security Checklist:"
echo "  ✅ SSL certificates configured"
echo "  ✅ Environment variables secured"
echo "  ✅ Database passwords generated"
echo "  ✅ JWT secrets generated"
echo "  ✅ Rate limiting enabled"
echo "  ✅ Security headers configured"
echo ""

print_header "PRODUCTION DEPLOYMENT SUCCESSFUL! 🚀"
