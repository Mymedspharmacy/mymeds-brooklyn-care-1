#!/usr/bin/env node

/**
 * Simple Shop Functionality Test
 * Basic tests to verify shop functionality is working
 */

import axios from 'axios';

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:4000';

console.log('🛒 MyMeds Pharmacy Shop Functionality Test');
console.log('=' .repeat(50));

async function testServerStatus() {
  console.log('\n1. Testing Server Status...');
  
  try {
    // Test backend
    const backendResponse = await axios.get(`${BACKEND_URL}/api/status`, { timeout: 5000 });
    console.log('✅ Backend server is running');
  } catch (error) {
    console.log('❌ Backend server is not running');
    console.log('   Please start the backend server: cd backend && npm run dev');
    return false;
  }
  
  try {
    // Test frontend
    const frontendResponse = await axios.get(FRONTEND_URL, { timeout: 5000 });
    console.log('✅ Frontend server is running');
  } catch (error) {
    console.log('❌ Frontend server is not running');
    console.log('   Please start the frontend server: npm run dev');
    return false;
  }
  
  return true;
}

async function testWooCommerceAPI() {
  console.log('\n2. Testing WooCommerce API...');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/woocommerce/status`, { timeout: 5000 });
    console.log('✅ WooCommerce API endpoint accessible');
    console.log(`   Status: ${response.data.enabled ? 'Enabled' : 'Disabled'}`);
    
    if (!response.data.enabled) {
      console.log('⚠️  WooCommerce is not configured');
      console.log('   Please configure WooCommerce credentials in your .env file');
    }
  } catch (error) {
    console.log('❌ WooCommerce API endpoint not accessible');
    console.log('   Error:', error.message);
  }
}

async function testProductsAPI() {
  console.log('\n3. Testing Products API...');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/woocommerce/products`, { timeout: 10000 });
    console.log('✅ Products API endpoint accessible');
    console.log(`   Products found: ${response.data.products?.length || 0}`);
    
    if (response.data.products?.length === 0) {
      console.log('⚠️  No products found');
      console.log('   Please add products to your WooCommerce store');
    }
  } catch (error) {
    console.log('❌ Products API endpoint not accessible');
    console.log('   Error:', error.message);
  }
}

async function testCartAPI() {
  console.log('\n4. Testing Cart API...');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/woocommerce-cart/session`, { timeout: 5000 });
    console.log('✅ Cart API endpoint accessible');
    console.log(`   Session created: ${response.data.sessionKey ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log('❌ Cart API endpoint not accessible');
    console.log('   Error:', error.message);
  }
}

async function testFrontendShopPage() {
  console.log('\n5. Testing Frontend Shop Page...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}/shop`, { timeout: 10000 });
    console.log('✅ Shop page loads successfully');
    
    // Check for common shop elements
    const content = response.data;
    if (content.includes('Shop') || content.includes('Products')) {
      console.log('✅ Shop page contains expected content');
    } else {
      console.log('⚠️  Shop page may not be displaying correctly');
    }
  } catch (error) {
    console.log('❌ Shop page not accessible');
    console.log('   Error:', error.message);
  }
}

async function runTests() {
  const serversRunning = await testServerStatus();
  
  if (!serversRunning) {
    console.log('\n❌ Cannot proceed with tests - servers not running');
    console.log('\n📋 Next Steps:');
    console.log('1. Start backend server: cd backend && npm run dev');
    console.log('2. Start frontend server: npm run dev');
    console.log('3. Run this test again: node test-shop-simple.js');
    return;
  }
  
  await testWooCommerceAPI();
  await testProductsAPI();
  await testCartAPI();
  await testFrontendShopPage();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🎯 Test Summary');
  console.log('=' .repeat(50));
  console.log('✅ Basic functionality tests completed');
  console.log('\n📋 Next Steps:');
  console.log('1. Open your browser and go to http://localhost:3000/shop');
  console.log('2. Test adding products to cart');
  console.log('3. Test checkout process');
  console.log('4. Verify all features work as expected');
  console.log('\n📖 For detailed testing, see SHOP-TEST-PLAN.md');
}

// Run tests
runTests().catch(console.error);

