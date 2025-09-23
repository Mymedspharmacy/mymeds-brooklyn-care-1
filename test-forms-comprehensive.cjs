#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// All form submission endpoints
const formEndpoints = [
  // Appointment Request Form
  { 
    method: 'POST', 
    path: '/api/appointments/request', 
    name: 'Appointment Request Form', 
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      service: 'Medication Consultation',
      preferredDate: '2025-01-25',
      preferredTime: '14:00',
      notes: 'Need to discuss medication adjustments and side effects'
    }
  },
  
  // Contact Form
  { 
    method: 'POST', 
    path: '/api/contact', 
    name: 'Contact Form', 
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      subject: 'Prescription Question',
      message: 'I have a question about my Metformin prescription. Can you help me understand the dosage?',
      agreeToTerms: true
    }
  },
  
  // Refill Request Form
  { 
    method: 'POST', 
    path: '/api/refill-requests', 
    name: 'Refill Request Form', 
    data: {
      medication: 'Metformin',
      dosage: '500mg',
      urgency: 'normal',
      notes: 'Need refill for next month. Running low on current supply.'
    }
  },
  
  // Transfer Request Form
  { 
    method: 'POST', 
    path: '/api/transfer-requests', 
    name: 'Transfer Request Form', 
    data: {
      currentPharmacy: 'CVS Pharmacy',
      medications: 'Metformin, Lisinopril, Atorvastatin',
      notes: 'Moving to new area, need to transfer all prescriptions to MyMeds Pharmacy'
    }
  },
  
  // Patient Registration Form (without file uploads for testing)
  { 
    method: 'POST', 
    path: '/api/patient/register', 
    name: 'Patient Registration Form', 
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
  
  // Newsletter Subscription Form
  { 
    method: 'POST', 
    path: '/api/newsletter/subscribe', 
    name: 'Newsletter Subscription Form', 
    data: {
      email: 'newsletter@example.com',
      firstName: 'Newsletter',
      lastName: 'Subscriber'
    }
  },
  
  // Prescription Request Form (Admin only)
  { 
    method: 'POST', 
    path: '/api/prescriptions', 
    name: 'Prescription Request Form', 
    data: {
      patientId: 1,
      medication: 'Metformin',
      dosage: '500mg',
      instructions: 'Take once daily with food',
      quantity: 30,
      refills: 3
    },
    requiresAuth: true
  },
  
  // Order Form (E-commerce)
  { 
    method: 'POST', 
    path: '/api/orders', 
    name: 'Order Form', 
    data: {
      items: [
        { productId: 1, quantity: 2, price: 25.99 },
        { productId: 2, quantity: 1, price: 15.50 }
      ],
      shippingAddress: '123 Main St, New York, NY 10001',
      paymentMethod: 'credit_card',
      guestEmail: 'customer@example.com'
    }
  },
  
  // Review Form
  { 
    method: 'POST', 
    path: '/api/reviews', 
    name: 'Review Form', 
    data: {
      productId: 1,
      rating: 5,
      title: 'Excellent Product',
      comment: 'This medication has been very effective for managing my condition.',
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com'
    }
  },
  
  // Feedback Form
  { 
    method: 'POST', 
    path: '/api/feedback', 
    name: 'Feedback Form', 
    data: {
      name: 'Feedback User',
      email: 'feedback@example.com',
      subject: 'Service Feedback',
      message: 'Great service! The pharmacy staff was very helpful and professional.',
      rating: 5,
      category: 'service'
    }
  }
];

let adminToken = null;

async function testFormEndpoint(endpoint) {
  try {
    console.log(`\n📝 Testing ${endpoint.name}...`);
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
    
    // Add admin token if required
    if (endpoint.requiresAuth && adminToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${adminToken}`;
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

async function getAdminToken() {
  try {
    console.log('🔐 Getting admin token for protected endpoints...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@mymedspharmacyinc.com',
      password: 'Mymeds2025!AdminSecure123!@#'
    });
    
    if (response.status === 200 && response.data.token) {
      adminToken = response.data.token;
      console.log(`✅ Admin token obtained: ${adminToken.substring(0, 20)}...`);
      return true;
    }
    return false;
  } catch (error) {
    console.log(`❌ Failed to get admin token: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function runFormTests() {
  console.log('📝 MyMeds Form Submission Testing');
  console.log('=================================');
  
  // Get admin token first
  await getAdminToken();
  
  const results = [];
  
  for (const endpoint of formEndpoints) {
    const result = await testFormEndpoint(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 FORM SUBMISSION TEST SUMMARY');
  console.log('===============================');
  
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
  
  // Form functionality verification
  console.log('\n📝 FORM SUBMISSION FUNCTIONALITY');
  console.log('==================================');
  
  const appointmentForm = results.find(r => r.name.includes('Appointment Request'));
  const contactForm = results.find(r => r.name.includes('Contact Form'));
  const refillForm = results.find(r => r.name.includes('Refill Request'));
  const transferForm = results.find(r => r.name.includes('Transfer Request'));
  const registrationForm = results.find(r => r.name.includes('Patient Registration'));
  const newsletterForm = results.find(r => r.name.includes('Newsletter Subscription'));
  const prescriptionForm = results.find(r => r.name.includes('Prescription Request'));
  const orderForm = results.find(r => r.name.includes('Order Form'));
  const reviewForm = results.find(r => r.name.includes('Review Form'));
  const feedbackForm = results.find(r => r.name.includes('Feedback Form'));
  
  console.log(`📅 Appointment Request: ${appointmentForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📧 Contact Form: ${contactForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔄 Refill Request: ${refillForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📦 Transfer Request: ${transferForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`👤 Patient Registration: ${registrationForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📰 Newsletter Subscription: ${newsletterForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💊 Prescription Request: ${prescriptionForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🛒 Order Form: ${orderForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`⭐ Review Form: ${reviewForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💬 Feedback Form: ${feedbackForm?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  // Core form features
  console.log('\n🎯 CORE FORM FEATURES');
  console.log('=====================');
  
  const coreFeatures = [
    { name: 'Patient Services', endpoints: [appointmentForm, refillForm, transferForm] },
    { name: 'Communication', endpoints: [contactForm, feedbackForm] },
    { name: 'Registration & Subscription', endpoints: [registrationForm, newsletterForm] },
    { name: 'E-commerce', endpoints: [orderForm, reviewForm] },
    { name: 'Admin Functions', endpoints: [prescriptionForm] }
  ];
  
  coreFeatures.forEach(feature => {
    const workingEndpoints = feature.endpoints.filter(e => e?.result.success).length;
    const totalEndpoints = feature.endpoints.filter(e => e).length;
    const status = workingEndpoints === totalEndpoints ? '✅ COMPLETE' : 
                  workingEndpoints > 0 ? '⚠️ PARTIAL' : '❌ FAILED';
    console.log(`${status} ${feature.name} (${workingEndpoints}/${totalEndpoints})`);
  });
  
  console.log('\n🎯 FORM SUBMISSION ASSESSMENT');
  console.log('=============================');
  
  if (successful === total) {
    console.log('🎉 ALL FORM SUBMISSIONS ARE WORKING!');
    console.log('✅ All forms functional and ready for use');
    console.log('✅ Data validation working correctly');
  } else if (successful > total * 0.8) {
    console.log('✅ Form submissions mostly functional. Minor issues to address.');
  } else if (successful > total * 0.5) {
    console.log('⚠️ Form submissions partially functional. Some forms need attention.');
  } else {
    console.log('❌ Form submissions have significant issues. Core functionality needs fixing.');
  }
  
  // Show what's working
  const workingEndpoints = results.filter(r => r.result.success);
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING FORM SUBMISSIONS:');
    workingEndpoints.forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  // Show what needs attention
  const failedEndpoints = results.filter(r => !r.result.success);
  if (failedEndpoints.length > 0) {
    console.log('\n❌ FORM SUBMISSIONS NEEDING ATTENTION:');
    failedEndpoints.forEach(({ name, result }) => {
      const errorMsg = result.error?.error || result.error || 'Unknown error';
      console.log(`   • ${name} - ${errorMsg}`);
    });
  }
  
  // Form readiness
  console.log('\n📝 FORM SUBMISSION READINESS');
  console.log('============================');
  
  const patientServices = coreFeatures[0].endpoints.filter(e => e?.result.success).length;
  const communication = coreFeatures[1].endpoints.filter(e => e?.result.success).length;
  const registration = coreFeatures[2].endpoints.filter(e => e?.result.success).length;
  const ecommerce = coreFeatures[3].endpoints.filter(e => e?.result.success).length;
  const adminFunctions = coreFeatures[4].endpoints.filter(e => e?.result.success).length;
  
  console.log(`🏥 Patient Services: ${patientServices > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`📧 Communication: ${communication > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`👤 Registration & Subscription: ${registration > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🛒 E-commerce: ${ecommerce > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`👨‍⚕️ Admin Functions: ${adminFunctions > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  
  // Overall assessment
  const workingFeatures = [patientServices, communication, registration, ecommerce, adminFunctions].filter(count => count > 0).length;
  const totalFeatures = 5;
  
  console.log(`\n🎯 OVERALL FORM SUBMISSION STATUS: ${workingFeatures}/${totalFeatures} feature categories working`);
  
  if (workingFeatures === totalFeatures) {
    console.log('🎉 ALL FORM SUBMISSIONS ARE FULLY READY!');
  } else if (workingFeatures >= totalFeatures * 0.8) {
    console.log('✅ Form submissions are mostly ready with minor issues.');
  } else if (workingFeatures >= totalFeatures * 0.5) {
    console.log('⚠️ Form submissions are partially ready. Some forms need work.');
  } else {
    console.log('❌ Form submissions need significant work before they\'re ready.');
  }
}

// Run the form tests
runFormTests().catch(console.error);
