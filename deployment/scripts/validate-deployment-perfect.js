#!/usr/bin/env node

/**
 * PERFECT DEPLOYMENT VALIDATION SCRIPT - MyMeds Pharmacy Inc.
 * Comprehensive validation for production deployment readiness
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 MyMeds Pharmacy Inc. - Perfect Deployment Validation');
console.log('=====================================================\n');

let hasErrors = false;
let hasWarnings = false;
const errors = [];
const warnings = [];
const successes = [];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function addError(message) {
    errors.push(message);
    hasErrors = true;
    console.log(`❌ ERROR: ${message}`);
}

function addWarning(message) {
    warnings.push(message);
    hasWarnings = true;
    console.log(`⚠️  WARNING: ${message}`);
}

function addSuccess(message) {
    successes.push(message);
    console.log(`✅ ${message}`);
}

function checkFileExists(filePath, description) {
    if (fs.existsSync(filePath)) {
        addSuccess(`${description} exists: ${filePath}`);
        return true;
    } else {
        addError(`${description} not found: ${filePath}`);
        return false;
    }
}

function checkFileContains(filePath, content, description) {
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.includes(content)) {
            addSuccess(`${description} contains required content`);
            return true;
        } else {
            addError(`${description} missing required content: ${content}`);
            return false;
        }
    } else {
        addError(`${description} file not found: ${filePath}`);
        return false;
    }
}

// =============================================================================
// DOCKERFILE VALIDATION
// =============================================================================
console.log('🐳 DOCKERFILE VALIDATION');
console.log('========================');

const dockerfilePath = path.join(__dirname, '..', '..', 'Dockerfile');
if (checkFileExists(dockerfilePath, 'Dockerfile')) {
    const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    
    // Check for multi-stage build
    if (dockerfileContent.includes('FROM node:20-alpine AS frontend-builder')) {
        addSuccess('Multi-stage build detected');
    } else {
        addWarning('Single-stage build detected (multi-stage recommended)');
    }
    
    // Check for security practices
    if (dockerfileContent.includes('USER mymeds')) {
        addSuccess('Non-root user configured');
    } else {
        addError('No non-root user configured');
    }
    
    // Check for health check
    if (dockerfileContent.includes('HEALTHCHECK')) {
        addSuccess('Health check configured');
    } else {
        addWarning('No health check configured');
    }
    
    // Check for proper entrypoint
    if (dockerfileContent.includes('docker-entrypoint-perfect.sh')) {
        addSuccess('Perfect entrypoint script configured');
    } else {
        addWarning('Using standard entrypoint script');
    }
}

// =============================================================================
// DOCKER COMPOSE VALIDATION
// =============================================================================
console.log('\n🔧 DOCKER COMPOSE VALIDATION');
console.log('===========================');

const composeFiles = [
    'docker-compose.full-stack.yml',
    'docker-compose.prod.yml',
    'docker-compose.optimized.yml'
];

composeFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    if (checkFileExists(filePath, `Docker Compose file: ${file}`)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for required services
        const requiredServices = ['mysql', 'mymeds-app', 'nginx'];
        requiredServices.forEach(service => {
            if (content.includes(`${service}:`)) {
                addSuccess(`${file} contains ${service} service`);
            } else {
                addWarning(`${file} missing ${service} service`);
            }
        });
        
        // Check for volumes
        if (content.includes('volumes:')) {
            addSuccess(`${file} has volumes configured`);
        } else {
            addWarning(`${file} has no volumes configured`);
        }
        
        // Check for networks
        if (content.includes('networks:')) {
            addSuccess(`${file} has networks configured`);
        } else {
            addWarning(`${file} has no networks configured`);
        }
    }
});

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================
console.log('\n🌍 ENVIRONMENT VALIDATION');
console.log('========================');

const envFiles = [
    'env.production.template',
    '.env.production',
    'backend/env.production'
];

envFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    if (checkFileExists(filePath, `Environment file: ${file}`)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for required variables
        const requiredVars = [
            'DATABASE_URL',
            'JWT_SECRET',
            'ADMIN_EMAIL',
            'ADMIN_PASSWORD',
            'NODE_ENV=production'
        ];
        
        requiredVars.forEach(varName => {
            if (content.includes(varName)) {
                addSuccess(`${file} contains ${varName}`);
            } else {
                addError(`${file} missing ${varName}`);
            }
        });
        
        // Check for placeholder values
        if (content.includes('YourGmailAppPasswordHere') || 
            content.includes('YourStripeSecretKey123')) {
            addWarning(`${file} contains placeholder values`);
        } else {
            addSuccess(`${file} has production values`);
        }
    }
});

// =============================================================================
// NGINX VALIDATION
// =============================================================================
console.log('\n🌐 NGINX VALIDATION');
console.log('==================');

const nginxFiles = [
    'deployment/nginx/nginx-full-stack.conf',
    'deployment/nginx/nginx.conf'
];

nginxFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    if (checkFileExists(filePath, `Nginx config: ${file}`)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for SSL configuration
        if (content.includes('ssl_certificate')) {
            addSuccess(`${file} has SSL configured`);
        } else {
            addWarning(`${file} has no SSL configuration`);
        }
        
        // Check for security headers
        if (content.includes('X-Frame-Options') || content.includes('X-Content-Type-Options')) {
            addSuccess(`${file} has security headers`);
        } else {
            addWarning(`${file} missing security headers`);
        }
        
        // Check for proxy configuration
        if (content.includes('proxy_pass')) {
            addSuccess(`${file} has proxy configuration`);
        } else {
            addWarning(`${file} missing proxy configuration`);
        }
    }
});

// =============================================================================
// PACKAGE.JSON VALIDATION
// =============================================================================
console.log('\n📦 PACKAGE.JSON VALIDATION');
console.log('=========================');

const packageFiles = [
    'package.json',
    'backend/package.json'
];

packageFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    if (checkFileExists(filePath, `Package file: ${file}`)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // Check for required scripts
            const requiredScripts = ['build', 'start'];
            requiredScripts.forEach(script => {
                if (packageJson.scripts && packageJson.scripts[script]) {
                    addSuccess(`${file} has ${script} script`);
                } else {
                    addError(`${file} missing ${script} script`);
                }
            });
            
            // Check for production dependencies
            if (packageJson.dependencies) {
                const prodDeps = Object.keys(packageJson.dependencies);
                if (prodDeps.length > 0) {
                    addSuccess(`${file} has ${prodDeps.length} production dependencies`);
                } else {
                    addWarning(`${file} has no production dependencies`);
                }
            }
            
        } catch (error) {
            addError(`${file} has invalid JSON: ${error.message}`);
        }
    }
});

// =============================================================================
// DEPLOYMENT SCRIPTS VALIDATION
// =============================================================================
console.log('\n🚀 DEPLOYMENT SCRIPTS VALIDATION');
console.log('================================');

const scriptFiles = [
    'deployment/scripts/deploy-full-stack.sh',
    'deployment/scripts/deploy-production.sh',
    'deployment/scripts/deploy-optimized.sh',
    'deployment/scripts/quick-deploy.sh',
    'deployment/scripts/generate-ssl.sh'
];

scriptFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', '..', file);
    if (checkFileExists(filePath, `Deployment script: ${file}`)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for error handling
        if (content.includes('set -e')) {
            addSuccess(`${file} has error handling`);
        } else {
            addWarning(`${file} missing error handling`);
        }
        
        // Check for Docker commands
        if (content.includes('docker-compose')) {
            addSuccess(`${file} has Docker Compose commands`);
        } else {
            addWarning(`${file} missing Docker Compose commands`);
        }
    }
});

// =============================================================================
// SECURITY VALIDATION
// =============================================================================
console.log('\n🔒 SECURITY VALIDATION');
console.log('=====================');

// Check for .gitignore
const gitignorePath = path.join(__dirname, '..', '..', '.gitignore');
if (checkFileExists(gitignorePath, '.gitignore file')) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (content.includes('.env') && content.includes('node_modules')) {
        addSuccess('.gitignore properly configured');
    } else {
        addWarning('.gitignore may be missing important entries');
    }
}

// Check for Docker security
const dockerfilePath = path.join(__dirname, '..', '..', 'Dockerfile');
if (fs.existsSync(dockerfilePath)) {
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    if (content.includes('USER mymeds') && content.includes('chmod -R 755')) {
        addSuccess('Docker security practices implemented');
    } else {
        addWarning('Docker security practices could be improved');
    }
}

// =============================================================================
// FINAL SUMMARY
// =============================================================================
console.log('\n📊 VALIDATION SUMMARY');
console.log('===================');
console.log(`✅ Successes: ${successes.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (errors.length > 0) {
    console.log('\n❌ CRITICAL ERRORS FOUND:');
    errors.forEach(error => console.log(`  • ${error}`));
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`  • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('\n🎉 PERFECT! All validations passed!');
    console.log('✅ Your deployment is ready for production!');
} else if (errors.length === 0) {
    console.log('\n✅ No critical errors found!');
    console.log('⚠️  Review warnings before deployment.');
} else {
    console.log('\n❌ Critical errors found!');
    console.log('🔧 Fix all errors before deploying to production.');
}

console.log('\n📋 NEXT STEPS:');
if (hasErrors) {
    console.log('1. Fix all critical errors listed above');
    console.log('2. Run this validation script again');
    console.log('3. Deploy to production');
} else {
    console.log('1. Review warnings (optional)');
    console.log('2. Run deployment script');
    console.log('3. Monitor deployment health');
}

console.log('\n🔗 USEFUL COMMANDS:');
console.log('  npm run validate:prod          # Run this validation');
console.log('  npm run deploy:docker           # Deploy with Docker');
console.log('  npm run deploy:quick            # Quick deployment');
console.log('  docker-compose -f docker-compose.optimized.yml up -d  # Start services');

process.exit(hasErrors ? 1 : 0);
