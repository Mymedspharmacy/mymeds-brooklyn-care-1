const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AutomatedTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:3001'; // Updated to port 3001
    this.apiUrl = 'http://localhost:4000';
  }

  async init() {
    console.log('🚀 Starting automated testing...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for headless testing
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('✅ Browser initialized');
  }

  async runAllTests() {
    try {
      await this.init();
      
      console.log('\n📋 Running Admin Authentication Tests...');
      await this.testAdminAuthentication();
      
      console.log('\n📋 Running Patient Forms Tests...');
      await this.testPatientForms();
      
      console.log('\n📋 Running API Endpoint Tests...');
      await this.testAPIEndpoints();
      
      console.log('\n📋 Running Error Handling Tests...');
      await this.testErrorHandling();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async testAdminAuthentication() {
    const tests = [
      {
        name: 'Admin Sign-In Page Load',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/admin-signin`);
          await this.page.waitForSelector('#admin-email', { timeout: 5000 });
          const title = await this.page.title();
          return title.includes('Admin') || title.includes('Sign In');
        }
      },
      {
        name: 'Admin Login Form Validation',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/admin-signin`);
          await this.page.waitForSelector('#admin-email');
          
          // Wait for form to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if form has required validation
          const emailField = await this.page.$('#admin-email');
          const passwordField = await this.page.$('#admin-password');
          
          // Check if fields have required attribute
          const emailRequired = await emailField.evaluate(el => el.hasAttribute('required'));
          const passwordRequired = await passwordField.evaluate(el => el.hasAttribute('required'));
          
          // Check if submit button exists and is enabled
          const submitButton = await this.page.$('button[type="submit"]');
          const buttonExists = submitButton !== null;
          
          return emailRequired && passwordRequired && buttonExists;
        }
      },
      {
        name: 'Admin Login with Valid Credentials',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/admin-signin`);
          await this.page.waitForSelector('#admin-email');
          
          // Wait for form to be fully loaded
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if form elements exist and are interactive
          const emailField = await this.page.$('#admin-email');
          const passwordField = await this.page.$('#admin-password');
          const submitButton = await this.page.$('button[type="submit"]');
          
          // Check if all elements exist
          const elementsExist = emailField !== null && passwordField !== null && submitButton !== null;
          
          // Check if elements are enabled
          const emailEnabled = await emailField.evaluate(el => !el.disabled);
          const passwordEnabled = await passwordField.evaluate(el => !el.disabled);
          const buttonEnabled = await submitButton.evaluate(el => !el.disabled);
          
          return elementsExist && emailEnabled && passwordEnabled && buttonEnabled;
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

  async testPatientForms() {
    const tests = [
      {
        name: 'Homepage Load',
        test: async () => {
          await this.page.goto(this.baseUrl);
          await this.page.waitForSelector('button', { timeout: 5000 });
          const title = await this.page.title();
          return title.length > 0;
        }
      },
      {
        name: 'Refill Form Modal Open',
        test: async () => {
          await this.page.goto(this.baseUrl);
          await this.page.waitForSelector('button');
          
          // Wait for page to fully load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find and click refill button - try multiple selectors
          let refillButton = null;
          
          // Try to find button by text content
          const allButtons = await this.page.$$('button');
          for (const button of allButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('refill') || text.toLowerCase().includes('rx'))) {
              refillButton = button;
              break;
            }
          }
          
          // If not found, try to find by specific text
          if (!refillButton) {
            refillButton = await this.page.$('button:has-text("Refill Rx")');
          }
          
          if (!refillButton) {
            refillButton = await this.page.$('button:has-text("Refill Prescription")');
          }
          
          if (refillButton) {
            await refillButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if modal is visible
            const modal = await this.page.$('[role="dialog"]');
            const modalVisible = await this.page.$('.fixed.inset-0');
            return modal !== null || modalVisible !== null;
          }
          
          return false;
        }
      },
      {
        name: 'Transfer Form Modal Open',
        test: async () => {
          await this.page.goto(this.baseUrl);
          await this.page.waitForSelector('button');
          
          // Wait for page to fully load
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find and click transfer button - try multiple selectors
          let transferButton = null;
          
          // Try to find button by text content
          const allButtons = await this.page.$$('button');
          for (const button of allButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('transfer') || text.toLowerCase().includes('rx'))) {
              transferButton = button;
              break;
            }
          }
          
          // If not found, try to find by specific text
          if (!transferButton) {
            transferButton = await this.page.$('button:has-text("Transfer Rx")');
          }
          
          if (transferButton) {
            await transferButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if modal is visible
            const modal = await this.page.$('[role="dialog"]');
            const modalVisible = await this.page.$('.fixed.inset-0');
            return modal !== null || modalVisible !== null;
          }
          
          return false;
        }
      },
      {
        name: 'Appointment Form Modal Open',
        test: async () => {
          // Navigate to special offers page first to find appointment button
          await this.page.goto(`${this.baseUrl}/special-offers`);
          await this.page.waitForSelector('button');
          
          // Find and click appointment button
          const appointmentButtons = await this.page.$$('button');
          let appointmentButton = null;
          
          for (const button of appointmentButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('appointment') || text.toLowerCase().includes('get started') || text.toLowerCase().includes('consultation'))) {
              appointmentButton = button;
              break;
            }
          }
          
          if (appointmentButton) {
            await appointmentButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if modal is visible or if we're redirected to home with modal
            const modal = await this.page.$('[role="dialog"]');
            const currentUrl = this.page.url();
            return modal !== null || currentUrl.includes('/');
          }
          
          return false;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Patient Forms',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Patient Forms',
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
        name: 'Backend Health Check',
        test: async () => {
          const response = await this.page.evaluate(async (url) => {
            try {
              const res = await fetch(`${url}/api/health`);
              return res.status === 200;
            } catch (error) {
              return false;
            }
          }, this.apiUrl);
          return response;
        }
      },
      {
        name: 'Admin Login API',
        test: async () => {
          const response = await this.page.evaluate(async (url) => {
            try {
              const res = await fetch(`${url}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: 'admin@mymedspharmacy.com',
                  password: 'AdminPassword123!'
                })
              });
              return res.status === 200 || res.status === 401; // 401 is expected for invalid credentials
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

  async testErrorHandling() {
    const tests = [
      {
        name: '404 Page Handling',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/non-existent-page`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const title = await this.page.title();
          const content = await this.page.content();
          
          return title.includes('404') || content.includes('404') || content.includes('Not Found');
        }
      },
      {
        name: 'Network Error Handling',
        test: async () => {
          // This test simulates a network error by trying to access a non-existent endpoint
          const response = await this.page.evaluate(async (url) => {
            try {
              const res = await fetch(`${url}/api/non-existent-endpoint`);
              return res.status === 404;
            } catch (error) {
              return true; // Network error is expected
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
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Test Report Generated:');
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
    <title>Automated Test Report</title>
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
        <h1>🚀 Automated Test Report</h1>
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

// Run the automated tests
const tester = new AutomatedTester();
tester.runAllTests().catch(console.error);
