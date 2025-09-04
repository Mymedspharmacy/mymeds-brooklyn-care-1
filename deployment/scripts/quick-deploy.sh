#!/bin/bash

# Quick Docker Deployment Script for MyMeds Pharmacy
# This script provides a simplified deployment process

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 MyMeds Pharmacy - Quick Docker Deployment${NC}"
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    echo -e "${YELLOW}⚠️  Not in the correct directory. Please run this script from the project root.${NC}"
    exit 1
fi

# Create .env file from template if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${BLUE}📝 Creating .env file from template...${NC}"
    cp docker.env .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env file with your actual values before continuing${NC}"
    echo ""
    echo "Required updates in .env file:"
    echo "  • MYSQL_ROOT_PASSWORD - Set a secure root password"
    echo "  • REDIS_PASSWORD - Set a secure Redis password"
    echo "  • SMTP_PASS - Set your Gmail app password"
    echo "  • WOOCOMMERCE_CONSUMER_KEY - Set your WooCommerce consumer key"
    echo "  • WOOCOMMERCE_CONSUMER_SECRET - Set your WooCommerce consumer secret"
    echo "  • WORDPRESS_PASSWORD - Set your WordPress password"
    echo "  • NEW_RELIC_LICENSE_KEY - Set your New Relic license key (optional)"
    echo ""
    read -p "Press Enter after updating the .env file..."
fi

# Generate SSL certificates if they don't exist
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo -e "${BLUE}🔐 Generating SSL certificates...${NC}"
    mkdir -p nginx/ssl
    chmod +x scripts/generate-ssl.sh
    ./scripts/generate-ssl.sh
fi

# Stop any existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Build and start services
echo -e "${BLUE}🔨 Building and starting services...${NC}"
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 30

# Check service status
echo -e "${BLUE}📊 Checking service status...${NC}"
docker-compose -f docker-compose.prod.yml ps

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# Check application health
echo -e "${BLUE}🔍 Checking application health...${NC}"
if curl -f -k https://localhost/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy!${NC}"
else
    echo -e "${YELLOW}⚠️  Application health check failed. Checking logs...${NC}"
    docker-compose -f docker-compose.prod.yml logs app --tail=20
fi

echo ""
echo -e "${GREEN}🎉 Quick deployment completed!${NC}"
echo ""
echo -e "${BLUE}🔗 Access URLs:${NC}"
echo "  • Frontend: https://localhost"
echo "  • API Health: https://localhost/api/health"
echo "  • API Documentation: https://localhost/api/docs"
echo ""
echo -e "${BLUE}📝 Useful Commands:${NC}"
echo "  docker-compose -f docker-compose.prod.yml logs -f    # Follow logs"
echo "  docker-compose -f docker-compose.prod.yml restart    # Restart services"
echo "  docker-compose -f docker-compose.prod.yml down       # Stop services"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  • SSL certificates are self-signed for development"
echo "  • Update environment variables in .env for production"
echo "  • Configure proper SSL certificates for production deployment"
