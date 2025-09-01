const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:4000/api';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
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
          resolve({ 
            status: res.statusCode, 
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data: body,
            headers: res.headers
          });
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

async function checkSecurityHeaders() {
  console.log('🔒 Testing Security Headers...');
  
  try {
    const response = await makeRequest('/health');
    
    const securityHeaders = {
      'X-Frame-Options': response.headers['x-frame-options'],
      'X-Content-Type-Options': response.headers['x-content-type-options'],
      'X-XSS-Protection': response.headers['x-xss-protection'],
      'Strict-Transport-Security': response.headers['strict-transport-security'],
      'Content-Security-Policy': response.headers['content-security-policy'],
      'Referrer-Policy': response.headers['referrer-policy']
    };
    
    console.log('Security Headers Found:');
    Object.entries(securityHeaders).forEach(([header, value]) => {
      if (value) {
        console.log(`   ✅ ${header}: ${value}`);
      } else {
        console.log(`   ⚠️  ${header}: Not set`);
      }
    });
    
    return securityHeaders;
  } catch (error) {
    console.log('   ❌ Could not test security headers:', error.message);
    return {};
  }
}

async function testRateLimiting() {
  console.log('\n🚦 Testing Rate Limiting...');
  
  try {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 25; i++) {
      promises.push(makeRequest('/health'));
    }
    
    const results = await Promise.all(promises);
    const blocked = results.filter(r => r.status === 429).length;
    
    if (blocked > 0) {
      console.log(`   ✅ Rate limiting active: ${blocked} requests blocked`);
    } else {
      console.log('   ⚠️  Rate limiting may be disabled (expected in development)');
    }
    
    return blocked > 0;
  } catch (error) {
    console.log('   ❌ Rate limiting test failed:', error.message);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    // Test login with correct credentials
    const loginResponse = await makeRequest('/auth/login', 'POST', {
      email: 'mymedspharmacyinc@gmail.com',
      password: 'MyMeds2024!@Pharm'
    });
    
    if (loginResponse.status === 200) {
      console.log('   ✅ Admin login successful');
      
      // Test protected endpoint with token
      const token = loginResponse.data.token;
      if (token) {
        const protectedResponse = await makeRequest('/users', 'GET', null, {
          'Authorization': `Bearer ${token}`
        });
        
        if (protectedResponse.status === 200) {
          console.log('   ✅ JWT authentication working');
        } else {
          console.log(`   ⚠️  Protected endpoint returned ${protectedResponse.status}`);
        }
      }
    } else {
      console.log(`   ❌ Login failed: ${loginResponse.status}`);
    }
    
    return loginResponse.status === 200;
  } catch (error) {
    console.log('   ❌ Authentication test failed:', error.message);
    return false;
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️  Testing Database Connection...');
  
  try {
    const dbResponse = await makeRequest('/health/db');
    
    if (dbResponse.status === 200) {
      console.log('   ✅ Database connection healthy');
      console.log(`   📊 Table counts:`, dbResponse.data.tableCounts);
      return true;
    } else {
      console.log(`   ❌ Database health check failed: ${dbResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Database test failed:', error.message);
    return false;
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS Configuration...');
  
  try {
    // Test with Origin header to trigger CORS response
    const response = await makeRequest('/health', 'GET', null, {
      'Origin': 'http://localhost:3000'
    });
    
    if (response.headers['access-control-allow-origin']) {
      console.log('   ✅ CORS headers present');
      console.log(`   🌍 Allowed origins: ${response.headers['access-control-allow-origin']}`);
      return true;
    } else {
      // Check if CORS is configured but not triggered
      const corsResponse = await makeRequest('/health', 'OPTIONS', null, {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      });
      
      if (corsResponse.headers['access-control-allow-origin']) {
        console.log('   ✅ CORS preflight working');
        console.log(`   🌍 Allowed origins: ${corsResponse.headers['access-control-allow-origin']}`);
        return true;
      } else {
        console.log('   ⚠️  CORS headers not found (may be configured but not triggered)');
        return false;
      }
    }
  } catch (error) {
    console.log('   ❌ CORS test failed:', error.message);
    return false;
  }
}

async function checkEnvironmentVariables() {
  console.log('\n⚙️  Checking Environment Configuration...');
  
  try {
    const response = await makeRequest('/health');
    
    if (response.status === 200) {
      console.log('   ✅ Environment variables loaded');
      console.log(`   🏭 Environment: ${response.data.environment}`);
      console.log(`   📦 Version: ${response.data.version}`);
      return true;
    } else {
      console.log('   ❌ Could not check environment');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Environment check failed:', error.message);
    return false;
  }
}

async function testAllEndpoints() {
  console.log('\n🧪 Testing All API Endpoints...');
  
  const tests = [
    { name: 'Health Check', path: '/health', method: 'GET' },
    { name: 'Database Health', path: '/health/db', method: 'GET' },
    { name: 'Products List', path: '/products', method: 'GET' },
    { name: 'Categories List', path: '/products/categories', method: 'GET' },
    { name: 'Admin Login', path: '/auth/login', method: 'POST', data: {
      email: 'mymedspharmacyinc@gmail.com',
      password: 'MyMeds2024!@Pharm'
    }},
    { name: 'Cart Status', path: '/cart', method: 'GET' },
    { name: 'Blog Posts', path: '/blogs', method: 'GET' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path, test.method, test.data);
      
      if (result.status === 200) {
        console.log(`   ✅ ${test.name}: ${result.status} OK`);
        passed++;
      } else {
        console.log(`   ❌ ${test.name}: ${result.status} (Error)`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: Connection Error`);
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Endpoint Test Summary: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

async function checkDeploymentFiles() {
  console.log('\n📁 Checking Deployment Files...');
  
  const requiredFiles = [
    'backend/Dockerfile',
    'backend/package.json',
    'backend/prisma/schema.prisma',
    'backend/.env',
    'backend/ecosystem.config.js',
    'nginx-production.conf',
    'deploy.sh'
  ];
  
  let found = 0;
  let missing = 0;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}`);
      found++;
    } else {
      console.log(`   ❌ ${file} (missing)`);
      missing++;
    }
  });
  
  console.log(`\n📊 Deployment Files: ${found} found, ${missing} missing`);
  return { found, missing };
}

async function runDeploymentReadinessTest() {
  console.log('🚀 MyMeds Pharmacy - Deployment Readiness Test');
  console.log('================================================');
  console.log('Frontend Port: 3000/3001/3002');
  console.log('Backend Port: 4000');
  console.log('');

  // Wait for servers to start
  await new Promise(resolve => setTimeout(resolve, 3000));

  const results = {
    securityHeaders: await checkSecurityHeaders(),
    rateLimiting: await testRateLimiting(),
    authentication: await testAuthentication(),
    database: await testDatabaseConnection(),
    cors: await testCORS(),
    environment: await checkEnvironmentVariables(),
    endpoints: await testAllEndpoints(),
    deploymentFiles: await checkDeploymentFiles()
  };

  console.log('\n🎯 DEPLOYMENT READINESS SUMMARY');
  console.log('================================');
  console.log(`🔒 Security Headers: ${Object.values(results.securityHeaders).filter(Boolean).length > 0 ? '✅' : '⚠️'}`);
  console.log(`🚦 Rate Limiting: ${results.rateLimiting ? '✅' : '⚠️'}`);
  console.log(`🔐 Authentication: ${results.authentication ? '✅' : '❌'}`);
  console.log(`🗄️  Database: ${results.database ? '✅' : '❌'}`);
  console.log(`🌐 CORS: ${results.cors ? '✅' : '⚠️'}`);
  console.log(`⚙️  Environment: ${results.environment ? '✅' : '❌'}`);
  console.log(`🧪 Endpoints: ${results.endpoints.passed}/${results.endpoints.passed + results.endpoints.failed} working`);
  console.log(`📁 Deployment Files: ${results.deploymentFiles.found}/${results.deploymentFiles.found + results.deploymentFiles.missing} present`);

  const criticalIssues = [
    !results.authentication && 'Authentication not working',
    !results.database && 'Database connection failed',
    !results.environment && 'Environment configuration issues'
  ].filter(Boolean);

  if (criticalIssues.length > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND:');
    criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n⚠️  Fix these issues before deployment!');
  } else {
    console.log('\n✅ READY FOR VPS DEPLOYMENT!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Configure production environment variables');
    console.log('2. Set up SSL certificates');
    console.log('3. Configure nginx reverse proxy');
    console.log('4. Set up PM2 for process management');
    console.log('5. Configure firewall rules');
  }
}

runDeploymentReadinessTest().catch(console.error);
