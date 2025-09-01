const axios = require('axios');

const API_BASE = 'http://localhost:4000/api';

async function quickTest() {
  console.log('🧪 Quick API Test');
  console.log('================');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', healthResponse.status, healthResponse.data.status);
    
    // Test products endpoint
    console.log('\n2. Testing Products Endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products:', productsResponse.status, `${productsResponse.data.length} products found`);
    
    // Test auth endpoint
    console.log('\n3. Testing Auth Endpoint...');
    const authResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mymedspharmacyinc@gmail.com',
      password: 'MyMeds2024!@Pharm'
    });
    console.log('✅ Auth:', authResponse.status, 'Login successful');
    
    console.log('\n🎉 All API endpoints are working!');
    console.log('\n📊 Summary:');
    console.log('- Backend: Running on port 4000');
    console.log('- Database: Connected with sample data');
    console.log('- Admin User: Available for login');
    console.log('- Products: Available for frontend');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server not running on port 4000');
      console.log('💡 Start the backend with: cd backend && npm run dev');
    } else if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

quickTest();
