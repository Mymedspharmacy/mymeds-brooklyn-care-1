#!/usr/bin/env node

/**
 * Generate Admin Password Hash
 * 
 * This script generates a bcrypt hash for the admin password.
 * Run this script to generate a secure hash for your admin password.
 * 
 * Usage:
 *   node scripts/generate-admin-password-hash.js "YourSecurePassword123!"
 * 
 * Or run interactively:
 *   node scripts/generate-admin-password-hash.js
 */

const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generatePasswordHash(password) {
  if (!password) {
    throw new Error('Password is required');
  }

  // Validate password strength
  if (password.length < 12) {
    throw new Error('Password must be at least 12 characters long');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }

  // Generate hash with salt rounds 12 (recommended for production)
  const hash = bcrypt.hashSync(password, 12);
  return hash;
}

function main() {
  const password = process.argv[2];

  if (password) {
    // Password provided as argument
    try {
      const hash = generatePasswordHash(password);
      console.log('\n🔐 Admin Password Hash Generated Successfully!\n');
      console.log('Add this to your environment variables:');
      console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
      console.log('⚠️  Keep this hash secure and never commit it to version control!\n');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } else {
    // Interactive mode
    console.log('🔐 Admin Password Hash Generator\n');
    console.log('Password requirements:');
    console.log('- At least 12 characters long');
    console.log('- Contains uppercase letter');
    console.log('- Contains lowercase letter');
    console.log('- Contains number');
    console.log('- Contains special character (@$!%*?&)\n');

    rl.question('Enter admin password: ', (password) => {
      try {
        const hash = generatePasswordHash(password);
        console.log('\n🔐 Admin Password Hash Generated Successfully!\n');
        console.log('Add this to your environment variables:');
        console.log(`ADMIN_PASSWORD_HASH="${hash}"\n`);
        console.log('⚠️  Keep this hash secure and never commit it to version control!\n');
        rl.close();
      } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nPlease try again with a stronger password.\n');
        rl.close();
      }
    });
  }
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
  console.log('\n\n👋 Goodbye!');
  rl.close();
  process.exit(0);
});

main();



