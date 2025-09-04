#!/bin/bash

# =============================================================================
# MyMeds Pharmacy VPS Deployment Test Script
# =============================================================================
# This script tests all components after deployment
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="mymedspharmacyinc.com"
API_URL="https://${DOMAIN}/api"
ADMIN_EMAIL="admin@${DOMAIN}"
ADMIN_PASSWORD="YourSecureAdminPassword123!@#"

echo -e "${BLUE}🧪 MyMeds Pharmacy VPS Deployment Test${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_success "PASSED"
        return 0
    else
        print_error "FAILED"
        return 1
    fi
}

# Function to test database connection
test_database() {
    echo -n "Testing database connection... "
    
    if mysql -u mymeds_user -p"YourSecurePassword123" -e "SELECT 1;" > /dev/null 2>&1; then
        print_success "PASSED"
        return 0
    else
        print_error "FAILED"
        return 1
    fi
}

# Function to test form submission
test_form_submission() {
    local form_type=$1
    local endpoint=$2
    local test_data=$3
    
    echo -n "Testing $form_type form submission... "
    
    # Create temporary test file
    echo "Test prescription file content" > /tmp/test_prescription.pdf
    
    # Submit form data
    if curl -f -s -X POST \
        -F "firstName=Test" \
        -F "lastName=User" \
        -F "phone=555-123-4567" \
        -F "email=test@example.com" \
        -F "medication=Test Medication" \
        -F "file=@/tmp/test_prescription.pdf" \
        "$API_URL$endpoint" > /dev/null 2>&1; then
        print_success "PASSED"
        rm -f /tmp/test_prescription.pdf
        return 0
    else
        print_error "FAILED"
        rm -f /tmp/test_prescription.pdf
        return 1
    fi
}

# Function to test admin login
test_admin_login() {
    echo -n "Testing admin login... "
    
    # Test admin login
    if curl -f -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "$API_URL/admin/login" | grep -q "token"; then
        print_success "PASSED"
        return 0
    else
        print_error "FAILED"
        return 1
    fi
}

# Function to check service status
check_service() {
    local service=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    if systemctl is-active --quiet "$service"; then
        print_success "RUNNING"
        return 0
    else
        print_error "STOPPED"
        return 1
    fi
}

# Function to check PM2 process
check_pm2() {
    local app_name=$1
    local description=$2
    
    echo -n "Checking $description... "
    
    if pm2 list | grep -q "$app_name.*online"; then
        print_success "RUNNING"
        return 0
    else
        print_error "STOPPED"
        return 1
    fi
}

# Function to test SSL certificate
test_ssl() {
    echo -n "Testing SSL certificate... "
    
    if curl -f -s -I "https://$DOMAIN" | grep -q "HTTP/2 200"; then
        print_success "VALID"
        return 0
    else
        print_error "INVALID"
        return 1
    fi
}

# Main test function
main() {
    local tests_passed=0
    local total_tests=0
    
    echo -e "${BLUE}Starting comprehensive deployment tests...${NC}"
    echo ""
    
    # Test 1: Check system services
    echo -e "${BLUE}🔧 System Services${NC}"
    check_service "nginx" "Nginx web server"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    check_service "mysql" "MySQL database"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    check_pm2 "mymeds-backend" "PM2 application"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 2: Check SSL certificate
    echo -e "${BLUE}🔒 SSL Certificate${NC}"
    test_ssl
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 3: Test database connection
    echo -e "${BLUE}🗄️  Database${NC}"
    test_database
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 4: Test API endpoints
    echo -e "${BLUE}🌐 API Endpoints${NC}"
    test_endpoint "$API_URL/health" "200" "Health check endpoint"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    test_endpoint "$API_URL/status" "200" "Status endpoint"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 5: Test form submissions
    echo -e "${BLUE}📝 Form Submissions${NC}"
    test_form_submission "Prescription Refill" "/prescriptions/refill" "refill_data"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    test_form_submission "Prescription Transfer" "/prescriptions/transfer" "transfer_data"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 6: Test admin authentication
    echo -e "${BLUE}🔐 Admin Authentication${NC}"
    test_admin_login
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 7: Test frontend accessibility
    echo -e "${BLUE}🎨 Frontend${NC}"
    test_endpoint "https://$DOMAIN" "200" "Frontend homepage"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    test_endpoint "https://$DOMAIN/admin" "200" "Admin dashboard"
    ((total_tests++))
    if [ $? -eq 0 ]; then ((tests_passed++)); fi
    
    echo ""
    
    # Test 8: Check file upload directories
    echo -e "${BLUE}📁 File System${NC}"
    echo -n "Checking upload directories... "
    if [ -d "/var/www/mymeds/backend/uploads" ] && [ -w "/var/www/mymeds/backend/uploads" ]; then
        print_success "EXISTS AND WRITABLE"
        ((tests_passed++))
    else
        print_error "MISSING OR NOT WRITABLE"
    fi
    ((total_tests++))
    
    echo ""
    
    # Test 9: Check environment variables
    echo -e "${BLUE}⚙️  Configuration${NC}"
    echo -n "Checking environment file... "
    if [ -f "/var/www/mymeds/backend/.env" ]; then
        print_success "EXISTS"
        ((tests_passed++))
    else
        print_error "MISSING"
    fi
    ((total_tests++))
    
    echo ""
    
    # Test 10: Check database tables
    echo -e "${BLUE}📊 Database Schema${NC}"
    echo -n "Checking database tables... "
    if mysql -u mymeds_user -p"YourSecurePassword123" -e "SHOW TABLES;" mymeds_production | grep -q "User"; then
        print_success "CREATED"
        ((tests_passed++))
    else
        print_error "MISSING"
    fi
    ((total_tests++))
    
    echo ""
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${BLUE}📊 Test Results Summary${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    echo -e "Tests Passed: ${GREEN}$tests_passed${NC} / $total_tests"
    echo ""
    
    if [ $tests_passed -eq $total_tests ]; then
        echo -e "${GREEN}🎉 All tests passed! Your MyMeds Pharmacy is fully operational!${NC}"
        echo ""
        echo -e "${BLUE}🌐 Your application is live at:${NC}"
        echo -e "   https://$DOMAIN"
        echo ""
        echo -e "${BLUE}📊 Admin Dashboard:${NC}"
        echo -e "   https://$DOMAIN/admin"
        echo ""
        echo -e "${BLUE}🔧 Management Commands:${NC}"
        echo -e "   PM2 Status: pm2 status"
        echo -e "   PM2 Logs: pm2 logs mymeds-backend"
        echo -e "   Restart: pm2 restart mymeds-backend"
        echo ""
        echo -e "${GREEN}✅ All forms will submit successfully to the MySQL database!${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Please check the errors above.${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Troubleshooting:${NC}"
        echo -e "   1. Check PM2 logs: pm2 logs mymeds-backend"
        echo -e "   2. Check Nginx logs: sudo tail -f /var/log/nginx/error.log"
        echo -e "   3. Check MySQL status: sudo systemctl status mysql"
        echo -e "   4. Restart services: pm2 restart mymeds-backend"
        exit 1
    fi
}

# Run main function
main "$@"
