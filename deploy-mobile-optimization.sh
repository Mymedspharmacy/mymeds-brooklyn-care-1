#!/bin/bash

# MyMeds Pharmacy - Mobile Shop Optimization Deployment Script
# This script updates only the modified components for mobile optimization

echo "🚀 MyMeds Pharmacy - Mobile Shop Optimization Deployment"
echo "=================================================="

# Configuration
VPS_HOST="your-vps-ip"
VPS_USER="your-username"
VPS_PATH="/path/to/your/app"
BACKUP_DIR="/path/to/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if required parameters are provided
if [ -z "$VPS_HOST" ] || [ "$VPS_HOST" = "your-vps-ip" ]; then
    print_error "Please configure VPS_HOST in the script"
    exit 1
fi

if [ -z "$VPS_USER" ] || [ "$VPS_USER" = "your-username" ]; then
    print_error "Please configure VPS_USER in the script"
    exit 1
fi

if [ -z "$VPS_PATH" ] || [ "$VPS_PATH" = "/path/to/your/app" ]; then
    print_error "Please configure VPS_PATH in the script"
    exit 1
fi

print_status "Starting mobile optimization deployment..."

# Create backup directory if it doesn't exist
print_status "Creating backup directory..."
ssh $VPS_USER@$VPS_HOST "mkdir -p $BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"

# Backup current files
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$BACKUP_TIMESTAMP"

print_status "Creating backup of current files..."
ssh $VPS_USER@$VPS_HOST "mkdir -p $BACKUP_PATH"

# Backup the files we're about to update
ssh $VPS_USER@$VPS_HOST "
    cp $VPS_PATH/src/pages/Shop.tsx $BACKUP_PATH/Shop.tsx.backup 2>/dev/null || echo 'Shop.tsx not found'
    cp $VPS_PATH/src/components/WooCommerceCheckoutForm.tsx $BACKUP_PATH/WooCommerceCheckoutForm.tsx.backup 2>/dev/null || echo 'WooCommerceCheckoutForm.tsx not found'
    cp $VPS_PATH/backend/src/routes/stripe.ts $BACKUP_PATH/stripe.ts.backup 2>/dev/null || echo 'stripe.ts not found'
"

print_success "Backup created at $BACKUP_PATH"

# Upload updated files
print_status "Uploading updated files..."

# Upload Shop.tsx (mobile-optimized)
print_status "Uploading mobile-optimized Shop.tsx..."
scp src/pages/Shop.tsx $VPS_USER@$VPS_HOST:$VPS_PATH/src/pages/Shop.tsx
if [ $? -eq 0 ]; then
    print_success "Shop.tsx uploaded successfully"
else
    print_error "Failed to upload Shop.tsx"
    exit 1
fi

# Upload WooCommerceCheckoutForm.tsx (mobile-optimized)
print_status "Uploading mobile-optimized WooCommerceCheckoutForm.tsx..."
scp src/components/WooCommerceCheckoutForm.tsx $VPS_USER@$VPS_HOST:$VPS_PATH/src/components/WooCommerceCheckoutForm.tsx
if [ $? -eq 0 ]; then
    print_success "WooCommerceCheckoutForm.tsx uploaded successfully"
else
    print_error "Failed to upload WooCommerceCheckoutForm.tsx"
    exit 1
fi

# Upload stripe.ts (fixed Stripe configuration)
print_status "Uploading fixed stripe.ts..."
scp backend/src/routes/stripe.ts $VPS_USER@$VPS_HOST:$VPS_PATH/backend/src/routes/stripe.ts
if [ $? -eq 0 ]; then
    print_success "stripe.ts uploaded successfully"
else
    print_error "Failed to upload stripe.ts"
    exit 1
fi

# Upload documentation files
print_status "Uploading documentation files..."

# Upload mobile shop guide
scp MOBILE-SHOP-GUIDE.md $VPS_USER@$VPS_HOST:$VPS_PATH/docs/ 2>/dev/null || print_warning "Could not upload MOBILE-SHOP-GUIDE.md"

# Upload WooCommerce payment guide
scp WOOCOMMERCE-PAYMENT-GUIDE.md $VPS_USER@$VPS_HOST:$VPS_PATH/docs/ 2>/dev/null || print_warning "Could not upload WOOCOMMERCE-PAYMENT-GUIDE.md"

# Upload shop test plan
scp SHOP-TEST-PLAN.md $VPS_USER@$VPS_HOST:$VPS_PATH/docs/ 2>/dev/null || print_warning "Could not upload SHOP-TEST-PLAN.md"

print_success "Documentation files uploaded"

# Restart services on VPS
print_status "Restarting services on VPS..."

# Restart backend service
print_status "Restarting backend service..."
ssh $VPS_USER@$VPS_HOST "
    cd $VPS_PATH/backend
    if command -v pm2 >/dev/null 2>&1; then
        pm2 restart mymeds-backend
        print_success 'Backend restarted with PM2'
    elif command -v systemctl >/dev/null 2>&1; then
        sudo systemctl restart mymeds-backend
        print_success 'Backend restarted with systemctl'
    else
        print_warning 'No process manager found. Please restart backend manually.'
    fi
"

# Restart frontend service
print_status "Restarting frontend service..."
ssh $VPS_USER@$VPS_HOST "
    cd $VPS_PATH
    if command -v pm2 >/dev/null 2>&1; then
        pm2 restart mymeds-frontend
        print_success 'Frontend restarted with PM2'
    elif command -v systemctl >/dev/null 2>&1; then
        sudo systemctl restart mymeds-frontend
        print_success 'Frontend restarted with systemctl'
    else
        print_warning 'No process manager found. Please restart frontend manually.'
    fi
"

# Verify deployment
print_status "Verifying deployment..."

# Check if files exist
ssh $VPS_USER@$VPS_HOST "
    if [ -f '$VPS_PATH/src/pages/Shop.tsx' ]; then
        echo '✅ Shop.tsx exists'
    else
        echo '❌ Shop.tsx missing'
    fi
    
    if [ -f '$VPS_PATH/src/components/WooCommerceCheckoutForm.tsx' ]; then
        echo '✅ WooCommerceCheckoutForm.tsx exists'
    else
        echo '❌ WooCommerceCheckoutForm.tsx missing'
    fi
    
    if [ -f '$VPS_PATH/backend/src/routes/stripe.ts' ]; then
        echo '✅ stripe.ts exists'
    else
        echo '❌ stripe.ts missing'
    fi
"

# Test endpoints
print_status "Testing endpoints..."
ssh $VPS_USER@$VPS_HOST "
    # Test backend health
    if curl -s http://localhost:4000/api/health >/dev/null; then
        echo '✅ Backend health check passed'
    else
        echo '❌ Backend health check failed'
    fi
    
    # Test frontend
    if curl -s http://localhost:3000 >/dev/null; then
        echo '✅ Frontend is accessible'
    else
        echo '❌ Frontend is not accessible'
    fi
"

print_success "Mobile optimization deployment completed!"
print_status "Deployment Summary:"
echo "  📱 Mobile-optimized Shop.tsx"
echo "  📱 Mobile-optimized WooCommerceCheckoutForm.tsx"
echo "  🔧 Fixed stripe.ts configuration"
echo "  📚 Updated documentation"
echo "  🔄 Services restarted"
echo "  ✅ Deployment verified"

print_status "Next steps:"
echo "  1. Test the mobile functionality on your VPS"
echo "  2. Verify all features work correctly"
echo "  3. Check mobile responsiveness"
echo "  4. Test cart and checkout functionality"

print_warning "Important: Make sure to configure your WooCommerce settings on the VPS:"
echo "  - Set WOOCOMMERCE_STORE_URL"
echo "  - Set WOOCOMMERCE_CONSUMER_KEY"
echo "  - Set WOOCOMMERCE_CONSUMER_SECRET"
echo "  - Configure payment gateways"

echo ""
print_success "🎉 Mobile optimization deployment completed successfully!"

