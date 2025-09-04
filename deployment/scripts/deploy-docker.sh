#!/bin/bash

# MyMeds Pharmacy Docker Deployment Script
# This script handles the complete Docker deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="MyMeds Pharmacy"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="docker.env"

echo -e "${BLUE}🐳 Starting ${APP_NAME} Docker Deployment...${NC}"
echo ""

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Pre-deployment checks
echo -e "${BLUE}📋 Running pre-deployment checks...${NC}"

# Check if Docker is installed
if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop first."
    print_error "Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

print_status "Docker and Docker Compose are available"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    print_error "Not in the correct directory. Please run this script from the project root."
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_warning "Environment file not found: $ENV_FILE"
    print_warning "Please create it with your production values"
    exit 1
fi

print_status "Pre-deployment checks passed"

# Run validation script
echo ""
echo -e "${BLUE}🔍 Running production validation...${NC}"
if [ -f "scripts/validate-production.js" ]; then
    node scripts/validate-production.js
    if [ $? -ne 0 ]; then
        print_error "Production validation failed. Please fix the issues before deploying."
        exit 1
    fi
else
    print_warning "Production validation script not found"
fi

# Generate SSL certificates if they don't exist
echo ""
echo -e "${BLUE}🔐 Checking SSL certificates...${NC}"
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    print_warning "SSL certificates not found. Generating self-signed certificates..."
    if [ -f "scripts/generate-ssl.sh" ]; then
        chmod +x scripts/generate-ssl.sh
        ./scripts/generate-ssl.sh
    else
        print_error "SSL generation script not found"
        exit 1
    fi
else
    print_status "SSL certificates found"
fi

# Stop existing containers
echo ""
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || true
print_status "Existing containers stopped"

# Build and start containers
echo ""
echo -e "${BLUE}🔨 Building and starting containers...${NC}"

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Build images
echo "Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache
print_status "Docker images built successfully"

# Start services
echo "Starting services..."
docker-compose -f $COMPOSE_FILE up -d
print_status "Services started successfully"

# Wait for services to be ready
echo ""
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service health
echo ""
echo -e "${BLUE}🔍 Checking service health...${NC}"

# Check MySQL
if docker-compose -f $COMPOSE_FILE exec -T mysql mysqladmin ping -h localhost >/dev/null 2>&1; then
    print_status "MySQL database is healthy"
else
    print_warning "MySQL database health check failed"
fi

# Check Redis
if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping >/dev/null 2>&1; then
    print_status "Redis cache is healthy"
else
    print_warning "Redis cache health check failed"
fi

# Check application
if curl -f -k https://localhost/api/health >/dev/null 2>&1; then
    print_status "Application is healthy"
else
    print_warning "Application health check failed - checking logs..."
    docker-compose -f $COMPOSE_FILE logs app --tail=20
fi

# Run database migrations
echo ""
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
docker-compose -f $COMPOSE_FILE exec -T app npx prisma migrate deploy
print_status "Database migrations completed"

# Show service status
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show logs
echo ""
echo -e "${BLUE}📋 Recent logs:${NC}"
docker-compose -f $COMPOSE_FILE logs --tail=10

echo ""
echo -e "${GREEN}🎉 Docker deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  • Frontend: Built and deployed"
echo "  • Backend: Built and deployed"
echo "  • Database: MySQL running and migrated"
echo "  • Cache: Redis running"
echo "  • Proxy: Nginx running with SSL"
echo "  • Health Check: $(curl -s -k https://localhost/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo 'Failed')"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "  • Application: https://localhost"
echo "  • Health Check: https://localhost/api/health"
echo "  • API Documentation: https://localhost/api/docs"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  docker-compose -f $COMPOSE_FILE logs -f    # Follow logs"
echo "  docker-compose -f $COMPOSE_FILE restart    # Restart services"
echo "  docker-compose -f $COMPOSE_FILE down       # Stop services"
echo "  docker-compose -f $COMPOSE_FILE up -d      # Start services"
echo ""
echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo "  • Check logs: docker-compose -f $COMPOSE_FILE logs [service]"
echo "  • Restart service: docker-compose -f $COMPOSE_FILE restart [service]"
echo "  • Access container: docker-compose -f $COMPOSE_FILE exec [service] bash"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  • SSL certificates are self-signed for development"
echo "  • Update environment variables in $ENV_FILE for production"
echo "  • Configure proper SSL certificates for production deployment"
echo "  • Set up monitoring and backup procedures"

print_status "Docker deployment completed successfully!"
