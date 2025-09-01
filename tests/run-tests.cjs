#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const testFiles = {
  'api': 'test-all-apis.cjs',
  'basic-api': 'test-apis.cjs',
  'guest-checkout': 'test-guest-checkout.cjs',
  'smtp': 'test-smtp-service.cjs',
  'patient-portal': 'PATIENT_PORTAL_COMPREHENSIVE_TEST.cjs'
};

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

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function showHelp() {
  log('\n🚀 MyMeds Test Runner', 'bright');
  log('='.repeat(50), 'cyan');
  log('\nAvailable test suites:', 'yellow');
  
  Object.keys(testFiles).forEach((testName, index) => {
    log(`${index + 1}. ${testName} - ${testFiles[testName]}`, 'green');
  });
  
  log('\nUsage:', 'yellow');
  log('  node tests/run-tests.js [test-name]', 'cyan');
  log('  node tests/run-tests.js all', 'cyan');
  log('  node tests/run-tests.js help', 'cyan');
  
  log('\nExamples:', 'yellow');
  log('  node tests/run-tests.js api', 'cyan');
  log('  node tests/run-tests.js guest-checkout', 'cyan');
  log('  node tests/run-tests.js all', 'cyan');
  
  log('\nPrerequisites:', 'yellow');
  log('  - Backend server running on port 4000', 'cyan');
  log('  - Database connection (for full tests)', 'cyan');
  log('  - Required environment variables configured', 'cyan');
}

function runTest(testName) {
  const testFile = testFiles[testName];
  if (!testFile) {
    log(`❌ Test "${testName}" not found!`, 'red');
    showHelp();
    return;
  }
  
  const testPath = path.join(__dirname, testFile);
  if (!fs.existsSync(testPath)) {
    log(`❌ Test file "${testFile}" not found!`, 'red');
    return;
  }
  
  log(`\n🚀 Running ${testName} tests...`, 'bright');
  log(`📁 File: ${testFile}`, 'cyan');
  log('='.repeat(50), 'cyan');
  
  const child = spawn('node', [testPath], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  child.on('close', (code) => {
    log('\n' + '='.repeat(50), 'cyan');
    if (code === 0) {
      log(`✅ ${testName} tests completed successfully!`, 'green');
    } else {
      log(`❌ ${testName} tests failed with code ${code}`, 'red');
    }
  });
}

function runAllTests() {
  log('\n🚀 Running ALL test suites...', 'bright');
  log('='.repeat(50), 'cyan');
  
  const testNames = Object.keys(testFiles);
  let completed = 0;
  let failed = 0;
  
  testNames.forEach((testName, index) => {
    setTimeout(() => {
      log(`\n${index + 1}/${testNames.length} - Running ${testName}...`, 'yellow');
      
      const testFile = testFiles[testName];
      const testPath = path.join(__dirname, testFile);
      
      if (!fs.existsSync(testPath)) {
        log(`❌ Test file "${testFile}" not found!`, 'red');
        failed++;
        return;
      }
      
      const child = spawn('node', [testPath], {
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });
      
      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });
      
      child.on('close', (code) => {
        completed++;
        if (code === 0) {
          log(`✅ ${testName} completed`, 'green');
        } else {
          log(`❌ ${testName} failed`, 'red');
          failed++;
        }
        
        if (completed === testNames.length) {
          log('\n' + '='.repeat(50), 'cyan');
          log(`📊 Test Summary:`, 'bright');
          log(`✅ Completed: ${completed - failed}`, 'green');
          log(`❌ Failed: ${failed}`, 'red');
          log(`📈 Total: ${completed}`, 'cyan');
        }
      });
    }, index * 1000); // Run tests with 1-second delay between them
  });
}

// Main execution
const args = process.argv.slice(2);
const testName = args[0];

if (!testName || testName === 'help') {
  showHelp();
} else if (testName === 'all') {
  runAllTests();
} else {
  runTest(testName);
}
