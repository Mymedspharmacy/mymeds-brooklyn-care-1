#!/bin/bash
# =============================================================================
# DEPLOYMENT VERIFICATION SCRIPT - MyMeds Pharmacy Inc.
# =============================================================================
# Comprehensive verification of all deployed systems
# =============================================================================

set -e

echo "🔍 MyMeds Pharmacy Inc. - Deployment Verification"
echo "================================================="

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
BASE_URL="http://localhost:4000"
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_PASSWORD="Mymeds2025!AdminSecure123!@#"

# =============================================================================
# VERIFICATION FUNCTIONS
# =============================================================================

test_endpoint() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    
    log_info "Testing $description..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_success "$description: PASSED ($response)"
        return 0
    else
        log_error "$description: FAILED (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

test_endpoint_with_auth() {
    local endpoint="$1"
    local expected_status="$2"
    local description="$3"
    local token="$4"
    
    log_info "Testing $description..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$BASE_URL$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_success "$description: PASSED ($response)"
        return 0
    else
        log_error "$description: FAILED (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

# =============================================================================
# MAIN VERIFICATION
# =============================================================================

log_info "Starting comprehensive system verification..."

# Test 1: Basic Health Check
echo ""
log_info "=== BASIC HEALTH CHECKS ==="
test_endpoint "/api/health" "200" "Backend Health Check"
test_endpoint "/api/products" "200" "Products Endpoint"
test_endpoint "/api/blogs" "200" "Blogs Endpoint"

# Test 2: Authentication
echo ""
log_info "=== AUTHENTICATION TESTS ==="
log_info "Testing admin login..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" || echo '{"error":"Failed"}')

if echo "$login_response" | grep -q "token"; then
    log_success "Admin Login: PASSED"
    admin_token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    log_error "Admin Login: FAILED"
    admin_token=""
fi

# Test 3: Protected Endpoints
echo ""
log_info "=== PROTECTED ENDPOINT TESTS ==="
if [ -n "$admin_token" ]; then
    test_endpoint_with_auth "/api/products/categories" "200" "Product Categories (Admin)" "$admin_token"
    test_endpoint_with_auth "/api/woocommerce/settings" "200" "WooCommerce Settings (Admin)" "$admin_token"
    test_endpoint_with_auth "/api/wordpress/sync-status" "200" "WordPress Sync Status (Admin)" "$admin_token"
    test_endpoint_with_auth "/api/feedback/admin/stats" "200" "Feedback Stats (Admin)" "$admin_token"
else
    log_warning "Skipping protected endpoint tests (no admin token)"
fi

# Test 4: WooCommerce Integration
echo ""
log_info "=== WOOCOMMERCE INTEGRATION TESTS ==="
test_endpoint "/api/woocommerce/status" "200" "WooCommerce Status"
if [ -n "$admin_token" ]; then
    test_endpoint_with_auth "/api/woocommerce/generate-api-keys" "200" "API Key Generation" "$admin_token"
fi

# Test 5: WordPress Integration
echo ""
log_info "=== WORDPRESS INTEGRATION TESTS ==="
if [ -n "$admin_token" ]; then
    test_endpoint_with_auth "/api/wordpress/media" "200" "WordPress Media" "$admin_token"
fi

# Test 6: Form Submissions
echo ""
log_info "=== FORM SUBMISSION TESTS ==="
test_endpoint "/api/appointments/request" "400" "Appointment Request (Validation)"
test_endpoint "/api/contact" "400" "Contact Form (Validation)"
test_endpoint "/api/refill-requests" "400" "Refill Request (Validation)"
test_endpoint "/api/transfer-requests" "400" "Transfer Request (Validation)"

# Test 7: Patient Portal
echo ""
log_info "=== PATIENT PORTAL TESTS ==="
test_endpoint "/api/patient/register" "400" "Patient Registration (Validation)"
test_endpoint "/api/reviews" "400" "Review Submission (Validation)"
test_endpoint "/api/feedback" "400" "Feedback Submission (Validation)"

# Test 8: Database Connectivity
echo ""
log_info "=== DATABASE CONNECTIVITY TESTS ==="
log_info "Testing database connection..."
if docker-compose -f docker-compose.prod.yml exec -T mysql mysqladmin ping -h localhost >/dev/null 2>&1; then
    log_success "Database Connection: PASSED"
else
    log_error "Database Connection: FAILED"
fi

# Test 9: Container Status
echo ""
log_info "=== CONTAINER STATUS ==="
log_info "Checking container status..."
docker-compose -f docker-compose.prod.yml ps

# Test 10: Service URLs
echo ""
log_info "=== SERVICE URLS ==="
log_info "Testing service accessibility..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log_success "Frontend (Port 3000): ACCESSIBLE"
else
    log_warning "Frontend (Port 3000): NOT ACCESSIBLE"
fi

if curl -f http://localhost:4000 >/dev/null 2>&1; then
    log_success "Backend (Port 4000): ACCESSIBLE"
else
    log_error "Backend (Port 4000): NOT ACCESSIBLE"
fi

# =============================================================================
# FINAL SUMMARY
# =============================================================================
echo ""
log_info "=== DEPLOYMENT VERIFICATION SUMMARY ==="
echo ""

# Count successful tests
total_tests=0
passed_tests=0

# This is a simplified count - in a real implementation, you'd track each test
log_info "Verification completed!"
echo ""
log_success "🎉 MyMeds Pharmacy Inc. deployment verification completed!"
echo ""
log_info "Service URLs:"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo "🗄️ Database: localhost:3306"
echo "🔐 Admin Panel: http://localhost:3000/admin"
echo "📊 Health Check: http://localhost:4000/api/health"
echo ""
log_info "Next steps:"
echo "1. Configure your domain DNS"
echo "2. Set up SSL certificates"
echo "3. Update environment variables"
echo "4. Configure email settings"
echo "5. Test all functionality"
echo "6. Go live! 🚀"
echo ""
log_info "For troubleshooting, check logs with:"
echo "docker-compose -f docker-compose.prod.yml logs -f"
