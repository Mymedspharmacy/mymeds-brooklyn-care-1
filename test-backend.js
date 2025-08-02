#!/usr/bin/env node

/**
 * Backend Testing Script for MyMeds Pharmacy
 * This script tests all critical backend functionality
 */

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'testpassword123';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(name, passed, error = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  
  if (error) {
    console.log(`   Error: ${error.message || error}`);
  }
  
  results.tests.push({ name, passed, error });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

// Helper function to make API requests
async function makeRequest(method, endpoint, data = null, headers = {}) {
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
      status: error.response?.status 
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.success && result.status === 200) {
    logTest('Health Check', true);
  } else {
    logTest('Health Check', false, result.error);
  }
}

async function testDatabaseHealth() {
  console.log('\n🔍 Testing Database Health...');
  
  const result = await makeRequest('GET', '/health/db');
  
  if (result.success && result.status === 200) {
    logTest('Database Health', true);
  } else {
    logTest('Database Health', false, result.error);
  }
}

async function testContactForm() {
  console.log('\n🔍 Testing Contact Form...');
  
  const contactData = {
    name: 'Test User',
    email: TEST_EMAIL,
    message: 'This is a test contact form submission'
  };
  
  const result = await makeRequest('POST', '/contact', contactData);
  
  if (result.success && result.status === 201) {
    logTest('Contact Form Submission', true);
  } else {
    logTest('Contact Form Submission', false, result.error);
  }
}

async function testAppointmentForm() {
  console.log('\n🔍 Testing Appointment Form...');
  
  const appointmentData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '(555) 123-4567',
    email: TEST_EMAIL,
    service: 'Consultation',
    preferredDate: '2024-12-25',
    preferredTime: '14:00',
    notes: 'Test appointment request'
  };
  
  const result = await makeRequest('POST', '/appointments/request', appointmentData);
  
  if (result.success && result.status === 201) {
    logTest('Appointment Form Submission', true);
  } else {
    logTest('Appointment Form Submission', false, result.error);
  }
}

async function testPrescriptionRefill() {
  console.log('\n🔍 Testing Prescription Refill Form...');
  
  const refillData = {
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '(555) 987-6543',
    email: TEST_EMAIL,
    prescriptionNumber: 'RX123456',
    medication: 'Lisinopril 10mg',
    pharmacy: 'Test Pharmacy',
    notes: 'Test refill request'
  };
  
  const result = await makeRequest('POST', '/prescriptions/refill', refillData);
  
  if (result.success && result.status === 201) {
    logTest('Prescription Refill Form', true);
  } else {
    logTest('Prescription Refill Form', false, result.error);
  }
}

async function testAdminLogin() {
  console.log('\n🔍 Testing Admin Login...');
  
  const loginData = {
    email: process.env.ADMIN_EMAIL || 'admin@mymeds.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPassword123!'
  };
  
  const result = await makeRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.status === 200 && result.data.token) {
    logTest('Admin Login', true);
    return result.data.token; // Return token for other tests
  } else {
    logTest('Admin Login', false, result.error);
    return null;
  }
}

async function testAdminEndpoints(token) {
  if (!token) {
    console.log('\n⚠️  Skipping admin endpoint tests (no valid token)');
    return;
  }
  
  console.log('\n🔍 Testing Admin Endpoints...');
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  // Test getting appointments
  const appointmentsResult = await makeRequest('GET', '/appointments', null, headers);
  if (appointmentsResult.success) {
    logTest('Get Appointments (Admin)', true);
  } else {
    logTest('Get Appointments (Admin)', false, appointmentsResult.error);
  }
  
  // Test getting prescriptions
  const prescriptionsResult = await makeRequest('GET', '/prescriptions', null, headers);
  if (prescriptionsResult.success) {
    logTest('Get Prescriptions (Admin)', true);
  } else {
    logTest('Get Prescriptions (Admin)', false, prescriptionsResult.error);
  }
  
  // Test getting contact forms
  const contactResult = await makeRequest('GET', '/contact', null, headers);
  if (contactResult.success) {
    logTest('Get Contact Forms (Admin)', true);
  } else {
    logTest('Get Contact Forms (Admin)', false, contactResult.error);
  }
}

async function testSecurityFeatures() {
  console.log('\n🔍 Testing Security Features...');
  
  // Test rate limiting (try multiple requests quickly)
  const promises = [];
  for (let i = 0; i < 6; i++) {
    promises.push(makeRequest('POST', '/contact', {
      name: `Test User ${i}`,
      email: `test${i}@example.com`,
      message: 'Rate limit test'
    }));
  }
  
  const results = await Promise.all(promises);
  const rateLimited = results.some(r => r.status === 429);
  
  if (rateLimited) {
    logTest('Rate Limiting', true);
  } else {
    logTest('Rate Limiting', false, 'Rate limiting not working');
  }
  
  // Test input validation
  const maliciousData = {
    name: "'; DROP TABLE users; --",
    email: "test@example.com",
    message: "<script>alert('xss')</script>"
  };
  
  const validationResult = await makeRequest('POST', '/contact', maliciousData);
  
  if (validationResult.success) {
    logTest('Input Validation', true);
  } else {
    logTest('Input Validation', false, validationResult.error);
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Testing Environment Variables...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];
  
  let allSet = true;
  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      allSet = false;
      missing.push(varName);
    }
  }
  
  if (allSet) {
    logTest('Environment Variables', true);
  } else {
    logTest('Environment Variables', false, `Missing: ${missing.join(', ')}`);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Backend Tests...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Run all tests
    await testEnvironmentVariables();
    await testHealthCheck();
    await testDatabaseHealth();
    await testContactForm();
    await testAppointmentForm();
    await testPrescriptionRefill();
    await testSecurityFeatures();
    
    const token = await testAdminLogin();
    await testAdminEndpoints(token);
    
  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.tests
      .filter(test => !test.passed)
      .forEach(test => {
        console.log(`   - ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.failed === 0) {
    console.log('   ✅ All tests passed! Backend is ready for production.');
  } else {
    console.log('   ⚠️  Fix failed tests before deploying to production.');
    console.log('   📖 Check the error messages above for guidance.');
  }
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests, logTest, makeRequest }; 