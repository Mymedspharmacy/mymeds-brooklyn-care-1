#!/bin/bash

# VPS API Endpoint Test Script
# This script tests all API endpoints on the VPS

VPS_URL="https://mymedspharmacyinc.com"
API_BASE="$VPS_URL/api"

echo "🚀 Testing VPS API Endpoints"
echo "📍 Testing: $VPS_URL"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
passed=0
failed=0
total=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    
    total=$((total + 1))
    echo "🧪 Testing: $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE$endpoint" --max-time 10)
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$API_BASE$endpoint" --max-time 10)
    fi
    
    if [ "$response" = "$expected_status" ] || [ -z "$expected_status" ] && [ "$response" -ge 200 ] && [ "$response" -lt 300 ]; then
        echo -e "${GREEN}✅ $method $endpoint - Status: $response${NC}"
        passed=$((passed + 1))
    else
        echo -e "${RED}❌ $method $endpoint - Status: $response (Expected: ${expected_status:-"2xx"})${NC}"
        failed=$((failed + 1))
    fi
}

echo ""
echo "🏥 HEALTH CHECK ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "GET" "/health" "" "200"

echo ""
echo "📞 CONTACT FORM ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "POST" "/contact" '{"name":"Test User","email":"test@example.com","phone":"123-456-7890","subject":"API Test","message":"Test message"}' "201"
test_endpoint "GET" "/contact" "" "401"  # Should require auth

echo ""
echo "💊 REFILL REQUEST ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "POST" "/refill-requests" '{"name":"Test Patient","email":"patient@example.com","phone":"123-456-7890","prescriptionNumber":"RX123456","medicationName":"Test Medication","pharmacyName":"Test Pharmacy","message":"Test refill"}' "201"
test_endpoint "GET" "/refill-requests" "" "401"  # Should require auth

echo ""
echo "🔄 TRANSFER REQUEST ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "POST" "/transfer-requests" '{"name":"Test Patient","email":"patient@example.com","phone":"123-456-7890","currentPharmacy":"Current","newPharmacy":"New","prescriptionNumber":"RX123456","medicationName":"Test Medication","message":"Test transfer"}' "201"
test_endpoint "GET" "/transfer-requests" "" "401"  # Should require auth

echo ""
echo "📅 APPOINTMENT ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "POST" "/appointments/request" '{"firstName":"Test","lastName":"Patient","phone":"123-456-7890","email":"patient@example.com","service":"Consultation","preferredDate":"2024-01-15","preferredTime":"10:00","notes":"Test appointment"}' "201"
test_endpoint "GET" "/appointments/admin/all" "" "401"  # Should require auth
test_endpoint "GET" "/appointments/admin/stats" "" "401"  # Should require auth

echo ""
echo "🛒 WOOCOMMERCE ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "GET" "/woocommerce/products" "" "200"
test_endpoint "GET" "/woocommerce/categories" "" "200"
test_endpoint "GET" "/woocommerce/payment-gateways" "" "200"
test_endpoint "POST" "/woocommerce/sync-products" "" "401"  # Should require auth

echo ""
echo "📝 WORDPRESS ENDPOINTS"
echo "------------------------------------------------------------"
test_endpoint "GET" "/wordpress/posts" "" "200"
test_endpoint "GET" "/wordpress/categories" "" "200"
test_endpoint "GET" "/wordpress/posts/1" "" "200"

echo ""
echo "👨‍💼 ADMIN ENDPOINTS (Expected 401 - No Auth)"
echo "------------------------------------------------------------"
test_endpoint "GET" "/crm/admin/customers" "" "401"
test_endpoint "GET" "/crm/admin/stats" "" "401"

echo ""
echo "============================================================"
echo "📊 TEST RESULTS SUMMARY"
echo "============================================================"
echo -e "${GREEN}✅ Passed: $passed${NC}"
echo -e "${RED}❌ Failed: $failed${NC}"
echo -e "${YELLOW}📈 Total: $total${NC}"

if [ $total -gt 0 ]; then
    success_rate=$((passed * 100 / total))
    echo -e "${YELLOW}🎯 Success Rate: $success_rate%${NC}"
fi

echo ""
echo "💡 RECOMMENDATIONS"
echo "============================================================"

if [ $failed -gt 0 ]; then
    echo -e "${RED}⚠️  Some endpoints failed. Check the following:${NC}"
    echo "1. Ensure backend server is running: pm2 status"
    echo "2. Check backend logs: pm2 logs mymeds-backend"
    echo "3. Verify database connection"
    echo "4. Check environment variables"
else
    echo -e "${GREEN}🎉 All endpoints are working correctly!${NC}"
fi

echo ""
echo "🔧 TROUBLESHOOTING COMMANDS"
echo "============================================================"
echo "Check backend status: pm2 status"
echo "View backend logs: pm2 logs mymeds-backend"
echo "Restart backend: pm2 restart mymeds-backend"
echo "Check nginx status: sudo systemctl status nginx"
echo "Test database: mysql -u root -p mymeds_production -e \"SHOW TABLES;\""
echo "Check nginx logs: sudo tail -f /var/log/nginx/error.log"
echo "Check nginx access logs: sudo tail -f /var/log/nginx/access.log"
