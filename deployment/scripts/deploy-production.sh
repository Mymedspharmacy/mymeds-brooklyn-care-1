#!/bin/bash

# MyMeds Pharmacy Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="MyMeds Pharmacy"
DEPLOYMENT_TYPE=${1:-"docker"}  # docker, pm2, or manual
ENVIRONMENT_FILE=".env.production"

echo -e "${BLUE}🚀 Starting ${APP_NAME} Production Deployment...${NC}"
echo -e "${BLUE}Deployment Type: ${DEPLOYMENT_TYPE}${NC}"
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

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    print_error "Not in the correct directory. Please run this script from the project root."
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENVIRONMENT_FILE" ]; then
    print_warning "Production environment file not found: $ENVIRONMENT_FILE"
    print_warning "Please create it with your production values"
    exit 1
fi

# Check Node.js version
if command_exists node; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    print_status "Node.js version: $(node --version)"
else
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if ! command_exists npm; then
    print_error "npm is not installed"
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

# Install dependencies
echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --only=production
cd backend && npm ci --only=production && cd ..
print_status "Dependencies installed"

# Build applications
echo ""
echo -e "${BLUE}🔨 Building applications...${NC}"

# Build frontend
echo "Building frontend..."
npm run build:prod
print_status "Frontend built successfully"

# Build backend
echo "Building backend..."
cd backend && npm run build && cd ..
print_status "Backend built successfully"

# Database migration
echo ""
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
cd backend
npx prisma generate
npx prisma migrate deploy
cd ..
print_status "Database migrations completed"

# Deploy based on deployment type
case $DEPLOYMENT_TYPE in
    "docker")
        deploy_docker
        ;;
    "pm2")
        deploy_pm2
        ;;
    "manual")
        deploy_manual
        ;;
    *)
        print_error "Invalid deployment type. Use: docker, pm2, or manual"
        exit 1
        ;;
esac

# Post-deployment checks
echo ""
echo -e "${BLUE}🔍 Running post-deployment checks...${NC}"
sleep 10  # Wait for services to start

# Health check
if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
    print_status "Application health check passed"
else
    print_warning "Application health check failed - check logs"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo "  • Frontend: Built and deployed"
echo "  • Backend: Built and deployed"
echo "  • Database: Migrations completed"
echo "  • Health Check: $(curl -s http://localhost:4000/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo 'Failed')"
echo ""
echo -e "${BLUE}🔗 Useful URLs:${NC}"
echo "  • Application: http://localhost:4000"
echo "  • Health Check: http://localhost:4000/api/health"
echo "  • API Documentation: http://localhost:4000/api/docs"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Configure your reverse proxy (Nginx/Apache)"
echo "  2. Set up SSL certificates"
echo "  3. Configure monitoring and logging"
echo "  4. Set up automated backups"
echo "  5. Test all functionality"

# Function: Docker deployment
deploy_docker() {
    echo ""
    echo -e "${BLUE}🐳 Deploying with Docker...${NC}"
    
    if ! command_exists docker; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Load environment variables
    export $(cat $ENVIRONMENT_FILE | grep -v '^#' | xargs)
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml build
    docker-compose -f docker-compose.prod.yml up -d
    
    print_status "Docker deployment completed"
}

# Function: PM2 deployment
deploy_pm2() {
    echo ""
    echo -e "${BLUE}⚡ Deploying with PM2...${NC}"
    
    if ! command_exists pm2; then
        print_error "PM2 is not installed. Install with: npm install -g pm2"
        exit 1
    fi
    
    # Load environment variables
    export $(cat $ENVIRONMENT_FILE | grep -v '^#' | xargs)
    
    # Start with PM2
    cd backend
    pm2 start ecosystem.config.js --env production
    pm2 save
    cd ..
    
    print_status "PM2 deployment completed"
}

# Function: Manual deployment
deploy_manual() {
    echo ""
    echo -e "${BLUE}🔧 Manual deployment mode...${NC}"
    echo "Please manually start the application using:"
    echo "  cd backend && npm start"
    echo ""
    echo "Or with PM2:"
    echo "  cd backend && pm2 start ecosystem.config.js --env production"
    echo ""
    print_status "Manual deployment instructions provided"
}

# Cleanup
echo ""
echo -e "${BLUE}🧹 Cleaning up...${NC}"
npm run clean
cd backend && npm run clean && cd ..
print_status "Cleanup completed"

echo ""
echo -e "${GREEN}✅ ${APP_NAME} production deployment completed!${NC}"
