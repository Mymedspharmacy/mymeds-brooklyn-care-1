#!/usr/bin/env node

/**
 * Generate Strong Secrets for MyMeds Pharmacy
 * Run this script to generate secure secrets for your environment variables
 */

const crypto = require('crypto');

console.log('🔐 Generating Strong Secrets for MyMeds Pharmacy');
console.log('='.repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n🔑 JWT_SECRET:');
console.log(jwtSecret);

// Generate JWT Refresh Secret
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
console.log('\n🔄 JWT_REFRESH_SECRET:');
console.log(jwtRefreshSecret);

// Generate Stripe Webhook Secret
const stripeWebhookSecret = crypto.randomBytes(32).toString('hex');
console.log('\n💳 STRIPE_WEBHOOK_SECRET:');
console.log(`whsec_${stripeWebhookSecret}`);

// Generate Admin Password
const adminPassword = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + '!@#';
console.log('\n👤 ADMIN_PASSWORD:');
console.log(adminPassword);

console.log('\n' + '='.repeat(60));
console.log('📋 Copy these secrets to your environment variables:');
console.log('='.repeat(60));

console.log(`
# Security Secrets
JWT_SECRET="${jwtSecret}"
JWT_REFRESH_SECRET="${jwtRefreshSecret}"
STRIPE_WEBHOOK_SECRET="whsec_${stripeWebhookSecret}"

# Admin User
ADMIN_PASSWORD="${adminPassword}"
ADMIN_EMAIL="admin@yourpharmacy.com"
ADMIN_NAME="Admin User"

# Other Required Variables
FRONTEND_URL="https://your-frontend-domain.com"
NODE_ENV="production"

# Database (Railway will provide these)
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@yourpharmacy.com"

# External APIs (You need to get these from respective services)
VITE_WOOCOMMERCE_URL="https://your-store.com"
VITE_WOOCOMMERCE_CONSUMER_KEY="your-consumer-key"
VITE_WOOCOMMERCE_CONSUMER_SECRET="your-consumer-secret"
VITE_WORDPRESS_URL="https://your-blog.com"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
`);

console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Store these secrets securely - never commit them to version control');
console.log('2. Use different secrets for development and production');
console.log('3. Rotate secrets regularly (every 90 days recommended)');
console.log('4. Use a password manager to store these securely');
console.log('5. Share secrets securely with team members');

console.log('\n✅ Secrets generated successfully!');
console.log('🔒 Your application is now ready for secure deployment.'); 