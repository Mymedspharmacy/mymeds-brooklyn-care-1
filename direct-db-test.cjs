const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class DirectDatabaseTester {
  constructor() {
    this.testResults = [];
    this.apiUrl = 'http://localhost:4000';
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting direct database testing...');
      
      console.log('\n📋 Running Direct API Database Tests...');
      await this.testDirectAPIDatabase();
      
      console.log('\n📋 Running Database Write/Read Tests...');
      await this.testDatabaseWriteRead();
      
      console.log('\n📋 Running Database Integrity Tests...');
      await this.testDatabaseIntegrity();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  async testDirectAPIDatabase() {
    const tests = [
      {
        name: 'Health Check with Database Status',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/health`);
            console.log('Health Response:', response.data);
            return response.status === 200 && response.data;
          } catch (error) {
            console.error('Health check failed:', error.message);
            return false;
          }
        }
      },
      {
        name: 'Database Connection Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/status`);
            console.log('Status Response:', response.data);
            return response.status === 200;
          } catch (error) {
            console.error('Status check failed:', error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Direct API Database',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Direct API Database',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testDatabaseWriteRead() {
    const tests = [
      {
        name: 'Refill Form Database Write',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `DirectTest${timestamp}`,
            lastName: 'User',
            phone: '555-123-4567',
            email: `directtest${timestamp}@example.com`,
            prescriptionNumber: `DT${timestamp}`,
            medication: 'Direct Test Medication'
          };

          try {
            const formData = new FormData();
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Add required file for refill
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Direct Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `direct-test-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            console.log('Refill Write Response:', response.data);
            return response.status === 200 || response.status === 201;
          } catch (error) {
            console.error('Refill write failed:', error.response?.data || error.message);
            return false;
          }
        }
      },
      {
        name: 'Transfer Form Database Write',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `DirectTransfer${timestamp}`,
            lastName: 'User',
            phone: '555-987-6543',
            email: `directtransfer${timestamp}@example.com`,
            prescriptionNumber: `DTX${timestamp}`,
            medication: 'Direct Transfer Medication',
            pharmacy: 'Test Pharmacy'
          };

          try {
            const formData = new FormData();
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Add optional file for transfer
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Direct Transfer File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `direct-transfer-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/transfer`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            console.log('Transfer Write Response:', response.data);
            return response.status === 200 || response.status === 201;
          } catch (error) {
            console.error('Transfer write failed:', error.response?.data || error.message);
            return false;
          }
        }
      },
      {
        name: 'Database Read Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/prescriptions`);
            console.log('Read Response Status:', response.status);
            return response.status === 200;
          } catch (error) {
            console.error('Database read failed:', error.response?.data || error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Database Write/Read',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Database Write/Read',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testDatabaseIntegrity() {
    const tests = [
      {
        name: 'Multiple Concurrent Writes',
        test: async () => {
          try {
            const promises = [];
            for (let i = 0; i < 3; i++) {
              const timestamp = Date.now() + i;
              const testData = {
                firstName: `Concurrent${timestamp}`,
                lastName: 'User',
                phone: '555-111-2222',
                email: `concurrent${timestamp}@example.com`,
                prescriptionNumber: `CC${timestamp}`,
                medication: 'Concurrent Test Medication'
              };

              const formData = new FormData();
              Object.keys(testData).forEach(key => {
                formData.append(key, testData[key]);
              });

              // Add required file for refill
              const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Concurrent Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
              const dummyFilePath = path.join(__dirname, `concurrent-test-${timestamp}.pdf`);
              fs.writeFileSync(dummyFilePath, dummyFileContent);
              formData.append('file', fs.createReadStream(dummyFilePath));

              promises.push(
                axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
                  headers: {
                    ...formData.getHeaders()
                  }
                }).then(response => {
                  // Clean up test file
                  fs.unlinkSync(dummyFilePath);
                  return response;
                })
              );
            }

            const results = await Promise.all(promises);
            const allSuccessful = results.every(res => res.status === 200 || res.status === 201);
            
            console.log('Concurrent writes completed:', allSuccessful);
            return allSuccessful;
          } catch (error) {
            console.error('Concurrent writes failed:', error.message);
            return false;
          }
        }
      },
      {
        name: 'Data Validation Test',
        test: async () => {
          try {
            // Test with invalid data to ensure validation works
            const invalidData = {
              firstName: '', // Empty first name should fail
              lastName: 'User',
              phone: 'invalid-phone',
              email: 'invalid-email',
              prescriptionNumber: 'RX123',
              medication: 'Test Medication'
            };

            const formData = new FormData();
            Object.keys(invalidData).forEach(key => {
              formData.append(key, invalidData[key]);
            });

            // Add required file for refill (even with invalid data)
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Validation Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `validation-test-${Date.now()}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            formData.append('file', fs.createReadStream(dummyFilePath));

            try {
              await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
                headers: {
                  ...formData.getHeaders()
                }
              });
              // Clean up test file
              fs.unlinkSync(dummyFilePath);
              // If we get here, validation failed
              return false;
            } catch (error) {
              // Expected to fail due to validation
              console.log('Validation correctly rejected invalid data:', error.response?.status);
              return error.response?.status === 400 || error.response?.status === 422;
            }
          } catch (error) {
            console.error('Validation test failed:', error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Database Integrity',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Database Integrity',
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
    const reportPath = path.join(__dirname, 'direct-db-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'direct-db-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Direct Database Test Report Generated:');
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
    <title>Direct Database Test Report</title>
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
        <h1>🚀 Direct Database Test Report</h1>
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
}

// Run the direct database tests
const tester = new DirectDatabaseTester();
tester.runAllTests().catch(console.error);
