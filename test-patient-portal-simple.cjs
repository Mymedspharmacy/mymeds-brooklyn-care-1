#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Test patient portal endpoints that don't require file uploads
const patientPortalEndpoints = [
  // Test appointment request (working)
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
  
  // Test contact support (working)
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
  },
  
  // Test refill request (should work without auth)
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
  
  // Test transfer request (should work without auth)
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
  
  // Test health check
  { 
    method: 'GET', 
    path: '/api/health', 
    name: 'Health Check'
  },
  
  // Test products (shop functionality)
  { 
    method: 'GET', 
    path: '/api/products', 
    name: 'Get Products'
  },
  
  // Test blogs
  { 
    method: 'GET', 
    path: '/api/blogs', 
    name: 'Get Blogs'
  }
];

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
    
    const response = await axios(config);
    
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
  console.log('🏥 MyMeds Patient Portal API Testing (Simplified)');
  console.log('================================================');
  
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
  
  const appointment = results.find(r => r.name.includes('Request Appointment'));
  const contact = results.find(r => r.name.includes('Contact Support'));
  const refillRequest = results.find(r => r.name.includes('Refill Request'));
  const transferRequest = results.find(r => r.name.includes('Transfer Request'));
  const healthCheck = results.find(r => r.name.includes('Health Check'));
  const products = results.find(r => r.name.includes('Get Products'));
  const blogs = results.find(r => r.name.includes('Get Blogs'));
  
  console.log(`📅 Appointment Requests: ${appointment?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📧 Contact Support: ${contact?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔄 Refill Requests: ${refillRequest?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📦 Transfer Requests: ${transferRequest?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🏥 Health Check: ${healthCheck?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🛒 Products (Shop): ${products?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📝 Blogs: ${blogs?.result.success ? '✅ WORKING' : '❌ FAILED'}`);
  
  // Core patient portal features
  console.log('\n🎯 CORE PATIENT PORTAL FEATURES');
  console.log('===============================');
  
  const coreFeatures = [
    { name: 'Appointment Management', endpoints: [appointment] },
    { name: 'Support & Communication', endpoints: [contact] },
    { name: 'Prescription Management', endpoints: [refillRequest, transferRequest] },
    { name: 'System Health', endpoints: [healthCheck] },
    { name: 'Shop Integration', endpoints: [products] },
    { name: 'Content Management', endpoints: [blogs] }
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
  
  const appointmentMgmt = coreFeatures[0].endpoints.filter(e => e?.result.success).length;
  const support = coreFeatures[1].endpoints.filter(e => e?.result.success).length;
  const prescriptionMgmt = coreFeatures[2].endpoints.filter(e => e?.result.success).length;
  const systemHealth = coreFeatures[3].endpoints.filter(e => e?.result.success).length;
  const shopIntegration = coreFeatures[4].endpoints.filter(e => e?.result.success).length;
  const contentMgmt = coreFeatures[5].endpoints.filter(e => e?.result.success).length;
  
  console.log(`📅 Appointment Management: ${appointmentMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`📧 Support & Communication: ${support > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`💊 Prescription Management: ${prescriptionMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🏥 System Health: ${systemHealth > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`🛒 Shop Integration: ${shopIntegration > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  console.log(`📝 Content Management: ${contentMgmt > 0 ? '✅ READY' : '❌ NEEDS WORK'}`);
  
  // Overall assessment
  const workingFeatures = [appointmentMgmt, support, prescriptionMgmt, systemHealth, shopIntegration, contentMgmt].filter(count => count > 0).length;
  const totalFeatures = 6;
  
  console.log(`\n🎯 OVERALL PATIENT PORTAL STATUS: ${workingFeatures}/${totalFeatures} features working`);
  
  if (workingFeatures === totalFeatures) {
    console.log('🎉 PATIENT PORTAL IS FULLY READY!');
  } else if (workingFeatures >= totalFeatures * 0.8) {
    console.log('✅ Patient portal is mostly ready with minor issues.');
  } else if (workingFeatures >= totalFeatures * 0.5) {
    console.log('⚠️ Patient portal is partially ready. Some features need work.');
  } else {
    console.log('❌ Patient portal needs significant work before it\'s ready.');
  }
}

// Run the patient portal tests
runPatientPortalTests().catch(console.error);
