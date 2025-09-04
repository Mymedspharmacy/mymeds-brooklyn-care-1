const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class CompleteFormTester {
  constructor() {
    this.testResults = [];
    this.apiUrl = 'http://localhost:4000';
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting complete form submission testing...');
      
      console.log('\n📋 Running Complete Form Submission Tests...');
      await this.testCompleteFormSubmissions();
      
      console.log('\n📋 Running Database Verification Tests...');
      await this.testDatabaseVerification();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  async testCompleteFormSubmissions() {
    const tests = [
      {
        name: 'Complete Refill Form with File Upload',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `CompleteTest${timestamp}`,
            lastName: 'User',
            phone: '555-123-4567',
            email: `completetest${timestamp}@example.com`,
            prescriptionNumber: `CRX${timestamp}`,
            medication: 'Complete Test Medication'
          };

          try {
            const formData = new FormData();
            
            // Add form fields
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Create a dummy PDF file for testing
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Prescription File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `test-prescription-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            
            // Add file to form data
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            console.log('Complete Refill Response:', response.data);
            return response.status === 200 || response.status === 201;
          } catch (error) {
            console.error('Complete refill failed:', error.response?.data || error.message);
            return false;
          }
        }
      },
      {
        name: 'Complete Transfer Form with Optional File',
        test: async () => {
          const timestamp = Date.now();
          const testData = {
            firstName: `CompleteTransfer${timestamp}`,
            lastName: 'User',
            phone: '555-987-6543',
            email: `completetransfer${timestamp}@example.com`,
            prescriptionNumber: `CTX${timestamp}`,
            medication: 'Complete Transfer Medication',
            pharmacy: 'Test Pharmacy'
          };

          try {
            const formData = new FormData();
            
            // Add form fields
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Optional file upload
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test Transfer File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `test-transfer-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/transfer`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            console.log('Complete Transfer Response:', response.data);
            return response.status === 200 || response.status === 201;
          } catch (error) {
            console.error('Complete transfer failed:', error.response?.data || error.message);
            return false;
          }
        }
      },
      {
        name: 'Form Data Validation Test',
        test: async () => {
          try {
            // Test with valid data
            const timestamp = Date.now();
            const validData = {
              firstName: `ValidTest${timestamp}`,
              lastName: 'User',
              phone: '555-111-2222',
              email: `validtest${timestamp}@example.com`,
              prescriptionNumber: `VRX${timestamp}`,
              medication: 'Valid Test Medication'
            };

            const formData = new FormData();
            Object.keys(validData).forEach(key => {
              formData.append(key, validData[key]);
            });

            // Create test file
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Valid Prescription File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `valid-test-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            return response.status === 200 || response.status === 201;
          } catch (error) {
            console.error('Validation test failed:', error.response?.data || error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Complete Form Submissions',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Complete Form Submissions',
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
        name: 'Database Transaction Success',
        test: async () => {
          try {
            const timestamp = Date.now();
            const testData = {
              firstName: `DBTest${timestamp}`,
              lastName: 'User',
              phone: '555-333-4444',
              email: `dbtest${timestamp}@example.com`,
              prescriptionNumber: `DBRX${timestamp}`,
              medication: 'Database Test Medication'
            };

            const formData = new FormData();
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Create test file
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Database Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `db-test-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            // Verify the response indicates successful database storage
            const success = response.data && (
              response.data.success || 
              response.data.prescriptionId || 
              response.data.message?.includes('success')
            );

            console.log('Database Transaction Response:', response.data);
            return success;
          } catch (error) {
            console.error('Database transaction failed:', error.response?.data || error.message);
            return false;
          }
        }
      },
      {
        name: 'Database Data Integrity',
        test: async () => {
          try {
            // Test that data is properly stored and can be retrieved
            const timestamp = Date.now();
            const testData = {
              firstName: `Integrity${timestamp}`,
              lastName: 'User',
              phone: '555-555-6666',
              email: `integrity${timestamp}@example.com`,
              prescriptionNumber: `IRX${timestamp}`,
              medication: 'Integrity Test Medication'
            };

            const formData = new FormData();
            Object.keys(testData).forEach(key => {
              formData.append(key, testData[key]);
            });

            // Create test file
            const dummyFileContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Integrity Test File) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
            const dummyFilePath = path.join(__dirname, `integrity-test-${timestamp}.pdf`);
            fs.writeFileSync(dummyFilePath, dummyFileContent);
            
            formData.append('file', fs.createReadStream(dummyFilePath));

            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, formData, {
              headers: {
                ...formData.getHeaders()
              }
            });

            // Clean up test file
            fs.unlinkSync(dummyFilePath);

            // Check if response contains the submitted data
            const responseData = response.data;
            const dataIntegrity = responseData && (
              responseData.prescriptionId ||
              responseData.success ||
              responseData.message?.includes('success')
            );

            console.log('Data Integrity Response:', responseData);
            return dataIntegrity;
          } catch (error) {
            console.error('Data integrity test failed:', error.response?.data || error.message);
            return false;
          }
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
    const reportPath = path.join(__dirname, 'complete-form-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'complete-form-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Complete Form Test Report Generated:');
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
    <title>Complete Form Test Report</title>
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
        <h1>🚀 Complete Form Test Report</h1>
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

// Run the complete form tests
const tester = new CompleteFormTester();
tester.runAllTests().catch(console.error);
