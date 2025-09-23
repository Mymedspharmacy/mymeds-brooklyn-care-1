#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testRefillRequest() {
  try {
    console.log('🧪 Testing Refill Request with detailed error...');
    
    const response = await axios.post(`${BASE_URL}/api/refill-requests`, {
      medication: 'Metformin',
      dosage: '500mg',
      urgency: 'normal',
      notes: 'Need refill for next month'
    }, {
      timeout: 10000,
      validateStatus: function (status) {
        return true; // Accept any status
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error details:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

async function testTransferRequest() {
  try {
    console.log('\n🧪 Testing Transfer Request with detailed error...');
    
    const response = await axios.post(`${BASE_URL}/api/transfer-requests`, {
      currentPharmacy: 'CVS Pharmacy',
      medications: 'Metformin, Lisinopril',
      notes: 'Moving to new area, need to transfer prescriptions'
    }, {
      timeout: 10000,
      validateStatus: function (status) {
        return true; // Accept any status
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error details:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Response:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`Error: ${error.message}`);
    }
  }
}

async function runDetailedTests() {
  await testRefillRequest();
  await testTransferRequest();
}

runDetailedTests().catch(console.error);
