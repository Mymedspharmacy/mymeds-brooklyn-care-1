#!/bin/bash
# MyMeds Deployment Fix Script
# This script fixes common deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  MyMeds Deployment Fix Script${NC}" 
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on VPS or local
check_environment() {
    if [[ -d "/var/www/mymeds" ]]; then
        DEPLOY_PATH="/var/www/mymeds/current"
        IS_VPS=true
        print_status "Running on VPS deployment"
    else
        DEPLOY_PATH="$(pwd)"
        IS_VPS=false
        print_status "Running on local environment"
    fi
}

# Step 1: Stop services safely
stop_services() {
    print_status "Stopping services..."
    
    if command -v pm2 > /dev/null && pm2 list > /dev/null 2>&1; then
        pm2 stop all > /dev/null 2>&1 || true
        print_success "PM2 services stopped"
    fi
    
    if sudo systemctl is-active --quiet nginx; then
        sudo systemctl stop nginx
        print_success "Nginx stopped"
    fi
    
    if sudo systemctl is-active --quiet mysql; then
        print_success "MySQL is running (not stopping for safety)"
    fi
}

# Step 2: Clean and rebuild
rebuild_application() {
    print_status "Rebuilding application..."
    
    cd "$DEPLOY_PATH"
    
    # Frontend rebuild
    print_status "Building frontend..."
    if [[ -f "package.json" ]]; then
        rm -rf dist node_modules/.vite .vite-cache
        npm ci --silent
        npm run build
        
        if [[ -d "dist" ]]; then
            print_success "Frontend build completed"
        else
            print_error "Frontend build failed"
            return 1
        fi
    else
        print_warning "Frontend package.json not found"
    fi
    
    # Backend rebuild
    print_status "Building backend..."
    if [[ -f "backend/package.json" ]]; then
        cd backend
        rm -rf dist node_modules/.prisma
        
        npm ci --silent
        
        # Generate Prisma client
        if command -v npx > /dev/null; then
            npx prisma generate --silent
            print_success "Prisma client generated"
        fi
        
        # Build backend
        npm run build
        
        if [[ -f "dist/index.js" ]]; then
            print_success "Backend build completed"
        else
            print_error "Backend build failed"
            return 1
        fi
        cd ..
    else
        print_warning "Backend package.json not found"
    fi
}

# Step 3: Fix file permissions
fix_permissions() {
    print_status "Fixing file permissions..."
    
    if [[ "$IS_VPS" == true ]]; then
        sudo chown -R www-data:www-data /var/www/mymeds
        sudo chmod -R 755 /var/www/mymeds
        sudo find /var/www/mymeds -type f -name "*.js" -exec chmod 644 {} \;
        sudo find /var/www/mymeds -type f -name "*.html" -exec chmod 644 {} \;
        print_success "Permissions fixed"
    else
        print_warning "Skipping permission fix (local environment)"
    fi
}

# Step 4: Create directories and check environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create log directory
    if [[ "$IS_VPS" == true ]]; then
        sudo mkdir -p /var/log/mymeds
        sudo chown -R www-data:www-data /var/log/mymeds
    fi
    
    # Check environment files
    if [[ -f "backend/.env" ]]; then
        print_success "Backend .env found"
    else
        print_warning "Backend .env missing - create from template"
    fi
    
    # Check ecosystem config
    if [[ -f "deployment/ecosystem.config.js" ]]; then
        print_success "PM2 config found"
    else
        print_warning "PM2 config missing"
    fi
}

# Step 5: Test configurations
test_configurations() {
    print_status "Testing configurations..."
    
    # Test MySQL
    if sudo systemctl is-active --quiet mysql; then
        print_success "MySQL service: Running"
    else
        print_error "MySQL service: Not running"
        echo "Try: sudo systemctl start mysql"
    fi
    
    # Test Nginx configuration
    if sudo nginx -t > /dev/null 2>&1; then
        print_success "Nginx configuration: Valid"
    else
        print_error "Nginx configuration: Invalid"
        echo "Run: sudo nginx -t"
    fi
    
    # Test database connection
    if [[ -f "backend/.env" ]]; then
        cd backend
        # Simple node script to test DB connection
        node -e "
        require('dotenv').config();
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.\$connect()
          .then(() => { console.log('✅ Database connection: OK'); process.exit(0); })
          .catch(() => { console.log('❌ Database connection: Failed'); process.exit(1); });
        " 2>/dev/null && print_success "Database connection: OK" || print_error "Database connection: Failed"
        cd ..
    fi
}

# Step 6: Start services
start_services() {
    print_status "Starting services..."
    
    # Start MySQL if needed
    if ! sudo systemctl is-active --quiet mysql; then
        sudo systemctl start mysql
        print_success "MySQL started"
    fi
    
    # Start Nginx
    if sudo nginx -t > /dev/null 2>&1; then
        sudo systemctl start nginx
        print_success "Nginx started"
    else
        print_error "Cannot start Nginx - configuration error"
        return 1
    fi
    
    # Start PM2 (if ecosystem config exists)
    if [[ -f "deployment/ecosystem.config.js" ]]; then
        cp deployment/ecosystem.config.js backend/
        cd backend
        pm2 start ecosystem.config.js
        pm2 save
        print_success "PM2 service started"
        cd ..
    else
        print_warning "PM2 ecosystem config not found"
    fi
}

# Step 7: Test deployment
test_deployment() {
    print_status "Testing deployment..."
    sleep 3
    
    # Test API health endpoint
    if curl -sf http://localhost:4000/api/health > /dev/null 2>&1; then
        print_success "Backend API: Responding"
    else
        print_warning "Backend API: Not responding (may need time to start)"
    fi
    
    # Test frontend
    if curl -sf http://localhost/ > /dev/null 2>&1; then
        print_success "Frontend: Serving"
    else
        print_warning "Frontend: Not serving (check Nginx config)"
    fi
    
    # Show service status
    print_status "Service status:"
    pm2 status 2>/dev/null || echo "PM2 not available"
    sudo systemctl is-active nginx && echo "✅ Nginx: Active" || echo "❌ Nginx: Inactive"
    sudo systemctl is-active mysql && echo "✅ MySQL: Active" || echo "❌ MySQL: Inactive"
}

# Step 8: Display next steps
show_next_steps() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}    Deployment Fix Complete${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
    
    print_status "Next steps:"
    echo "1. Check logs: pm2 logs mymeds-backend"
    echo "2. Monitor services: pm2 monit"
    echo "3. Test website: https://yourdomain.com"
    echo "4. Test API: https://yourdomain.com/api/health"
    echo ""
    
    if [[ "$IS_VPS" == true ]]; then
        print_status "VPS-specific commands:"
        echo "• View logs: sudo tail -f /var/log/nginx/error.log"
        echo "• Check PM2: PM2_HOME=/var/www/mymeds pm2 status"
        echo "• Restart all: sudo systemctl restart nginx mysql && pm2 restart all"
    else
        print_status "Local development commands:"
        echo "• Start backend: cd backend && npm run dev"
        echo "• Start frontend: npm run dev"
        echo "• Test API: http://localhost:4000"
    fi
    
    echo ""
    print_success "Deployment fix completed successfully!"
}

# Main execution
main() {
    print_header
    
    # Check if running as root (mostly for VPS)
    if [[ "$EUID" -eq 0 ]]; then
        print_warning "Running as root - ensure files have correct ownership"
    fi
    
    check_environment
    
    # Execute fix steps
    stop_services
    rebuild_application || {
        print_error "Rebuild failed. Please check build errors above."
        exit 1
    }
    fix_permissions
    setup_environment
    test_configurations
    start_services || {
        print_error "Service startup failed. Please check errors above."
        exit 1
    }
    test_deployment
    show_next_steps
}

# Run main function
main "$@"
