#!/usr/bin/env node

/**
 * Security Monitoring Script for MyMeds Pharmacy Backend
 * Run this script regularly to monitor security status
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityMonitor {
  constructor() {
    this.checks = [];
    this.failures = [];
    this.warnings = [];
  }

  // Check environment variables
  checkEnvironmentVariables() {
    console.log('🔍 Checking environment variables...');
    
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'FRONTEND_URL',
      'NODE_ENV'
    ];

    const sensitiveVars = [
      'JWT_SECRET',
      'DATABASE_URL',
      'WOOCOMMERCE_CONSUMER_SECRET'
    ];

    // Check required variables
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        this.failures.push(`Missing required environment variable: ${varName}`);
      } else {
        this.checks.push(`✅ ${varName} is set`);
      }
    });

    // Check JWT secret strength
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      if (jwtSecret.length < 32) {
        this.failures.push('JWT_SECRET is too short (minimum 32 characters)');
      } else if (jwtSecret.length < 64) {
        this.warnings.push('JWT_SECRET should be at least 64 characters for production');
      } else {
        this.checks.push('✅ JWT_SECRET is strong enough');
      }
    }

    // Check for weak secrets
    const weakSecrets = ['password', 'secret', 'key', '123456', 'admin'];
    sensitiveVars.forEach(varName => {
      const value = process.env[varName];
      if (value && weakSecrets.some(weak => value.toLowerCase().includes(weak))) {
        this.warnings.push(`${varName} may contain weak values`);
      }
    });
  }

  // Check package.json for vulnerabilities
  checkDependencies() {
    console.log('🔍 Checking dependencies...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for known vulnerable packages
      const vulnerablePackages = [
        'lodash',
        'moment',
        'jquery'
      ];

      vulnerablePackages.forEach(pkg => {
        if (dependencies[pkg]) {
          this.warnings.push(`Consider updating or replacing ${pkg} (potential security issues)`);
        }
      });

      this.checks.push('✅ Dependencies checked');
    } catch (error) {
      this.failures.push(`Failed to read package.json: ${error.message}`);
    }
  }

  // Check file permissions
  checkFilePermissions() {
    console.log('🔍 Checking file permissions...');
    
    const sensitiveFiles = [
      '.env',
      'create-admin-user.js',
      'security-monitor.js'
    ];

    sensitiveFiles.forEach(file => {
      try {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          const mode = stats.mode.toString(8);
          
          // Check if file is readable by others
          if (mode.endsWith('6') || mode.endsWith('7')) {
            this.warnings.push(`${file} has overly permissive permissions`);
          } else {
            this.checks.push(`✅ ${file} has appropriate permissions`);
          }
        }
      } catch (error) {
        this.failures.push(`Failed to check ${file}: ${error.message}`);
      }
    });
  }

  // Check for security headers
  checkSecurityHeaders() {
    console.log('🔍 Checking security configuration...');
    
    // Check if helmet is configured
    try {
      const indexFile = fs.readFileSync('src/index.ts', 'utf8');
      if (indexFile.includes('helmet')) {
        this.checks.push('✅ Helmet security headers are configured');
      } else {
        this.failures.push('Helmet security headers are not configured');
      }

      if (indexFile.includes('rateLimit')) {
        this.checks.push('✅ Rate limiting is configured');
      } else {
        this.failures.push('Rate limiting is not configured');
      }

      if (indexFile.includes('cors')) {
        this.checks.push('✅ CORS is configured');
      } else {
        this.failures.push('CORS is not configured');
      }
    } catch (error) {
      this.failures.push(`Failed to check security configuration: ${error.message}`);
    }
  }

  // Check database connection security
  checkDatabaseSecurity() {
    console.log('🔍 Checking database security...');
    
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      // Check if using SSL
      if (dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true')) {
        this.checks.push('✅ Database connection uses SSL');
      } else {
        this.warnings.push('Database connection should use SSL in production');
      }

      // Check if using strong password
      if (dbUrl.includes('password=')) {
        const passwordMatch = dbUrl.match(/password=([^@]+)/);
        if (passwordMatch && passwordMatch[1].length < 8) {
          this.warnings.push('Database password should be at least 8 characters');
        } else {
          this.checks.push('✅ Database password appears strong');
        }
      }
    } else {
      this.failures.push('DATABASE_URL is not set');
    }
  }

  // Generate security report
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 SECURITY MONITORING REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Passed checks: ${this.checks.length}`);
    console.log(`⚠️  Warnings: ${this.warnings.length}`);
    console.log(`❌ Failures: ${this.failures.length}`);
    
    if (this.checks.length > 0) {
      console.log(`\n✅ Passed Checks:`);
      this.checks.forEach(check => console.log(`  ${check}`));
    }
    
    if (this.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }
    
    if (this.failures.length > 0) {
      console.log(`\n❌ Failures (Must Fix):`);
      this.failures.forEach(failure => console.log(`  ${failure}`));
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      checks: this.checks,
      warnings: this.warnings,
      failures: this.failures,
      summary: {
        passed: this.checks.length,
        warnings: this.warnings.length,
        failures: this.failures.length
      }
    };
    
    const reportFile = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportFile}`);
    
    // Exit with error code if there are failures
    if (this.failures.length > 0) {
      console.log('\n🚨 Security issues found! Please fix failures before deployment.');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      console.log('\n⚠️  Security warnings found. Consider addressing them.');
      process.exit(0);
    } else {
      console.log('\n🎉 All security checks passed!');
      process.exit(0);
    }
  }

  // Run all checks
  async run() {
    console.log('🚀 Starting security monitoring...\n');
    
    this.checkEnvironmentVariables();
    this.checkDependencies();
    this.checkFilePermissions();
    this.checkSecurityHeaders();
    this.checkDatabaseSecurity();
    
    this.generateReport();
  }
}

// Run the security monitor
if (require.main === module) {
  const monitor = new SecurityMonitor();
  monitor.run().catch(error => {
    console.error('❌ Security monitoring failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityMonitor; 