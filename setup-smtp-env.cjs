#!/usr/bin/env node

/**
 * 🔧 SMTP Environment Setup Script
 * Helps configure SMTP settings for MyMeds Pharmacy
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function askQuestion(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    rl.question(`${question}${defaultValue ? ` (${defaultValue})` : ''}: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

async function setupSMTPEnvironment() {
  log('\n🔧 SMTP Environment Setup for MyMeds Pharmacy', 'bright');
  log('This script will help you configure SMTP settings for testing', 'cyan');
  
  const rl = createInterface();
  
  try {
    // SMTP Provider Selection
    log('\n📧 Select your SMTP provider:', 'blue');
    log('1. Office 365 / Outlook', 'cyan');
    log('2. Gmail', 'cyan');
    log('3. Custom SMTP Server', 'cyan');
    
    const providerChoice = await askQuestion(rl, 'Enter choice (1-3)', '1');
    
    let smtpConfig = {};
    
    switch (providerChoice) {
      case '1':
        log('\n🏢 Office 365 / Outlook Configuration', 'blue');
        smtpConfig = {
          SMTP_HOST: 'smtp.office365.com',
          SMTP_PORT: '587',
          SMTP_SECURE: 'false'
        };
        break;
        
      case '2':
        log('\n📱 Gmail Configuration', 'blue');
        log('Note: You need to use an App Password, not your regular password', 'yellow');
        smtpConfig = {
          SMTP_HOST: 'smtp.gmail.com',
          SMTP_PORT: '587',
          SMTP_SECURE: 'false'
        };
        break;
        
      case '3':
        log('\n⚙️  Custom SMTP Configuration', 'blue');
        smtpConfig = {
          SMTP_HOST: await askQuestion(rl, 'SMTP Host'),
          SMTP_PORT: await askQuestion(rl, 'SMTP Port', '587'),
          SMTP_SECURE: await askQuestion(rl, 'Use SSL/TLS? (true/false)', 'false')
        };
        break;
        
      default:
        log('Invalid choice, using Office 365 defaults', 'yellow');
        smtpConfig = {
          SMTP_HOST: 'smtp.office365.com',
          SMTP_PORT: '587',
          SMTP_SECURE: 'false'
        };
    }
    
    // Email credentials
    log('\n🔐 Email Credentials', 'blue');
    const emailUser = await askQuestion(rl, 'Email Address');
    const emailPass = await askQuestion(rl, 'Password or App Password');
    
    // Contact configuration
    log('\n📞 Contact Configuration', 'blue');
    const contactReceiver = await askQuestion(rl, 'Contact Form Receiver Email', emailUser);
    const adminEmail = await askQuestion(rl, 'Admin Email', emailUser);
    
    // Generate environment file content
    const envContent = `# SMTP Configuration for MyMeds Pharmacy
# Generated on ${new Date().toISOString()}

# SMTP Settings
SMTP_HOST=${smtpConfig.SMTP_HOST}
SMTP_PORT=${smtpConfig.SMTP_PORT}
SMTP_SECURE=${smtpConfig.SMTP_SECURE}
EMAIL_USER=${emailUser}
EMAIL_PASS=${emailPass}

# Contact Configuration
CONTACT_RECEIVER=${contactReceiver}
ADMIN_EMAIL=${adminEmail}

# Optional: Custom SMTP User/Pass (if different from EMAIL_USER/EMAIL_PASS)
SMTP_USER=${emailUser}
SMTP_PASS=${emailPass}

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:5173

# Database (if needed for testing)
DATABASE_URL="postgresql://username:password@localhost:5432/mymeds_test"

# JWT Secrets (for testing)
JWT_SECRET="test-jwt-secret-key-for-testing-only-minimum-32-characters"
JWT_REFRESH_SECRET="test-jwt-refresh-secret-key-for-testing-only-minimum-32-characters"
`;

    // Save to .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, envContent);
    
    log(`\n✅ Environment file created: ${envPath}`, 'green');
    
    // Create .env.example
    const exampleContent = envContent.replace(/=.+/g, '=your-value-here');
    const examplePath = path.join(__dirname, '.env.example');
    fs.writeFileSync(examplePath, exampleContent);
    
    log(`✅ Example file created: ${examplePath}`, 'green');
    
    // Instructions
    log('\n📋 Next Steps:', 'blue');
    log('1. Review the generated .env file', 'cyan');
    log('2. Update any values as needed', 'cyan');
    log('3. Test SMTP connection:', 'cyan');
    log(`   node test-smtp-service.cjs`, 'yellow');
    log('4. Check the testing guide:', 'cyan');
    log(`   SMTP_SERVICE_TESTING_GUIDE.md`, 'yellow');
    
    // Test connection option
    const testNow = await askQuestion(rl, '\nWould you like to test the SMTP connection now? (y/n)', 'y');
    
    if (testNow.toLowerCase() === 'y' || testNow.toLowerCase() === 'yes') {
      log('\n🧪 Testing SMTP connection...', 'blue');
      
      // Load environment variables
      require('dotenv').config({ path: envPath });
      
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        await transporter.verify();
        log('✅ SMTP connection successful!', 'green');
        log('🎉 Your email service is ready for testing!', 'green');
        
      } catch (error) {
        log('❌ SMTP connection failed:', 'red');
        log(`   ${error.message}`, 'red');
        log('\n🔧 Troubleshooting tips:', 'yellow');
        log('   - Check your email and password', 'cyan');
        log('   - Verify SMTP settings with your provider', 'cyan');
        log('   - Check if you need an App Password (Gmail)', 'cyan');
        log('   - Verify firewall/network settings', 'cyan');
      }
    }
    
  } catch (error) {
    log(`\n💥 Setup failed: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Check if dotenv is available
try {
  require('dotenv');
} catch (error) {
  log('⚠️  dotenv package not found. Installing...', 'yellow');
  log('   npm install dotenv', 'cyan');
  log('   Then run this script again.', 'cyan');
  process.exit(1);
}

// Check if nodemailer is available
try {
  require('nodemailer');
} catch (error) {
  log('⚠️  nodemailer package not found. Installing...', 'yellow');
  log('   npm install nodemailer', 'cyan');
  log('   Then run this script again.', 'cyan');
  process.exit(1);
}

// Run setup if called directly
if (require.main === module) {
  setupSMTPEnvironment();
}

module.exports = { setupSMTPEnvironment };


