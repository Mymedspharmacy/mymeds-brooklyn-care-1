#!/usr/bin/env node

// MyMeds Password Hash Generator
// This script generates a secure bcrypt hash for the admin password

const bcrypt = require('bcrypt');

async function generatePasswordHash() {
    const password = process.argv[2];
    
    if (!password) {
        console.log('Usage: node generate-password-hash.js <password>');
        console.log('Example: node generate-password-hash.js "MySecurePassword123!"');
        process.exit(1);
    }
    
    try {
        const saltRounds = 12;
        const hash = await bcrypt.hash(password, saltRounds);
        
        console.log('🔐 Password Hash Generated');
        console.log('========================');
        console.log('Password:', password);
        console.log('Hash:', hash);
        console.log('');
        console.log('Copy this hash to your .env.production file:');
        console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
        console.log('');
        console.log('✅ Hash generated successfully!');
        
    } catch (error) {
        console.error('❌ Error generating hash:', error.message);
        process.exit(1);
    }
}

generatePasswordHash();
