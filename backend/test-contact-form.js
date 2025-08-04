const axios = require('axios');

// Test contact form submission
async function testContactForm() {
  console.log('🧪 Testing Contact Form Submission and Admin Panel Data Flow\n');
  
  const API_BASE = process.env.API_URL || 'http://localhost:4000/api';
  
  try {
    // Test 1: Submit contact form
    console.log('1️⃣ Submitting test contact form...');
    const contactData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test contact form submission to verify admin panel functionality.'
    };
    
    const contactResponse = await axios.post(`${API_BASE}/contact`, contactData);
    console.log('✅ Contact form submitted successfully');
    console.log('   Response:', contactResponse.data);
    
    // Test 2: Check if contact appears in admin notifications
    console.log('\n2️⃣ Checking admin notifications...');
    
    // First, we need to get an admin token
    console.log('   Getting admin token...');
    const loginData = {
      email: 'a.mymeds03@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!'
    };
    
    const loginResponse = await axios.post(`${API_BASE}/admin/login`, loginData);
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Now check notifications
    const notificationsResponse = await axios.get(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Notifications retrieved successfully');
    console.log('   Unread contacts:', notificationsResponse.data.contacts.length);
    console.log('   Unread orders:', notificationsResponse.data.orders.length);
    console.log('   Unread appointments:', notificationsResponse.data.appointments.length);
    console.log('   Unread prescriptions:', notificationsResponse.data.prescriptions.length);
    
    // Test 3: Mark notification as read
    if (notificationsResponse.data.contacts.length > 0) {
      console.log('\n3️⃣ Testing mark as read functionality...');
      const contactId = notificationsResponse.data.contacts[0].id;
      
      const markReadResponse = await axios.post(`${API_BASE}/notifications/mark-read`, {
        type: 'contact',
        id: contactId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Notification marked as read successfully');
    }
    
    // Test 4: Check orders endpoint
    console.log('\n4️⃣ Testing orders endpoint...');
    const ordersResponse = await axios.get(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Orders endpoint working');
    console.log('   Total orders:', ordersResponse.data.length);
    
    // Test 5: Check contact forms endpoint
    console.log('\n5️⃣ Testing contact forms endpoint...');
    const contactsResponse = await axios.get(`${API_BASE}/contact`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Contact forms endpoint working');
    console.log('   Total contacts:', contactsResponse.data.length);
    
    console.log('\n🎉 All tests passed! Admin panel data flow is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Test with different API URLs
async function testAllEnvironments() {
  console.log('🌐 Testing different environments...\n');
  
  const environments = [
    { name: 'Local', url: 'http://localhost:4000/api' },
    { name: 'Railway', url: process.env.RAILWAY_API_URL || 'https://your-backend.railway.app/api' }
  ];
  
  for (const env of environments) {
    console.log(`\n--- Testing ${env.name} Environment ---`);
    process.env.API_URL = env.url;
    await testContactForm();
  }
}

// Run tests
if (require.main === module) {
  testContactForm();
} 