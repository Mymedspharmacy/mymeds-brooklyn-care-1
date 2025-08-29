#!/usr/bin/env node

/**
 * 🔍 SMTP Service Testing Script
 * Tests all email functionality for MyMeds Pharmacy
 * 
 * This script verifies:
 * - SMTP connection and authentication
 * - Prescription refill emails
 * - Contact form emails
 * - Transfer request emails
 * - Newsletter subscription emails
 * - Admin password reset emails
 * - System alert emails
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test configuration
const testConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.office365.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_PASS || process.env.SMTP_PASS
    }
  },
  testEmails: {
    from: process.env.EMAIL_USER || process.env.SMTP_USER,
    to: process.env.CONTACT_RECEIVER || process.env.EMAIL_USER || process.env.SMTP_USER,
    adminEmail: process.env.ADMIN_EMAIL || 'admin@mymedspharmacy.com'
  }
};

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`❌ ${name}`, 'red');
  }
  if (details) {
    log(`   ${details}`, 'cyan');
  }
  testResults.details.push({ name, passed, details });
}

async function testSMTPConnection() {
  log('\n🔌 Testing SMTP Connection...', 'blue');
  
  try {
    // Check environment variables
    if (!testConfig.smtp.auth.user || !testConfig.smtp.auth.pass) {
      throw new Error('SMTP credentials not configured');
    }
    
    log(`   Host: ${testConfig.smtp.host}`, 'cyan');
    log(`   Port: ${testConfig.smtp.port}`, 'cyan');
    log(`   User: ${testConfig.smtp.auth.user}`, 'cyan');
    log(`   Secure: ${testConfig.smtp.secure}`, 'cyan');
    
    // Create transporter
    const transporter = nodemailer.createTransporter(testConfig.smtp);
    
    // Verify connection
    await transporter.verify();
    logTest('SMTP Connection', true, 'Connection verified successfully');
    
    return transporter;
  } catch (error) {
    logTest('SMTP Connection', false, error.message);
    return null;
  }
}

async function testPrescriptionRefillEmail(transporter) {
  log('\n💊 Testing Prescription Refill Email...', 'blue');
  
  try {
    const emailContent = `
New Prescription Refill Request

Patient Information:
- Name: John Doe
- Phone: (555) 123-4567
- Email: john.doe@example.com
- Prescription #: RX123456

Medication Details:
- Medication: Lisinopril 10mg
- Current Pharmacy: CVS Pharmacy
- Notes: Need refill by end of week

Submitted: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: New Prescription Refill Request from John Doe',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('Prescription Refill Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Prescription Refill Email', false, error.message);
    return false;
  }
}

async function testTransferRequestEmail(transporter) {
  log('\n🔄 Testing Transfer Request Email...', 'blue');
  
  try {
    const emailContent = `
New Prescription Transfer Request

Patient Information:
- Name: Jane Smith
- Phone: (555) 987-6543
- Email: jane.smith@example.com
- Prescription #: RX789012

Transfer Details:
- Current Pharmacy: Walgreens
- New Pharmacy: My Meds Pharmacy
- Medications: Metformin 500mg, Atorvastatin 20mg
- Reason: Moving to new area, prefer local pharmacy

Submitted: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: New Prescription Transfer Request from Jane Smith',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('Transfer Request Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Transfer Request Email', false, error.message);
    return false;
  }
}

async function testContactFormEmail(transporter) {
  log('\n📝 Testing Contact Form Email...', 'blue');
  
  try {
    const emailContent = `
New Contact Form Submission

Contact Information:
- Name: Robert Johnson
- Email: robert.johnson@example.com
- Phone: (555) 456-7890
- Subject: General Inquiry

Message:
Hello, I have a question about your pharmacy services. 
Do you offer medication synchronization for multiple prescriptions?

Additional Information:
- Service Type: General Inquiry
- Urgency Level: Normal
- Preferred Contact Method: Email
- Best Time to Contact: Afternoon
- Marketing Consent: Yes

Submitted: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: New Contact Form Submission: General Inquiry',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('Contact Form Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Contact Form Email', false, error.message);
    return false;
  }
}

async function testNewsletterSubscriptionEmail(transporter) {
  log('\n📧 Testing Newsletter Subscription Email...', 'blue');
  
  try {
    const emailContent = `
Welcome to My Meds Pharmacy Newsletter!

Thank you for subscribing to our newsletter. You'll now receive updates about:
• Special offers and promotions
• Health tips and wellness advice
• New products and services
• Pharmacy news and updates

You can unsubscribe at any time by clicking the unsubscribe link in our emails.

Best regards,
The My Meds Pharmacy Team

Subscription Details:
- Email: subscriber@example.com
- Source: Website
- Consent: Yes
- Date: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: Welcome to My Meds Pharmacy Newsletter!',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('Newsletter Subscription Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Newsletter Subscription Email', false, error.message);
    return false;
  }
}

async function testAdminPasswordResetEmail(transporter) {
  log('\n🔐 Testing Admin Password Reset Email...', 'blue');
  
  try {
    const resetUrl = 'https://mymedspharmacy.com/admin-reset?token=test-token-123';
    const emailContent = `
Admin Password Reset Request

You requested a password reset for your admin account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 30 minutes.

If you didn't request this reset, please ignore this email.

Security Information:
- Requested from: 192.168.1.100
- User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
- Timestamp: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.adminEmail,
      subject: 'Test: Admin Password Reset',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>').replace(resetUrl, `<a href="${resetUrl}">Reset Password</a>`)
    });
    
    logTest('Admin Password Reset Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Admin Password Reset Email', false, error.message);
    return false;
  }
}

async function testSystemAlertEmail(transporter) {
  log('\n🚨 Testing System Alert Email...', 'blue');
  
  try {
    const emailContent = `
MyMeds Pharmacy System Alert

Type: Warning
Subject: High Server Load Detected
Message: Server CPU usage has exceeded 80% for the last 5 minutes.

System Data:
- CPU Usage: 85%
- Memory Usage: 72%
- Active Connections: 45
- Response Time: 2.3s

Timestamp: ${new Date().toISOString()}

This is an automated alert. Please investigate if this continues.
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: [MyMeds Alert] High Server Load Detected',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('System Alert Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('System Alert Email', false, error.message);
    return false;
  }
}

async function testAppointmentRequestEmail(transporter) {
  log('\n📅 Testing Appointment Request Email...', 'blue');
  
  try {
    const emailContent = `
New Appointment Request

Patient Information:
- Name: Sarah Wilson
- Phone: (555) 321-6540
- Email: sarah.wilson@example.com

Appointment Details:
- Service: Medication Review
- Preferred Date: 2025-01-15
- Preferred Time: 2:00 PM
- Notes: Need to discuss new medication interactions

Submitted: ${new Date().toISOString()}
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: New Appointment Request: Medication Review',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('Appointment Request Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('Appointment Request Email', false, error.message);
    return false;
  }
}

async function testFileUploadNotificationEmail(transporter) {
  log('\n📎 Testing File Upload Notification Email...', 'blue');
  
  try {
    const emailContent = `
New Patient Document Upload

Patient Information:
- Name: Michael Brown
- Phone: (555) 654-3210
- Email: michael.brown@example.com

Document Details:
- File Type: Prescription Image
- File Name: prescription-20250108-123456.jpg
- File Size: 2.4 MB
- Upload Time: ${new Date().toISOString()}

Notes: Patient uploaded prescription for refill request

Document will be reviewed by pharmacy staff within 24 hours.
    `;
    
    const result = await transporter.sendMail({
      from: testConfig.testEmails.from,
      to: testConfig.testEmails.to,
      subject: 'Test: New Patient Document Upload: Michael Brown',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    
    logTest('File Upload Notification Email', true, `Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    logTest('File Upload Notification Email', false, error.message);
    return false;
  }
}

function generateTestReport() {
  log('\n📊 SMTP Service Test Report', 'magenta');
  log('=' .repeat(50), 'magenta');
  
  log(`\nTotal Tests: ${testResults.total}`, 'bright');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, 'red');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'bright');
  
  if (testResults.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.details
      .filter(test => !test.passed)
      .forEach(test => {
        log(`   - ${test.name}: ${test.details}`, 'red');
      });
  }
  
  log('\n✅ Passed Tests:', 'green');
  testResults.details
    .filter(test => test.passed)
    .forEach(test => {
      log(`   - ${test.name}`, 'green');
    });
  
  // Save report to file
  const reportPath = path.join(__dirname, 'smtp-test-report.txt');
  const reportContent = `
SMTP Service Test Report
Generated: ${new Date().toISOString()}

Total Tests: ${testResults.total}
Passed: ${testResults.passed}
Failed: ${testResults.failed}
Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%

${testResults.failed > 0 ? 'Failed Tests:\n' + testResults.details.filter(test => !test.passed).map(test => `- ${test.name}: ${test.details}`).join('\n') : ''}

Passed Tests:
${testResults.details.filter(test => test.passed).map(test => `- ${test.name}`).join('\n')}
  `;
  
  fs.writeFileSync(reportPath, reportContent);
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
}

async function runAllTests() {
  log('🚀 Starting SMTP Service Testing...', 'bright');
  log('Testing all email functionality for MyMeds Pharmacy', 'cyan');
  
  // Test SMTP connection first
  const transporter = await testSMTPConnection();
  if (!transporter) {
    log('\n❌ Cannot proceed with email tests - SMTP connection failed', 'red');
    return;
  }
  
  // Run all email tests
  await testPrescriptionRefillEmail(transporter);
  await testTransferRequestEmail(transporter);
  await testContactFormEmail(transporter);
  await testNewsletterSubscriptionEmail(transporter);
  await testAdminPasswordResetEmail(transporter);
  await testSystemAlertEmail(transporter);
  await testAppointmentRequestEmail(transporter);
  await testFileUploadNotificationEmail(transporter);
  
  // Generate and display report
  generateTestReport();
  
  // Summary
  if (testResults.failed === 0) {
    log('\n🎉 All SMTP tests passed! Email service is 100% working.', 'green');
  } else {
    log(`\n⚠️  ${testResults.failed} test(s) failed. Please check the configuration.`, 'yellow');
  }
}

// Check if running directly
if (require.main === module) {
  // Validate environment
  if (!testConfig.smtp.auth.user || !testConfig.smtp.auth.pass) {
    log('❌ SMTP credentials not configured!', 'red');
    log('Please set the following environment variables:', 'yellow');
    log('   EMAIL_USER or SMTP_USER', 'cyan');
    log('   EMAIL_PASS or SMTP_PASS', 'cyan');
    log('   SMTP_HOST (optional, defaults to smtp.office365.com)', 'cyan');
    log('   SMTP_PORT (optional, defaults to 587)', 'cyan');
    process.exit(1);
  }
  
  runAllTests().catch(error => {
    log(`\n💥 Test execution failed: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  testSMTPConnection,
  testPrescriptionRefillEmail,
  testTransferRequestEmail,
  testContactFormEmail,
  testNewsletterSubscriptionEmail,
  testAdminPasswordResetEmail,
  testSystemAlertEmail,
  testAppointmentRequestEmail,
  testFileUploadNotificationEmail,
  runAllTests
};


