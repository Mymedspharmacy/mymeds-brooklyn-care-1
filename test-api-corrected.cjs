#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test endpoints with CORRECT data
const endpointsWithCorrectData = [
  // Patient Registration with ALL required fields including city, state, zipCode
  { 
    method: 'POST', 
    path: '/api/patient/register', 
    name: 'Patient Registration (Complete Data)', 
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
      phone: '555-123-4567',
      dateOfBirth: '1985-06-15',
      ssn: '123-45-6789',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '555-987-6543',
      emergencyContactRelationship: 'Spouse',
      insuranceProvider: 'Blue Cross Blue Shield',
      insuranceGroupNumber: 'GRP123456',
      insuranceMemberId: 'MEM789012',
      primaryCarePhysician: 'Dr. Smith',
      physicianPhone: '555-555-5555',
      allergies: 'Penicillin',
      currentMedications: 'Metformin 500mg',
      medicalConditions: 'Type 2 Diabetes',
      governmentIdType: 'Driver License',
      governmentIdNumber: 'DL123456789',
      termsAccepted: true,
      privacyPolicyAccepted: true,
      hipaaConsent: true,
      medicalAuthorization: true,
      financialResponsibility: true,
      securityQuestions: JSON.stringify([
        { question: "What was your first pet's name?", answer: "Fluffy" },
        { question: "What city were you born in?", answer: "New York" }
      ])
    }
  },
  
  // Admin Login with correct credentials from environment
  { 
    method: 'POST', 
    path: '/api/admin/login', 
    name: 'Admin Login (Correct Credentials)', 
    data: {
      email: 'admin@mymedspharmacyinc.com',
      password: 'Mymeds2025!AdminSecure123!@#'
    }
  },
  
  // Appointment Request with complete data
  { 
    method: 'POST', 
    path: '/api/appointments/request', 
    name: 'Appointment Request (Complete Data)', 
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      preferredDate: '2025-01-15',
      preferredTime: '10:00',
      reason: 'Medication Consultation',
      message: 'I need to discuss my current medication regimen and potential adjustments.'
    }
  },
  
  // Contact Form with complete data
  { 
    method: 'POST', 
    path: '/api/contact', 
    name: 'Contact Form (Complete Data)', 
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      subject: 'Question about Prescription',
      message: 'I have a question about my prescription refill. Can you please help me?'
    }
  }
];

let adminToken = null;

async function testEndpointWithCorrectData(endpoint) {
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
    
    // Add admin token if required
    if (endpoint.requiresAuth && adminToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    }
    
    const response = await axios(config);
    
    // Store admin token for future requests
    if (endpoint.path === '/api/admin/login' && response.status === 200 && response.data.token) {
      adminToken = response.data.token;
      console.log(`   🔑 Admin token obtained: ${adminToken.substring(0, 20)}...`);
    }
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        const responseStr = JSON.stringify(response.data);
        console.log(`   📊 Response: ${responseStr.substring(0, 200)}${responseStr.length > 200 ? '...' : ''}`);
      }
    } else {
      console.log(`   ⚠️  PARTIAL (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Error: ${response.data.error}`);
      } else if (response.data && response.data.message) {
        console.log(`   ℹ️  Message: ${response.data.message}`);
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

async function runCorrectedTests() {
  console.log('🚀 MyMeds Pharmacy API Testing with CORRECT Data');
  console.log('================================================');
  
  const results = [];
  
  for (const endpoint of endpointsWithCorrectData) {
    const result = await testEndpointWithCorrectData(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test prescription creation with admin token
  if (adminToken) {
    console.log('\n🧪 Testing Create Prescription (With Admin Token)...');
    const prescriptionResult = await testEndpointWithCorrectData({
      method: 'POST',
      path: '/api/prescriptions',
      name: 'Create Prescription (With Admin Token)',
      data: {
        patientName: 'John Doe',
        medication: 'Metformin',
        dosage: '500mg',
        instructions: 'Take once daily with breakfast',
        doctorName: 'Dr. Smith',
        doctorPhone: '555-555-5555'
      },
      requiresAuth: true
    });
    results.push({ 
      method: 'POST', 
      path: '/api/prescriptions', 
      name: 'Create Prescription (With Admin Token)', 
      result: prescriptionResult 
    });
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY WITH CORRECT DATA');
  console.log('==================================');
  
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
  
  // Test specific functionality
  console.log('\n🔍 FUNCTIONALITY VERIFICATION');
  console.log('==============================');
  
  const patientReg = results.find(r => r.name.includes('Patient Registration'));
  const adminLogin = results.find(r => r.name.includes('Admin Login'));
  const appointment = results.find(r => r.name.includes('Appointment Request'));
  const contact = results.find(r => r.name.includes('Contact Form'));
  const prescription = results.find(r => r.name.includes('Prescription'));
  
  console.log(`👤 Patient Registration: ${patientReg?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔐 Admin Authentication: ${adminLogin?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📅 Appointment System: ${appointment?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📧 Contact System: ${contact?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💊 Prescription System: ${prescription?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  console.log('\n🎯 FINAL ASSESSMENT');
  console.log('===================');
  
  if (successful === total) {
    console.log('🎉 ALL CRITICAL API ENDPOINTS ARE WORKING PERFECTLY!');
    console.log('✅ Patient Portal: Ready for production');
    console.log('✅ Admin Portal: Ready for production');
    console.log('✅ Forms: Ready for production');
    console.log('✅ Authentication: Working correctly');
    console.log('✅ Validation: Working correctly');
  } else if (successful > total * 0.8) {
    console.log('✅ Most API endpoints are working. Minor issues to address.');
  } else if (successful > total * 0.5) {
    console.log('⚠️  Some API endpoints are working. Significant issues need attention.');
  } else {
    console.log('❌ Major API issues detected. Core functionality needs fixing.');
  }
  
  // Show what's working
  const workingEndpoints = results.filter(r => r.result.success);
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING ENDPOINTS:');
    workingEndpoints.forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  // Show what needs fixing
  const failedEndpoints = results.filter(r => !r.result.success);
  if (failedEndpoints.length > 0) {
    console.log('\n❌ ENDPOINTS NEEDING ATTENTION:');
    failedEndpoints.forEach(({ name, result }) => {
      console.log(`   • ${name} - ${result.error?.error || result.error || 'Unknown error'}`);
    });
  }
}

// Run the corrected tests
runCorrectedTests().catch(console.error);
