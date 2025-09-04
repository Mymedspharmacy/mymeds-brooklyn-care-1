const axios = require('axios');
const fs = require('fs');
const path = require('path');

class LiveIntegrationTester {
  constructor() {
    this.testResults = [];
    this.apiUrl = 'http://localhost:4000';
  }

  async runAllTests() {
    try {
      console.log('🌐 Testing Live WordPress Blog and WooCommerce Shop Integration...');
      
      console.log('\n📝 Testing WordPress Blog API...');
      await this.testWordPressBlog();
      
      console.log('\n🛒 Testing WooCommerce Shop API...');
      await this.testWooCommerceShop();
      
      console.log('\n🔗 Testing Frontend Integration...');
      await this.testFrontendIntegration();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Live integration test failed:', error);
    }
  }

  async testWordPressBlog() {
    const tests = [
      {
        name: 'WordPress API Connection Test',
        test: async () => {
          try {
            // Test the WordPress API endpoint
            const response = await axios.get(`${this.apiUrl}/api/wordpress/posts?per_page=5`);
            console.log('WordPress API Response Status:', response.status);
            console.log('WordPress Posts Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WordPress API Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WordPress Categories Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/wordpress/categories`);
            console.log('WordPress Categories Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WordPress Categories Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WordPress Featured Posts Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/wordpress/featured?per_page=3`);
            console.log('WordPress Featured Posts Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WordPress Featured Posts Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WordPress Search Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/wordpress/search?q=health`);
            console.log('WordPress Search Results Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WordPress Search Error:', error.response?.status || error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'WordPress Blog',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'WordPress Blog',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async testWooCommerceShop() {
    const tests = [
      {
        name: 'WooCommerce Products API Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/woocommerce/products?per_page=10`);
            console.log('WooCommerce Products Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WooCommerce Products Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Categories Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/woocommerce/categories`);
            console.log('WooCommerce Categories Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WooCommerce Categories Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Product Search Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/woocommerce/search?q=vitamin`);
            console.log('WooCommerce Search Results Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WooCommerce Search Error:', error.response?.status || error.message);
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Product by Category Test',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/woocommerce/products?category=1&per_page=5`);
            console.log('WooCommerce Category Products Found:', response.data?.length || 0);
            return response.status === 200;
          } catch (error) {
            console.error('WooCommerce Category Products Error:', error.response?.status || error.message);
            return false;
          }
        }
      }
    ];

    for (const test of tests) {
      try {
        const result = await test.test();
        this.testResults.push({
          category: 'WooCommerce Shop',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'WooCommerce Shop',
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
        name: 'Frontend WordPress Library Test',
        test: async () => {
          try {
            // Test if the frontend WordPress library can be imported and used
            const wordpressLibPath = path.join(__dirname, 'src/lib/wordpress.ts');
            if (fs.existsSync(wordpressLibPath)) {
              const content = fs.readFileSync(wordpressLibPath, 'utf8');
              const hasAPI = content.includes('wordPressAPI') && content.includes('getPosts');
              console.log('WordPress Frontend Library Functions:', hasAPI ? 'Available' : 'Missing');
              return hasAPI;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Frontend WooCommerce Library Test',
        test: async () => {
          try {
            const woocommerceLibPath = path.join(__dirname, 'src/lib/woocommerce.ts');
            if (fs.existsSync(woocommerceLibPath)) {
              const content = fs.readFileSync(woocommerceLibPath, 'utf8');
              const hasAPI = content.includes('wooCommerceAPI') && content.includes('getProducts');
              console.log('WooCommerce Frontend Library Functions:', hasAPI ? 'Available' : 'Missing');
              return hasAPI;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Blog Page Integration Test',
        test: async () => {
          try {
            const blogPagePath = path.join(__dirname, 'src/pages/Blog.tsx');
            if (fs.existsSync(blogPagePath)) {
              const content = fs.readFileSync(blogPagePath, 'utf8');
              const hasWordPress = content.includes('wordPressAPI') && content.includes('getPosts');
              console.log('Blog Page WordPress Integration:', hasWordPress ? 'Active' : 'Missing');
              return hasWordPress;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Shop Page Integration Test',
        test: async () => {
          try {
            const shopPagePath = path.join(__dirname, 'src/pages/Shop.tsx');
            if (fs.existsSync(shopPagePath)) {
              const content = fs.readFileSync(shopPagePath, 'utf8');
              const hasWooCommerce = content.includes('wooCommerceAPI') && content.includes('getProducts');
              console.log('Shop Page WooCommerce Integration:', hasWooCommerce ? 'Active' : 'Missing');
              return hasWooCommerce;
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

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.length,
        passed: this.testResults.filter(r => r.status === 'PASS').length,
        failed: this.testResults.filter(r => r.status === 'FAIL').length,
        errors: this.testResults.filter(r => r.status === 'ERROR').length
      },
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'live-integration-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'live-integration-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Live Integration Test Report Generated:');
    console.log(`  📄 JSON: ${reportPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${report.summary.total}`);
    console.log(`  ✅ Passed: ${report.summary.passed}`);
    console.log(`  ❌ Failed: ${report.summary.failed}`);
    console.log(`  ⚠️  Errors: ${report.summary.errors}`);
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    
    const wordPressTests = failedTests.filter(t => t.category === 'WordPress Blog');
    const wooCommerceTests = failedTests.filter(t => t.category === 'WooCommerce Shop');
    const frontendTests = failedTests.filter(t => t.category === 'Frontend Integration');

    if (wordPressTests.length > 0) {
      recommendations.push('WordPress blog is not fetching live data - check WordPress site configuration');
      recommendations.push('Verify WordPress REST API is enabled and accessible');
      recommendations.push('Check WordPress credentials and permissions');
    }

    if (wooCommerceTests.length > 0) {
      recommendations.push('WooCommerce shop is not fetching live data - check WooCommerce store configuration');
      recommendations.push('Verify WooCommerce REST API credentials');
      recommendations.push('Check WooCommerce store URL and API permissions');
    }

    if (frontendTests.length > 0) {
      recommendations.push('Frontend integration components need to be properly connected to APIs');
      recommendations.push('Verify environment variables are set correctly');
      recommendations.push('Check that API libraries are properly imported in frontend components');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Both WordPress blog and WooCommerce shop are successfully fetching live data!');
      recommendations.push('The blog at https://mymedspharmacyinc.com/blog should display WordPress posts');
      recommendations.push('The shop should display WooCommerce products with full functionality');
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
    <title>Live Integration Test Report</title>
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
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌐 Live Integration Test Report</h1>
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

// Run the live integration tests
const tester = new LiveIntegrationTester();
tester.runAllTests().catch(console.error);
