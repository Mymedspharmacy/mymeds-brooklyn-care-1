// Comprehensive Admin Panel Testing Script
const http = require('http');

const BASE_URL = 'http://localhost:4000';
const ADMIN_EMAIL = 'admin@mymedspharmacyinc.com';
const ADMIN_PASSWORD = 'Admin123!@$%Dev2025';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test function
async function runTest(testName, testFunction) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    const result = await testFunction();
    if (result.success) {
      console.log(`✅ PASSED: ${testName}`);
      testResults.passed++;
    } else {
      console.log(`❌ FAILED: ${testName} - ${result.error}`);
      testResults.failed++;
    }
    testResults.tests.push({ name: testName, success: result.success, error: result.error });
  } catch (error) {
    console.log(`❌ ERROR: ${testName} - ${error.message}`);
    testResults.failed++;
    testResults.tests.push({ name: testName, success: false, error: error.message });
  }
}

// Individual test functions
async function testServerHealth() {
  const response = await makeRequest('GET', '/api/health');
  return {
    success: response.status === 200 && response.body.status === 'ok',
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testLoginEndpointInfo() {
  const response = await makeRequest('GET', '/api/admin/login');
  return {
    success: response.status === 200 && response.body.message,
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testAdminLogin() {
  const response = await makeRequest('POST', '/api/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD
  });
  
  if (response.status === 200 && response.body.success && response.body.token) {
    // Store token for other tests
    global.adminToken = response.body.token;
    return { success: true };
  }
  return {
    success: false,
    error: `Status: ${response.status}, Response: ${JSON.stringify(response.body)}`
  };
}

async function testInvalidLogin() {
  const response = await makeRequest('POST', '/api/admin/login', {
    email: 'wrong@email.com',
    password: 'wrongpassword'
  });
  return {
    success: response.status === 401,
    error: response.status !== 401 ? `Expected 401, got ${response.status}` : null
  };
}

async function testTokenVerification() {
  if (!global.adminToken) {
    return { success: false, error: 'No admin token available' };
  }
  
  const response = await makeRequest('GET', '/api/admin/verify', null, {
    'Authorization': `Bearer ${global.adminToken}`
  });
  return {
    success: response.status === 200 && response.body.success,
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testDashboardData() {
  const response = await makeRequest('GET', '/api/admin/dashboard');
  return {
    success: response.status === 200 && response.body.success && response.body.data,
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testOrdersData() {
  const response = await makeRequest('GET', '/api/admin/orders');
  return {
    success: response.status === 200 && response.body.success && Array.isArray(response.body.data),
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testProductsData() {
  const response = await makeRequest('GET', '/api/products');
  return {
    success: response.status === 200 && response.body.success && Array.isArray(response.body.data),
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

async function testAdminLogout() {
  const response = await makeRequest('POST', '/api/admin/logout');
  return {
    success: response.status === 200 && response.body.success,
    error: response.status !== 200 ? `Status: ${response.status}` : null
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Admin Panel Testing');
  console.log('=' .repeat(60));
  
  // Test server connectivity
  await runTest('Server Health Check', testServerHealth);
  
  // Test login endpoint info
  await runTest('Login Endpoint Info', testLoginEndpointInfo);
  
  // Test authentication flow
  await runTest('Valid Admin Login', testAdminLogin);
  await runTest('Invalid Login Rejection', testInvalidLogin);
  await runTest('Token Verification', testTokenVerification);
  
  // Test admin panel features
  await runTest('Dashboard Data Retrieval', testDashboardData);
  await runTest('Orders Data Retrieval', testOrdersData);
  await runTest('Products Data Retrieval', testProductsData);
  
  // Test logout
  await runTest('Admin Logout', testAdminLogout);
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests.filter(t => !t.success).forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n🎯 ADMIN PANEL STATUS:');
  if (testResults.failed === 0) {
    console.log('   🟢 ALL SYSTEMS OPERATIONAL - Ready for production!');
  } else if (testResults.passed > testResults.failed) {
    console.log('   🟡 MOSTLY FUNCTIONAL - Minor issues to address');
  } else {
    console.log('   🔴 CRITICAL ISSUES - Needs attention before production');
  }
}

// Run the tests
runAllTests().catch(console.error);
