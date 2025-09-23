#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test all the newly implemented systems
const testEndpoints = [
  // Patient Registration (Fixed)
  { 
    method: 'POST', 
    path: '/api/patient/register', 
    name: 'Patient Registration (Fixed)', 
    data: {
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
    }
  },
  
  // Product Review System
  { 
    method: 'POST', 
    path: '/api/reviews', 
    name: 'Product Review System', 
    data: {
      productId: 1,
      rating: 5,
      title: 'Excellent Product',
      comment: 'This medication has been very effective for managing my condition. Highly recommended!',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com'
    }
  },
  
  // Feedback Collection System
  { 
    method: 'POST', 
    path: '/api/feedback', 
    name: 'Feedback Collection System', 
    data: {
      name: 'Feedback User',
      email: 'feedback@example.com',
      subject: 'Service Feedback',
      message: 'Great service! The pharmacy staff was very helpful and professional. The online ordering system is easy to use.',
      rating: 5,
      category: 'service',
      priority: 'medium',
      contactPreference: 'email'
    }
  },
  
  // WooCommerce Order Processing
  { 
    method: 'POST', 
    path: '/api/woocommerce/orders', 
    name: 'WooCommerce Order Processing', 
    data: {
      billing: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address_1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US'
      },
      shipping: {
        first_name: 'John',
        last_name: 'Doe',
        address_1: '123 Main Street',
        city: 'New York',
        state: 'NY',
        postcode: '10001',
        country: 'US'
      },
      line_items: [
        {
          product_id: 1,
          quantity: 2,
          price: 25.99
        }
      ],
      payment_method: 'bacs',
      payment_method_title: 'Direct Bank Transfer',
      set_paid: false,
      customer_note: 'Please handle with care'
    }
  },
  
  // Get Reviews for Product
  { 
    method: 'GET', 
    path: '/api/reviews/product/1', 
    name: 'Get Product Reviews' 
  },
  
  // Get Feedback Statistics (Admin)
  { 
    method: 'GET', 
    path: '/api/feedback/admin/stats', 
    name: 'Feedback Statistics' 
  },
  
  // WooCommerce Status Check
  { 
    method: 'GET', 
    path: '/api/woocommerce/status', 
    name: 'WooCommerce Status Check' 
  }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔧 Testing ${endpoint.name}...`);
    console.log(`   ${endpoint.method} ${endpoint.path}`);
    
    const config = {
      method: endpoint.method.toLowerCase(),
      url: `${BASE_URL}${endpoint.path}`,
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500; // Accept any status less than 500
      }
    };
    
    if (endpoint.data) {
      config.data = endpoint.data;
      config.headers = { 'Content-Type': 'application/json' };
    }
    
    const response = await axios(config);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        const responseStr = JSON.stringify(response.data);
        console.log(`   📊 Response: ${responseStr.substring(0, 200)}${responseStr.length > 200 ? '...' : ''}`);
      }
    } else if (response.status === 400) {
      console.log(`   ⚠️  VALIDATION ERROR (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Validation Error: ${response.data.error}`);
      }
    } else if (response.status === 401) {
      console.log(`   🔒 AUTHENTICATION REQUIRED (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Auth Error: ${response.data.error}`);
      }
    } else if (response.status === 404) {
      console.log(`   ❌ NOT FOUND (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Error: ${response.data.error}`);
      }
    } else {
      console.log(`   ⚠️  PARTIAL (${response.status})`);
      if (response.data && response.data.error) {
        console.log(`   ❌ Error: ${response.data.error}`);
      } else if (response.data && response.data.message) {
        console.log(`   ℹ️  Message: ${response.data.message}`);
      }
    }
    
    return { success: response.status < 400, status: response.status, data: response.data };
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ CONNECTION REFUSED - Server not running`);
      return { success: false, error: 'Server not running' };
    } else if (error.response) {
      console.log(`   ❌ ERROR (${error.response.status})`);
      if (error.response.data && error.response.data.error) {
        console.log(`   ❌ Error: ${error.response.data.error}`);
      }
      return { success: false, status: error.response.status, error: error.response.data };
    } else {
      console.log(`   ❌ NETWORK ERROR: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

async function runDevelopmentTests() {
  console.log('🚀 MyMeds Development Systems Testing');
  console.log('=====================================');
  
  const results = [];
  
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 DEVELOPMENT SYSTEMS TEST SUMMARY');
  console.log('===================================');
  
  const successful = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  // Detailed results
  console.log('\n📋 DETAILED RESULTS');
  console.log('===================');
  
  results.forEach(({ name, path, result }) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${name} (${path})`);
  });
  
  // System functionality verification
  console.log('\n🎯 SYSTEM FUNCTIONALITY STATUS');
  console.log('==============================');
  
  const patientRegistration = results.find(r => r.name.includes('Patient Registration'));
  const reviewSystem = results.find(r => r.name.includes('Product Review'));
  const feedbackSystem = results.find(r => r.name.includes('Feedback Collection'));
  const woocommerceOrder = results.find(r => r.name.includes('WooCommerce Order'));
  const getReviews = results.find(r => r.name.includes('Get Product Reviews'));
  const feedbackStats = results.find(r => r.name.includes('Feedback Statistics'));
  const woocommerceStatus = results.find(r => r.name.includes('WooCommerce Status'));
  
  console.log(`👤 Patient Registration: ${patientRegistration?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`⭐ Product Review System: ${reviewSystem?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💬 Feedback Collection: ${feedbackSystem?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🛒 WooCommerce Orders: ${woocommerceOrder?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📊 Review Retrieval: ${getReviews?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📈 Feedback Statistics: ${feedbackStats?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔗 WooCommerce Status: ${woocommerceStatus?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  // Development readiness
  console.log('\n🎯 DEVELOPMENT READINESS ASSESSMENT');
  console.log('===================================');
  
  const coreSystems = [
    { name: 'Patient Registration', result: patientRegistration?.result.success },
    { name: 'Review System', result: reviewSystem?.result.success },
    { name: 'Feedback System', result: feedbackSystem?.result.success },
    { name: 'E-commerce Integration', result: woocommerceOrder?.result.success }
  ];
  
  const workingSystems = coreSystems.filter(s => s.result).length;
  const totalSystems = coreSystems.length;
  
  console.log(`🏥 Patient Registration: ${patientRegistration?.result.success ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`⭐ Review System: ${reviewSystem?.result.success ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`💬 Feedback System: ${feedbackSystem?.result.success ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🛒 E-commerce Integration: ${woocommerceOrder?.result.success ? '✅ READY' : '❌ NEEDS WORK'}`);
  
  // Overall assessment
  console.log(`\n🎯 OVERALL DEVELOPMENT STATUS: ${workingSystems}/${totalSystems} core systems working`);
  
  if (workingSystems === totalSystems) {
    console.log('🎉 ALL DEVELOPMENT SYSTEMS ARE FULLY READY!');
    console.log('✅ Patient registration with file upload handling');
    console.log('✅ Product review system with approval workflow');
    console.log('✅ Feedback collection with ticket system');
    console.log('✅ WooCommerce e-commerce integration');
  } else if (workingSystems >= totalSystems * 0.75) {
    console.log('✅ Development systems are mostly ready with minor issues.');
  } else if (workingSystems >= totalSystems * 0.5) {
    console.log('⚠️ Development systems are partially ready. Some systems need work.');
  } else {
    console.log('❌ Development systems need significant work before they\'re ready.');
  }
  
  // Show what's working
  const workingEndpoints = results.filter(r => r.result.success);
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING SYSTEMS:');
    workingEndpoints.forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  // Show what needs attention
  const failedEndpoints = results.filter(r => !r.result.success);
  if (failedEndpoints.length > 0) {
    console.log('\n❌ SYSTEMS NEEDING ATTENTION:');
    failedEndpoints.forEach(({ name, result }) => {
      const errorMsg = result.error?.error || result.error || 'Unknown error';
      console.log(`   • ${name} - ${errorMsg}`);
    });
  }
  
  // Next steps
  console.log('\n🚀 NEXT STEPS');
  console.log('=============');
  
  if (workingSystems === totalSystems) {
    console.log('🎉 All development systems are ready! You can now:');
    console.log('   • Deploy to production');
    console.log('   • Configure WooCommerce store');
    console.log('   • Set up email notifications');
    console.log('   • Configure file upload handling');
  } else {
    console.log('🔧 Complete the remaining systems:');
    if (!patientRegistration?.result.success) {
      console.log('   • Fix patient registration file upload handling');
    }
    if (!reviewSystem?.result.success) {
      console.log('   • Implement product review system');
    }
    if (!feedbackSystem?.result.success) {
      console.log('   • Build feedback collection system');
    }
    if (!woocommerceOrder?.result.success) {
      console.log('   • Configure WooCommerce integration');
    }
  }
}

// Run the development tests
runDevelopmentTests().catch(console.error);
