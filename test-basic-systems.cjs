#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function getAdminToken() {
  try {
    console.log('🔐 Getting admin token...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@mymedspharmacyinc.com',
      password: 'Mymeds2025!AdminSecure123!@#'
    });
    
    if (response.status === 200 && response.data.token) {
      console.log('✅ Admin token obtained');
      return response.data.token;
    }
    return null;
  } catch (error) {
    console.log('❌ Failed to get admin token:', error.response?.data?.error || error.message);
    return null;
  }
}

async function createTestProduct(adminToken) {
  try {
    console.log('🔧 Creating test product...');
    
    // First, create a category
    const categoryResponse = await axios.post(`${BASE_URL}/api/products/categories`, {
      name: 'Test Category',
      description: 'Test category for development'
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    console.log('✅ Category created:', categoryResponse.data);
    
    // Create a test product
    const productResponse = await axios.post(`${BASE_URL}/api/products`, {
      name: 'Test Medication',
      description: 'A test medication for development testing',
      price: 25.99,
      stock: 100,
      categoryId: categoryResponse.data.id
    }, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    console.log('✅ Product created:', productResponse.data);
    return productResponse.data;
    
  } catch (error) {
    console.error('❌ Error creating test product:', error.response?.data || error.message);
    return null;
  }
}

async function testBasicSystems() {
  try {
    console.log('🚀 Testing Basic Systems');
    console.log('========================');
    
    // Get admin token first
    const adminToken = await getAdminToken();
    if (!adminToken) {
      console.log('❌ Cannot proceed without admin token');
      return;
    }
    
    // Create test product first
    const product = await createTestProduct(adminToken);
    if (!product) {
      console.log('❌ Cannot proceed without test product');
      return;
    }
    
    // Test 1: Product Review System
    console.log('\n🔧 Testing Product Review System...');
    try {
      const reviewResponse = await axios.post(`${BASE_URL}/api/reviews`, {
        productId: product.id,
        rating: 5,
        title: 'Excellent Product',
        comment: 'This medication has been very effective for managing my condition.',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com'
      });
      
      console.log('✅ Review created:', reviewResponse.data);
    } catch (error) {
      console.log('❌ Review creation failed:', error.response?.data || error.message);
    }
    
    // Test 2: Feedback Collection System
    console.log('\n🔧 Testing Feedback Collection System...');
    try {
      const feedbackResponse = await axios.post(`${BASE_URL}/api/feedback`, {
        name: 'Feedback User',
        email: 'feedback@example.com',
        subject: 'Service Feedback',
        message: 'Great service! The pharmacy staff was very helpful.',
        rating: 5,
        category: 'service'
      });
      
      console.log('✅ Feedback created:', feedbackResponse.data);
    } catch (error) {
      console.log('❌ Feedback creation failed:', error.response?.data || error.message);
    }
    
    // Test 3: Patient Registration (without file uploads)
    console.log('\n🔧 Testing Patient Registration...');
    try {
      const patientResponse = await axios.post(`${BASE_URL}/api/patient/register`, {
        firstName: 'Michael',
        lastName: 'Johnson',
        email: 'michael.johnson@example.com',
        password: 'SecurePass123!',
        phone: '555-456-7890',
        dateOfBirth: '1980-03-15',
        ssn: '123-45-6789',
        address: '123 Main Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        emergencyContactName: 'Sarah Johnson',
        emergencyContactPhone: '555-789-0123',
        emergencyContactRelationship: 'Spouse',
        insuranceProvider: 'Blue Cross Blue Shield',
        insuranceGroupNumber: 'GRP123456',
        insuranceMemberId: 'MEM789012',
        primaryCarePhysician: 'Dr. Smith',
        physicianPhone: '555-555-5555',
        allergies: 'Penicillin, Shellfish',
        currentMedications: 'Metformin 500mg, Lisinopril 10mg',
        medicalConditions: 'Type 2 Diabetes, Hypertension',
        governmentIdType: 'Driver License',
        governmentIdNumber: 'DL123456789',
        termsAccepted: true,
        privacyPolicyAccepted: true,
        hipaaConsent: true,
        medicalAuthorization: true,
        financialResponsibility: true,
        securityQuestions: JSON.stringify([
          { question: "What was your first pet's name?", answer: "Fluffy" },
          { question: "What city were you born in?", answer: "New York" }
        ])
      });
      
      console.log('✅ Patient registration successful:', patientResponse.data);
    } catch (error) {
      console.log('❌ Patient registration failed:', error.response?.data || error.message);
    }
    
    // Test 4: Get Reviews
    console.log('\n🔧 Testing Get Reviews...');
    try {
      const reviewsResponse = await axios.get(`${BASE_URL}/api/reviews/product/${product.id}`);
      console.log('✅ Reviews retrieved:', reviewsResponse.data);
    } catch (error) {
      console.log('❌ Get reviews failed:', error.response?.data || error.message);
    }
    
    // Test 5: Get Feedback Stats
    console.log('\n🔧 Testing Feedback Statistics...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/feedback/admin/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('✅ Feedback stats retrieved:', statsResponse.data);
    } catch (error) {
      console.log('❌ Feedback stats failed:', error.response?.data || error.message);
    }
    
    console.log('\n🎯 BASIC SYSTEMS TEST COMPLETE');
    console.log('===============================');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the basic systems test
testBasicSystems().catch(console.error);
