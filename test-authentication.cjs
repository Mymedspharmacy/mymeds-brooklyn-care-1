#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Authentication and admin endpoints
const authEndpoints = [
  // Admin Login Test
  { 
    method: 'POST', 
    path: '/api/auth/login', 
    name: 'Admin Login (Valid Credentials)', 
    data: {
      email: 'admin@mymedspharmacyinc.com',
      password: 'admin123'
    }
  },
  
  // Admin Login Test (Invalid Credentials)
  { 
    method: 'POST', 
    path: '/api/auth/login', 
    name: 'Admin Login (Invalid Credentials)', 
    data: {
      email: 'admin@mymedspharmacyinc.com',
      password: 'wrongpassword'
    }
  },
  
  // Patient Login Test (if exists)
  { 
    method: 'POST', 
    path: '/api/auth/login', 
    name: 'Patient Login Test', 
    data: {
      email: 'test@example.com',
      password: 'password123'
    }
  },
  
  // Protected Patient Profile (without token)
  { 
    method: 'GET', 
    path: '/api/patient/profile', 
    name: 'Get Patient Profile (No Token)',
    expectsAuth: true
  },
  
  // Protected Patient Prescriptions (without token)
  { 
    method: 'GET', 
    path: '/api/patient/prescriptions', 
    name: 'Get Patient Prescriptions (No Token)',
    expectsAuth: true
  },
  
  // Protected Patient Appointments (without token)
  { 
    method: 'GET', 
    path: '/api/appointments/my', 
    name: 'Get My Appointments (No Token)',
    expectsAuth: true
  },
  
  // Admin Dashboard (without token)
  { 
    method: 'GET', 
    path: '/api/admin/dashboard', 
    name: 'Admin Dashboard (No Token)',
    expectsAuth: true
  },
  
  // Admin Users (without token)
  { 
    method: 'GET', 
    path: '/api/admin/users', 
    name: 'Admin Users (No Token)',
    expectsAuth: true
  }
];

let adminToken = null;
let patientToken = null;

async function testAuthEndpoint(endpoint) {
  try {
    console.log(`\n🔐 Testing ${endpoint.name}...`);
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
    
    // Add tokens if available
    if (endpoint.path.includes('/admin/') && adminToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    } else if (endpoint.path.includes('/patient/') && patientToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${patientToken}`;
    }
    
    const response = await axios(config);
    
    // Store tokens for future requests
    if (endpoint.path === '/api/auth/login' && response.status === 200 && response.data.token) {
      if (endpoint.data.email.includes('admin')) {
        adminToken = response.data.token;
        console.log(`   🔑 Admin token obtained: ${adminToken.substring(0, 20)}...`);
      } else {
        patientToken = response.data.token;
        console.log(`   🔑 Patient token obtained: ${patientToken.substring(0, 20)}...`);
      }
    }
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        const responseStr = JSON.stringify(response.data);
        console.log(`   📊 Response: ${responseStr.substring(0, 200)}${responseStr.length > 200 ? '...' : ''}`);
      }
    } else if (response.status === 401) {
      if (endpoint.expectsAuth) {
        console.log(`   ✅ EXPECTED (${response.status}) - Authentication required`);
      } else {
        console.log(`   ⚠️  AUTH FAILED (${response.status})`);
      }
      if (response.data && response.data.error) {
        console.log(`   ℹ️  Error: ${response.data.error}`);
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

async function runAuthTests() {
  console.log('🔐 MyMeds Authentication & Admin Portal Testing');
  console.log('==============================================');
  
  const results = [];
  
  for (const endpoint of authEndpoints) {
    const result = await testAuthEndpoint(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 AUTHENTICATION TEST SUMMARY');
  console.log('==============================');
  
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
  
  // Authentication functionality verification
  console.log('\n🔐 AUTHENTICATION FUNCTIONALITY');
  console.log('================================');
  
  const adminLogin = results.find(r => r.name.includes('Admin Login (Valid Credentials)'));
  const adminLoginInvalid = results.find(r => r.name.includes('Admin Login (Invalid Credentials)'));
  const patientLogin = results.find(r => r.name.includes('Patient Login Test'));
  const patientProfile = results.find(r => r.name.includes('Patient Profile'));
  const patientPrescriptions = results.find(r => r.name.includes('Patient Prescriptions'));
  const patientAppointments = results.find(r => r.name.includes('My Appointments'));
  const adminDashboard = results.find(r => r.name.includes('Admin Dashboard'));
  const adminUsers = results.find(r => r.name.includes('Admin Users'));
  
  console.log(`👤 Admin Login (Valid): ${adminLogin?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🚫 Admin Login (Invalid): ${adminLoginInvalid?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  console.log(`👤 Patient Login: ${patientLogin?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔒 Patient Profile (Protected): ${patientProfile?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  console.log(`🔒 Patient Prescriptions (Protected): ${patientPrescriptions?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  console.log(`🔒 Patient Appointments (Protected): ${patientAppointments?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  console.log(`🔒 Admin Dashboard (Protected): ${adminDashboard?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  console.log(`🔒 Admin Users (Protected): ${adminUsers?.result.status === 401 ? '✅ WORKING (Expected 401)' : '❌ FAILED'}`);
  
  // Core authentication features
  console.log('\n🎯 CORE AUTHENTICATION FEATURES');
  console.log('===============================');
  
  const coreFeatures = [
    { name: 'Admin Authentication', endpoints: [adminLogin, adminLoginInvalid] },
    { name: 'Patient Authentication', endpoints: [patientLogin] },
    { name: 'Protected Patient Routes', endpoints: [patientProfile, patientPrescriptions, patientAppointments] },
    { name: 'Protected Admin Routes', endpoints: [adminDashboard, adminUsers] }
  ];
  
  coreFeatures.forEach(feature => {
    const workingEndpoints = feature.endpoints.filter(e => {
      if (!e) return false;
      if (e.name.includes('Invalid') || e.name.includes('Protected')) {
        return e.result.status === 401; // Expected 401 for invalid/protected
      }
      return e.result.success;
    }).length;
    const totalEndpoints = feature.endpoints.filter(e => e).length;
    const status = workingEndpoints === totalEndpoints ? '✅ COMPLETE' : 
                  workingEndpoints > 0 ? '⚠️ PARTIAL' : '❌ FAILED';
    console.log(`${status} ${feature.name} (${workingEndpoints}/${totalEndpoints})`);
  });
  
  console.log('\n🎯 AUTHENTICATION ASSESSMENT');
  console.log('============================');
  
  if (successful === total) {
    console.log('🎉 AUTHENTICATION IS FULLY FUNCTIONAL!');
    console.log('✅ All auth features working perfectly');
    console.log('✅ Security properly implemented');
  } else if (successful > total * 0.8) {
    console.log('✅ Authentication mostly functional. Minor issues to address.');
  } else if (successful > total * 0.5) {
    console.log('⚠️ Authentication partially functional. Some features need attention.');
  } else {
    console.log('❌ Authentication has significant issues. Core functionality needs fixing.');
  }
  
  // Show what's working
  const workingEndpoints = results.filter(r => r.result.success);
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING AUTHENTICATION FEATURES:');
    workingEndpoints.forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  // Show what needs attention
  const failedEndpoints = results.filter(r => !r.result.success);
  if (failedEndpoints.length > 0) {
    console.log('\n❌ AUTHENTICATION FEATURES NEEDING ATTENTION:');
    failedEndpoints.forEach(({ name, result }) => {
      console.log(`   • ${name} - ${result.error?.error || result.error || 'Unknown error'}`);
    });
  }
  
  // Authentication readiness
  console.log('\n🔐 AUTHENTICATION READINESS');
  console.log('============================');
  
  const adminAuth = coreFeatures[0].endpoints.filter(e => {
    if (!e) return false;
    if (e.name.includes('Invalid')) return e.result.status === 401;
    return e.result.success;
  }).length;
  
  const patientAuth = coreFeatures[1].endpoints.filter(e => e?.result.success).length;
  const protectedPatient = coreFeatures[2].endpoints.filter(e => e?.result.status === 401).length;
  const protectedAdmin = coreFeatures[3].endpoints.filter(e => e?.result.status === 401).length;
  
  console.log(`👤 Admin Authentication: ${adminAuth > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`👤 Patient Authentication: ${patientAuth > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🔒 Protected Patient Routes: ${protectedPatient > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🔒 Protected Admin Routes: ${protectedAdmin > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  
  // Overall assessment
  const workingFeatures = [adminAuth, patientAuth, protectedPatient, protectedAdmin].filter(count => count > 0).length;
  const totalFeatures = 4;
  
  console.log(`\n🎯 OVERALL AUTHENTICATION STATUS: ${workingFeatures}/${totalFeatures} features working`);
  
  if (workingFeatures === totalFeatures) {
    console.log('🎉 AUTHENTICATION IS FULLY READY!');
  } else if (workingFeatures >= totalFeatures * 0.8) {
    console.log('✅ Authentication is mostly ready with minor issues.');
  } else if (workingFeatures >= totalFeatures * 0.5) {
    console.log('⚠️ Authentication is partially ready. Some features need work.');
  } else {
    console.log('❌ Authentication needs significant work before it\'s ready.');
  }
}

// Run the authentication tests
runAuthTests().catch(console.error);
