#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test endpoints systematically
const endpoints = [
  // Health and Status
  { method: 'GET', path: '/api/health', name: 'Health Check' },
  { method: 'GET', path: '/api/status', name: 'Server Status' },
  
  // Patient Portal APIs
  { method: 'POST', path: '/api/patient/register', name: 'Patient Registration', data: {
    firstName: 'Test',
    lastName: 'Patient',
    email: 'test@example.com',
    password: 'test123',
    phone: '123-456-7890',
    dateOfBirth: '1990-01-01',
    address: '123 Test St',
    emergencyContactName: 'Emergency Contact',
    emergencyContactPhone: '987-654-3210',
    emergencyContactRelationship: 'Parent',
    allergies: 'None',
    currentMedications: 'None',
    medicalConditions: 'None',
    termsAccepted: true,
    privacyPolicyAccepted: true,
    hipaaConsent: true
  }},
  
  // Admin Portal APIs
  { method: 'POST', path: '/api/admin/login', name: 'Admin Login', data: {
    email: 'admin@mymedspharmacyinc.com',
    password: 'Mymeds2025!AdminSecure123!@#'
  }},
  
  // Form Submission APIs
  { method: 'POST', path: '/api/appointments/request', name: 'Appointment Request', data: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    preferredDate: '2025-01-15',
    preferredTime: '10:00',
    reason: 'Consultation',
    message: 'Test appointment request'
  }},
  
  { method: 'POST', path: '/api/contact', name: 'Contact Form', data: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '123-456-7890',
    subject: 'Test Subject',
    message: 'Test message'
  }},
  
  // Shop/E-commerce APIs
  { method: 'GET', path: '/api/products', name: 'Get Products' },
  { method: 'GET', path: '/api/woocommerce/products', name: 'WooCommerce Products' },
  
  // Blog APIs
  { method: 'GET', path: '/api/blogs', name: 'Get Blogs' },
  { method: 'GET', path: '/api/wordpress/posts', name: 'WordPress Posts' },
  
  // Prescription APIs
  { method: 'POST', path: '/api/prescriptions', name: 'Create Prescription', data: {
    patientName: 'Test Patient',
    medication: 'Test Medication',
    dosage: '10mg',
    instructions: 'Take once daily',
    doctorName: 'Dr. Test',
    doctorPhone: '123-456-7890'
  }},
  
  // Refill and Transfer Requests
  { method: 'POST', path: '/api/refill-requests', name: 'Refill Request', data: {
    medication: 'Test Medication',
    dosage: '10mg',
    urgency: 'normal',
    notes: 'Test refill request'
  }},
  
  { method: 'POST', path: '/api/transfer-requests', name: 'Transfer Request', data: {
    currentPharmacy: 'Test Pharmacy',
    medications: 'Test Medication',
    notes: 'Test transfer request'
  }}
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing ${endpoint.name}...`);
    console.log(`   ${endpoint.method} ${endpoint.path}`);
    
    const config = {
      method: endpoint.method.toLowerCase(),
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500
      }
    };
    
    if (endpoint.data) {
      config.data = endpoint.data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   📊 Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
      }
    } else {
      console.log(`   ⚠️  PARTIAL (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Error: ${response.data.error}`);
      }
    }
    
    return { success: response.status < 400, status: response.status, data: response.data };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ CONNECTION REFUSED - Server not running`);
      return { success: false, error: 'Server not running' };
    } else if (error.response) {
      console.log(`   ❌ ERROR (${error.response.status})`);
      if (error.response.data && error.response.data.error) {
        console.log(`   ❌ Error: ${error.response.data.error}`);
      }
      return { success: false, status: error.response.status, error: error.response.data };
    } else {
      console.log(`   ❌ NETWORK ERROR: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runTests() {
  console.log('🚀 MyMeds Pharmacy API Endpoint Testing');
  console.log('==========================================');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');
  
  results.forEach(({ name, path, result }) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${name} (${path})`);
  });
  
  // Critical endpoints check
  console.log('\n🔍 CRITICAL ENDPOINTS STATUS');
  console.log('=============================');
  
  const criticalEndpoints = [
    'Health Check',
    'Server Status',
    'Patient Registration',
    'Admin Login',
    'Appointment Request',
    'Contact Form',
    'Get Products'
  ];
  
  criticalEndpoints.forEach(name => {
    const endpoint = results.find(r => r.name === name);
    if (endpoint) {
      const status = endpoint.result.success ? '✅ WORKING' : '❌ FAILED';
      console.log(`${status} ${name}`);
    }
  });
  
  console.log('\n🎯 RECOMMENDATIONS');
  console.log('==================');
  
  if (successful === total) {
    console.log('🎉 All API endpoints are working correctly!');
  } else if (successful > total * 0.8) {
    console.log('✅ Most API endpoints are working. Fix the remaining issues.');
  } else if (successful > total * 0.5) {
    console.log('⚠️  Some API endpoints are working. Significant issues need attention.');
  } else {
    console.log('❌ Major API issues detected. Server may not be running properly.');
  }
}

// Run the tests
runTests().catch(console.error);
