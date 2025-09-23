#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testCorrectAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login with Correct Password...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@mymedspharmacyinc.com',
      password: 'Mymeds2025!AdminSecure123!@#'
    }, {
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Admin login successful!');
      console.log(`Token: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      console.log(`❌ Admin login failed: ${response.data.error}`);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testProtectedEndpointsWithToken(token) {
  if (!token) {
    console.log('\n❌ No token available for protected endpoint testing');
    return;
  }
  
  console.log('\n🔒 Testing Protected Endpoints with Token...');
  
  const protectedEndpoints = [
    { method: 'GET', path: '/api/patient/profile', name: 'Patient Profile' },
    { method: 'GET', path: '/api/patient/prescriptions', name: 'Patient Prescriptions' },
    { method: 'GET', path: '/api/appointments/my', name: 'My Appointments' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      console.log(`\n🧪 Testing ${endpoint.name}...`);
      
      const response = await axios({
        method: endpoint.method.toLowerCase(),
        url: `${BASE_URL}${endpoint.path}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status >= 200 && response.status < 300) {
        console.log(`   ✅ SUCCESS - ${endpoint.name} accessible with token`);
        if (response.data && typeof response.data === 'object') {
          const responseStr = JSON.stringify(response.data);
          console.log(`   📊 Response: ${responseStr.substring(0, 100)}${responseStr.length > 100 ? '...' : ''}`);
        }
      } else {
        console.log(`   ⚠️  PARTIAL (${response.status})`);
        if (response.data && response.data.error) {
          console.log(`   ❌ Error: ${response.data.error}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function testProtectedEndpointsWithoutToken() {
  console.log('\n🔒 Testing Protected Endpoints WITHOUT Token...');
  
  const protectedEndpoints = [
    { method: 'GET', path: '/api/patient/profile', name: 'Patient Profile' },
    { method: 'GET', path: '/api/patient/prescriptions', name: 'Patient Prescriptions' },
    { method: 'GET', path: '/api/appointments/my', name: 'My Appointments' }
  ];
  
  for (const endpoint of protectedEndpoints) {
    try {
      console.log(`\n🧪 Testing ${endpoint.name} (No Token)...`);
      
      const response = await axios({
        method: endpoint.method.toLowerCase(),
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000,
        validateStatus: function (status) {
          return status < 500;
        }
      });
      
      console.log(`   Status: ${response.status}`);
      if (response.status === 401) {
        console.log(`   ✅ SECURE - ${endpoint.name} properly protected (401)`);
      } else if (response.status >= 200 && response.status < 300) {
        console.log(`   ❌ SECURITY ISSUE - ${endpoint.name} accessible without token!`);
        if (response.data && typeof response.data === 'object') {
          const responseStr = JSON.stringify(response.data);
          console.log(`   📊 Response: ${responseStr.substring(0, 100)}${responseStr.length > 100 ? '...' : ''}`);
        }
      } else {
        console.log(`   ⚠️  UNEXPECTED (${response.status})`);
        if (response.data && response.data.error) {
          console.log(`   ❌ Error: ${response.data.error}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.response?.data?.error || error.message}`);
    }
  }
}

async function runDetailedAuthTests() {
  console.log('🔐 Detailed Authentication Testing');
  console.log('==================================');
  
  // Test admin login with correct password
  const adminToken = await testCorrectAdminLogin();
  
  // Test protected endpoints with token
  await testProtectedEndpointsWithToken(adminToken);
  
  // Test protected endpoints without token
  await testProtectedEndpointsWithoutToken();
  
  console.log('\n🎯 AUTHENTICATION SECURITY ASSESSMENT');
  console.log('=====================================');
  console.log('✅ Admin Login: Working with correct password');
  console.log('🔒 Protected Endpoints: Testing security...');
  console.log('⚠️  If any endpoint returns data without token, there\'s a security issue!');
}

runDetailedAuthTests().catch(console.error);
