#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Patient Portal specific endpoints
const patientPortalEndpoints = [
  // Patient Registration (without file uploads for testing)
  { 
    method: 'POST', 
    path: '/api/patient/register', 
    name: 'Patient Registration', 
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe.patient@example.com',
      password: 'SecurePass123!',
      phone: '555-123-4567',
      dateOfBirth: '1985-06-15',
      ssn: '123-45-6789',
      address: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '555-987-6543',
      emergencyContactRelationship: 'Spouse',
      insuranceProvider: 'Blue Cross Blue Shield',
      insuranceGroupNumber: 'GRP123456',
      insuranceMemberId: 'MEM789012',
      primaryCarePhysician: 'Dr. Smith',
      physicianPhone: '555-555-5555',
      allergies: 'Penicillin',
      currentMedications: 'Metformin 500mg',
      medicalConditions: 'Type 2 Diabetes',
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
  
  // Patient Login (if we had a login endpoint)
  { 
    method: 'POST', 
    path: '/api/auth/login', 
    name: 'Patient Login', 
    data: {
      email: 'john.doe.patient@example.com',
      password: 'SecurePass123!'
    }
  },
  
  // Get Patient Profile (requires auth)
  { 
    method: 'GET', 
    path: '/api/patient/profile', 
    name: 'Get Patient Profile',
    requiresAuth: true
  },
  
  // Update Patient Profile (requires auth)
  { 
    method: 'PUT', 
    path: '/api/patient/profile', 
    name: 'Update Patient Profile',
    data: {
      phone: '555-999-8888',
      address: '456 Updated Street',
      allergies: 'Penicillin, Shellfish',
      currentMedications: 'Metformin 500mg, Lisinopril 10mg'
    },
    requiresAuth: true
  },
  
  // Get Patient Prescriptions (requires auth)
  { 
    method: 'GET', 
    path: '/api/patient/prescriptions', 
    name: 'Get Patient Prescriptions',
    requiresAuth: true
  },
  
  // Submit Refill Request
  { 
    method: 'POST', 
    path: '/api/refill-requests', 
    name: 'Submit Refill Request', 
    data: {
      medication: 'Metformin',
      dosage: '500mg',
      urgency: 'normal',
      notes: 'Need refill for next month'
    }
  },
  
  // Submit Transfer Request
  { 
    method: 'POST', 
    path: '/api/transfer-requests', 
    name: 'Submit Transfer Request', 
    data: {
      currentPharmacy: 'CVS Pharmacy',
      medications: 'Metformin, Lisinopril',
      notes: 'Moving to new area, need to transfer prescriptions'
    }
  },
  
  // Request Appointment
  { 
    method: 'POST', 
    path: '/api/appointments/request', 
    name: 'Request Appointment', 
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe.patient@example.com',
      phone: '555-123-4567',
      service: 'Medication Consultation',
      preferredDate: '2025-01-20',
      preferredTime: '14:00',
      notes: 'Need to discuss medication adjustments'
    }
  },
  
  // Get Patient Appointments (requires auth)
  { 
    method: 'GET', 
    path: '/api/appointments/my', 
    name: 'Get My Appointments',
    requiresAuth: true
  },
  
  // Contact Support
  { 
    method: 'POST', 
    path: '/api/contact', 
    name: 'Contact Support', 
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe.patient@example.com',
      phone: '555-123-4567',
      subject: 'Prescription Question',
      message: 'I have a question about my Metformin prescription. Can you help?',
      agreeToTerms: true
    }
  }
];

let patientToken = null;

async function testPatientPortalEndpoint(endpoint) {
  try {
    console.log(`\n🧪 Testing ${endpoint.name}...`);
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
    
    // Add patient token if required
    if (endpoint.requiresAuth && patientToken) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${patientToken}`;
    }
    
    const response = await axios(config);
    
    // Store patient token for future requests
    if (endpoint.path === '/api/auth/login' && response.status === 200 && response.data.token) {
      patientToken = response.data.token;
      console.log(`   🔑 Patient token obtained: ${patientToken.substring(0, 20)}...`);
    }
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ SUCCESS (${response.status})`);
      if (response.data && typeof response.data === 'object') {
        const responseStr = JSON.stringify(response.data);
        console.log(`   📊 Response: ${responseStr.substring(0, 200)}${responseStr.length > 200 ? '...' : ''}`);
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

async function runPatientPortalTests() {
  console.log('🏥 MyMeds Patient Portal API Testing');
  console.log('====================================');
  
  const results = [];
  
  for (const endpoint of patientPortalEndpoints) {
    const result = await testPatientPortalEndpoint(endpoint);
    results.push({ ...endpoint, result });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('\n📊 PATIENT PORTAL TEST SUMMARY');
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
  
  // Patient Portal functionality verification
  console.log('\n🏥 PATIENT PORTAL FUNCTIONALITY');
  console.log('=================================');
  
  const registration = results.find(r => r.name.includes('Patient Registration'));
  const login = results.find(r => r.name.includes('Patient Login'));
  const profile = results.find(r => r.name.includes('Patient Profile'));
  const prescriptions = results.find(r => r.name.includes('Prescriptions'));
  const refillRequest = results.find(r => r.name.includes('Refill Request'));
  const transferRequest = results.find(r => r.name.includes('Transfer Request'));
  const appointment = results.find(r => r.name.includes('Request Appointment'));
  const myAppointments = results.find(r => r.name.includes('My Appointments'));
  const contact = results.find(r => r.name.includes('Contact Support'));
  
  console.log(`👤 Patient Registration: ${registration?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔐 Patient Login: ${login?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📋 Patient Profile: ${profile?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💊 Prescriptions: ${prescriptions?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔄 Refill Requests: ${refillRequest?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📦 Transfer Requests: ${transferRequest?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📅 Appointment Requests: ${appointment?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📋 My Appointments: ${myAppointments?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📧 Contact Support: ${contact?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  // Core patient portal features
  console.log('\n🎯 CORE PATIENT PORTAL FEATURES');
  console.log('===============================');
  
  const coreFeatures = [
    { name: 'Account Management', endpoints: [registration, login, profile] },
    { name: 'Prescription Management', endpoints: [prescriptions, refillRequest, transferRequest] },
    { name: 'Appointment Management', endpoints: [appointment, myAppointments] },
    { name: 'Support & Communication', endpoints: [contact] }
  ];
  
  coreFeatures.forEach(feature => {
    const workingEndpoints = feature.endpoints.filter(e => e?.result.success).length;
    const totalEndpoints = feature.endpoints.filter(e => e).length;
    const status = workingEndpoints === totalEndpoints ? '✅ COMPLETE' : 
                  workingEndpoints > 0 ? '⚠️ PARTIAL' : '❌ FAILED';
    console.log(`${status} ${feature.name} (${workingEndpoints}/${totalEndpoints})`);
  });
  
  console.log('\n🎯 PATIENT PORTAL ASSESSMENT');
  console.log('============================');
  
  if (successful === total) {
    console.log('🎉 PATIENT PORTAL IS FULLY FUNCTIONAL!');
    console.log('✅ All patient features working perfectly');
    console.log('✅ Ready for patient use');
  } else if (successful > total * 0.8) {
    console.log('✅ Patient portal mostly functional. Minor issues to address.');
  } else if (successful > total * 0.5) {
    console.log('⚠️ Patient portal partially functional. Some features need attention.');
  } else {
    console.log('❌ Patient portal has significant issues. Core functionality needs fixing.');
  }
  
  // Show what's working
  const workingEndpoints = results.filter(r => r.result.success);
  if (workingEndpoints.length > 0) {
    console.log('\n✅ WORKING PATIENT PORTAL FEATURES:');
    workingEndpoints.forEach(({ name }) => {
      console.log(`   • ${name}`);
    });
  }
  
  // Show what needs attention
  const failedEndpoints = results.filter(r => !r.result.success);
  if (failedEndpoints.length > 0) {
    console.log('\n❌ PATIENT PORTAL FEATURES NEEDING ATTENTION:');
    failedEndpoints.forEach(({ name, result }) => {
      console.log(`   • ${name} - ${result.error?.error || result.error || 'Unknown error'}`);
    });
  }
  
  // Patient portal readiness
  console.log('\n🏥 PATIENT PORTAL READINESS');
  console.log('============================');
  
  const accountMgmt = coreFeatures[0].endpoints.filter(e => e?.result.success).length;
  const prescriptionMgmt = coreFeatures[1].endpoints.filter(e => e?.result.success).length;
  const appointmentMgmt = coreFeatures[2].endpoints.filter(e => e?.result.success).length;
  const support = coreFeatures[3].endpoints.filter(e => e?.result.success).length;
  
  console.log(`👤 Account Management: ${accountMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`💊 Prescription Management: ${prescriptionMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`📅 Appointment Management: ${appointmentMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`📧 Support & Communication: ${support > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
}

// Run the patient portal tests
runPatientPortalTests().catch(console.error);
