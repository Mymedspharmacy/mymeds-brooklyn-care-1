const axios = require('axios');

// Configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

// Test data
const testPatientData = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  ssn: '123-45-6789',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  emergencyContactName: 'Jane Doe',
  emergencyContactPhone: '(555) 987-6543',
  emergencyContactRelationship: 'Spouse',
  insuranceProvider: 'Blue Cross Blue Shield',
  insuranceGroupNumber: '12345',
  insuranceMemberId: 'MEM123456',
  primaryCarePhysician: 'Dr. Smith',
  physicianPhone: '(555) 456-7890',
  allergies: 'None',
  currentMedications: 'None',
  medicalConditions: 'None',
  governmentIdType: 'drivers-license',
  governmentIdNumber: 'DL123456789',
  termsAccepted: true,
  privacyPolicyAccepted: true,
  hipaaConsent: true,
  medicalAuthorization: true,
  financialResponsibility: true,
  password: 'SecurePassword123!',
  securityQuestions: JSON.stringify({
    question1: 'What was the name of your first pet?',
    answer1: 'Fluffy',
    question2: 'In what city were you born?',
    answer2: 'New York',
    question3: 'What was your mother\'s maiden name?',
    answer3: 'Johnson'
  })
};

// Helper function to create test file
function createTestFile() {
  const testContent = 'This is a test file for verification purposes.';
  return new Blob([testContent], { type: 'text/plain' });
}

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to log test results
function logTestResult(testName, success, error = null) {
  if (success) {
    console.log(`✅ PASSED: ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ FAILED: ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
      testResults.errors.push({ test: testName, error: error.message || error });
    }
    testResults.failed++;
  }
}

// Test 1: Check if backend is running
async function testBackendHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logTestResult('Backend Health Check', response.status === 200);
  } catch (error) {
    logTestResult('Backend Health Check', false, error);
  }
}

// Test 2: Test patient registration API
async function testPatientRegistration() {
  try {
    // Create FormData for file uploads
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add all form data
    Object.keys(testPatientData).forEach(key => {
      formData.append(key, testPatientData[key]);
    });

    // Add test files
    const testFile = createTestFile();
    formData.append('governmentIdFile', testFile, 'test-id.pdf');
    formData.append('proofOfAddressFile', testFile, 'test-address.pdf');
    formData.append('insuranceCardFile', testFile, 'test-insurance.pdf');

    const response = await axios.post(`${BASE_URL}/api/patient/register`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    logTestResult('Patient Registration API', response.status === 201);
    return response.data.patientId;
  } catch (error) {
    logTestResult('Patient Registration API', false, error);
    return null;
  }
}

// Test 3: Test patient login
async function testPatientLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testPatientData.email,
      password: testPatientData.password
    });

    logTestResult('Patient Login API', response.status === 200);
    return response.data.token;
  } catch (error) {
    logTestResult('Patient Login API', false, error);
    return null;
  }
}

// Test 4: Test patient profile retrieval
async function testPatientProfile(token) {
  if (!token) {
    logTestResult('Patient Profile API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Profile API', response.status === 200);
  } catch (error) {
    logTestResult('Patient Profile API', false, error);
  }
}

// Test 5: Test patient prescriptions
async function testPatientPrescriptions(token) {
  if (!token) {
    logTestResult('Patient Prescriptions API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/prescriptions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Prescriptions API', response.status === 200);
  } catch (error) {
    logTestResult('Patient Prescriptions API', false, error);
  }
}

// Test 6: Test patient appointments
async function testPatientAppointments(token) {
  if (!token) {
    logTestResult('Patient Appointments API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Appointments API', response.status === 200);
  } catch (error) {
    logTestResult('Patient Appointments API', false, error);
  }
}

// Test 7: Test patient dashboard
async function testPatientDashboard(token) {
  if (!token) {
    logTestResult('Patient Dashboard API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Dashboard API', response.status === 200);
  } catch (error) {
    logTestResult('Patient Dashboard API', false, error);
  }
}

// Test 8: Test patient messages
async function testPatientMessages(token) {
  if (!token) {
    logTestResult('Patient Messages API', false, 'No token available');
    return;
  }

  try {
    // Test getting messages
    const getResponse = await axios.get(`${BASE_URL}/api/patient/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Get Messages API', getResponse.status === 200);

    // Test sending a message
    const sendResponse = await axios.post(`${BASE_URL}/api/patient/messages`, {
      subject: 'Test Message',
      message: 'This is a test message from the API test suite.'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Patient Send Message API', sendResponse.status === 200);
  } catch (error) {
    logTestResult('Patient Messages API', false, error);
  }
}

// Test 9: Test refill requests
async function testRefillRequests(token) {
  if (!token) {
    logTestResult('Refill Requests API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/refill-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Refill Requests API', response.status === 200);
  } catch (error) {
    logTestResult('Refill Requests API', false, error);
  }
}

// Test 10: Test transfer requests
async function testTransferRequests(token) {
  if (!token) {
    logTestResult('Transfer Requests API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/patient/transfer-requests`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Transfer Requests API', response.status === 200);
  } catch (error) {
    logTestResult('Transfer Requests API', false, error);
  }
}

// Test 11: Test admin authentication
async function testAdminAuth() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/admin/login`, {
      email: 'admin@mymeds.com',
      password: 'admin123'
    });

    logTestResult('Admin Authentication API', response.status === 200);
    return response.data.token;
  } catch (error) {
    logTestResult('Admin Authentication API', false, error);
    return null;
  }
}

// Test 12: Test admin notifications
async function testAdminNotifications(token) {
  if (!token) {
    logTestResult('Admin Notifications API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/admin/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Admin Notifications API', response.status === 200);
  } catch (error) {
    logTestResult('Admin Notifications API', false, error);
  }
}

// Test 13: Test admin patient verification
async function testAdminPatientVerification(token) {
  if (!token) {
    logTestResult('Admin Patient Verification API', false, 'No token available');
    return;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/admin/patients/pending-verification`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logTestResult('Admin Patient Verification API', response.status === 200);
  } catch (error) {
    logTestResult('Admin Patient Verification API', false, error);
  }
}

// Test 14: Test file upload validation
async function testFileUploadValidation() {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add test data without files
    Object.keys(testPatientData).forEach(key => {
      formData.append(key, testPatientData[key]);
    });

    const response = await axios.post(`${BASE_URL}/api/patient/register`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    logTestResult('File Upload Validation', false, 'Should have failed without required files');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTestResult('File Upload Validation', true);
    } else {
      logTestResult('File Upload Validation', false, error);
    }
  }
}

// Test 15: Test data validation
async function testDataValidation() {
  try {
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add incomplete data
    formData.append('firstName', 'John');
    // Missing other required fields

    const response = await axios.post(`${BASE_URL}/api/patient/register`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data'
      }
    });

    logTestResult('Data Validation', false, 'Should have failed with incomplete data');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logTestResult('Data Validation', true);
    } else {
      logTestResult('Data Validation', false, error);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API and Business Logic Tests...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  // Run tests in sequence
  await testBackendHealth();
  await testDataValidation();
  await testFileUploadValidation();
  
  const patientId = await testPatientRegistration();
  const patientToken = await testPatientLogin();
  
  if (patientToken) {
    await testPatientProfile(patientToken);
    await testPatientPrescriptions(patientToken);
    await testPatientAppointments(patientToken);
    await testPatientDashboard(patientToken);
    await testPatientMessages(patientToken);
    await testRefillRequests(patientToken);
    await testTransferRequests(patientToken);
  }

  const adminToken = await testAdminAuth();
  if (adminToken) {
    await testAdminNotifications(adminToken);
    await testAdminPatientVerification(adminToken);
  }

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Detailed Errors:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }

  console.log('\n🎯 Test Suite Complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults
};
