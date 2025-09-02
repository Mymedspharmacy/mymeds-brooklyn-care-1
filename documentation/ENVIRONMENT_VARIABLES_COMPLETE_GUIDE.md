# 🔧 Complete Environment Variables Guide

## 📋 Overview

This guide provides a comprehensive list of all environment variables needed for the MyMeds Pharmacy system, separated by frontend and backend components.

---

## 🎯 **FRONTEND ENVIRONMENT VARIABLES**

### 📁 **File Location:** `.env` (in project root)

### 🏗️ **Core Application Configuration**

```bash
# Application Settings
NODE_ENV=development
VITE_NODE_ENV=development
VITE_APP_NAME="MyMeds Pharmacy"
VITE_APP_VERSION=1.0.0
```

### 🌐 **API & Backend Configuration**

```bash
# Backend URLs
VITE_API_URL=http://localhost:4000
VITE_BACKEND_URL=http://localhost:4000

# API Configuration
VITE_API_BASE_URL=/api
VITE_API_TIMEOUT=30000
VITE_API_RETRY_ATTEMPTS=3
```

### 🔐 **Authentication & Security**

```bash
# JWT Configuration
VITE_JWT_STORAGE_KEY=admin-token
VITE_REFRESH_TOKEN_KEY=admin-refresh-token
VITE_AUTH_USER_KEY=admin-user-data

# Session Configuration
VITE_SESSION_TIMEOUT=900000
VITE_REMEMBER_ME_DURATION=2592000000

# Security
VITE_ENABLE_HTTPS=false
VITE_STRICT_MODE=true
```

### 📧 **Email & Notifications**

```bash
# Contact Information
VITE_CONTACT_EMAIL=contact@mymedspharmacyinc.com
VITE_SUPPORT_EMAIL=support@mymedspharmacyinc.com
VITE_ADMIN_EMAIL=admin@mymedspharmacyinc.com

# Notification Settings
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_SMS_NOTIFICATIONS=false
```

### 💳 **Payment Configuration**

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Payment Settings
VITE_ENABLE_STRIPE=true
VITE_ENABLE_PAYPAL=false
VITE_CURRENCY=USD
VITE_TAX_RATE=0.0875
```

### 🔄 **WordPress Integration**

```bash
# WordPress Blog
VITE_WORDPRESS_ENABLED=true
VITE_WORDPRESS_URL=https://blog.mymedspharmacyinc.com
VITE_WORDPRESS_API_URL=https://blog.mymedspharmacyinc.com/wp-json/wp/v2
```

### 📱 **PWA & Mobile Configuration**

```bash
# Progressive Web App
VITE_PWA_ENABLED=true
VITE_PWA_NAME="MyMeds Pharmacy"
VITE_PWA_SHORT_NAME="MyMeds"
VITE_PWA_DESCRIPTION="Professional pharmacy services and prescription management"
VITE_PWA_THEME_COLOR=#2563eb
VITE_PWA_BACKGROUND_COLOR=#ffffff

# Mobile Configuration
VITE_MOBILE_OPTIMIZED=true
VITE_TOUCH_FRIENDLY=true
VITE_RESPONSIVE_BREAKPOINTS=true
```

### 📊 **Analytics & Tracking**

```bash
# Google Analytics
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_GOOGLE_ANALYTICS_ENABLED=true

# Facebook Pixel
VITE_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
VITE_FACEBOOK_PIXEL_ENABLED=true

# Hotjar
VITE_HOTJAR_ID=your_hotjar_id
VITE_HOTJAR_ENABLED=false
```

### 🎨 **UI & Theme Configuration**

```bash
# Theme Colors
VITE_PRIMARY_COLOR=#2563eb
VITE_SECONDARY_COLOR=#7c3aed
VITE_ACCENT_COLOR=#f59e0b
VITE_SUCCESS_COLOR=#10b981
VITE_WARNING_COLOR=#f59e0b
VITE_ERROR_COLOR=#ef4444

# UI Configuration
VITE_ENABLE_DARK_MODE=true
VITE_DEFAULT_THEME=light
VITE_ANIMATIONS_ENABLED=true
VITE_LOADING_INDICATORS=true
```

### 📁 **File Upload Configuration**

```bash
# Upload Limits
VITE_MAX_FILE_SIZE=5242880
VITE_MAX_FILES_COUNT=5
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Upload Configuration
VITE_UPLOAD_ENDPOINT=/api/upload
VITE_UPLOAD_CHUNK_SIZE=1048576
VITE_ENABLE_DRAG_AND_DROP=true
```

### 🔍 **Search & Filtering**

```bash
# Search Configuration
VITE_SEARCH_ENABLED=true
VITE_SEARCH_DELAY=300
VITE_SEARCH_MIN_LENGTH=2
VITE_SEARCH_MAX_RESULTS=50

# Filter Configuration
VITE_FILTERS_ENABLED=true
VITE_FILTER_PERSISTENCE=true
VITE_FILTER_DEFAULTS=true
```

### 📱 **Features & Functionality**

```bash
# Core Features
VITE_ENABLE_PRESCRIPTION_REFILL=true
VITE_ENABLE_ONLINE_ORDERING=true
VITE_ENABLE_APPOINTMENT_BOOKING=true
VITE_ENABLE_MEDICATION_REMINDERS=true
VITE_ENABLE_HEALTH_TRACKING=true

# Advanced Features
VITE_ENABLE_CHAT_SUPPORT=false
VITE_ENABLE_VIDEO_CONSULTATIONS=false
VITE_ENABLE_MEDICATION_INTERACTION_CHECKER=true
VITE_ENABLE_PRICE_COMPARISON=true
```

### 🌍 **Internationalization**

```bash
# Language & Localization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,es,fr
VITE_ENABLE_TRANSLATIONS=true
VITE_DATE_FORMAT=MM/DD/YYYY
VITE_TIME_FORMAT=12
VITE_TIMEZONE=America/New_York
```

### 🧪 **Testing & Development**

```bash
# Development Tools
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_LOGGING=true
VITE_LOG_LEVEL=info
VITE_ENABLE_MOCK_DATA=false

# Testing Configuration
VITE_TEST_MODE=false
VITE_MOCK_API_ENABLED=false
VITE_TEST_USER_EMAIL=test@example.com
```

### 📱 **Social Media & Sharing**

```bash
# Social Media
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_TWITTER_CREATOR=@mymedspharmacy
VITE_INSTAGRAM_USERNAME=mymedspharmacy

# Sharing Configuration
VITE_ENABLE_SOCIAL_SHARING=true
VITE_SHARE_TITLE="MyMeds Pharmacy"
VITE_SHARE_DESCRIPTION="Professional pharmacy services and prescription management"
```

### 🔒 **Privacy & Compliance**

```bash
# Privacy Settings
VITE_ENABLE_COOKIE_CONSENT=true
VITE_ENABLE_PRIVACY_POLICY=true
VITE_ENABLE_TERMS_OF_SERVICE=true
VITE_ENABLE_GDPR_COMPLIANCE=true

# HIPAA Compliance
VITE_HIPAA_COMPLIANT=true
VITE_ENABLE_SECURE_MESSAGING=true
VITE_ENABLE_AUDIT_LOGGING=true
```

---

## ⚙️ **BACKEND ENVIRONMENT VARIABLES**

### 📁 **File Location:** `backend/.env` or `backend/env.development` / `backend/env.production`

### 🏗️ **Core Application Settings**

```bash
# Application Configuration
NODE_ENV=development
PORT=4000
HOST=localhost

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001
```

### 🗄️ **Database Configuration**

```bash
# Development Database (SQLite)
DATABASE_URL="file:./dev.db"

# Production Database (MySQL)
# DATABASE_URL="mysql://mymeds_user:strong_password_here@localhost:3306/mymeds_production"

# Alternative: PostgreSQL
# DATABASE_URL="postgresql://mymeds_user:strong_password_here@localhost:5432/mymeds_production"
```

### 🔐 **Security & Authentication**

```bash
# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-32-chars-minimum-required
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=dev-session-secret-key
SESSION_TIMEOUT=3600000

# Admin User Credentials
ADMIN_EMAIL=admin@mymeds.dev
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Development Admin

# Password Policy
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=false
```

### 🌐 **CORS & Security**

```bash
# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8080,http://localhost:8081

# Security Headers
HELMET_ENABLED=true
CONTENT_SECURITY_POLICY_STRICT=false
HSTS_MAX_AGE=0
HSTS_INCLUDE_SUBDOMAINS=false
HSTS_PRELOAD=false
```

### 🚦 **Rate Limiting**

```bash
# Rate Limiting Configuration
RATE_LIMITING_ENABLED=false
DISABLE_RATE_LIMIT=true

# Rate Limit Settings
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_CONTACT_MAX=50
RATE_LIMIT_CONTACT_WINDOW=3600000
```

### 💳 **Payment Processing (WooCommerce)**

```bash
# WooCommerce Configuration
WOOCOMMERCE_STORE_URL=https://your-dev-store.com
WOOCOMMERCE_CONSUMER_KEY=your_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=your_consumer_secret_here
WOOCOMMERCE_CURRENCY=usd
WOOCOMMERCE_PAYMENT_METHODS=card,paypal
WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
```

### 📧 **Email Configuration (SMTP)**

```bash
# SMTP Server Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@mymeds.dev

# Email Settings
EMAIL_VERIFICATION_ENABLED=false
EMAIL_RESET_PASSWORD_ENABLED=false
EMAIL_NOTIFICATIONS_ENABLED=false
```

### 🔗 **External Services**

```bash
# OpenFDA API
OPENFDA_API_URL=https://api.fda.gov

# WordPress Settings
WORDPRESS_SITE_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APPLICATION_PASSWORD=your_app_password
```

### 📝 **Logging & Debugging**

```bash
# Logging Configuration
LOG_LEVEL=debug
LOG_TO_FILE=true
LOG_FILE_PATH=./logs/app.log

# Debug Settings
DEBUG=true
SHOW_ERROR_DETAILS=true
ENABLE_SQL_LOGGING=true
```

### 📁 **File Uploads**

```bash
# File Upload Settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
UPLOAD_PATH=./uploads
```

### 📊 **Monitoring & Analytics (Production Only)**

```bash
# New Relic Monitoring
NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
NEW_RELIC_APP_NAME=MyMeds Pharmacy Production

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 🔒 **Security Monitoring (Production Only)**

```bash
# Security Monitoring
SECURITY_MONITORING_ENABLED=true
FAILED_LOGIN_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION=900000
IP_WHITELIST_ENABLED=true
IP_WHITELIST=127.0.0.1,your_admin_ip_here
```

### 💾 **Backup & Recovery (Production Only)**

```bash
# Backup Settings
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=./backups
```

---

## 🚀 **ENVIRONMENT-SPECIFIC CONFIGURATIONS**

### 🧪 **Development Environment**

```bash
# Frontend (.env)
NODE_ENV=development
VITE_API_URL=http://localhost:4000
VITE_ENABLE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Backend (backend/env.development)
NODE_ENV=development
PORT=4000
DATABASE_URL="file:./dev.db"
DEBUG=true
RATE_LIMITING_ENABLED=false
```

### 🎭 **Staging Environment**

```bash
# Frontend (.env)
NODE_ENV=production
VITE_API_URL=https://api-staging.mymedspharmacyinc.com
VITE_ENABLE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# Backend (backend/env.staging)
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://user:pass@staging-db:3306/mymeds_staging"
DEBUG=false
RATE_LIMITING_ENABLED=true
```

### 🏭 **Production Environment**

```bash
# Frontend (.env)
NODE_ENV=production
VITE_API_URL=https://api.mymedspharmacyinc.com
VITE_ENABLE_DEBUG_MODE=false
VITE_LOG_LEVEL=error

# Backend (backend/env.production)
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://user:pass@prod-db:3306/mymeds_production"
DEBUG=false
RATE_LIMITING_ENABLED=true
SECURITY_MONITORING_ENABLED=true
```

---

## 🔧 **SETUP INSTRUCTIONS**

### 1. **Frontend Setup**

```bash
# Copy the example file
cp scripts/config/env-examples/frontend.env.example .env

# Edit the file with your values
nano .env
```

### 2. **Backend Setup**

```bash
# Copy the appropriate environment file
cp backend/env.development backend/.env

# Edit the file with your values
nano backend/.env
```

### 3. **Generate Secrets**

```bash
# Run the secret generation script
node scripts/utilities/generate-secrets.js
```

---

## 🔒 **SECURITY BEST PRACTICES**

### ✅ **Do's**
- Use strong, unique secrets for each environment
- Rotate secrets regularly (every 90 days)
- Use environment-specific configurations
- Keep .env files out of version control
- Use HTTPS in production
- Enable rate limiting in production

### ❌ **Don'ts**
- Never commit .env files to git
- Don't use the same secrets across environments
- Don't use weak passwords or predictable secrets
- Don't expose sensitive data in logs
- Don't use development settings in production

---

## 🧪 **TESTING CONFIGURATION**

### **Frontend Testing**
```bash
VITE_TEST_MODE=true
VITE_MOCK_API_ENABLED=true
VITE_TEST_USER_EMAIL=test@example.com
```

### **Backend Testing**
```bash
NODE_ENV=test
DATABASE_URL="file:./test.db"
DEBUG=true
LOG_LEVEL=debug
```

---

## 📞 **TROUBLESHOOTING**

### **Common Issues**

1. **CORS Errors**: Check `CORS_ORIGINS` in backend and `VITE_API_URL` in frontend
2. **Database Connection**: Verify `DATABASE_URL` format and credentials
3. **Authentication Issues**: Check JWT secrets and expiration times
4. **File Uploads**: Verify upload paths and permissions
5. **Email Notifications**: Check SMTP credentials and settings

### **Validation Commands**

```bash
# Test backend configuration
cd backend && npm run validate-env

# Test frontend configuration
npm run validate-env

# Test database connection
cd backend && npm run test-db
```

---

## 📋 **CHECKLIST**

### **Before Deployment**

- [ ] All environment variables are set
- [ ] Secrets are generated and secure
- [ ] Database connection is tested
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled (production)
- [ ] SSL certificates are installed (production)
- [ ] Monitoring is configured (production)
- [ ] Backup strategy is in place (production)

### **After Deployment**

- [ ] Health check endpoint responds
- [ ] Admin panel is accessible
- [ ] Database operations work
- [ ] File uploads function
- [ ] Email notifications send
- [ ] Payment processing works
- [ ] WordPress integration functions
- [ ] Analytics are tracking

---

**📧 For support:** admin@mymedspharmacyinc.com  
**🌐 Documentation:** [Complete Documentation Index](README.md)

