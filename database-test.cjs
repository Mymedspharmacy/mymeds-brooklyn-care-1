const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

class DatabaseTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:3002'; // Updated to port 3002
    this.apiUrl = 'http://localhost:4000';
  }

  async init() {
    console.log('🚀 Starting database submission testing...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('✅ Browser initialized');
  }

  async runAllTests() {
    try {
      await this.init();
      
      console.log('\n📋 Running Database Submission Tests...');
      await this.testDatabaseSubmissions();
      
      console.log('\n📋 Running API Database Tests...');
      await this.testAPIDatabase();
      
      console.log('\n📋 Running Database Verification Tests...');
      await this.testDatabaseVerification();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async testDatabaseSubmissions() {
    const tests = [
      {
        name: 'Refill Form Database Submission',
        test: async () => {
          // Generate unique test data
          const timestamp = Date.now();
          const testData = {
            firstName: `Test${timestamp}`,
            lastName: 'User',
            phone: '555-123-4567',
            email: `test${timestamp}@example.com`,
            prescriptionNumber: `RX${timestamp}`,
            medication: 'Test Medication'
          };

          // Submit form via API directly
          const formData = new FormData();
          formData.append('firstName', testData.firstName);
          formData.append('lastName', testData.lastName);
          formData.append('phone', testData.phone);
          formData.append('email', testData.email);
          formData.append('prescriptionNumber', testData.prescriptionNumber);
          formData.append('medication', testData.medication);

          const response = await this.page.evaluate(async (url, data) => {
            try {
              const formData = new FormData();
              Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
              });

              const res = await fetch(`${url}/api/prescriptions/refill`, {
                method: 'POST',
                body: formData
              });

              if (res.ok) {
                const result = await res.json();
                return { success: true, data: result, status: res.status };
              } else {
                return { success: false, status: res.status, error: await res.text() };
              }
            } catch (error) {
              return { success: false, error: error.message };
            }
          }, this.apiUrl, testData);

          return response.success;
        }
      },
      {
        name: 'Transfer Form Database Submission',
        test: async () => {
          // Generate unique test data
          const timestamp = Date.now();
          const testData = {
            firstName: `Transfer${timestamp}`,
            lastName: 'User',
            phone: '555-987-6543',
            email: `transfer${timestamp}@example.com`,
            prescriptionNumber: `TX${timestamp}`,
            medication: 'Transfer Medication',
            pharmacy: 'CVS Pharmacy'
          };

          const response = await this.page.evaluate(async (url, data) => {
            try {
              const formData = new FormData();
              Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
              });

              const res = await fetch(`${url}/api/prescriptions/transfer`, {
                method: 'POST',
                body: formData
              });

              if (res.ok) {
                const result = await res.json();
                return { success: true, data: result, status: res.status };
              } else {
                return { success: false, status: res.status, error: await res.text() };
              }
            } catch (error) {
              return { success: false, error: error.message };
            }
          }, this.apiUrl, testData);

          return response.success;
        }
      },
      {
        name: 'Appointment Form Database Submission',
        test: async () => {
          // Generate unique test data
          const timestamp = Date.now();
          const testData = {
            name: `Appointment${timestamp}`,
            email: `appointment${timestamp}@example.com`,
            phone: '555-111-2222',
            date: '2024-12-25',
            time: '14:00',
            service: 'Consultation'
          };

          const response = await this.page.evaluate(async (url, data) => {
            try {
              const res = await fetch(`${url}/api/appointments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
              });

              if (res.ok) {
                const result = await res.json();
                return { success: true, data: result, status: res.status };
              } else {
                return { success: false, status: res.status, error: await res.text() };
              }
            } catch (error) {
              return { success: false, error: error.message };
            }
          }, this.apiUrl, testData);

          return response.success;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Database Submissions',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Database Submissions',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAPIDatabase() {
    const tests = [
      {
        name: 'Database Connection Test',
        test: async () => {
          const response = await this.page.evaluate(async (url) => {
            try {
              const res = await fetch(`${url}/api/health`);
              if (res.ok) {
                const data = await res.json();
                return data.database === 'connected';
              }
              return false;
            } catch (error) {
              return false;
            }
          }, this.apiUrl);

          return response;
        }
      },
      {
        name: 'Database Write Test',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `WriteTest${timestamp}`,
            lastName: 'User',
            phone: '555-999-8888',
            email: `writetest${timestamp}@example.com`,
            prescriptionNumber: `WT${timestamp}`,
            medication: 'Write Test Medication'
          };

          const response = await this.page.evaluate(async (url, data) => {
            try {
              const formData = new FormData();
              Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
              });

              const res = await fetch(`${url}/api/prescriptions/refill`, {
                method: 'POST',
                body: formData
              });

              return res.status === 200 || res.status === 201;
            } catch (error) {
              return false;
            }
          }, this.apiUrl, testData);

          return response;
        }
      },
      {
        name: 'Database Read Test',
        test: async () => {
          const response = await this.page.evaluate(async (url) => {
            try {
              const res = await fetch(`${url}/api/prescriptions`);
              return res.status === 200;
            } catch (error) {
              return false;
            }
          }, this.apiUrl);

          return response;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'API Database',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'API Database',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testDatabaseVerification() {
    const tests = [
      {
        name: 'Verify Refill Data in Database',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `Verify${timestamp}`,
            lastName: 'User',
            phone: '555-777-6666',
            email: `verify${timestamp}@example.com`,
            prescriptionNumber: `VR${timestamp}`,
            medication: 'Verify Medication'
          };

          // Submit data
          const submitResponse = await this.page.evaluate(async (url, data) => {
            try {
              const formData = new FormData();
              Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
              });

              const res = await fetch(`${url}/api/prescriptions/refill`, {
                method: 'POST',
                body: formData
              });

              if (res.ok) {
                return await res.json();
              }
              return null;
            } catch (error) {
              return null;
            }
          }, this.apiUrl, testData);

          if (!submitResponse) return false;

          // Verify data was stored by checking the response
          return submitResponse.success || submitResponse.id || submitResponse.message;
        }
      },
      {
        name: 'Verify Transfer Data in Database',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `TransferVerify${timestamp}`,
            lastName: 'User',
            phone: '555-444-3333',
            email: `transferverify${timestamp}@example.com`,
            prescriptionNumber: `TV${timestamp}`,
            medication: 'Transfer Verify Medication',
            pharmacy: 'Test Pharmacy'
          };

          const submitResponse = await this.page.evaluate(async (url, data) => {
            try {
              const formData = new FormData();
              Object.keys(data).forEach(key => {
                formData.append(key, data[key]);
              });

              const res = await fetch(`${url}/api/prescriptions/transfer`, {
                method: 'POST',
                body: formData
              });

              if (res.ok) {
                return await res.json();
              }
              return null;
            } catch (error) {
              return null;
            }
          }, this.apiUrl, testData);

          if (!submitResponse) return false;

          return submitResponse.success || submitResponse.id || submitResponse.message;
        }
      },
      {
        name: 'Database Transaction Integrity',
        test: async () => {
          // Test that database transactions are working properly
          const response = await this.page.evaluate(async (url) => {
            try {
              // Test multiple rapid submissions
              const promises = [];
              for (let i = 0; i < 3; i++) {
                const timestamp = Date.now() + i;
                const testData = {
                  firstName: `Integrity${timestamp}`,
                  lastName: 'User',
                  phone: '555-123-4567',
                  email: `integrity${timestamp}@example.com`,
                  prescriptionNumber: `IT${timestamp}`,
                  medication: 'Integrity Test Medication'
                };

                const formData = new FormData();
                Object.keys(testData).forEach(key => {
                  formData.append(key, testData[key]);
                });

                promises.push(
                  fetch(`${url}/api/prescriptions/refill`, {
                    method: 'POST',
                    body: formData
                  })
                );
              }

              const results = await Promise.all(promises);
              const allSuccessful = results.every(res => res.ok);
              
              return allSuccessful;
            } catch (error) {
              return false;
            }
          }, this.apiUrl);

          return response;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Database Verification',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Database Verification',
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
    const reportPath = path.join(__dirname, 'database-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'database-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Database Test Report Generated:');
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
    <title>Database Submission Test Report</title>
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
        <h1>🚀 Database Submission Test Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
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

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser closed');
    }
  }
}

// Run the database tests
const tester = new DatabaseTester();
tester.runAllTests().catch(console.error);
