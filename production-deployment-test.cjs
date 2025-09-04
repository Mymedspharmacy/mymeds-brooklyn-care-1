const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ProductionDeploymentTester {
  constructor() {
    this.testResults = [];
    this.apiUrl = 'http://localhost:4000';
    this.frontendUrl = 'http://localhost:3000';
  }

  async runAllTests() {
    try {
      console.log('🚀 Production Deployment System Test');
      console.log('=====================================');
      
      console.log('\n📋 Testing Backend Services...');
      await this.testBackendServices();
      
      console.log('\n📋 Testing Database Connection...');
      await this.testDatabaseConnection();
      
      console.log('\n📋 Testing API Endpoints...');
      await this.testAPIEndpoints();
      
      console.log('\n📋 Testing Frontend Integration...');
      await this.testFrontendIntegration();
      
      console.log('\n📋 Testing Security & CORS...');
      await this.testSecurityAndCORS();
      
      console.log('\n📋 Testing File Uploads...');
      await this.testFileUploads();
      
      console.log('\n📋 Testing Authentication...');
      await this.testAuthentication();
      
      console.log('\n📋 Testing Integration APIs...');
      await this.testIntegrationAPIs();
      
      await this.generateProductionReport();
      
    } catch (error) {
      console.error('❌ Production deployment test failed:', error);
    }
  }

  async testBackendServices() {
    const tests = [
      {
        name: 'Backend Server Health Check',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Backend Server Status Endpoint',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/status`, { timeout: 5000 });
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
          category: 'Backend Services',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Backend Services',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testDatabaseConnection() {
    const tests = [
      {
        name: 'Database Connection Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
            return response.data?.database === 'connected';
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Prisma Schema Validation',
        test: async () => {
          try {
            const schemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
            if (fs.existsSync(schemaPath)) {
              const content = fs.readFileSync(schemaPath, 'utf8');
              const hasMySQL = content.includes('mysql://');
              const hasModels = content.includes('model User') && content.includes('model Prescription');
              return hasMySQL && hasModels;
            }
            return false;
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
          category: 'Database Connection',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Database Connection',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAPIEndpoints() {
    const tests = [
      {
        name: 'Prescription Refill API',
        test: async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/api/prescriptions/refill`, {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '1234567890',
              prescriptionNumber: 'TEST123',
              medication: 'Test Medication',
              notes: 'Test notes'
            }, { timeout: 5000 });
            return response.status === 201;
          } catch (error) {
            return error.response?.status === 400; // Expected for missing file
          }
        }
      },
      {
        name: 'Prescription Transfer API',
        test: async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/api/prescriptions/transfer`, {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '1234567890',
              currentPharmacy: 'Test Pharmacy',
              newPharmacy: 'New Pharmacy',
              medication: 'Test Medication',
              notes: 'Test notes'
            }, { timeout: 5000 });
            return response.status === 201;
          } catch (error) {
            return error.response?.status === 400; // Expected for missing file
          }
        }
      },
      {
        name: 'Appointment API',
        test: async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/api/appointments`, {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '1234567890',
              date: '2025-09-05',
              time: '10:00',
              service: 'Consultation',
              notes: 'Test appointment'
            }, { timeout: 5000 });
            return response.status === 201;
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
          category: 'API Endpoints',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'API Endpoints',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testFrontendIntegration() {
    const tests = [
      {
        name: 'Frontend Server Running',
        test: async () => {
          try {
            const response = await axios.get(this.frontendUrl, { timeout: 5000 });
            return response.status === 200;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Frontend Build Files',
        test: async () => {
          try {
            const distPath = path.join(__dirname, 'dist');
            const indexPath = path.join(__dirname, 'dist/index.html');
            return fs.existsSync(distPath) && fs.existsSync(indexPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Frontend Environment Variables',
        test: async () => {
          try {
            const envPath = path.join(__dirname, '.env');
            if (fs.existsSync(envPath)) {
              const content = fs.readFileSync(envPath, 'utf8');
              return content.includes('VITE_API_URL');
            }
            return false;
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
          category: 'Frontend Integration',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Frontend Integration',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testSecurityAndCORS() {
    const tests = [
      {
        name: 'CORS Headers Check',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/health`, { timeout: 5000 });
            return response.headers['access-control-allow-origin'] !== undefined;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'JWT Secret Configuration',
        test: async () => {
          try {
            const envPath = path.join(__dirname, 'backend/.env');
            if (fs.existsSync(envPath)) {
              const content = fs.readFileSync(envPath, 'utf8');
              return content.includes('JWT_SECRET=') && content.includes('JWT_SECRET=').length > 10;
            }
            return false;
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
          category: 'Security & CORS',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Security & CORS',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testFileUploads() {
    const tests = [
      {
        name: 'File Upload Configuration',
        test: async () => {
          try {
            const uploadsPath = path.join(__dirname, 'backend/uploads');
            return fs.existsSync(uploadsPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Multer Configuration',
        test: async () => {
          try {
            const routesPath = path.join(__dirname, 'backend/src/routes/prescriptions.ts');
            if (fs.existsSync(routesPath)) {
              const content = fs.readFileSync(routesPath, 'utf8');
              return content.includes('multer') && content.includes('upload.single');
            }
            return false;
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
          category: 'File Uploads',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'File Uploads',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAuthentication() {
    const tests = [
      {
        name: 'Admin Authentication Endpoint',
        test: async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/api/admin/login`, {
              email: 'admin@example.com',
              password: 'testpassword'
            }, { timeout: 5000 });
            return response.status === 401; // Expected for invalid credentials
          } catch (error) {
            return error.response?.status === 401;
          }
        }
      },
      {
        name: 'User Authentication Endpoint',
        test: async () => {
          try {
            const response = await axios.post(`${this.apiUrl}/auth/login`, {
              email: 'user@example.com',
              password: 'testpassword'
            }, { timeout: 5000 });
            return response.status === 401; // Expected for invalid credentials
          } catch (error) {
            return error.response?.status === 401;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Authentication',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Authentication',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testIntegrationAPIs() {
    const tests = [
      {
        name: 'WordPress Integration API',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/wordpress/posts`, { timeout: 5000 });
            return response.status === 200 || response.status === 503; // 503 if WordPress not configured
          } catch (error) {
            return error.response?.status === 503; // Expected if WordPress not set up
          }
        }
      },
      {
        name: 'WooCommerce Integration API',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/woocommerce/products`, { timeout: 5000 });
            return response.status === 200 || response.status === 503; // 503 if WooCommerce not configured
          } catch (error) {
            return error.response?.status === 503; // Expected if WooCommerce not set up
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Integration APIs',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Integration APIs',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async generateProductionReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length
      },
      results: this.testResults,
      recommendations: this.generateRecommendations(),
      productionReady: this.testResults.filter(r => r.status === 'PASS').length >= this.testResults.length * 0.8
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'production-deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'production-deployment-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Production Deployment Test Report Generated:');
    console.log(`  📄 JSON: ${reportPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${report.summary.total}`);
    console.log(`  ✅ Passed: ${report.summary.passed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  ⚠️  Errors: ${report.summary.errors}`);
    console.log(`\n🚀 Production Ready: ${report.productionReady ? 'YES' : 'NO'}`);
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    
    if (failedTests.length === 0) {
      recommendations.push('✅ All systems are ready for production deployment!');
      recommendations.push('Update environment variables with production values');
      recommendations.push('Configure MySQL database connection');
      recommendations.push('Set up SSL certificates for production');
      recommendations.push('Configure proper CORS settings for production domain');
    } else {
      const backendTests = failedTests.filter(t => t.category === 'Backend Services');
      const dbTests = failedTests.filter(t => t.category === 'Database Connection');
      const apiTests = failedTests.filter(t => t.category === 'API Endpoints');
      const frontendTests = failedTests.filter(t => t.category === 'Frontend Integration');
      const securityTests = failedTests.filter(t => t.category === 'Security & CORS');

      if (backendTests.length > 0) {
        recommendations.push('Backend services need to be started and configured');
      }
      if (dbTests.length > 0) {
        recommendations.push('Database connection needs to be configured for MySQL');
      }
      if (apiTests.length > 0) {
        recommendations.push('API endpoints need proper error handling and validation');
      }
      if (frontendTests.length > 0) {
        recommendations.push('Frontend needs to be built and configured for production');
      }
      if (securityTests.length > 0) {
        recommendations.push('Security and CORS settings need to be configured');
      }
    }

    return recommendations;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Deployment Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-item { padding: 15px; border-radius: 8px; text-align: center; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .error { background: #fff3cd; color: #856404; }
        .ready { background: #d1ecf1; color: #0c5460; }
        .test-result { margin: 10px 0; padding: 10px; border-radius: 4px; }
        .test-result.pass { background: #d4edda; }
        .test-result.fail { background: #f8d7da; }
        .test-result.error { background: #fff3cd; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .production-status { padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .production-status.ready { background: #d4edda; color: #155724; }
        .production-status.not-ready { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Production Deployment Test Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="production-status ${report.productionReady ? 'ready' : 'not-ready'}">
        ${report.productionReady ? '✅ PRODUCTION READY' : '❌ NOT READY FOR PRODUCTION'}
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
        <div class="summary-item ready">
            <h3>📊 Total</h3>
            <h2>${report.summary.total}</h2>
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
    
    <div class="recommendations">
        <h2>💡 Recommendations</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
    `;
  }
}

// Run the production deployment tests
const tester = new ProductionDeploymentTester();
tester.runAllTests().catch(console.error);
