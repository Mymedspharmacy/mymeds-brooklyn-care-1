#!/usr/bin/env node

/**
 * =============================================================================
 * ENVIRONMENT VALIDATOR - MyMeds Pharmacy Inc.
 * =============================================================================
 * Validates production environment configuration
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function loadEnvFile(filePath) {
    const env = {};
    
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    }
    
    return env;
}

function validateRequired(env, requiredKeys) {
    const missing = [];
    const warnings = [];
    
    for (const key of requiredKeys) {
        if (!env[key] || env[key] === `YOUR_${key}_HERE` || env[key].includes('YOUR_')) {
            missing.push(key);
        } else if (key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')) {
            if (env[key].length < 16) {
                warnings.push(`${key} should be at least 16 characters long`);
            }
        }
    }
    
    return { missing, warnings };
}

function validateSecurity(env) {
    const warnings = [];
    
    // Check JWT secret strength
    if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
        warnings.push('JWT_SECRET should be at least 32 characters long for security');
    }
    
    // Check session secret strength
    if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32) {
        warnings.push('SESSION_SECRET should be at least 32 characters long for security');
    }
    
    // Check admin password strength
    if (env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length < 12) {
        warnings.push('ADMIN_PASSWORD should be at least 12 characters long');
    }
    
    // Check database password strength
    if (env.MYSQL_PASSWORD && env.MYSQL_PASSWORD.length < 12) {
        warnings.push('MYSQL_PASSWORD should be at least 12 characters long');
    }
    
    // Check if using default values
    const defaultValues = [
        'AdminPassword123!',
        'password',
        'admin',
        '123456',
        'secret',
        'test'
    ];
    
    for (const [key, value] of Object.entries(env)) {
        if (key.includes('PASSWORD') && defaultValues.includes(value)) {
            warnings.push(`${key} appears to be using a default/weak password`);
        }
    }
    
    return warnings;
}

function validateUrls(env) {
    const warnings = [];
    const errors = [];
    
    // Validate URLs
    const urlFields = [
        'WORDPRESS_URL',
        'WOOCOMMERCE_STORE_URL',
        'VITE_WORDPRESS_URL'
    ];
    
    for (const field of urlFields) {
        if (env[field]) {
            try {
                new URL(env[field]);
            } catch (e) {
                errors.push(`${field} is not a valid URL: ${env[field]}`);
            }
        }
    }
    
    // Check if URLs match expected domain
    const expectedDomain = 'mymedspharmacyinc.com';
    for (const field of urlFields) {
        if (env[field] && !env[field].includes(expectedDomain)) {
            warnings.push(`${field} doesn't match expected domain: ${expectedDomain}`);
        }
    }
    
    return { warnings, errors };
}

function validateEmail(env) {
    const warnings = [];
    const errors = [];
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (env.ADMIN_EMAIL && !emailRegex.test(env.ADMIN_EMAIL)) {
        errors.push('ADMIN_EMAIL is not a valid email format');
    }
    
    if (env.EMAIL_USER && !emailRegex.test(env.EMAIL_USER)) {
        errors.push('EMAIL_USER is not a valid email format');
    }
    
    if (env.EMAIL_FROM && !emailRegex.test(env.EMAIL_FROM)) {
        errors.push('EMAIL_FROM is not a valid email format');
    }
    
    // Check if using Gmail
    if (env.EMAIL_HOST === 'smtp.gmail.com') {
        if (!env.EMAIL_PASSWORD || env.EMAIL_PASSWORD.length !== 16) {
            warnings.push('Gmail App Password should be 16 characters long');
        }
    }
    
    return { warnings, errors };
}

function validateWooCommerce(env) {
    const warnings = [];
    const errors = [];
    
    if (env.FEATURE_WOOCOMMERCE_ENABLED === 'true') {
        const required = [
            'WOOCOMMERCE_STORE_URL',
            'WOOCOMMERCE_CONSUMER_KEY',
            'WOOCOMMERCE_CONSUMER_SECRET'
        ];
        
        for (const field of required) {
            if (!env[field] || env[field].includes('YOUR_')) {
                errors.push(`${field} is required when WooCommerce is enabled`);
            }
        }
        
        // Validate WooCommerce key format
        if (env.WOOCOMMERCE_CONSUMER_KEY && !env.WOOCOMMERCE_CONSUMER_KEY.startsWith('ck_')) {
            warnings.push('WOOCOMMERCE_CONSUMER_KEY should start with "ck_"');
        }
        
        if (env.WOOCOMMERCE_CONSUMER_SECRET && !env.WOOCOMMERCE_CONSUMER_SECRET.startsWith('cs_')) {
            warnings.push('WOOCOMMERCE_CONSUMER_SECRET should start with "cs_"');
        }
    }
    
    return { warnings, errors };
}

function validateWordPress(env) {
    const warnings = [];
    const errors = [];
    
    if (env.FEATURE_WORDPRESS_ENABLED === 'true') {
        const required = [
            'WORDPRESS_URL',
            'WORDPRESS_USERNAME',
            'WORDPRESS_APP_PASSWORD'
        ];
        
        for (const field of required) {
            if (!env[field] || env[field].includes('YOUR_')) {
                errors.push(`${field} is required when WordPress is enabled`);
            }
        }
        
        // Check WordPress URL format
        if (env.WORDPRESS_URL && !env.WORDPRESS_URL.endsWith('/blog')) {
            warnings.push('WORDPRESS_URL should typically end with "/blog"');
        }
    }
    
    return { warnings, errors };
}

function validateDatabase(env) {
    const warnings = [];
    const errors = [];
    
    // Validate DATABASE_URL format
    if (env.DATABASE_URL) {
        if (!env.DATABASE_URL.startsWith('mysql://')) {
            errors.push('DATABASE_URL should start with "mysql://" for production');
        }
        
        if (!env.DATABASE_URL.includes('@mysql:3306/')) {
            warnings.push('DATABASE_URL should point to mysql:3306 for Docker setup');
        }
        
        if (!env.DATABASE_URL.includes('mymeds_production')) {
            warnings.push('DATABASE_URL should use "mymeds_production" as database name');
        }
    }
    
    // Check if passwords match
    if (env.MYSQL_PASSWORD && env.MYSQL_ROOT_PASSWORD) {
        if (env.MYSQL_PASSWORD === env.MYSQL_ROOT_PASSWORD) {
            warnings.push('MYSQL_PASSWORD and MYSQL_ROOT_PASSWORD should be different');
        }
    }
    
    return { warnings, errors };
}

function main() {
    colorLog('cyan', '=============================================================================');
    colorLog('cyan', 'ENVIRONMENT VALIDATOR - MyMeds Pharmacy Inc.');
    colorLog('cyan', '=============================================================================');
    console.log('');
    
    // Load environment file
    const envPath = path.join(process.cwd(), '.env.production');
    const env = loadEnvFile(envPath);
    
    if (!env) {
        colorLog('red', '❌ .env.production file not found!');
        colorLog('yellow', 'Please run: node deployment/scripts/generate-secrets.js');
        process.exit(1);
    }
    
    colorLog('green', '✅ Environment file loaded');
    console.log('');
    
    // Define required fields
    const requiredFields = [
        'NODE_ENV',
        'DATABASE_URL',
        'JWT_SECRET',
        'SESSION_SECRET',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD',
        'MYSQL_PASSWORD',
        'MYSQL_ROOT_PASSWORD',
        'EMAIL_HOST',
        'EMAIL_USER',
        'EMAIL_PASSWORD',
        'WORDPRESS_URL',
        'WORDPRESS_USERNAME',
        'WORDPRESS_APP_PASSWORD',
        'WOOCOMMERCE_STORE_URL',
        'WOOCOMMERCE_CONSUMER_KEY',
        'WOOCOMMERCE_CONSUMER_SECRET'
    ];
    
    let allValid = true;
    let totalErrors = 0;
    let totalWarnings = 0;
    
    // Validate required fields
    colorLog('blue', '🔍 Validating required fields...');
    const { missing, warnings } = validateRequired(env, requiredFields);
    
    if (missing.length > 0) {
        colorLog('red', '❌ Missing required fields:');
        missing.forEach(field => colorLog('red', `   - ${field}`));
        allValid = false;
        totalErrors += missing.length;
    }
    
    if (warnings.length > 0) {
        colorLog('yellow', '⚠️  Field warnings:');
        warnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += warnings.length;
    }
    
    console.log('');
    
    // Validate security
    colorLog('blue', '🔐 Validating security settings...');
    const securityWarnings = validateSecurity(env);
    
    if (securityWarnings.length > 0) {
        colorLog('yellow', '⚠️  Security warnings:');
        securityWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += securityWarnings.length;
    }
    
    console.log('');
    
    // Validate URLs
    colorLog('blue', '🌐 Validating URLs...');
    const { warnings: urlWarnings, errors: urlErrors } = validateUrls(env);
    
    if (urlErrors.length > 0) {
        colorLog('red', '❌ URL errors:');
        urlErrors.forEach(error => colorLog('red', `   - ${error}`));
        allValid = false;
        totalErrors += urlErrors.length;
    }
    
    if (urlWarnings.length > 0) {
        colorLog('yellow', '⚠️  URL warnings:');
        urlWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += urlWarnings.length;
    }
    
    console.log('');
    
    // Validate email
    colorLog('blue', '📧 Validating email configuration...');
    const { warnings: emailWarnings, errors: emailErrors } = validateEmail(env);
    
    if (emailErrors.length > 0) {
        colorLog('red', '❌ Email errors:');
        emailErrors.forEach(error => colorLog('red', `   - ${error}`));
        allValid = false;
        totalErrors += emailErrors.length;
    }
    
    if (emailWarnings.length > 0) {
        colorLog('yellow', '⚠️  Email warnings:');
        emailWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += emailWarnings.length;
    }
    
    console.log('');
    
    // Validate WooCommerce
    colorLog('blue', '🛒 Validating WooCommerce configuration...');
    const { warnings: wcWarnings, errors: wcErrors } = validateWooCommerce(env);
    
    if (wcErrors.length > 0) {
        colorLog('red', '❌ WooCommerce errors:');
        wcErrors.forEach(error => colorLog('red', `   - ${error}`));
        allValid = false;
        totalErrors += wcErrors.length;
    }
    
    if (wcWarnings.length > 0) {
        colorLog('yellow', '⚠️  WooCommerce warnings:');
        wcWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += wcWarnings.length;
    }
    
    console.log('');
    
    // Validate WordPress
    colorLog('blue', '📝 Validating WordPress configuration...');
    const { warnings: wpWarnings, errors: wpErrors } = validateWordPress(env);
    
    if (wpErrors.length > 0) {
        colorLog('red', '❌ WordPress errors:');
        wpErrors.forEach(error => colorLog('red', `   - ${error}`));
        allValid = false;
        totalErrors += wpErrors.length;
    }
    
    if (wpWarnings.length > 0) {
        colorLog('yellow', '⚠️  WordPress warnings:');
        wpWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += wpWarnings.length;
    }
    
    console.log('');
    
    // Validate database
    colorLog('blue', '🗄️  Validating database configuration...');
    const { warnings: dbWarnings, errors: dbErrors } = validateDatabase(env);
    
    if (dbErrors.length > 0) {
        colorLog('red', '❌ Database errors:');
        dbErrors.forEach(error => colorLog('red', `   - ${error}`));
        allValid = false;
        totalErrors += dbErrors.length;
    }
    
    if (dbWarnings.length > 0) {
        colorLog('yellow', '⚠️  Database warnings:');
        dbWarnings.forEach(warning => colorLog('yellow', `   - ${warning}`));
        totalWarnings += dbWarnings.length;
    }
    
    console.log('');
    
    // Final summary
    colorLog('cyan', '=============================================================================');
    
    if (allValid && totalWarnings === 0) {
        colorLog('green', '🎉 Environment validation passed! All configurations are correct.');
    } else if (allValid && totalWarnings > 0) {
        colorLog('yellow', `⚠️  Environment validation passed with ${totalWarnings} warnings.`);
        colorLog('yellow', 'Please review the warnings above and fix them if necessary.');
    } else {
        colorLog('red', `❌ Environment validation failed with ${totalErrors} errors and ${totalWarnings} warnings.`);
        colorLog('red', 'Please fix all errors before deploying to production.');
        process.exit(1);
    }
    
    colorLog('cyan', '=============================================================================');
    
    // Additional recommendations
    if (totalWarnings > 0) {
        console.log('');
        colorLog('blue', '💡 Recommendations:');
        colorLog('blue', '   - Review and address all warnings above');
        colorLog('blue', '   - Test all integrations before going live');
        colorLog('blue', '   - Set up monitoring and alerting');
        colorLog('blue', '   - Configure regular backups');
        colorLog('blue', '   - Review security settings');
    }
    
    console.log('');
    colorLog('green', '✅ Environment is ready for production deployment!');
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    loadEnvFile,
    validateRequired,
    validateSecurity,
    validateUrls,
    validateEmail,
    validateWooCommerce,
    validateWordPress,
    validateDatabase
};
