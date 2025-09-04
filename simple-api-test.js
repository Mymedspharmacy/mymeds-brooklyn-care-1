const axios = require('axios');
const fs = require('fs');
const path = require('path');

class SimpleAPITester {
  constructor() {
    this.baseUrl = 'http://localhost:4000';
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🚀 Starting Simple API Testing...');
    console.log(`📍 Testing API at: ${this.baseUrl}`);
    
    try {
      console.log('\n📋 Running Health Check Tests...');
      await this.testHealthEndpoints();
      
      console.log('\n📋 Running Admin Authentication Tests...');
      await this.testAdminAuthentication();
      
      console.log('\n📋 Running Prescription Endpoints Tests...');
      await this.testPrescriptionEndpoints();
      
      console.log('\n📋 Running Error Handling Tests...');
      await this.testErrorHandling();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  async testHealthEndpoints() {
    const tests = [
      {
        name: 'Server Health Check',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/api/health`);
            return response.status === 200;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Server Status',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/api/status`);
            return response.status === 200;
          } catch (error) {
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Health Check',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Health Check',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAdminAuthentication() {
    const tests = [
      {
        name: 'Admin Login Endpoint Available',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/admin/login`, {
              email: 'admin@mymedspharmacy.com',
              password: 'AdminPassword123!'
            });
            return response.status === 200;
          } catch (error) {
            // 401 is expected for invalid credentials, but endpoint should exist
            return error.response && (error.response.status === 401 || error.response.status === 400);
          }
        }
      },
      {
        name: 'Admin Login with Invalid Credentials',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/admin/login`, {
              email: 'invalid@email.com',
              password: 'wrongpassword'
            });
            return false; // Should not succeed
          } catch (error) {
            return error.response && error.response.status === 401;
          }
        }
      },
      {
        name: 'Admin Login Missing Credentials',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/admin/login`, {});
            return false; // Should not succeed
          } catch (error) {
            return error.response && error.response.status === 400;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Admin Authentication',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Admin Authentication',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testPrescriptionEndpoints() {
    const tests = [
      {
        name: 'Prescription Refill Endpoint Available',
        test: async () => {
          try {
            // Create form data
            const FormData = require('form-data');
            const form = new FormData();
            form.append('firstName', 'Test');
            form.append('lastName', 'User');
            form.append('phone', '555-123-4567');
            form.append('email', 'test@example.com');
            form.append('prescriptionNumber', 'RX123456');
            form.append('medication', 'Test Medication');
            form.append('pharmacy', 'Test Pharmacy');
            form.append('notes', 'Test notes');
            
            // Create a simple text file for testing
            const testFile = Buffer.from('Test prescription file content');
            form.append('file', testFile, { filename: 'test-prescription.txt' });
            
            const response = await axios.post(`${this.baseUrl}/prescriptions/refill`, form, {
              headers: form.getHeaders()
            });
            return response.status === 200;
          } catch (error) {
            // Endpoint should exist, even if validation fails
            return error.response && (error.response.status === 400 || error.response.status === 500);
          }
        }
      },
      {
        name: 'Prescription Transfer Endpoint Available',
        test: async () => {
          try {
            const FormData = require('form-data');
            const form = new FormData();
            form.append('firstName', 'Test');
            form.append('lastName', 'User');
            form.append('dateOfBirth', '1990-01-01');
            form.append('phone', '555-123-4567');
            form.append('email', 'test@example.com');
            form.append('currentPharmacy', 'Test Pharmacy');
            form.append('medication', 'Test Medication');
            form.append('prescriptionNumber', 'RX123456');
            form.append('prescribingDoctor', 'Dr. Test');
            
            const response = await axios.post(`${this.baseUrl}/prescriptions/transfer`, form, {
              headers: form.getHeaders()
            });
            return response.status === 200;
          } catch (error) {
            return error.response && (error.response.status === 400 || error.response.status === 500);
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Prescription Endpoints',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Prescription Endpoints',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    const tests = [
      {
        name: '404 Error Handling',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/api/non-existent-endpoint`);
            return false; // Should not succeed
          } catch (error) {
            return error.response && error.response.status === 404;
          }
        }
      },
      {
        name: 'Method Not Allowed',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/admin/login`);
            return false; // Should not succeed
          } catch (error) {
            return error.response && error.response.status === 405;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Error Handling',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Error Handling',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length
      },
      results: this.testResults
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'api-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'api-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 API Test Report Generated:');
    console.log(`  📄 JSON: ${reportPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${report.summary.total}`);
    console.log(`  ✅ Passed: ${report.summary.passed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  ⚠️  Errors: ${report.summary.errors}`);
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-item { padding: 15px; border-radius: 8px; text-align: center; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .error { background: #fff3cd; color: #856404; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-result.pass { background: #d4edda; }
        .test-result.fail { background: #f8d7da; }
        .test-result.error { background: #fff3cd; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 API Test Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
        <p>API Base URL: ${this.baseUrl}</p>
    </div>
    
    <div class="summary">
        <div class="summary-item passed">
            <h3>✅ Passed</h3>
            <h2>${report.summary.passed}</h2>
        </div>
        <div class="summary-item failed">
            <h3>❌ Failed</h3>
            <h2>${report.summary.failed}</h2>
        </div>
        <div class="summary-item error">
            <h3>⚠️ Errors</h3>
            <h2>${report.summary.errors}</h2>
        </div>
    </div>
    
    <h2>📋 Test Results</h2>
    ${report.results.map(result => `
        <div class="test-result ${result.status.toLowerCase()}">
            <strong>${result.category} - ${result.test}</strong>
            <br>
            Status: ${result.status}
            ${result.error ? `<br>Error: ${result.error}` : ''}
            <br>
            <small>${new Date(result.timestamp).toLocaleString()}</small>
        </div>
    `).join('')}
</body>
</html>
    `;
  }
}

// Run the API tests
const tester = new SimpleAPITester();
tester.runAllTests().catch(console.error);
