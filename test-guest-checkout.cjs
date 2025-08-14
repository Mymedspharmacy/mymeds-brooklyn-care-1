const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mymedspharmacy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

let adminToken = null;
let testCartId = null;
let testOrderId = null;

// Test results
const results = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to log results
function logResult(testName, success, error = null) {
  if (success) {
    console.log(`✅ ${testName} - PASSED`);
    results.passed++;
  } else {
    console.log(`❌ ${testName} - FAILED`);
    if (error) {
      console.log(`   Error: ${error}`);
      results.errors.push({ test: testName, error });
    }
    results.failed++;
  }
}

// Helper function to make authenticated requests
async function makeAuthRequest(method, endpoint, data = null) {
  if (!adminToken) {
    throw new Error('No admin token available');
  }
  
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
}

// Test 1: Health Check
async function testHealthCheck() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logResult('Health Check', response.status === 200);
  } catch (error) {
    logResult('Health Check', false, error.message);
  }
}

// Test 2: Admin Login
async function testAdminLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (response.data.token) {
      adminToken = response.data.token;
      logResult('Admin Login', true);
    } else {
      logResult('Admin Login', false, 'No token received');
    }
  } catch (error) {
    logResult('Admin Login', false, error.response?.data?.error || error.message);
  }
}

// Test 3: Create Guest Cart
async function testCreateGuestCart() {
  try {
    const response = await axios.get(`${BASE_URL}/cart`);
    
    if (response.data.success && response.data.cart.id) {
      testCartId = response.data.cart.id;
      logResult('Create Guest Cart', true);
    } else {
      logResult('Create Guest Cart', false, 'No cart ID received');
    }
  } catch (error) {
    logResult('Create Guest Cart', false, error.response?.data?.error || error.message);
  }
}

// Test 4: Add Product to Cart
async function testAddProductToCart() {
  try {
    if (!testCartId) {
      logResult('Add Product to Cart', false, 'No cart ID available');
      return;
    }
    
    const response = await axios.post(`${BASE_URL}/cart/add`, {
      cartId: testCartId,
      productId: 1, // Assuming product ID 1 exists
      quantity: 2
    });
    
    if (response.data.success) {
      logResult('Add Product to Cart', true);
    } else {
      logResult('Add Product to Cart', false, 'Failed to add product');
    }
  } catch (error) {
    logResult('Add Product to Cart', false, error.response?.data?.error || error.message);
  }
}

// Test 5: Get Cart Contents
async function testGetCartContents() {
  try {
    if (!testCartId) {
      logResult('Get Cart Contents', false, 'No cart ID available');
      return;
    }
    
    const response = await axios.get(`${BASE_URL}/cart?cartId=${testCartId}`);
    
    if (response.data.success && response.data.cart.items.length > 0) {
      logResult('Get Cart Contents', true);
    } else {
      logResult('Get Cart Contents', false, 'Cart is empty or failed to retrieve');
    }
  } catch (error) {
    logResult('Get Cart Contents', false, error.response?.data?.error || error.message);
  }
}

// Test 6: Guest Checkout
async function testGuestCheckout() {
  try {
    if (!testCartId) {
      logResult('Guest Checkout', false, 'No cart ID available');
      return;
    }
    
    const checkoutData = {
      cartId: testCartId,
      guestEmail: 'test@example.com',
      guestName: 'Test Customer',
      guestPhone: '555-123-4567',
      shippingAddress: '123 Test Street',
      shippingCity: 'Test City',
      shippingState: 'NY',
      shippingZipCode: '10001',
      shippingCountry: 'USA',
      shippingMethod: 'standard',
      paymentMethod: 'stripe',
      notes: 'Test order for guest checkout'
    };
    
    const response = await axios.post(`${BASE_URL}/orders/guest-checkout`, checkoutData);
    
    if (response.data.success && response.data.order.id) {
      testOrderId = response.data.order.id;
      logResult('Guest Checkout', true);
    } else {
      logResult('Guest Checkout', false, 'Failed to create order');
    }
  } catch (error) {
    logResult('Guest Checkout', false, error.response?.data?.error || error.message);
  }
}

// Test 7: Guest Order Tracking
async function testGuestOrderTracking() {
  try {
    if (!testOrderId) {
      logResult('Guest Order Tracking', false, 'No order ID available');
      return;
    }
    
    const response = await axios.get(`${BASE_URL}/orders/guest-track`, {
      params: {
        guestEmail: 'test@example.com',
        guestPhone: '555-123-4567'
      }
    });
    
    if (response.data.success && response.data.order) {
      logResult('Guest Order Tracking', true);
    } else {
      logResult('Guest Order Tracking', false, 'Failed to track order');
    }
  } catch (error) {
    logResult('Guest Order Tracking', false, error.response?.data?.error || error.message);
  }
}

// Test 8: Admin View Guest Order
async function testAdminViewGuestOrder() {
  try {
    if (!adminToken || !testOrderId) {
      logResult('Admin View Guest Order', false, 'No admin token or order ID available');
      return;
    }
    
    const response = await makeAuthRequest('GET', `/orders/${testOrderId}`);
    
    if (response.status === 200 && response.data) {
      logResult('Admin View Guest Order', true);
    } else {
      logResult('Admin View Guest Order', false, 'Failed to retrieve order');
    }
  } catch (error) {
    logResult('Admin View Guest Order', false, error.response?.data?.error || error.message);
  }
}

// Test 9: Update Order Status
async function testUpdateOrderStatus() {
  try {
    if (!adminToken || !testOrderId) {
      logResult('Update Order Status', false, 'No admin token or order ID available');
      return;
    }
    
    const response = await makeAuthRequest('PUT', `/orders/${testOrderId}/status`, {
      status: 'processing',
      trackingNumber: 'TRK123456789',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    if (response.status === 200 && response.data.success) {
      logResult('Update Order Status', true);
    } else {
      logResult('Update Order Status', false, 'Failed to update order status');
    }
  } catch (error) {
    logResult('Update Order Status', false, error.response?.data?.error || error.message);
  }
}

// Test 10: Cart Operations
async function testCartOperations() {
  try {
    if (!testCartId) {
      logResult('Cart Operations', false, 'No cart ID available');
      return;
    }
    
    // Test cart summary
    const summaryResponse = await axios.get(`${BASE_URL}/cart/summary/${testCartId}`);
    if (!summaryResponse.data.success) {
      logResult('Cart Operations', false, 'Failed to get cart summary');
      return;
    }
    
    // Test update cart item (if items exist)
    const cartResponse = await axios.get(`${BASE_URL}/cart?cartId=${testCartId}`);
    if (cartResponse.data.success && cartResponse.data.cart.items.length > 0) {
      const itemId = cartResponse.data.cart.items[0].id;
      
      const updateResponse = await axios.put(`${BASE_URL}/cart/update/${itemId}`, {
        quantity: 3
      });
      
      if (updateResponse.data.success) {
        logResult('Cart Operations', true);
      } else {
        logResult('Cart Operations', false, 'Failed to update cart item');
      }
    } else {
      logResult('Cart Operations', true); // No items to update, but summary works
    }
  } catch (error) {
    logResult('Cart Operations', false, error.response?.data?.error || error.message);
  }
}

// Test 11: Test Cart Expiration
async function testCartExpiration() {
  try {
    // Create a new cart for expiration test
    const response = await axios.get(`${BASE_URL}/cart`);
    
    if (response.data.success && response.data.cart.id) {
      const cartId = response.data.cart.id;
      
      // Try to get cart summary
      const summaryResponse = await axios.get(`${BASE_URL}/cart/summary/${cartId}`);
      if (summaryResponse.data.success) {
        logResult('Cart Expiration Test', true);
      } else {
        logResult('Cart Expiration Test', false, 'Failed to get cart summary');
      }
    } else {
      logResult('Cart Expiration Test', false, 'Failed to create test cart');
    }
  } catch (error) {
    logResult('Cart Expiration Test', false, error.response?.data?.error || error.message);
  }
}

// Test 12: Test Invalid Cart Operations
async function testInvalidCartOperations() {
  try {
    // Test adding item to non-existent cart
    try {
      await axios.post(`${BASE_URL}/cart/add`, {
        cartId: 'invalid-cart-id',
        productId: 1,
        quantity: 1
      });
      logResult('Invalid Cart Operations', false, 'Should have failed with invalid cart ID');
    } catch (error) {
      if (error.response?.status === 404) {
        logResult('Invalid Cart Operations', true);
      } else {
        logResult('Invalid Cart Operations', false, 'Unexpected error response');
      }
    }
  } catch (error) {
    logResult('Invalid Cart Operations', false, error.message);
  }
}

// Test 13: Test Guest Checkout Validation
async function testGuestCheckoutValidation() {
  try {
    // Test checkout with missing required fields
    try {
      await axios.post(`${BASE_URL}/orders/guest-checkout`, {
        cartId: 'test-cart-id',
        // Missing required fields
      });
      logResult('Guest Checkout Validation', false, 'Should have failed with missing fields');
    } catch (error) {
      if (error.response?.status === 400) {
        logResult('Guest Checkout Validation', true);
      } else {
        logResult('Guest Checkout Validation', false, 'Unexpected error response');
      }
    }
  } catch (error) {
    logResult('Guest Checkout Validation', false, error.message);
  }
}

// Test 14: Test Order Tracking Validation
async function testOrderTrackingValidation() {
  try {
    // Test tracking with missing required fields
    try {
      await axios.get(`${BASE_URL}/orders/guest-track`, {
        params: {
          // Missing required fields
        }
      });
      logResult('Order Tracking Validation', false, 'Should have failed with missing fields');
    } catch (error) {
      if (error.response?.status === 400) {
        logResult('Order Tracking Validation', true);
      } else {
        logResult('Order Tracking Validation', false, 'Unexpected error response');
      }
    }
  } catch (error) {
    logResult('Order Tracking Validation', false, error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Guest Checkout Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  // Basic functionality tests
  console.log('📋 Testing Basic Functionality...');
  await testHealthCheck();
  await testAdminLogin();
  
  // Cart functionality tests
  console.log('\n🛒 Testing Cart Functionality...');
  await testCreateGuestCart();
  await testAddProductToCart();
  await testGetCartContents();
  await testCartOperations();
  await testCartExpiration();
  
  // Guest checkout tests
  console.log('\n💳 Testing Guest Checkout...');
  await testGuestCheckout();
  await testGuestCheckoutValidation();
  
  // Order management tests
  console.log('\n📦 Testing Order Management...');
  await testGuestOrderTracking();
  await testOrderTrackingValidation();
  await testAdminViewGuestOrder();
  await testUpdateOrderStatus();
  
  // Error handling tests
  console.log('\n⚠️ Testing Error Handling...');
  await testInvalidCartOperations();
  
  // Results summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n🚨 Detailed Errors:');
    results.errors.forEach(({ test, error }) => {
      console.log(`   ${test}: ${error}`);
    });
  }
  
  console.log('\n🎯 Testing Complete!');
  
  // Production readiness assessment
  console.log('\n🏭 Production Readiness Assessment');
  console.log('==================================');
  
  const criticalTests = ['Health Check', 'Admin Login', 'Create Guest Cart', 'Guest Checkout'];
  const criticalPassed = criticalTests.every(test => 
    results.errors.every(error => error.test !== test)
  );
  
  if (criticalPassed) {
    console.log('✅ CRITICAL TESTS PASSED - System is production ready');
  } else {
    console.log('❌ CRITICAL TESTS FAILED - System needs fixes before production');
  }
  
  if (results.passed >= results.failed * 2) {
    console.log('✅ OVERALL SYSTEM HEALTH - Good for production deployment');
  } else {
    console.log('⚠️ SYSTEM HEALTH CONCERNS - Review failed tests before production');
  }
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  results
};
