#!/bin/bash

# =============================================================================
# NGINX SETUP SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Script to set up nginx configuration for production deployment
# =============================================================================

set -e

echo "🚀 Setting up Nginx for MyMeds Pharmacy Inc."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
    print_error "Please don't run this script as root"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_header "NGINX CONFIGURATION SETUP"

# Create necessary directories
print_status "Creating nginx configuration directories..."
mkdir -p deployment/nginx
mkdir -p deployment/wordpress
mkdir -p deployment/ssl
mkdir -p logs/nginx

# Check if nginx configuration files exist
if [ ! -f "deployment/nginx/nginx.conf" ]; then
    print_error "nginx.conf not found. Please ensure all configuration files are in place."
    exit 1
fi

if [ ! -f "deployment/nginx/nginx-ssl.conf" ]; then
    print_error "nginx-ssl.conf not found. Please ensure all configuration files are in place."
    exit 1
fi

print_status "Nginx configuration files found ✓"

# Set proper permissions
print_status "Setting file permissions..."
chmod 644 deployment/nginx/*.conf
chmod 755 deployment/nginx/

# Test nginx configuration
print_status "Testing nginx configuration..."
if docker run --rm -v "$(pwd)/deployment/nginx:/etc/nginx/conf.d" nginx:alpine nginx -t; then
    print_status "Nginx configuration test passed ✓"
else
    print_error "Nginx configuration test failed. Please check your configuration files."
    exit 1
fi

print_header "SSL CERTIFICATE SETUP"

# Check if SSL certificates exist
SSL_CERT_PATH="deployment/ssl/live/mymedspharmacyinc.com"
if [ ! -f "$SSL_CERT_PATH/fullchain.pem" ] || [ ! -f "$SSL_CERT_PATH/privkey.pem" ]; then
    print_warning "SSL certificates not found. You have two options:"
    echo ""
    echo "1. Use Let's Encrypt (recommended for production):"
    echo "   - Install certbot: sudo apt install certbot"
    echo "   - Run: sudo certbot certonly --standalone -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com"
    echo "   - Certificates will be in /etc/letsencrypt/live/mymedspharmacyinc.com/"
    echo ""
    echo "2. Use self-signed certificates (development only):"
    echo "   - Run: ./deployment/scripts/generate-self-signed-ssl.sh"
    echo ""
    read -p "Do you want to generate self-signed certificates for development? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -f "deployment/scripts/generate-self-signed-ssl.sh" ]; then
            chmod +x deployment/scripts/generate-self-signed-ssl.sh
            ./deployment/scripts/generate-self-signed-ssl.sh
        else
            print_error "Self-signed SSL generation script not found."
            exit 1
        fi
    else
        print_warning "SSL certificates are required for production deployment."
        print_status "Please set up SSL certificates and update the nginx-ssl.conf file paths."
    fi
else
    print_status "SSL certificates found ✓"
fi

print_header "DOCKER COMPOSE CONFIGURATION"

# Check if docker-compose.prod.yml exists
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found. Please ensure the production compose file exists."
    exit 1
fi

print_status "Docker Compose production file found ✓"

# Check environment variables
print_status "Checking environment variables..."
if [ ! -f "env.production" ]; then
    print_warning "env.production file not found. Please create it with your production environment variables."
else
    print_status "Environment file found ✓"
fi

print_header "DEPLOYMENT OPTIONS"

echo "Choose your deployment method:"
echo "1. Production deployment with SSL"
echo "2. Development deployment (no SSL)"
echo "3. Test nginx configuration only"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        print_header "PRODUCTION DEPLOYMENT"
        print_status "Starting production deployment..."
        
        # Build and start services
        print_status "Building Docker images..."
        docker-compose -f docker-compose.prod.yml build
        
        print_status "Starting services..."
        docker-compose -f docker-compose.prod.yml up -d
        
        print_status "Checking service health..."
        sleep 10
        
        # Check if services are running
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_status "Services started successfully ✓"
        else
            print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.prod.yml logs"
            exit 1
        fi
        
        print_status "Deployment completed! Your application should be accessible at:"
        echo "  - Main site: https://mymedspharmacyinc.com"
        echo "  - WordPress admin: https://mymedspharmacyinc.com/wp-admin/"
        echo "  - WooCommerce shop: https://mymedspharmacyinc.com/shop/"
        ;;
        
    2)
        print_header "DEVELOPMENT DEPLOYMENT"
        print_status "Starting development deployment..."
        
        # Use development configuration
        if [ -f "docker-compose.dev.yml" ]; then
            docker-compose -f docker-compose.dev.yml up -d
        else
            print_warning "Development compose file not found. Using production compose with HTTP."
            # Temporarily modify nginx config for development
            cp deployment/nginx/nginx-ssl.conf deployment/nginx/nginx-ssl.conf.backup
            cp deployment/nginx/nginx-dev.conf deployment/nginx/nginx-ssl.conf
            docker-compose -f docker-compose.prod.yml up -d
        fi
        
        print_status "Development deployment completed! Your application should be accessible at:"
        echo "  - Main site: http://localhost"
        echo "  - Backend API: http://localhost/api"
        ;;
        
    3)
        print_header "CONFIGURATION TEST"
        print_status "Testing nginx configuration only..."
        docker run --rm -v "$(pwd)/deployment/nginx:/etc/nginx/conf.d" nginx:alpine nginx -t
        print_status "Configuration test completed ✓"
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again and select 1, 2, or 3."
        exit 1
        ;;
esac

print_header "USEFUL COMMANDS"

echo "To manage your deployment:"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "Restart services:"
echo "  docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "Stop services:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
echo "Update and redeploy:"
echo "  docker-compose -f docker-compose.prod.yml build"
echo "  docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "Check service status:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo ""

print_header "DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"

print_status "Your MyMeds Pharmacy application is now deployed with nginx configuration supporting:"
echo "  ✓ React frontend with SPA routing"
echo "  ✓ WordPress admin panel and blog"
echo "  ✓ WooCommerce shop functionality"
echo "  ✓ Backend API with rate limiting"
echo "  ✓ SSL/HTTPS security (production)"
echo "  ✓ Static file caching and optimization"
echo "  ✓ Security headers and protection"

print_status "Next steps:"
echo "  1. Configure your domain DNS to point to this server"
echo "  2. Set up SSL certificates (if not already done)"
echo "  3. Configure environment variables in env.production"
echo "  4. Test all functionality and integrations"
echo "  5. Set up monitoring and backups"
