const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class EndToEndTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
    this.baseUrl = 'http://localhost:3001';
    this.apiUrl = 'http://localhost:4000';
  }

  async init() {
    console.log('🚀 Starting end-to-end testing...');
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
      
      console.log('\n📋 Running Form Submission Tests...');
      await this.testFormSubmissions();
      
      console.log('\n📋 Running Admin Dashboard Tests...');
      await this.testAdminDashboard();
      
      console.log('\n📋 Running API Integration Tests...');
      await this.testAPIIntegration();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  async testFormSubmissions() {
    const tests = [
      {
        name: 'Refill Form Complete Submission',
        test: async () => {
          await this.page.goto(this.baseUrl);
          await this.page.waitForSelector('button');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find and click refill button
          let refillButton = null;
          const allButtons = await this.page.$$('button');
          for (const button of allButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('refill') || text.toLowerCase().includes('rx'))) {
              refillButton = button;
              break;
            }
          }
          
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
            if (!modal) return false;
            
            // Fill out the form
            await this.page.type('input[name="firstName"]', 'John');
            await this.page.type('input[name="lastName"]', 'Doe');
            await this.page.type('input[name="phone"]', '555-123-4567');
            await this.page.type('input[name="email"]', 'john.doe@example.com');
            
            // Go to next step
            const nextButton = await this.page.$('button:has-text("Next Step")');
            if (nextButton) {
              await nextButton.click();
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Fill prescription information
              await this.page.type('input[name="prescriptionNumber"]', 'RX123456');
              await this.page.type('input[name="medication"]', 'Test Medication');
            }
            
            // Submit the form
            const submitButton = await this.page.$('button[type="submit"]');
            if (submitButton) {
              await submitButton.click();
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // Check for success message or redirect
              const pageContent = await this.page.content();
              const hasSuccessMessage = pageContent.includes('success') || 
                                       pageContent.includes('submitted') || 
                                       pageContent.includes('thank you');
              
              return hasSuccessMessage;
            }
          }
          
          return false;
        }
      },
      {
        name: 'Transfer Form Complete Submission',
        test: async () => {
          await this.page.goto(this.baseUrl);
          await this.page.waitForSelector('button');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find and click transfer button
          let transferButton = null;
          const allButtons = await this.page.$$('button');
          for (const button of allButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('transfer') || text.toLowerCase().includes('rx'))) {
              transferButton = button;
              break;
            }
          }
          
          if (!transferButton) {
            transferButton = await this.page.$('button:has-text("Transfer Rx")');
          }
          
          if (transferButton) {
            await transferButton.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Check if modal is visible
            const modal = await this.page.$('[role="dialog"]');
            if (!modal) return false;
            
            // Fill out the form
            await this.page.type('input[name="firstName"]', 'Jane');
            await this.page.type('input[name="lastName"]', 'Smith');
            await this.page.type('input[name="phone"]', '555-987-6543');
            await this.page.type('input[name="email"]', 'jane.smith@example.com');
            
            // Go to next step
            const nextButton = await this.page.$('button:has-text("Next Step")');
            if (nextButton) {
              await nextButton.click();
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Fill prescription information
              await this.page.type('input[name="prescriptionNumber"]', 'RX789012');
              await this.page.type('input[name="medication"]', 'Transfer Medication');
              await this.page.type('input[name="pharmacy"]', 'CVS Pharmacy');
            }
            
            // Submit the form
            const submitButton = await this.page.$('button[type="submit"]');
            if (submitButton) {
              await submitButton.click();
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // Check for success message
              const pageContent = await this.page.content();
              const hasSuccessMessage = pageContent.includes('success') || 
                                       pageContent.includes('submitted') || 
                                       pageContent.includes('thank you');
              
              return hasSuccessMessage;
            }
          }
          
          return false;
        }
      },
      {
        name: 'Appointment Form Complete Submission',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/special-offers`);
          await this.page.waitForSelector('button');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Find appointment button
          let appointmentButton = null;
          const allButtons = await this.page.$$('button');
          for (const button of allButtons) {
            const text = await button.evaluate(el => el.textContent);
            if (text && (text.toLowerCase().includes('get started') || text.toLowerCase().includes('consultation'))) {
              appointmentButton = button;
              break;
            }
          }
          
          if (appointmentButton) {
            await appointmentButton.click();
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if we're on home page with modal open
            const currentUrl = this.page.url();
            if (currentUrl.includes('/')) {
              // Wait for modal to appear
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Check if modal is visible
              const modal = await this.page.$('[role="dialog"]');
              if (modal) {
                // Fill out the form
                await this.page.type('input[name="name"]', 'Test User');
                await this.page.type('input[name="email"]', 'test@example.com');
                await this.page.type('input[name="phone"]', '555-111-2222');
                await this.page.type('input[name="date"]', '2024-12-25');
                await this.page.type('input[name="time"]', '14:00');
                
                // Submit the form
                const submitButton = await this.page.$('button[type="submit"]');
                if (submitButton) {
                  await submitButton.click();
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  
                  // Check for success message
                  const pageContent = await this.page.content();
                  const hasSuccessMessage = pageContent.includes('success') || 
                                           pageContent.includes('submitted') || 
                                           pageContent.includes('thank you');
                  
                  return hasSuccessMessage;
                }
              }
            }
          }
          
          return false;
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Form Submissions',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Form Submissions',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAdminDashboard() {
    const tests = [
      {
        name: 'Admin Dashboard Access',
        test: async () => {
          await this.page.goto(`${this.baseUrl}/admin-signin`);
          await this.page.waitForSelector('#admin-email');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Fill in credentials
          await this.page.type('#admin-email', 'admin@mymedspharmacy.com');
          await this.page.type('#admin-password', 'AdminPassword123!');
          
          // Submit form
          const submitButton = await this.page.$('button[type="submit"]');
          if (submitButton) {
            await submitButton.click();
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Check if redirected to admin dashboard
            const currentUrl = this.page.url();
            return currentUrl.includes('/admin');
          }
          
          return false;
        }
      },
      {
        name: 'Admin Dashboard Navigation',
        test: async () => {
          // This test assumes we're already on the admin dashboard
          const currentUrl = this.page.url();
          if (!currentUrl.includes('/admin')) {
            return false;
          }
          
          // Wait for dashboard to load
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Check if dashboard elements are present
          const dashboardElements = await this.page.$$('[role="tab"]');
          const hasTabs = dashboardElements.length > 0;
          
          // Check for common dashboard elements
          const hasCards = await this.page.$('.card') !== null;
          const hasTables = await this.page.$('table') !== null;
          
          return hasTabs && (hasCards || hasTables);
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'Admin Dashboard',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Admin Dashboard',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testAPIIntegration() {
    const tests = [
      {
        name: 'Form Data Reaches Backend',
        test: async () => {
          // Test if form submissions actually reach the backend
          const response = await this.page.evaluate(async (url) => {
            try {
              const formData = new FormData();
              formData.append('firstName', 'Test');
              formData.append('lastName', 'User');
              formData.append('phone', '555-123-4567');
              formData.append('medication', 'Test Medication');
              
              const res = await fetch(`${url}/api/prescriptions/refill`, {
                method: 'POST',
                body: formData
              });
              
              return res.status === 200 || res.status === 201;
            } catch (error) {
              return false;
            }
          }, this.apiUrl);
          
          return response;
        }
      },
      {
        name: 'Admin Authentication Works',
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
          category: 'API Integration',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'API Integration',
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
    const reportPath = path.join(__dirname, 'end-to-end-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'end-to-end-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 End-to-End Test Report Generated:');
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
    <title>End-to-End Test Report</title>
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
        <h1>🚀 End-to-End Test Report</h1>
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

// Run the end-to-end tests
const tester = new EndToEndTester();
tester.runAllTests().catch(console.error);
