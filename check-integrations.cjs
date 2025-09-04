const axios = require('axios');
const fs = require('fs');
const path = require('path');

class IntegrationChecker {
  constructor() {
    this.testResults = [];
    this.apiUrl = 'http://localhost:4000';
  }

  async runAllChecks() {
    try {
      console.log('🔍 Checking WooCommerce and WordPress Integration Settings...');
      
      console.log('\n📋 Checking WooCommerce Settings...');
      await this.checkWooCommerceSettings();
      
      console.log('\n📋 Checking WordPress Settings...');
      await this.checkWordPressSettings();
      
      console.log('\n📋 Checking Frontend Integration...');
      await this.checkFrontendIntegration();
      
      console.log('\n📋 Checking Environment Variables...');
      await this.checkEnvironmentVariables();
      
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Integration check failed:', error);
    }
  }

  async checkWooCommerceSettings() {
    const tests = [
      {
        name: 'WooCommerce Backend API Status',
        test: async () => {
          try {
            const response = await axios.get(`${this.apiUrl}/api/health`);
            return response.status === 200;
          } catch (error) {
            console.error('Backend not running:', error.message);
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Settings Model',
        test: async () => {
          try {
            // Check if WooCommerceSettings model exists in schema
            const schemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
            if (fs.existsSync(schemaPath)) {
              const schemaContent = fs.readFileSync(schemaPath, 'utf8');
              return schemaContent.includes('WooCommerceSettings') || schemaContent.includes('wooCommerceSettings');
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Routes Available',
        test: async () => {
          try {
            const routesPath = path.join(__dirname, 'backend/src/routes/woocommerce.ts');
            return fs.existsSync(routesPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Frontend Library',
        test: async () => {
          try {
            const libPath = path.join(__dirname, 'src/lib/woocommerce.ts');
            return fs.existsSync(libPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WooCommerce Shop Page',
        test: async () => {
          try {
            const shopPath = path.join(__dirname, 'src/pages/Shop.tsx');
            return fs.existsSync(shopPath);
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
          category: 'WooCommerce Settings',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'WooCommerce Settings',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async checkWordPressSettings() {
    const tests = [
      {
        name: 'WordPress Backend Routes',
        test: async () => {
          try {
            const routesPath = path.join(__dirname, 'backend/src/routes/wordpress.ts');
            return fs.existsSync(routesPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WordPress Frontend Library',
        test: async () => {
          try {
            const libPath = path.join(__dirname, 'src/lib/wordpress.ts');
            return fs.existsSync(libPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WordPress Blog Page',
        test: async () => {
          try {
            const blogPath = path.join(__dirname, 'src/pages/Blog.tsx');
            return fs.existsSync(blogPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'WordPress Settings Model',
        test: async () => {
          try {
            const schemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
            if (fs.existsSync(schemaPath)) {
              const schemaContent = fs.readFileSync(schemaPath, 'utf8');
              return schemaContent.includes('WordPressSettings') || schemaContent.includes('wordPressSettings');
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
          category: 'WordPress Settings',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'WordPress Settings',
          test: test.name,
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.log(`  ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  async checkFrontendIntegration() {
    const tests = [
      {
        name: 'WooCommerce Checkout Components',
        test: async () => {
          try {
            const checkoutPath = path.join(__dirname, 'src/components/WooCommerceCheckout.tsx');
            const checkoutFormPath = path.join(__dirname, 'src/components/WooCommerceCheckoutForm.tsx');
            return fs.existsSync(checkoutPath) && fs.existsSync(checkoutFormPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Shop Section Component',
        test: async () => {
          try {
            const shopSectionPath = path.join(__dirname, 'src/components/ShopSection.tsx');
            return fs.existsSync(shopSectionPath);
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Package.json WooCommerce Dependencies',
        test: async () => {
          try {
            const packagePath = path.join(__dirname, 'package.json');
            if (fs.existsSync(packagePath)) {
              const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
              return packageContent.dependencies && 
                     (packageContent.dependencies['@woocommerce/woocommerce-rest-api'] || 
                      packageContent.devDependencies['@woocommerce/woocommerce-rest-api']);
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

  async checkEnvironmentVariables() {
    const tests = [
      {
        name: 'Production WooCommerce Config',
        test: async () => {
          try {
            const envPath = path.join(__dirname, 'backend/env.production');
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf8');
              const hasWooCommerce = envContent.includes('WOOCOMMERCE_STORE_URL') && 
                                   envContent.includes('WOOCOMMERCE_CONSUMER_KEY') && 
                                   envContent.includes('WOOCOMMERCE_CONSUMER_SECRET');
              const hasFeatureFlag = envContent.includes('FEATURE_WOOCOMMERCE_ENABLED=true');
              return hasWooCommerce && hasFeatureFlag;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Production WordPress Config',
        test: async () => {
          try {
            const envPath = path.join(__dirname, 'backend/env.production');
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf8');
              const hasWordPress = envContent.includes('WORDPRESS_URL') && 
                                 envContent.includes('WORDPRESS_USERNAME') && 
                                 envContent.includes('WORDPRESS_PASSWORD');
              const hasFeatureFlag = envContent.includes('FEATURE_WORDPRESS_ENABLED=true');
              return hasWordPress && hasFeatureFlag;
            }
            return false;
          } catch (error) {
            return false;
          }
        }
      },
      {
        name: 'Frontend Environment Config',
        test: async () => {
          try {
            const envPath = path.join(__dirname, 'frontend.env.production');
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf8');
              const hasWordPress = envContent.includes('VITE_WORDPRESS_ENABLED=true') && 
                                 envContent.includes('VITE_WORDPRESS_URL');
              return hasWordPress;
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
          category: 'Environment Variables',
          test: test.name,
          status: result ? 'PASS' : 'FAIL',
          timestamp: new Date().toISOString()
        });
        console.log(`  ${result ? '✅' : '❌'} ${test.name}`);
      } catch (error) {
        this.testResults.push({
          category: 'Environment Variables',
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
    const reportPath = path.join(__dirname, 'integration-check-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'integration-check-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Integration Check Report Generated:');
    console.log(`  📄 JSON: ${reportPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`  Total Checks: ${report.summary.total}`);
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
    
    const wooCommerceTests = failedTests.filter(t => t.category === 'WooCommerce Settings');
    const wordPressTests = failedTests.filter(t => t.category === 'WordPress Settings');
    const frontendTests = failedTests.filter(t => t.category === 'Frontend Integration');
    const envTests = failedTests.filter(t => t.category === 'Environment Variables');

    if (wooCommerceTests.length > 0) {
      recommendations.push('Configure WooCommerce integration: Set up store URL, consumer key, and consumer secret in environment variables');
      recommendations.push('Add WooCommerceSettings model to Prisma schema if missing');
      recommendations.push('Ensure WooCommerce backend routes are properly configured');
    }

    if (wordPressTests.length > 0) {
      recommendations.push('Configure WordPress integration: Set up site URL, username, and application password');
      recommendations.push('Add WordPressSettings model to Prisma schema if missing');
      recommendations.push('Ensure WordPress backend routes are properly configured');
    }

    if (frontendTests.length > 0) {
      recommendations.push('Install WooCommerce REST API package: npm install @woocommerce/woocommerce-rest-api');
      recommendations.push('Create missing frontend components for WooCommerce checkout and shop functionality');
    }

    if (envTests.length > 0) {
      recommendations.push('Update production environment files with proper WooCommerce and WordPress credentials');
      recommendations.push('Enable feature flags for WooCommerce and WordPress in production environment');
    }

    if (recommendations.length === 0) {
      recommendations.push('All integrations appear to be properly configured!');
      recommendations.push('Next steps: Configure actual WooCommerce store URL and credentials for production');
      recommendations.push('Next steps: Configure actual WordPress site URL and credentials for production');
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
    <title>Integration Check Report</title>
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
        <h1>🔍 Integration Check Report</h1>
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
    
    <h2>📋 Check Results</h2>
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

// Run the integration checks
const checker = new IntegrationChecker();
checker.runAllChecks().catch(console.error);
