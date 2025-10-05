#!/usr/bin/env node

import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// VPS Configuration
const VPS_BASE_URL = 'https://mymedspharmacyinc.com';
const API_BASE_URL = `${VPS_BASE_URL}/api`;

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to make API requests
async function testEndpoint(method, endpoint, data = null, headers = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const testName = `${method.toUpperCase()} ${endpoint}`;
  
  try {
    console.log(`🧪 Testing: ${testName}`);
    
    let response;
    if (method.toLowerCase() === 'get') {
      response = await axios.get(url, { headers, timeout: 10000 });
    } else if (method.toLowerCase() === 'post') {
      response = await axios.post(url, data, { headers, timeout: 10000 });
    } else if (method.toLowerCase() === 'put') {
      response = await axios.put(url, data, { headers, timeout: 10000 });
    } else if (method.toLowerCase() === 'delete') {
      response = await axios.delete(url, { headers, timeout: 10000 });
    }
    
    const success = response.status >= 200 && response.status < 300;
    
    if (success) {
      testResults.passed++;
      console.log(`✅ ${testName} - Status: ${response.status}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${testName} - Status: ${response.status}`);
    }
    
    testResults.total++;
    testResults.details.push({
      endpoint: testName,
      status: response.status,
      success,
      responseTime: response.headers['x-response-time'] || 'N/A'
    });
    
    return { success, response };
  } catch (error) {
    testResults.failed++;
    testResults.total++;
    
    const status = error.response?.status || 'Network Error';
    console.log(`❌ ${testName} - Error: ${status} - ${error.message}`);
    
    testResults.details.push({
      endpoint: testName,
      status,
      success: false,
      error: error.message
    });
    
    return { success: false, error };
  }
}

// Test data
const testContactData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '123-456-7890',
  subject: 'API Test',
  message: 'This is a test message from the API endpoint test script.'
};

const testRefillData = {
  name: 'Test Patient',
  email: 'patient@example.com',
  phone: '123-456-7890',
  prescriptionNumber: 'RX123456',
  medicationName: 'Test Medication',
  pharmacyName: 'Test Pharmacy',
  message: 'Test refill request'
};

const testTransferData = {
  name: 'Test Patient',
  email: 'patient@example.com',
  phone: '123-456-7890',
  currentPharmacy: 'Current Pharmacy',
  newPharmacy: 'New Pharmacy',
  prescriptionNumber: 'RX123456',
  medicationName: 'Test Medication',
  message: 'Test transfer request'
};

const testAppointmentData = {
  firstName: 'Test',
  lastName: 'Patient',
  phone: '123-456-7890',
  email: 'patient@example.com',
  service: 'Consultation',
  preferredDate: '2024-01-15',
  preferredTime: '10:00',
  notes: 'Test appointment request'
};

// Main test function
async function runAllTests() {
  console.log('🚀 Starting VPS API Endpoint Tests');
  console.log(`📍 Testing: ${VPS_BASE_URL}`);
  console.log('='.repeat(60));
  
  // Health Check
  console.log('\n🏥 HEALTH CHECK ENDPOINTS');
  await testEndpoint('GET', '/health');
  
  // Contact Form Endpoints
  console.log('\n📞 CONTACT FORM ENDPOINTS');
  await testEndpoint('POST', '/contact', testContactData);
  await testEndpoint('GET', '/contact');
  
  // Refill Request Endpoints
  console.log('\n💊 REFILL REQUEST ENDPOINTS');
  await testEndpoint('POST', '/refill-requests', testRefillData);
  await testEndpoint('GET', '/refill-requests');
  
  // Transfer Request Endpoints
  console.log('\n🔄 TRANSFER REQUEST ENDPOINTS');
  await testEndpoint('POST', '/transfer-requests', testTransferData);
  await testEndpoint('GET', '/transfer-requests');
  
  // Appointment Endpoints
  console.log('\n📅 APPOINTMENT ENDPOINTS');
  await testEndpoint('POST', '/appointments/request', testAppointmentData);
  await testEndpoint('GET', '/appointments/admin/all');
  await testEndpoint('GET', '/appointments/admin/stats');
  
  // WooCommerce Endpoints
  console.log('\n🛒 WOOCOMMERCE ENDPOINTS');
  await testEndpoint('GET', '/woocommerce/products');
  await testEndpoint('GET', '/woocommerce/categories');
  await testEndpoint('GET', '/woocommerce/payment-gateways');
  await testEndpoint('POST', '/woocommerce/sync-products');
  
  // WordPress Endpoints
  console.log('\n📝 WORDPRESS ENDPOINTS');
  await testEndpoint('GET', '/wordpress/posts');
  await testEndpoint('GET', '/wordpress/categories');
  await testEndpoint('GET', '/wordpress/posts/1');
  
  // Admin Endpoints (without auth - should return 401)
  console.log('\n👨‍💼 ADMIN ENDPOINTS (Expected 401)');
  await testEndpoint('GET', '/crm/admin/customers');
  await testEndpoint('GET', '/crm/admin/stats');
  
  // Print Results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Detailed Results
  console.log('\n📋 DETAILED RESULTS');
  console.log('='.repeat(60));
  testResults.details.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.endpoint} - Status: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(60));
  
  if (testResults.failed > 0) {
    console.log('⚠️  Some endpoints failed. Check the following:');
    console.log('1. Ensure backend server is running: pm2 status');
    console.log('2. Check backend logs: pm2 logs mymeds-backend');
    console.log('3. Verify database connection');
    console.log('4. Check environment variables');
  } else {
    console.log('🎉 All endpoints are working correctly!');
  }
  
  console.log('\n🔧 TROUBLESHOOTING COMMANDS');
  console.log('='.repeat(60));
  console.log('Check backend status: pm2 status');
  console.log('View backend logs: pm2 logs mymeds-backend');
  console.log('Restart backend: pm2 restart mymeds-backend');
  console.log('Check nginx status: sudo systemctl status nginx');
  console.log('Test database: mysql -u root -p mymeds_production -e "SHOW TABLES;"');
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };
