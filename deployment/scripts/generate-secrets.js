#!/usr/bin/env node

/**
 * =============================================================================
 * SECRET GENERATOR - MyMeds Pharmacy Inc.
 * =============================================================================
 * Generates secure secrets for production environment
 * =============================================================================
 */

const crypto = require('crypto');
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

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecureSecret(length = 64) {
    return crypto.randomBytes(length).toString('hex');
}

function generateStrongPassword(length = 32) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

function generateWooCommerceKeys() {
    const consumerKey = 'ck_' + generateSecureSecret(40);
    const consumerSecret = 'cs_' + generateSecureSecret(40);
    const webhookSecret = generateSecureSecret(32);
    
    return {
        consumerKey,
        consumerSecret,
        webhookSecret
    };
}

function generateWordPressCredentials() {
    const username = 'mymeds_api_user';
    const appPassword = generateStrongPassword(16).replace(/[^a-zA-Z0-9]/g, '');
    
    return {
        username,
        appPassword
    };
}

function generateDatabaseCredentials() {
    const dbPassword = generateStrongPassword(24);
    const rootPassword = generateStrongPassword(24);
    
    return {
        dbPassword,
        rootPassword
    };
}

function generateAdminCredentials() {
    const adminPassword = generateStrongPassword(20);
    
    return {
        adminPassword
    };
}

function generateJWTSecrets() {
    const jwtSecret = generateSecureSecret(64);
    const sessionSecret = generateSecureSecret(64);
    
    return {
        jwtSecret,
        sessionSecret
    };
}

function generateEmailCredentials() {
    // For Gmail App Password (16 characters, no spaces)
    const gmailAppPassword = generateStrongPassword(16).replace(/[^a-zA-Z0-9]/g, '');
    
    return {
        gmailAppPassword
    };
}

function generatePaymentGatewayKeys() {
    // Stripe keys (these would be actual Stripe keys in production)
    const stripeSecretKey = 'sk_live_' + generateSecureSecret(96);
    const stripePublishableKey = 'pk_live_' + generateSecureSecret(96);
    const stripeWebhookSecret = 'whsec_' + generateSecureSecret(64);
    
    return {
        stripeSecretKey,
        stripePublishableKey,
        stripeWebhookSecret
    };
}

function main() {
    colorLog('cyan', '=============================================================================');
    colorLog('cyan', 'SECRET GENERATOR - MyMeds Pharmacy Inc.');
    colorLog('cyan', '=============================================================================');
    console.log('');
    
    colorLog('yellow', '🔐 Generating secure secrets for production environment...');
    console.log('');
    
    // Generate all secrets
    const secrets = {
        database: generateDatabaseCredentials(),
        jwt: generateJWTSecrets(),
        admin: generateAdminCredentials(),
        wordpress: generateWordPressCredentials(),
        woocommerce: generateWooCommerceKeys(),
        email: generateEmailCredentials(),
        payment: generatePaymentGatewayKeys()
    };
    
    // Display generated secrets
    colorLog('green', '✅ Generated Secrets:');
    console.log('');
    
    colorLog('blue', '📊 DATABASE CREDENTIALS:');
    console.log(`   MYSQL_PASSWORD: ${secrets.database.dbPassword}`);
    console.log(`   MYSQL_ROOT_PASSWORD: ${secrets.database.rootPassword}`);
    console.log('');
    
    colorLog('blue', '🔑 JWT & AUTHENTICATION:');
    console.log(`   JWT_SECRET: ${secrets.jwt.jwtSecret}`);
    console.log(`   SESSION_SECRET: ${secrets.jwt.sessionSecret}`);
    console.log('');
    
    colorLog('blue', '👤 ADMIN CREDENTIALS:');
    console.log(`   ADMIN_PASSWORD: ${secrets.admin.adminPassword}`);
    console.log('');
    
    colorLog('blue', '📝 WORDPRESS CREDENTIALS:');
    console.log(`   WORDPRESS_USERNAME: ${secrets.wordpress.username}`);
    console.log(`   WORDPRESS_APP_PASSWORD: ${secrets.wordpress.appPassword}`);
    console.log('');
    
    colorLog('blue', '🛒 WOOCOMMERCE CREDENTIALS:');
    console.log(`   WOOCOMMERCE_CONSUMER_KEY: ${secrets.woocommerce.consumerKey}`);
    console.log(`   WOOCOMMERCE_CONSUMER_SECRET: ${secrets.woocommerce.consumerSecret}`);
    console.log(`   WOOCOMMERCE_WEBHOOK_SECRET: ${secrets.woocommerce.webhookSecret}`);
    console.log('');
    
    colorLog('blue', '📧 EMAIL CREDENTIALS:');
    console.log(`   EMAIL_PASSWORD (Gmail App Password): ${secrets.email.gmailAppPassword}`);
    console.log('');
    
    colorLog('blue', '💳 PAYMENT GATEWAY (Stripe):');
    console.log(`   STRIPE_SECRET_KEY: ${secrets.payment.stripeSecretKey}`);
    console.log(`   STRIPE_PUBLISHABLE_KEY: ${secrets.payment.stripePublishableKey}`);
    console.log(`   STRIPE_WEBHOOK_SECRET: ${secrets.payment.stripeWebhookSecret}`);
    console.log('');
    
    // Generate environment file
    const envContent = generateEnvFile(secrets);
    
    // Write to file
    const envPath = path.join(process.cwd(), '.env.production');
    fs.writeFileSync(envPath, envContent);
    
    colorLog('green', `✅ Production environment file created: ${envPath}`);
    console.log('');
    
    colorLog('yellow', '⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   1. Keep this .env.production file secure and never commit it to version control');
    console.log('   2. Store these credentials in a secure password manager');
    console.log('   3. Use these credentials to configure your WordPress and WooCommerce');
    console.log('   4. Test all integrations before going live');
    console.log('   5. Set up proper file permissions: chmod 600 .env.production');
    console.log('');
    
    colorLog('cyan', '=============================================================================');
    colorLog('green', '🎉 Secret generation completed successfully!');
    colorLog('cyan', '=============================================================================');
}

function generateEnvFile(secrets) {
    return `# =============================================================================
# PRODUCTION ENVIRONMENT - MyMeds Pharmacy Inc.
# Generated on: ${new Date().toISOString()}
# =============================================================================

# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL="mysql://mymeds_user:${secrets.database.dbPassword}@mysql:3306/mymeds_production"
MYSQL_ROOT_PASSWORD=${secrets.database.rootPassword}
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=${secrets.database.dbPassword}
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_CHARSET=utf8mb4
MYSQL_COLLATION=utf8mb4_unicode_ci

# =============================================================================
# JWT & AUTHENTICATION
# =============================================================================
JWT_SECRET=${secrets.jwt.jwtSecret}
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=${secrets.jwt.sessionSecret}
BCRYPT_ROUNDS=12

# =============================================================================
# ADMIN CREDENTIALS
# =============================================================================
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=${secrets.admin.adminPassword}
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=${secrets.email.gmailAppPassword}
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# =============================================================================
# WORDPRESS INTEGRATION
# =============================================================================
VITE_WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=${secrets.wordpress.username}
WORDPRESS_PASSWORD=${secrets.wordpress.appPassword}
WORDPRESS_APP_PASSWORD=${secrets.wordpress.appPassword}
FEATURE_WORDPRESS_ENABLED=true

# =============================================================================
# WOOCOMMERCE INTEGRATION
# =============================================================================
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=${secrets.woocommerce.consumerKey}
WOOCOMMERCE_CONSUMER_SECRET=${secrets.woocommerce.consumerSecret}
WOOCOMMERCE_WEBHOOK_SECRET=${secrets.woocommerce.webhookSecret}
FEATURE_WOOCOMMERCE_ENABLED=true

# =============================================================================
# PAYMENT GATEWAY CONFIGURATION
# =============================================================================
STRIPE_SECRET_KEY=${secrets.payment.stripeSecretKey}
STRIPE_PUBLISHABLE_KEY=${secrets.payment.stripePublishableKey}
STRIPE_WEBHOOK_SECRET=${secrets.payment.stripeWebhookSecret}
PAYMENT_GATEWAY_ENABLED=true

# =============================================================================
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================
COMPRESSION_ENABLED=true
CLUSTER_ENABLED=true
CLUSTER_WORKERS=2

# =============================================================================
# DEBUG (DISABLE IN PRODUCTION)
# =============================================================================
DEBUG_MODE=false
VERBOSE_LOGGING=false
`;
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    generateSecureSecret,
    generateStrongPassword,
    generateWooCommerceKeys,
    generateWordPressCredentials,
    generateDatabaseCredentials,
    generateAdminCredentials,
    generateJWTSecrets
};
