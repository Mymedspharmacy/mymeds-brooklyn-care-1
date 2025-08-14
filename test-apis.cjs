const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:4000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mymedspharmacy.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

let adminToken = null;

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

// Test 1: Health Check (Public)
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

// Test 3: OpenFDA Search (Public)
async function testOpenFDASearch() {
  try {
    const response = await axios.get(`${BASE_URL}/openfda/search?query=aspirin&limit=5`);
    logResult('OpenFDA Search (Public)', response.status === 200);
  } catch (error) {
    logResult('OpenFDA Search (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 4: Contact Form Submission (Public)
async function testContactForm() {
  try {
    const response = await axios.post(`${BASE_URL}/contact`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-1234',
      subject: 'Test Message',
      message: 'This is a test message',
      agreeToTerms: true
    });
    logResult('Contact Form Submission (Public)', response.status === 201);
  } catch (error) {
    logResult('Contact Form Submission (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 5: Newsletter Subscription (Public)
async function testNewsletterSubscription() {
  try {
    const response = await axios.post(`${BASE_URL}/newsletter/subscribe`, {
      email: 'test@example.com',
      consent: true
    });
    logResult('Newsletter Subscription (Public)', response.status === 201);
  } catch (error) {
    logResult('Newsletter Subscription (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 6: Appointment Request (Public)
async function testAppointmentRequest() {
  try {
    const response = await axios.post(`${BASE_URL}/appointments/request`, {
      firstName: 'Test',
      lastName: 'Patient',
      phone: '555-1234',
      email: 'patient@example.com',
      service: 'Consultation',
      preferredDate: '2025-08-20',
      preferredTime: '10:00',
      notes: 'Test appointment'
    });
    logResult('Appointment Request (Public)', response.status === 201);
  } catch (error) {
    logResult('Appointment Request (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 7: Prescription Refill (Public)
async function testPrescriptionRefill() {
  try {
    const response = await axios.post(`${BASE_URL}/prescriptions/refill`, {
      firstName: 'Test',
      lastName: 'Patient',
      phone: '555-1234',
      email: 'patient@example.com',
      prescriptionNumber: 'RX123456',
      medication: 'Aspirin',
      pharmacy: 'Test Pharmacy',
      notes: 'Test refill request'
    });
    logResult('Prescription Refill (Public)', response.status === 201);
  } catch (error) {
    logResult('Prescription Refill (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 8: Get Orders (Admin Only)
async function testGetOrders() {
  try {
    const response = await makeAuthRequest('GET', '/orders');
    logResult('Get Orders (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Orders (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 9: Get Refill Requests (Admin Only)
async function testGetRefillRequests() {
  try {
    const response = await makeAuthRequest('GET', '/refill-requests');
    logResult('Get Refill Requests (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Refill Requests (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 10: Get Transfer Requests (Admin Only)
async function testGetTransferRequests() {
  try {
    const response = await makeAuthRequest('GET', '/transfer-requests');
    logResult('Get Transfer Requests (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Transfer Requests (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 11: Get Contacts (Admin Only)
async function testGetContacts() {
  try {
    const response = await makeAuthRequest('GET', '/contact');
    logResult('Get Contacts (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Contacts (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 12: Get Notifications (Admin Only)
async function testGetNotifications() {
  try {
    const response = await makeAuthRequest('GET', '/notifications');
    logResult('Get Notifications (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Notifications (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 13: Get Settings (Admin Only)
async function testGetSettings() {
  try {
    const response = await makeAuthRequest('GET', '/settings');
    logResult('Get Settings (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Settings (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 14: Get Newsletter Stats (Admin Only)
async function testGetNewsletterStats() {
  try {
    const response = await makeAuthRequest('GET', '/newsletter/stats');
    logResult('Get Newsletter Stats (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Newsletter Stats (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 15: Get Products (Public)
async function testGetProducts() {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    logResult('Get Products (Public)', response.status === 200);
  } catch (error) {
    logResult('Get Products (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 16: Get Blogs (Public)
async function testGetBlogs() {
  try {
    const response = await axios.get(`${BASE_URL}/blogs`);
    logResult('Get Blogs (Public)', response.status === 200);
  } catch (error) {
    logResult('Get Blogs (Public)', false, error.response?.data?.error || error.message);
  }
}

// Test 17: Get Current User (Admin Only)
async function testGetCurrentUser() {
  try {
    const response = await makeAuthRequest('GET', '/auth/me');
    logResult('Get Current User (Admin)', response.status === 200);
  } catch (error) {
    logResult('Get Current User (Admin)', false, error.response?.data?.error || error.message);
  }
}

// Test 18: Test Unauthorized Access
async function testUnauthorizedAccess() {
  try {
    await axios.get(`${BASE_URL}/orders`);
    logResult('Unauthorized Access Test', false, 'Should have been denied access');
  } catch (error) {
    if (error.response?.status === 401) {
      logResult('Unauthorized Access Test', true);
    } else {
      logResult('Unauthorized Access Test', false, `Expected 401, got ${error.response?.status}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  
  // Public tests (no authentication required)
  console.log('📋 Testing Public Endpoints...');
  await testHealthCheck();
  await testOpenFDASearch();
  await testContactForm();
  await testNewsletterSubscription();
  await testAppointmentRequest();
  await testPrescriptionRefill();
  await testGetProducts();
  await testGetBlogs();
  
  // Authentication test
  console.log('\n🔐 Testing Authentication...');
  await testAdminLogin();
  
  // Admin tests (require authentication)
  if (adminToken) {
    console.log('\n👑 Testing Admin Endpoints...');
    await testGetOrders();
    await testGetRefillRequests();
    await testGetTransferRequests();
    await testGetContacts();
    await testGetNotifications();
    await testGetSettings();
    await testGetNewsletterStats();
    await testGetCurrentUser();
  }
  
  // Security tests
  console.log('\n🔒 Testing Security...');
  await testUnauthorizedAccess();
  
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
}

// Run tests
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  results
};
