#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating Production Secrets for MyMeds Pharmacy');
console.log('===================================================\n');

// Generate JWT Secret (64 characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate Session Secret (64 characters)
const sessionSecret = crypto.randomBytes(64).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

// Generate WooCommerce Webhook Secret (32 characters)
const wooCommerceWebhookSecret = crypto.randomBytes(32).toString('hex');
console.log('WOOCOMMERCE_WEBHOOK_SECRET:');
console.log(wooCommerceWebhookSecret);
console.log('');

// Generate Database Password (32 characters)
const dbPassword = crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
console.log('DATABASE_PASSWORD:');
console.log(dbPassword);
console.log('');

// Generate Admin Password (16 characters with complexity)
const adminPassword = crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 
                     crypto.randomBytes(4).toString('base64').replace(/[^A-Z]/g, '') +
                     crypto.randomBytes(2).toString('base64').replace(/[^0-9]/g, '') +
                     '!@#';
console.log('ADMIN_PASSWORD:');
console.log(adminPassword);
console.log('');

console.log('📝 Instructions:');
console.log('1. Copy these secrets to your production environment file');
console.log('2. Never commit these secrets to version control');
console.log('3. Store them securely (password manager, secret management service)');
console.log('4. Rotate these secrets regularly (every 90 days)');
console.log('');

console.log('🔒 Security Notes:');
console.log('- JWT_SECRET: Used for signing JWT tokens');
console.log('- SESSION_SECRET: Used for session management');
console.log('- WOOCOMMERCE_WEBHOOK_SECRET: Used for WooCommerce webhook verification');
console.log('- DATABASE_PASSWORD: Used for database connection');
console.log('- ADMIN_PASSWORD: Used for initial admin account');
console.log('');

console.log('✅ Secrets generated successfully!');
