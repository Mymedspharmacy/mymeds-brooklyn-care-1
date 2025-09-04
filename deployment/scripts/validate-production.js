#!/usr/bin/env node

/**
 * Production Environment Validation Script
 * Validates all required configurations before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Production Environment...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// Check if we're in production mode
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Warning: NODE_ENV is not set to production');
  warnings.push('NODE_ENV should be set to production for deployment');
}

// Validate frontend environment
console.log('📱 Frontend Validation:');
const frontendEnvPath = path.join(__dirname, '..', 'frontend.env.production');
if (fs.existsSync(frontendEnvPath)) {
  const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
  
  // Check required variables
  const requiredFrontendVars = [
    'VITE_API_URL',
    'VITE_BACKEND_URL',
    'VITE_APP_NAME',
    'VITE_CONTACT_EMAIL',
    'VITE_SUPPORT_EMAIL'
  ];
  
  requiredFrontendVars.forEach(varName => {
    if (!frontendEnv.includes(varName)) {
      errors.push(`Missing frontend environment variable: ${varName}`);
      hasErrors = true;
    }
  });
  
  // Check for localhost URLs in production
  if (frontendEnv.includes('localhost') || frontendEnv.includes('127.0.0.1')) {
    warnings.push('Frontend environment contains localhost URLs - ensure these are updated for production');
  }
  
  console.log('✅ Frontend environment file exists');
} else {
  errors.push('Frontend environment file not found: frontend.env.production');
  hasErrors = true;
}

// Validate backend environment
console.log('\n🔧 Backend Validation:');
const backendEnvPath = path.join(__dirname, '..', 'backend', 'env.production');
if (fs.existsSync(backendEnvPath)) {
  const backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
  
  // Check required variables
  const requiredBackendVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CORS_ORIGINS',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];
  
  requiredBackendVars.forEach(varName => {
    if (!backendEnv.includes(varName)) {
      errors.push(`Missing backend environment variable: ${varName}`);
      hasErrors = true;
    }
  });
  
  // Check JWT secret strength
  const jwtSecretMatch = backendEnv.match(/JWT_SECRET=([^\s]+)/);
  if (jwtSecretMatch && jwtSecretMatch[1].length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
    hasErrors = true;
  }
  
  // Check for placeholder values
  if (backendEnv.includes('your_production_app_password_here') || 
      backendEnv.includes('prod_webhook_secret_here') ||
      backendEnv.includes('your_new_relic_license_key_here')) {
    warnings.push('Backend environment contains placeholder values - ensure these are updated for production');
  }
  
  console.log('✅ Backend environment file exists');
} else {
  errors.push('Backend environment file not found: backend/env.production');
  hasErrors = true;
}

// Validate database configuration
console.log('\n🗄️  Database Validation:');
const prismaSchemaPath = path.join(__dirname, '..', 'backend', 'prisma', 'schema.prisma');
if (fs.existsSync(prismaSchemaPath)) {
  const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
  
  if (prismaSchema.includes('provider = "sqlite"')) {
    errors.push('Database provider is set to SQLite - should be MySQL for production');
    hasErrors = true;
  }
  
  if (prismaSchema.includes('provider = "mysql"')) {
    console.log('✅ Database provider is MySQL (production-ready)');
  }
} else {
  errors.push('Prisma schema file not found');
  hasErrors = true;
}

// Validate build files
console.log('\n📦 Build Validation:');
const frontendDistPath = path.join(__dirname, '..', 'dist');
const backendDistPath = path.join(__dirname, '..', 'backend', 'dist');

if (fs.existsSync(frontendDistPath)) {
  const frontendFiles = fs.readdirSync(frontendDistPath);
  if (frontendFiles.length > 0) {
    console.log('✅ Frontend build directory exists with files');
  } else {
    warnings.push('Frontend build directory is empty - run npm run build');
  }
} else {
  warnings.push('Frontend build directory not found - run npm run build');
}

if (fs.existsSync(backendDistPath)) {
  const backendFiles = fs.readdirSync(backendDistPath);
  if (backendFiles.length > 0) {
    console.log('✅ Backend build directory exists with files');
  } else {
    warnings.push('Backend build directory is empty - run npm run build in backend folder');
  }
} else {
  warnings.push('Backend build directory not found - run npm run build in backend folder');
}

// Validate package.json scripts
console.log('\n📋 Script Validation:');
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const backendPackageJsonPath = path.join(__dirname, '..', 'backend', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredScripts = ['build', 'build:prod', 'lint', 'type-check'];
  
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      warnings.push(`Missing frontend script: ${script}`);
    }
  });
  
  console.log('✅ Frontend package.json scripts validated');
}

if (fs.existsSync(backendPackageJsonPath)) {
  const backendPackageJson = JSON.parse(fs.readFileSync(backendPackageJsonPath, 'utf8'));
  const requiredBackendScripts = ['build', 'start', 'prisma:generate', 'prisma:migrate'];
  
  requiredBackendScripts.forEach(script => {
    if (!backendPackageJson.scripts[script]) {
      warnings.push(`Missing backend script: ${script}`);
    }
  });
  
  console.log('✅ Backend package.json scripts validated');
}

// Validate security configurations
console.log('\n🔒 Security Validation:');
const ecosystemPath = path.join(__dirname, '..', 'backend', 'ecosystem.config.js');
if (fs.existsSync(ecosystemPath)) {
  const ecosystemConfig = fs.readFileSync(ecosystemPath, 'utf8');
  
  if (!ecosystemConfig.includes('NODE_ENV: \'production\'')) {
    warnings.push('PM2 ecosystem config should set NODE_ENV to production');
  }
  
  if (!ecosystemConfig.includes('max_memory_restart')) {
    warnings.push('PM2 ecosystem config should include memory limits');
  }
  
  console.log('✅ PM2 ecosystem configuration exists');
} else {
  warnings.push('PM2 ecosystem configuration not found');
}

// Validate TypeScript configuration
console.log('\n📝 TypeScript Validation:');
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  if (tsConfig.compilerOptions?.strict !== true) {
    warnings.push('TypeScript strict mode should be enabled for production');
  }
  
  console.log('✅ TypeScript configuration validated');
}

// Summary
console.log('\n📊 Validation Summary:');
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ ERRORS FOUND:');
  errors.forEach(error => console.log(`  • ${error}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  warnings.forEach(warning => console.log(`  • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All validations passed! Production environment is ready.');
} else if (errors.length === 0) {
  console.log('\n✅ No critical errors found. Review warnings before deployment.');
} else {
  console.log('\n❌ Critical errors found. Fix these issues before deployment.');
}

console.log('\n📋 Next Steps:');
if (hasErrors) {
  console.log('1. Fix all errors listed above');
  console.log('2. Update environment variables with production values');
  console.log('3. Run this validation script again');
} else {
  console.log('1. Review warnings and address as needed');
  console.log('2. Run production build: npm run build:prod');
  console.log('3. Deploy to production server');
  console.log('4. Run health checks after deployment');
}

console.log('\n🔗 Useful Commands:');
console.log('  npm run build:prod          # Build frontend for production');
console.log('  cd backend && npm run build # Build backend for production');
console.log('  npm run lint               # Run linting');
console.log('  npm run type-check         # Run TypeScript checks');

process.exit(hasErrors ? 1 : 0);
