# MyMeds Pharmacy Environment Setup Script
Write-Host "Setting up environment files..." -ForegroundColor Green

# Create backend development environment file
$backendEnv = @"
# =============================================================================
# DEVELOPMENT ENVIRONMENT - MyMeds Pharmacy Inc.
# =============================================================================

# Server Configuration
NODE_ENV=development
PORT=4000
HOST=localhost

# Database Configuration (SQLite for development)
DATABASE_URL="file:./prisma/dev.db"

# JWT & Authentication (Development keys)
JWT_SECRET="dev_jwt_secret_key_2025_mymeds_pharmacy_development_only_not_for_production_minimum_64_chars"
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET="dev_session_secret_key_2025_mymeds_pharmacy_development_only"
BCRYPT_ROUNDS=10

# Admin Credentials (Development)
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD_HASH=`$2b`$12`$UQGug4ewxXBvHFW2PTM/Memb9Dp18HR4.xQQs5qakEAzu40VA76A.
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# CSRF Protection (Development)
CSRF_SECRET=dev_csrf_secret_key_2025_mymeds_pharmacy_development_only_64_chars_long

# Email Configuration (Development - console logging)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc. (Dev)"

# WordPress Integration (Placeholder - fill with actual values)
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APP_PASSWORD=your_wordpress_app_password
FEATURE_WORDPRESS_ENABLED=true

# WooCommerce Integration (Placeholder - fill with actual values)
WOOCOMMERCE_STORE_URL=https://your-wordpress-site.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here
WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
FEATURE_WOOCOMMERCE_ENABLED=true

# CORS Configuration (Development)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,http://localhost:8080
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control

# Security Configuration (Relaxed for development)
HELMET_ENABLED=false
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=false
RATE_LIMIT_ENABLED=false

# Logging Configuration (Verbose for development)
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/dev.log

# Performance Configuration (Disabled for development)
COMPRESSION_ENABLED=false
CLUSTER_ENABLED=false

# Debug & Development (Debug for development)
DEBUG_MODE=true
VERBOSE_LOGGING=true
ENABLE_DEV_TOOLS=true
"@

# Write to backend directory
$backendEnv | Out-File -FilePath "backend/.env.development" -Encoding UTF8
Write-Host "Created backend/.env.development" -ForegroundColor Cyan

# Create root development environment file
$rootEnv = @"
# =============================================================================
# FRONTEND DEVELOPMENT ENVIRONMENT - MyMeds Pharmacy Inc.
# =============================================================================

# Backend URL for frontend to connect
VITE_BACKEND_URL=http://localhost:4000
VITE_API_BASE_URL=/api

# External Services (Placeholder values)
VITE_WORDPRESS_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_STORE_URL=https://your-wordpress-site.com
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_your_consumer_key_here
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_your_consumer_secret_here

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=false

# Contact Information (Example values)
VITE_PHONE_NUMBER=+1347312645
VITE_CONTACT_EMAIL=contact@mymedspharmacyinc.com
VITE_PHARMACY_ADDRESS=2242 65th St, Brooklyn, NY 11204
VITE_PHARMACY_HOURS=Mon-Fri: 9AM-7PM, Sat: 9AM-5PM, Sun: 10AM-4PM
VITE_GOOGLE_MAPS_URL=https://www.google.com/maps/dir/?api=1&destination=My+Meds+Pharmacy+Inc.+2242+65th+St+New+York+11204+United+States
"@

# Write to root directory
$rootEnv | Out-File -FilePath ".env.development" -Encoding UTF8
Write-Host "Created .env.development" -ForegroundColor Cyan

Write-Host ""
Write-Host "Environment files created successfully!" -ForegroundColor Green
Write-Host "You can now start the development servers:" -ForegroundColor Yellow
Write-Host "Frontend: npm run dev" -ForegroundColor White
Write-Host "Backend: cd backend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Note: Fill in actual values for WordPress/WooCommerce integration" -ForegroundColor Cyan
