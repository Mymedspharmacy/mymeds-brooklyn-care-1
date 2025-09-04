const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up development environment...');

// Create development environment variables
const devEnv = `# 🚀 DEVELOPMENT ENVIRONMENT CONFIGURATION
# This file contains development-specific environment variables

# =============================================================================
# CORE APPLICATION SETTINGS
# =============================================================================
NODE_ENV=development
PORT=4000
HOST=localhost

# =============================================================================
# DATABASE CONFIGURATION (SQLite for development)
# =============================================================================
# SQLite database for development (file-based)
DATABASE_URL="file:./dev.db"
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=mymeds_development
DATABASE_USER=dev_user
DATABASE_PASSWORD=dev_password
SHARD_COUNT=1

# =============================================================================
# SECURITY & AUTHENTICATION
# =============================================================================
# JWT Secret for development
JWT_SECRET=dev_jwt_secret_key_for_testing_purposes_only_do_not_use_in_production
JWT_REFRESH_SECRET=dev_refresh_secret_key_for_testing_purposes_only
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Admin user credentials for development
ADMIN_EMAIL=admin@mymedspharmacy.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Development Admin

# Password policy (relaxed for development)
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=false
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=false

# Session settings
SESSION_SECRET=dev_session_secret_for_testing
SESSION_TIMEOUT=900000

# =============================================================================
# CORS & SECURITY
# =============================================================================
# Allowed origins for development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001

# Contact receiver
CONTACT_RECEIVER=dev@mymedspharmacy.com

# Security headers (relaxed for development)
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY_STRICT=false
HSTS_MAX_AGE=0
HSTS_INCLUDE_SUBDOMAINS=false
HSTS_PRELOAD=false

# =============================================================================
# RATE LIMITING
# =============================================================================
# Disable rate limiting in development
RATE_LIMITING_ENABLED=false
DISABLE_RATE_LIMIT=true

# Rate limit settings (relaxed for development)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_AUTH_MAX=100
RATE_LIMIT_AUTH_WINDOW=60000
RATE_LIMIT_API_MAX=10000
RATE_LIMIT_API_WINDOW=60000
RATE_LIMIT_CONTACT_MAX=100
RATE_LIMIT_CONTACT_WINDOW=60000

# =============================================================================
# PAYMENT PROCESSING (WOOCOMMERCE)
# =============================================================================
# WooCommerce development settings
WOOCOMMERCE_STORE_URL=http://localhost:3000/shop
WOOCOMMERCE_CONSUMER_KEY=ck_dev_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_dev_secret_here
WOOCOMMERCE_VERSION=wc/v3

# WooCommerce settings
WOOCOMMERCE_CURRENCY=usd
WOOCOMMERCE_PAYMENT_METHODS=card,paypal
WOOCOMMERCE_WEBHOOK_SECRET=dev_webhook_secret_here

# =============================================================================
# EMAIL CONFIGURATION (SMTP)
# =============================================================================
# Email settings for development (using console output)
EMAIL_HOST=localhost
EMAIL_PORT=587
EMAIL_USER=dev@mymedspharmacy.com
EMAIL_PASS=dev_password
EMAIL_FROM=dev@mymedspharmacy.com
EMAIL_TO=dev@mymedspharmacy.com

# =============================================================================
# LOGGING
# =============================================================================
# Logging level for development
LOG_LEVEL=debug
LOG_TO_FILE=false
LOG_TO_CONSOLE=true

# =============================================================================
# FILE UPLOAD
# =============================================================================
# File upload settings for development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# =============================================================================
# MONITORING
# =============================================================================
# Monitoring settings for development
MONITORING_ENABLED=false
HEALTH_CHECK_ENABLED=true
METRICS_ENABLED=false

# =============================================================================
# INTEGRATIONS
# =============================================================================
# External service integrations for development
OPENFDA_API_KEY=dev_openfda_key_here
GOOGLE_MAPS_API_KEY=dev_google_maps_key_here
STRIPE_SECRET_KEY=sk_test_dev_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_dev_key_here

# =============================================================================
# FEATURE FLAGS
# =============================================================================
# Feature flags for development
ENABLE_ANALYTICS=false
ENABLE_NOTIFICATIONS=true
ENABLE_REAL_TIME_UPDATES=true
ENABLE_FILE_UPLOAD=true
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_PUSH_NOTIFICATIONS=false

# =============================================================================
# DEBUG SETTINGS
# =============================================================================
# Debug settings for development
DEBUG=true
DEBUG_DATABASE=false
DEBUG_EMAIL=false
DEBUG_PAYMENTS=false
DEBUG_AUTH=false
`;

// Write the development environment file
fs.writeFileSync(path.join(__dirname, '.env'), devEnv);
console.log('✅ Created .env file with development configuration');

// Copy the development schema to be the main schema
const devSchemaPath = path.join(__dirname, 'prisma', 'schema-dev.prisma');
const mainSchemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

if (fs.existsSync(devSchemaPath)) {
  fs.copyFileSync(devSchemaPath, mainSchemaPath);
  console.log('✅ Updated schema.prisma to use SQLite for development');
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('✅ Created uploads directory');
}

// Generate Prisma client
try {
  console.log('🔄 Generating Prisma client...');
  execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('⚠️  Prisma client generation failed, continuing...');
}

// Push the database schema
try {
  console.log('🔄 Pushing database schema...');
  execSync('npx prisma db push', { cwd: __dirname, stdio: 'inherit' });
  console.log('✅ Database schema pushed');
} catch (error) {
  console.log('⚠️  Database schema push failed, continuing...');
}

console.log('\n🎉 Development environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Start the backend: npm run dev');
console.log('2. Run API tests: cd .. && npm run test:api');
console.log('3. Access the application: http://localhost:3000');
console.log('4. Access the API: http://localhost:4000');
console.log('\n🔑 Admin credentials:');
console.log('   Email: admin@mymedspharmacy.com');
console.log('   Password: AdminPassword123!');
