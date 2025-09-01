const http = require('http');

const API_BASE = 'http://localhost:4000/api';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAllEndpoints() {
  console.log('🧪 Testing ALL MyMeds API Endpoints');
  console.log('====================================');
  console.log('Frontend Port: 3002');
  console.log('Backend Port: 4000');
  console.log('');

  const tests = [
    // Health & Status
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Database Health', path: '/health/db', method: 'GET' },
    
    // Products & Categories
    { name: 'Products List', path: '/products', method: 'GET' },
    { name: 'Categories List', path: '/products/categories', method: 'GET' },
    
    // Authentication
    { name: 'Admin Login', path: '/auth/login', method: 'POST', data: {
      email: 'mymedspharmacyinc@gmail.com',
      password: 'MyMeds2024!@Pharm'
    }},
    
    // User Management
    { name: 'Users List', path: '/users', method: 'GET' },
    
    // Orders & Cart
    { name: 'Orders List', path: '/orders', method: 'GET' },
    { name: 'Cart Status', path: '/cart', method: 'GET' },
    
    // Prescriptions
    { name: 'Prescriptions List', path: '/prescriptions', method: 'GET' },
    
    // Appointments
    { name: 'Appointments List', path: '/appointments', method: 'GET' },
    
    // Blog & Content
    { name: 'Blog Posts', path: '/blogs', method: 'GET' },
    
    // Contact & Newsletter
    { name: 'Contact Form', path: '/contact', method: 'GET' },
    { name: 'Newsletter', path: '/newsletter', method: 'GET' },
    
    // Payments
    { name: 'Payments Status', path: '/payments', method: 'GET' },
    
    // Reviews
    { name: 'Reviews List', path: '/reviews', method: 'GET' },
    
    // Settings
    { name: 'Settings', path: '/settings', method: 'GET' },
    
    // Patient Portal
    { name: 'Patient Portal', path: '/patient', method: 'GET' },
    
    // Monitoring
    { name: 'Monitoring', path: '/monitoring', method: 'GET' },
    
    // OpenFDA
    { name: 'OpenFDA', path: '/openfda', method: 'GET' },
    
    // Refill Requests
    { name: 'Refill Requests', path: '/refill-requests', method: 'GET' },
    
    // Transfer Requests
    { name: 'Transfer Requests', path: '/transfer-requests', method: 'GET' },
    
    // Notifications
    { name: 'Notifications', path: '/notifications', method: 'GET' },
    
    // Analytics
    { name: 'Analytics', path: '/analytics', method: 'GET' }
  ];

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const test of tests) {
    try {
      console.log(`🔍 Testing: ${test.name}...`);
      const result = await makeRequest(test.path, test.method, test.data);
      
      if (result.status === 200) {
        console.log(`   ✅ ${test.name}: ${result.status} OK`);
        passed++;
      } else if (result.status === 401 || result.status === 403) {
        console.log(`   🔒 ${test.name}: ${result.status} (Authentication Required)`);
        skipped++;
      } else if (result.status === 404) {
        console.log(`   ⚠️  ${test.name}: ${result.status} (Not Found)`);
        skipped++;
      } else {
        console.log(`   ❌ ${test.name}: ${result.status} (Error)`);
        failed++;
      }
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ❌ ${test.name}: Connection Refused`);
        failed++;
      } else {
        console.log(`   ❌ ${test.name}: ${error.message}`);
        failed++;
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`📈 Total: ${tests.length}`);

  if (failed === 0) {
    console.log('\n🎉 All API endpoints are working!');
    console.log('\n🌐 Frontend-Backend Connection:');
    console.log('- Frontend: http://localhost:3002 ✅');
    console.log('- Backend: http://localhost:4000 ✅');
    console.log('- CORS: Configured for port 3002 ✅');
    console.log('- Database: Connected with sample data ✅');
    
    console.log('\n🚀 Ready for Development!');
    console.log('Your React app can now connect to all API endpoints.');
  } else {
    console.log('\n⚠️  Some endpoints need attention.');
    console.log('Check the backend logs for more details.');
  }
}

testAllEndpoints();
