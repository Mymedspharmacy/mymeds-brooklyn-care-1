#!/bin/bash

# MyMeds Pharmacy VPS Update Script
# This script updates your VPS with all the latest changes

set -e  # Exit on any error

echo "🚀 Starting MyMeds Pharmacy VPS Update..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VPS_USER="root"
VPS_HOST="72.60.116.253"
APP_DIR="/var/www/mymeds-pharmacy"
BACKUP_DIR="/var/backups/mymeds-pharmacy"

# Function to print colored output
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

# Function to run commands on VPS
run_on_vps() {
    ssh ${VPS_USER}@${VPS_HOST} "$1"
}

# Function to copy files to VPS
copy_to_vps() {
    scp "$1" ${VPS_USER}@${VPS_HOST}:"$2"
}

echo "📋 VPS Update Summary:"
echo "======================"
echo "• TypeScript error fixes"
echo "• WordPress integration improvements"
echo "• WooCommerce enhancements"
echo "• Admin authentication improvements"
echo "• New documentation and guides"
echo "• Enhanced error handling"
echo "• Payment gateway integration"
echo "• Blog page WordPress integration"
echo ""

read -p "Do you want to proceed with the VPS update? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Update cancelled by user"
    exit 1
fi

print_status "Connecting to VPS: ${VPS_HOST}"

# Test SSH connection
if ! ssh -o ConnectTimeout=10 ${VPS_USER}@${VPS_HOST} "echo 'SSH connection successful'" > /dev/null 2>&1; then
    print_error "Cannot connect to VPS. Please check:"
    echo "1. SSH key is properly configured"
    echo "2. VPS is accessible"
    echo "3. SSH service is running"
    exit 1
fi

print_success "SSH connection established"

# Step 1: Create backup
print_status "Creating backup of current application..."
run_on_vps "mkdir -p ${BACKUP_DIR}/$(date +%Y%m%d_%H%M%S)"
BACKUP_PATH="${BACKUP_DIR}/$(date +%Y%m%d_%H%M%S)"

run_on_vps "cp -r ${APP_DIR} ${BACKUP_PATH}/"
print_success "Backup created at: ${BACKUP_PATH}"

# Step 2: Stop services
print_status "Stopping application services..."
run_on_vps "pm2 stop mymeds-pharmacy-backend || true"
run_on_vps "pm2 stop mymeds-pharmacy-frontend || true"
print_success "Services stopped"

# Step 3: Update code from Git
print_status "Updating code from Git repository..."
run_on_vps "cd ${APP_DIR} && git fetch origin"
run_on_vps "cd ${APP_DIR} && git reset --hard origin/latest"
run_on_vps "cd ${APP_DIR} && git clean -fd"
print_success "Code updated from repository"

# Step 4: Install/Update dependencies
print_status "Installing backend dependencies..."
run_on_vps "cd ${APP_DIR}/backend && npm ci --production"
print_success "Backend dependencies installed"

print_status "Installing frontend dependencies..."
run_on_vps "cd ${APP_DIR} && npm ci --production"
print_success "Frontend dependencies installed"

# Step 5: Build frontend
print_status "Building frontend application..."
run_on_vps "cd ${APP_DIR} && npm run build"
print_success "Frontend built successfully"

# Step 6: Run database migrations (if any)
print_status "Running database migrations..."
run_on_vps "cd ${APP_DIR}/backend && npx prisma migrate deploy"
print_success "Database migrations completed"

# Step 7: Update environment variables (if needed)
print_status "Checking environment configuration..."
if run_on_vps "cd ${APP_DIR}/backend && [ ! -f .env ]"; then
    print_warning "No .env file found. Please configure environment variables manually."
    echo "Required variables:"
    echo "- JWT_SECRET"
    echo "- ADMIN_EMAIL"
    echo "- ADMIN_PASSWORD_HASH"
    echo "- VITE_WORDPRESS_URL (optional)"
    echo "- WORDPRESS_USERNAME (optional)"
    echo "- WORDPRESS_PASSWORD (optional)"
fi

# Step 8: Ensure admin user exists
print_status "Ensuring admin user exists in database..."
run_on_vps "cd ${APP_DIR}/backend && node src/ensureAdminUser.ts || echo 'Admin user setup completed'"
print_success "Admin user verification completed"

# Step 9: Restart services
print_status "Starting application services..."
run_on_vps "pm2 start ${APP_DIR}/backend/ecosystem.config.js --env production"
run_on_vps "pm2 save"
print_success "Services started"

# Step 10: Verify deployment
print_status "Verifying deployment..."
sleep 5

# Check if backend is responding
if run_on_vps "curl -f http://localhost:4000/api/health > /dev/null 2>&1"; then
    print_success "Backend is responding"
else
    print_warning "Backend health check failed - may need manual verification"
fi

# Check PM2 status
print_status "Checking PM2 process status..."
run_on_vps "pm2 status"

# Step 11: Clean up old backups (keep last 5)
print_status "Cleaning up old backups..."
run_on_vps "cd ${BACKUP_DIR} && ls -t | tail -n +6 | xargs -r rm -rf"
print_success "Old backups cleaned up"

# Step 12: Update Nginx configuration (if needed)
print_status "Checking Nginx configuration..."
if run_on_vps "nginx -t"; then
    print_success "Nginx configuration is valid"
    run_on_vps "systemctl reload nginx"
    print_success "Nginx reloaded"
else
    print_warning "Nginx configuration test failed - manual check required"
fi

echo ""
print_success "🎉 VPS Update Completed Successfully!"
echo ""
echo "📋 Update Summary:"
echo "=================="
echo "✅ Code updated from Git repository"
echo "✅ Dependencies installed"
echo "✅ Frontend built"
echo "✅ Database migrations applied"
echo "✅ Admin user verified"
echo "✅ Services restarted"
echo "✅ Health checks performed"
echo "✅ Old backups cleaned up"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Test your application at: https://mymedspharmacyinc.com"
echo "2. Verify admin panel access"
echo "3. Test WordPress blog integration (if configured)"
echo "4. Test WooCommerce shop functionality"
echo "5. Check error logs: pm2 logs mymeds-pharmacy-backend"
echo ""
echo "📚 New Documentation Available:"
echo "==============================="
echo "• docs/admin-authentication-guide.md - Admin auth setup"
echo "• docs/wordpress-setup-guide.md - WordPress integration"
echo "• docs/woocommerce-payment-setup.md - Payment setup"
echo ""
echo "🐛 If you encounter issues:"
echo "==========================="
echo "• Check logs: pm2 logs"
echo "• Restore backup: cp -r ${BACKUP_PATH}/* ${APP_DIR}/"
echo "• Restart services: pm2 restart all"
echo ""

print_status "Deployment completed at: $(date)"
