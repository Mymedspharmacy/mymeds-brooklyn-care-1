const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'https://www.mymedspharmacyinc.com';
const API_BASE = `${BASE_URL}/api`;

// Test results storage
const testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: 0
  },
  tests: []
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MyMeds-Feature-Test/1.0',
        'Accept': 'application/json',
        ...options.headers
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  testResults.summary.total++;
  console.log(`\n🧪 Testing: ${name}`);
  
  try {
    const result = await testFn();
    if (result.success) {
      testResults.summary.passed++;
      testResults.tests.push({
        name,
        status: 'PASSED',
        details: result.details || 'Test passed successfully'
      });
      console.log(`✅ ${name}: PASSED`);
      if (result.details) console.log(`   ${result.details}`);
    } else {
      testResults.summary.failed++;
      testResults.tests.push({
        name,
        status: 'FAILED',
        details: result.details || 'Test failed'
      });
      console.log(`❌ ${name}: FAILED`);
      if (result.details) console.log(`   ${result.details}`);
    }
  } catch (error) {
    testResults.summary.errors++;
    testResults.tests.push({
      name,
      status: 'ERROR',
      details: error.message
    });
    console.log(`💥 ${name}: ERROR - ${error.message}`);
  }
}

// Individual tests
async function testMainPage() {
  const response = await makeRequest(BASE_URL);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}, Content-Type: ${response.headers['content-type']}`
  };
}

async function testAdminPage() {
  const response = await makeRequest(`${BASE_URL}/admin`);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}, Content-Type: ${response.headers['content-type']}`
  };
}

async function testShopPage() {
  const response = await makeRequest(`${BASE_URL}/shop`);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}, Content-Type: ${response.headers['content-type']}`
  };
}

async function testBlogPage() {
  const response = await makeRequest(`${BASE_URL}/blog`);
  return {
    success: response.statusCode === 200,
    details: `Status: ${response.statusCode}, Content-Type: ${response.headers['content-type']}`
  };
}

async function testWooCommerceStatus() {
  const response = await makeRequest(`${API_BASE}/woocommerce/status`);
  return {
    success: response.statusCode === 200 && response.data,
    details: `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`
  };
}

async function testWooCommerceProducts() {
  const response = await makeRequest(`${API_BASE}/woocommerce/products?per_page=5`);
  return {
    success: response.statusCode === 200 && response.data && response.data.products,
    details: `Status: ${response.statusCode}, Products count: ${response.data?.products?.length || 0}`
  };
}

async function testWooCommerceCategories() {
  const response = await makeRequest(`${API_BASE}/woocommerce/categories`);
  return {
    success: response.statusCode === 200 && Array.isArray(response.data),
    details: `Status: ${response.statusCode}, Categories count: ${response.data?.length || 0}`
  };
}

async function testWordPressStatus() {
  try {
    const response = await makeRequest(`${API_BASE}/wordpress/status`);
    return {
      success: response.statusCode === 200 && response.data,
      details: `Status: ${response.statusCode}, Data: ${JSON.stringify(response.data)}`
    };
  } catch (error) {
    return {
      success: false,
      details: `WordPress API not found or not configured: ${error.message}`
    };
  }
}

async function testWordPressPosts() {
  try {
    const response = await makeRequest(`${API_BASE}/wordpress/posts?per_page=5`);
    return {
      success: response.statusCode === 200 && Array.isArray(response.data),
      details: `Status: ${response.statusCode}, Posts count: ${response.data?.length || 0}`
    };
  } catch (error) {
    return {
      success: false,
      details: `WordPress posts API not found or not configured: ${error.message}`
    };
  }
}

async function testAdminAPI() {
  try {
    const response = await makeRequest(`${API_BASE}/admin/status`);
    return {
      success: response.statusCode === 200 || response.statusCode === 401, // 401 is expected without auth
      details: `Status: ${response.statusCode}, Auth required: ${response.statusCode === 401}`
    };
  } catch (error) {
    return {
      success: false,
      details: `Admin API error: ${error.message}`
    };
  }
}

async function testDatabaseConnection() {
  try {
    const response = await makeRequest(`${API_BASE}/health`);
    return {
      success: response.statusCode === 200,
      details: `Status: ${response.statusCode}, Health check: ${response.data?.status || 'Unknown'}`
    };
  } catch (error) {
    return {
      success: false,
      details: `Health check failed: ${error.message}`
    };
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Feature Test for My Meds Pharmacy');
  console.log('=' .repeat(60));
  
  // Frontend Tests
  await runTest('Main Page Load', testMainPage);
  await runTest('Admin Panel Page', testAdminPage);
  await runTest('Shop Page', testShopPage);
  await runTest('Blog Page', testBlogPage);
  
  // Backend API Tests
  await runTest('Database Health Check', testDatabaseConnection);
  await runTest('Admin API Endpoint', testAdminAPI);
  
  // WooCommerce Integration Tests
  await runTest('WooCommerce Status', testWooCommerceStatus);
  await runTest('WooCommerce Products API', testWooCommerceProducts);
  await runTest('WooCommerce Categories API', testWooCommerceCategories);
  
  // WordPress Integration Tests
  await runTest('WordPress Status', testWordPressStatus);
  await runTest('WordPress Posts API', testWordPressPosts);
  
  // Generate report
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${testResults.summary.total}`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log(`💥 Errors: ${testResults.summary.errors}`);
  
  const successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('=' .repeat(60));
  testResults.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '💥';
    console.log(`${icon} ${test.name}: ${test.status}`);
    if (test.details) {
      console.log(`   ${test.details}`);
    }
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('=' .repeat(60));
  
  const failedTests = testResults.tests.filter(t => t.status === 'FAILED' || t.status === 'ERROR');
  if (failedTests.length === 0) {
    console.log('🎉 All tests passed! Your application is working perfectly.');
  } else {
    console.log('🔧 Issues found that need attention:');
    failedTests.forEach(test => {
      console.log(`   • ${test.name}: ${test.details}`);
    });
  }
  
  // Save detailed report
  const fs = require('fs');
  const reportPath = `feature-test-report-${Date.now()}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  
  return testResults;
}

// Run the tests
runAllTests().catch(console.error);
