const axios = require('axios');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:4000/api';
const TEST_RESULTS = [];

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890'
};

// Utility functions
const logTest = (endpoint, method, status, message = '') => {
  const result = {
    endpoint,
    method,
    status,
    message,
    timestamp: new Date().toISOString()
  };
  TEST_RESULTS.push(result);
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${method} ${endpoint} - ${message}`);
};

const makeRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
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
};

// Test functions
const testHealthEndpoints = async () => {
  console.log('\n🏥 Testing Health Endpoints...');
  
  const healthResult = await makeRequest('GET', '/health');
  logTest('/health', 'GET', 
    healthResult.success ? 'PASS' : 'FAIL',
    healthResult.success ? 'Health check successful' : healthResult.error
  );
  
  const dbHealthResult = await makeRequest('GET', '/health/db');
  logTest('/health/db', 'GET',
    dbHealthResult.success ? 'PASS' : 'FAIL',
    dbHealthResult.success ? 'Database health check successful' : 'Database connection failed (expected in dev)'
  );
};

const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  const registerResult = await makeRequest('POST', '/auth/register', testUser);
  logTest('/auth/register', 'POST',
    registerResult.success ? 'PASS' : 'FAIL',
    registerResult.success ? 'Registration successful' : 'Registration failed (may already exist)'
  );
  
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testUser.email,
    password: testUser.password
  });
  logTest('/auth/login', 'POST',
    loginResult.success ? 'PASS' : 'FAIL',
    loginResult.success ? 'Login successful' : 'Login failed'
  );
  
  let authToken = '';
  if (loginResult.success) {
    authToken = loginResult.data.token;
  }
  
  const logoutResult = await makeRequest('POST', '/auth/logout', {}, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/auth/logout', 'POST',
    logoutResult.success ? 'PASS' : 'FAIL',
    logoutResult.success ? 'Logout successful' : 'Logout failed'
  );
  
  return authToken;
};

const testUserEndpoints = async (authToken) => {
  console.log('\n👤 Testing User Endpoints...');
  
  const profileResult = await makeRequest('GET', '/users/profile', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/users/profile', 'GET',
    profileResult.success ? 'PASS' : 'FAIL',
    profileResult.success ? 'Profile retrieved' : 'Profile retrieval failed'
  );
  
  const updateResult = await makeRequest('PUT', '/users/profile', {
    firstName: 'Updated Test',
    lastName: 'User'
  }, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/users/profile', 'PUT',
    updateResult.success ? 'PASS' : 'FAIL',
    updateResult.success ? 'Profile updated' : 'Profile update failed'
  );
};

const testProductEndpoints = async () => {
  console.log('\n💊 Testing Product Endpoints...');
  
  const productsResult = await makeRequest('GET', '/products');
  logTest('/products', 'GET',
    productsResult.success ? 'PASS' : 'FAIL',
    productsResult.success ? 'Products retrieved' : 'Products retrieval failed'
  );
  
  const productResult = await makeRequest('GET', '/products/1');
  logTest('/products/1', 'GET',
    productResult.success ? 'PASS' : 'FAIL',
    productResult.success ? 'Product retrieved' : 'Product retrieval failed'
  );
  
  const searchResult = await makeRequest('GET', '/products/search?q=test');
  logTest('/products/search', 'GET',
    searchResult.success ? 'PASS' : 'FAIL',
    searchResult.success ? 'Product search successful' : 'Product search failed'
  );
};

const testOrderEndpoints = async (authToken) => {
  console.log('\n📦 Testing Order Endpoints...');
  
  const userOrdersResult = await makeRequest('GET', '/orders', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/orders', 'GET',
    userOrdersResult.success ? 'PASS' : 'FAIL',
    userOrdersResult.success ? 'User orders retrieved' : 'User orders retrieval failed'
  );
};

const testPrescriptionEndpoints = async (authToken) => {
  console.log('\n💊 Testing Prescription Endpoints...');
  
  const prescriptionsResult = await makeRequest('GET', '/prescriptions', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/prescriptions', 'GET',
    prescriptionsResult.success ? 'PASS' : 'FAIL',
    prescriptionsResult.success ? 'Prescriptions retrieved' : 'Prescriptions retrieval failed'
  );
};

const testAppointmentEndpoints = async (authToken) => {
  console.log('\n📅 Testing Appointment Endpoints...');
  
  const appointmentsResult = await makeRequest('GET', '/appointments', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/appointments', 'GET',
    appointmentsResult.success ? 'PASS' : 'FAIL',
    appointmentsResult.success ? 'Appointments retrieved' : 'Appointments retrieval failed'
  );
};

const testBlogEndpoints = async () => {
  console.log('\n📝 Testing Blog Endpoints...');
  
  const blogsResult = await makeRequest('GET', '/blogs');
  logTest('/blogs', 'GET',
    blogsResult.success ? 'PASS' : 'FAIL',
    blogsResult.success ? 'Blogs retrieved' : 'Blogs retrieval failed'
  );
  
  const blogResult = await makeRequest('GET', '/blogs/1');
  logTest('/blogs/1', 'GET',
    blogResult.success ? 'PASS' : 'FAIL',
    blogResult.success ? 'Blog retrieved' : 'Blog retrieval failed'
  );
};

const testContactEndpoints = async () => {
  console.log('\n📧 Testing Contact Endpoints...');
  
  const contactResult = await makeRequest('POST', '/contact', {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Contact',
    message: 'This is a test contact message'
  });
  logTest('/contact', 'POST',
    contactResult.success ? 'PASS' : 'FAIL',
    contactResult.success ? 'Contact form submitted' : 'Contact form submission failed'
  );
};

const testNewsletterEndpoints = async () => {
  console.log('\n📰 Testing Newsletter Endpoints...');
  
  const subscribeResult = await makeRequest('POST', '/newsletter/subscribe', {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  });
  logTest('/newsletter/subscribe', 'POST',
    subscribeResult.success ? 'PASS' : 'FAIL',
    subscribeResult.success ? 'Newsletter subscription successful' : 'Newsletter subscription failed'
  );
  
  const unsubscribeResult = await makeRequest('POST', '/newsletter/unsubscribe', {
    email: 'test@example.com'
  });
  logTest('/newsletter/unsubscribe', 'POST',
    unsubscribeResult.success ? 'PASS' : 'FAIL',
    unsubscribeResult.success ? 'Newsletter unsubscription successful' : 'Newsletter unsubscription failed'
  );
};

const testPaymentEndpoints = async (authToken) => {
  console.log('\n💳 Testing Payment Endpoints...');
  
  const paymentMethodsResult = await makeRequest('GET', '/payments/methods', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/payments/methods', 'GET',
    paymentMethodsResult.success ? 'PASS' : 'FAIL',
    paymentMethodsResult.success ? 'Payment methods retrieved' : 'Payment methods retrieval failed'
  );
};

const testReviewEndpoints = async (authToken) => {
  console.log('\n⭐ Testing Review Endpoints...');
  
  const reviewsResult = await makeRequest('GET', '/reviews');
  logTest('/reviews', 'GET',
    reviewsResult.success ? 'PASS' : 'FAIL',
    reviewsResult.success ? 'Reviews retrieved' : 'Reviews retrieval failed'
  );
};

const testCartEndpoints = async (authToken) => {
  console.log('\n🛒 Testing Cart Endpoints...');
  
  const cartResult = await makeRequest('GET', '/cart', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/cart', 'GET',
    cartResult.success ? 'PASS' : 'FAIL',
    cartResult.success ? 'Cart retrieved' : 'Cart retrieval failed'
  );
};

const testRefillRequestEndpoints = async (authToken) => {
  console.log('\n🔄 Testing Refill Request Endpoints...');
  
  const refillRequestsResult = await makeRequest('GET', '/refill-requests', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/refill-requests', 'GET',
    refillRequestsResult.success ? 'PASS' : 'FAIL',
    refillRequestsResult.success ? 'Refill requests retrieved' : 'Refill requests retrieval failed'
  );
};

const testTransferRequestEndpoints = async (authToken) => {
  console.log('\n🔄 Testing Transfer Request Endpoints...');
  
  const transferRequestsResult = await makeRequest('GET', '/transfer-requests', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/transfer-requests', 'GET',
    transferRequestsResult.success ? 'PASS' : 'FAIL',
    transferRequestsResult.success ? 'Transfer requests retrieved' : 'Transfer requests retrieval failed'
  );
};

const testNotificationEndpoints = async (authToken) => {
  console.log('\n🔔 Testing Notification Endpoints...');
  
  const notificationsResult = await makeRequest('GET', '/notifications', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/notifications', 'GET',
    notificationsResult.success ? 'PASS' : 'FAIL',
    notificationsResult.success ? 'Notifications retrieved' : 'Notifications retrieval failed'
  );
};

const testAnalyticsEndpoints = async (authToken) => {
  console.log('\n📊 Testing Analytics Endpoints...');
  
  const analyticsResult = await makeRequest('GET', '/analytics', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/analytics', 'GET',
    analyticsResult.success ? 'PASS' : 'FAIL',
    analyticsResult.success ? 'Analytics retrieved' : 'Analytics retrieval failed'
  );
};

const testPatientEndpoints = async (authToken) => {
  console.log('\n👨‍⚕️ Testing Patient Endpoints...');
  
  const patientProfileResult = await makeRequest('GET', '/patient/profile', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/patient/profile', 'GET',
    patientProfileResult.success ? 'PASS' : 'FAIL',
    patientProfileResult.success ? 'Patient profile retrieved' : 'Patient profile retrieval failed'
  );
};

const testSettingsEndpoints = async (authToken) => {
  console.log('\n⚙️ Testing Settings Endpoints...');
  
  const settingsResult = await makeRequest('GET', '/settings', null, {
    Authorization: `Bearer ${authToken}`
  });
  logTest('/settings', 'GET',
    settingsResult.success ? 'PASS' : 'FAIL',
    settingsResult.success ? 'Settings retrieved' : 'Settings retrieval failed'
  );
};

const testMonitoringEndpoints = async () => {
  console.log('\n📈 Testing Monitoring Endpoints...');
  
  const systemStatusResult = await makeRequest('GET', '/monitoring/status');
  logTest('/monitoring/status', 'GET',
    systemStatusResult.success ? 'PASS' : 'FAIL',
    systemStatusResult.success ? 'System status retrieved' : 'System status retrieval failed'
  );
  
  const performanceResult = await makeRequest('GET', '/monitoring/performance');
  logTest('/monitoring/performance', 'GET',
    performanceResult.success ? 'PASS' : 'FAIL',
    performanceResult.success ? 'Performance metrics retrieved' : 'Performance metrics retrieval failed'
  );
};

const testOpenFDAEndpoints = async () => {
  console.log('\n🏥 Testing OpenFDA Endpoints...');
  
  const searchDrugsResult = await makeRequest('GET', '/openfda/search?q=aspirin');
  logTest('/openfda/search', 'GET',
    searchDrugsResult.success ? 'PASS' : 'FAIL',
    searchDrugsResult.success ? 'Drug search successful' : 'Drug search failed'
  );
  
  const drugDetailsResult = await makeRequest('GET', '/openfda/drug/aspirin');
  logTest('/openfda/drug/aspirin', 'GET',
    drugDetailsResult.success ? 'PASS' : 'FAIL',
    drugDetailsResult.success ? 'Drug details retrieved' : 'Drug details retrieval failed'
  );
};

const testWooCommerceEndpoints = async () => {
  console.log('\n🛍️ Testing WooCommerce Endpoints...');
  
  const wcProductsResult = await makeRequest('GET', '/woocommerce/products');
  logTest('/woocommerce/products', 'GET',
    wcProductsResult.success ? 'PASS' : 'FAIL',
    wcProductsResult.success ? 'WooCommerce products retrieved' : 'WooCommerce products retrieval failed'
  );
  
  const wcOrdersResult = await makeRequest('GET', '/woocommerce/orders');
  logTest('/woocommerce/orders', 'GET',
    wcOrdersResult.success ? 'PASS' : 'FAIL',
    wcOrdersResult.success ? 'WooCommerce orders retrieved' : 'WooCommerce orders retrieval failed'
  );
};

const testWordPressEndpoints = async () => {
  console.log('\n📝 Testing WordPress Endpoints...');
  
  const wpPostsResult = await makeRequest('GET', '/wordpress/posts');
  logTest('/wordpress/posts', 'GET',
    wpPostsResult.success ? 'PASS' : 'FAIL',
    wpPostsResult.success ? 'WordPress posts retrieved' : 'WordPress posts retrieval failed'
  );
  
  const wpPagesResult = await makeRequest('GET', '/wordpress/pages');
  logTest('/wordpress/pages', 'GET',
    wpPagesResult.success ? 'PASS' : 'FAIL',
    wpPagesResult.success ? 'WordPress pages retrieved' : 'WordPress pages retrieval failed'
  );
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    await testHealthEndpoints();
    const authToken = await testAuthEndpoints();
    await testUserEndpoints(authToken);
    await testProductEndpoints();
    await testOrderEndpoints(authToken);
    await testPrescriptionEndpoints(authToken);
    await testAppointmentEndpoints(authToken);
    await testBlogEndpoints();
    await testContactEndpoints();
    await testNewsletterEndpoints();
    await testPaymentEndpoints(authToken);
    await testReviewEndpoints(authToken);
    await testCartEndpoints(authToken);
    await testRefillRequestEndpoints(authToken);
    await testTransferRequestEndpoints(authToken);
    await testNotificationEndpoints(authToken);
    await testAnalyticsEndpoints(authToken);
    await testPatientEndpoints(authToken);
    await testSettingsEndpoints(authToken);
    await testMonitoringEndpoints();
    await testOpenFDAEndpoints();
    await testWooCommerceEndpoints();
    await testWordPressEndpoints();
    
    const passedTests = TEST_RESULTS.filter(result => result.status === 'PASS').length;
    const failedTests = TEST_RESULTS.filter(result => result.status === 'FAIL').length;
    const totalTests = TEST_RESULTS.length;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Total: ${totalTests}`);
    console.log(`📊 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    const reportData = {
      summary: {
        passed: passedTests,
        failed: failedTests,
        total: totalTests,
        successRate: ((passedTests / totalTests) * 100).toFixed(1)
      },
      results: TEST_RESULTS,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('api-test-results.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Detailed results saved to: api-test-results.json');
    
    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      TEST_RESULTS.filter(result => result.status === 'FAIL').forEach(result => {
        console.log(`   ${result.method} ${result.endpoint}: ${result.message}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
};

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests, TEST_RESULTS };
