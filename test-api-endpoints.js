const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';

async function testEndpoints() {
  console.log('🧪 Testing MyMeds API Endpoints...');
  console.log('=====================================');

  const tests = [
    {
      name: 'Health Check',
      method: 'GET',
      url: '/health',
      expectedStatus: 200
    },
    {
      name: 'Database Health',
      method: 'GET', 
      url: '/health/db',
      expectedStatus: 200
    },
    {
      name: 'Products List',
      method: 'GET',
      url: '/products',
      expectedStatus: 200
    },
    {
      name: 'Categories List',
      method: 'GET',
      url: '/products/categories',
      expectedStatus: 200
    },
    {
      name: 'Admin Login',
      method: 'POST',
      url: '/auth/login',
      data: {
        email: 'mymedspharmacyinc@gmail.com',
        password: 'MyMeds2024!@Pharm'
      },
      expectedStatus: 200
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.name}`);
      console.log(`   ${test.method} ${BASE_URL}${test.url}`);
      
      const config = {
        method: test.method,
        url: `${BASE_URL}${test.url}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.data) {
        config.data = test.data;
      }

      const response = await axios(config);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ SUCCESS (${response.status})`);
        
        // Show response data for successful requests
        if (response.data) {
          if (test.name === 'Health Check') {
            console.log(`   📊 Status: ${response.data.status}`);
            console.log(`   🗄️ Database: ${response.data.checks?.database || 'N/A'}`);
          } else if (test.name === 'Products List') {
            console.log(`   📦 Products found: ${response.data.length || 0}`);
          } else if (test.name === 'Admin Login') {
            console.log(`   🔐 Token received: ${response.data.token ? 'Yes' : 'No'}`);
            console.log(`   👤 User: ${response.data.user?.name || 'N/A'}`);
          }
        }
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status} (expected ${test.expectedStatus})`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ FAILED (${error.response.status}): ${error.response.data?.error || error.message}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ CONNECTION REFUSED: Backend server not running on port 4000`);
        console.log(`   💡 Start the backend with: cd backend && npm run dev`);
        break;
      } else {
        console.log(`   ❌ ERROR: ${error.message}`);
      }
    }
  }

  console.log('\n🎯 API Testing Complete!');
  console.log('📝 Next steps:');
  console.log('   1. Verify your frontend can connect to these endpoints');
  console.log('   2. Test authentication flow');
  console.log('   3. Test product listing and cart functionality');
}

// Run the tests
testEndpoints().catch(console.error);
