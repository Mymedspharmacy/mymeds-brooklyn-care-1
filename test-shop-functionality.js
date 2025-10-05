#!/usr/bin/env node

/**
 * Comprehensive Shop Functionality Test Script
 * Tests WooCommerce integration, cart functionality, and checkout process
 */

import axios from 'axios';

// Configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';
const API_BASE = `${BACKEND_URL}/api`;

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${message ? ` - ${message}` : ''}`);
  
  testResults.tests.push({ name: testName, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Helper function to make API requests
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test 1: Check if servers are running
async function testServerStatus() {
  console.log('\n🔍 Testing Server Status...');
  
  // Test backend server
  const backendResponse = await makeRequest('GET', `${BACKEND_URL}/api/status`);
  logTest('Backend Server Running', backendResponse.success, 
    backendResponse.success ? `Status: ${backendResponse.data?.status}` : backendResponse.error);
  
  // Test frontend server
  try {
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
    logTest('Frontend Server Running', frontendResponse.status === 200, 
      `Status: ${frontendResponse.status}`);
  } catch (error) {
    logTest('Frontend Server Running', false, error.message);
  }
}

// Test 2: Check WooCommerce API endpoints
async function testWooCommerceAPI() {
  console.log('\n🛒 Testing WooCommerce API Endpoints...');
  
  // Test WooCommerce status
  const statusResponse = await makeRequest('GET', `${API_BASE}/woocommerce/status`);
  logTest('WooCommerce Status Endpoint', statusResponse.success, 
    statusResponse.success ? `Enabled: ${statusResponse.data?.enabled}` : 'Endpoint not accessible');
  
  // Test products endpoint
  const productsResponse = await makeRequest('GET', `${API_BASE}/woocommerce/products`);
  logTest('WooCommerce Products Endpoint', productsResponse.success, 
    productsResponse.success ? `Products: ${productsResponse.data?.products?.length || 0}` : 'No products available');
  
  // Test categories endpoint
  const categoriesResponse = await makeRequest('GET', `${API_BASE}/woocommerce/categories`);
  logTest('WooCommerce Categories Endpoint', categoriesResponse.success, 
    categoriesResponse.success ? `Categories: ${categoriesResponse.data?.length || 0}` : 'No categories available');
  
  // Test payment gateways endpoint
  const gatewaysResponse = await makeRequest('GET', `${API_BASE}/woocommerce/payment-gateways`);
  logTest('WooCommerce Payment Gateways', gatewaysResponse.success, 
    gatewaysResponse.success ? `Gateways: ${gatewaysResponse.data?.paymentGateways?.length || 0}` : 'No payment gateways');
}

// Test 3: Test Cart Functionality
async function testCartFunctionality() {
  console.log('\n🛍️ Testing Cart Functionality...');
  
  // Test cart session creation
  const sessionResponse = await makeRequest('GET', `${API_BASE}/woocommerce-cart/session`);
  logTest('Cart Session Creation', sessionResponse.success, 
    sessionResponse.success ? `Session Key: ${sessionResponse.data?.sessionKey?.substring(0, 10)}...` : 'Failed to create session');
  
  if (!sessionResponse.success) {
    console.log('⚠️  Cart functionality tests skipped due to session creation failure');
    return;
  }
  
  const sessionKey = sessionResponse.data.sessionKey;
  const headers = { 'X-Cart-Session': sessionKey };
  
  // Test get empty cart
  const emptyCartResponse = await makeRequest('GET', `${API_BASE}/woocommerce-cart`, null, headers);
  logTest('Get Empty Cart', emptyCartResponse.success, 
    emptyCartResponse.success ? `Items: ${emptyCartResponse.data?.cart?.itemCount || 0}` : 'Failed to get cart');
  
  // Test add item to cart (using a test product ID)
  const addToCartData = {
    productId: 1,
    quantity: 2
  };
  const addToCartResponse = await makeRequest('POST', `${API_BASE}/woocommerce-cart/add`, addToCartData, headers);
  logTest('Add Item to Cart', addToCartResponse.success, 
    addToCartResponse.success ? `Added product ${addToCartData.productId}` : 'Failed to add item');
  
  // Test get cart with items
  const cartWithItemsResponse = await makeRequest('GET', `${API_BASE}/woocommerce-cart`, null, headers);
  logTest('Get Cart with Items', cartWithItemsResponse.success, 
    cartWithItemsResponse.success ? `Items: ${cartWithItemsResponse.data?.cart?.itemCount || 0}` : 'Failed to get cart');
  
  // Test update cart item quantity
  if (cartWithItemsResponse.success && cartWithItemsResponse.data.cart.items.length > 0) {
    const itemKey = cartWithItemsResponse.data.cart.items[0].id.toString();
    const updateData = {
      itemKey: itemKey,
      quantity: 3
    };
    const updateResponse = await makeRequest('PUT', `${API_BASE}/woocommerce-cart/update`, updateData, headers);
    logTest('Update Cart Item Quantity', updateResponse.success, 
      updateResponse.success ? `Updated quantity to ${updateData.quantity}` : 'Failed to update quantity');
  }
  
  // Test clear cart
  const clearCartResponse = await makeRequest('DELETE', `${API_BASE}/woocommerce-cart/clear`, null, headers);
  logTest('Clear Cart', clearCartResponse.success, 
    clearCartResponse.success ? 'Cart cleared successfully' : 'Failed to clear cart');
}

// Test 4: Test Order Creation
async function testOrderCreation() {
  console.log('\n📦 Testing Order Creation...');
  
  // Test order creation with sample data
  const orderData = {
    billing: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-0123',
      address_1: '123 Main St',
      city: 'Brooklyn',
      state: 'NY',
      postcode: '11201',
      country: 'US'
    },
    shipping: {
      first_name: 'John',
      last_name: 'Doe',
      address_1: '123 Main St',
      city: 'Brooklyn',
      state: 'NY',
      postcode: '11201',
      country: 'US'
    },
    line_items: [
      {
        product_id: 1,
        quantity: 1
      }
    ],
    payment_method: 'bacs',
    payment_method_title: 'Direct Bank Transfer',
    set_paid: false,
    customer_note: 'Test order from automated testing'
  };
  
  const orderResponse = await makeRequest('POST', `${API_BASE}/woocommerce/orders`, orderData);
  logTest('Create WooCommerce Order', orderResponse.success, 
    orderResponse.success ? `Order ID: ${orderResponse.data?.order?.id}` : 'Failed to create order');
}

// Test 5: Test Frontend Shop Page
async function testFrontendShopPage() {
  console.log('\n🌐 Testing Frontend Shop Page...');
  
  try {
    // Test if shop page loads
    const shopPageResponse = await axios.get(`${FRONTEND_URL}/shop`, { timeout: 10000 });
    logTest('Shop Page Loads', shopPageResponse.status === 200, 
      `Status: ${shopPageResponse.status}`);
    
    // Check if page contains expected elements
    const pageContent = shopPageResponse.data;
    const hasShopElements = pageContent.includes('Shop') || pageContent.includes('Products') || pageContent.includes('Cart');
    logTest('Shop Page Contains Expected Elements', hasShopElements, 
      hasShopElements ? 'Found shop-related content' : 'Missing shop elements');
    
  } catch (error) {
    logTest('Shop Page Loads', false, error.message);
  }
}

// Test 6: Test API Integration
async function testAPIIntegration() {
  console.log('\n🔗 Testing API Integration...');
  
  // Test if frontend can communicate with backend
  try {
    // This would typically be tested through the frontend, but we can test the API directly
    const healthResponse = await makeRequest('GET', `${API_BASE}/health`);
    logTest('API Health Check', healthResponse.success, 
      healthResponse.success ? `Status: ${healthResponse.data?.status}` : 'API not healthy');
    
    // Test CORS headers
    const corsResponse = await axios.options(`${API_BASE}/woocommerce/products`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    logTest('CORS Configuration', corsResponse.status === 200, 
      `CORS status: ${corsResponse.status}`);
    
  } catch (error) {
    logTest('API Integration', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Shop Functionality Tests...');
  console.log('=' .repeat(60));
  
  try {
    await testServerStatus();
    await testWooCommerceAPI();
    await testCartFunctionality();
    await testOrderCreation();
    await testFrontendShopPage();
    await testAPIIntegration();
    
    // Print summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.tests
        .filter(test => !test.passed)
        .forEach(test => console.log(`   - ${test.name}: ${test.message}`));
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    if (testResults.failed === 0) {
      console.log('   ✅ All tests passed! Your shop functionality is working correctly.');
      console.log('   🛒 You can now test the complete shopping flow in your browser.');
    } else {
      console.log('   🔧 Fix the failed tests before proceeding with manual testing.');
      console.log('   📝 Check server logs for detailed error information.');
      console.log('   🔑 Ensure WooCommerce credentials are properly configured.');
    }
    
  } catch (error) {
    console.error('💥 Test runner error:', error.message);
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, testResults };
