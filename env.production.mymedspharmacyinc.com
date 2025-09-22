# =============================================================================
# PRODUCTION ENVIRONMENT - MyMeds Pharmacy Inc.
# =============================================================================
# Domain: mymedspharmacyinc.com
# VPS IP: 72.60.116.253
# =============================================================================

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
MYSQL_ROOT_PASSWORD=Mymeds2025!RootSecure123!@#
MYSQL_DATABASE=mymeds_production
MYSQL_USER=mymeds_user
MYSQL_PASSWORD=Mymeds2025!UserSecure123!@#

# WordPress Database
WORDPRESS_DB_NAME=wordpress
WORDPRESS_TABLE_PREFIX=wp_

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# =============================================================================
# JWT & AUTHENTICATION
# =============================================================================
JWT_SECRET=Mymeds2025!JWTSecretKey_PharmacySecure_Production_2025!@#$%^&*()
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# =============================================================================
# ADMIN CREDENTIALS
# =============================================================================
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD=Mymeds2025!AdminSecure123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mymedspharmacyinc@gmail.com
EMAIL_PASSWORD=YourGmailAppPasswordHere
EMAIL_FROM=mymedspharmacyinc@gmail.com
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

# =============================================================================
# DOMAIN CONFIGURATION
# =============================================================================
# Primary domain
DOMAIN=mymedspharmacyinc.com
DOMAIN_WWW=www.mymedspharmacyinc.com

# CORS Configuration (Domain + VPS IP for development)
CORS_ORIGIN=https://www.mymedspharmacyinc.com,https://mymedspharmacyinc.com,http://72.60.116.253:8080,http://72.60.116.253:3000,http://72.60.116.253:4000
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS,PATCH
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control
CORS_MAX_AGE=86400

# =============================================================================
# WORDPRESS INTEGRATION
# =============================================================================
WORDPRESS_URL=http://wordpress:80
WORDPRESS_USERNAME=mymeds_api_user
WORDPRESS_APP_PASSWORD=X8J0 ICBi 5Ilb PnrX Bhyp r2PE
FEATURE_WORDPRESS_ENABLED=true
WORDPRESS_API_TIMEOUT=10000
WORDPRESS_CACHE_TTL=300

# =============================================================================
# WOOCOMMERCE INTEGRATION
# =============================================================================
WOOCOMMERCE_STORE_URL=http://wordpress:80
WOOCOMMERCE_CONSUMER_KEY=ck_47e02dc770a3824275746e6efd09a01497e3881f
WOOCOMMERCE_CONSUMER_SECRET=cs_9fc99adfd9306f1b02005701f7a1eb4244be2d46
WOOCOMMERCE_WEBHOOK_SECRET=Mymeds2025!WooCommerceWebhookSecret_Production_2025!@#
FEATURE_WOOCOMMERCE_ENABLED=true
WOOCOMMERCE_API_TIMEOUT=10000
WOOCOMMERCE_CACHE_TTL=300

# =============================================================================
# PAYMENT GATEWAY CONFIGURATION
# =============================================================================
STRIPE_SECRET_KEY=sk_live_YourStripeSecretKey123
STRIPE_PUBLISHABLE_KEY=pk_live_YourStripePublishableKey123
STRIPE_WEBHOOK_SECRET=whsec_YourStripeWebhookSecret123
PAYMENT_GATEWAY_ENABLED=true

# =============================================================================
# MONITORING & ANALYTICS
# =============================================================================
SENTRY_DSN=https://YourSentryDSN@sentry.io/project-id
SENTRY_ENABLED=true
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
ANALYTICS_ENABLED=true

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
SESSION_SECRET=Mymeds2025!SessionSecret_PharmacySecure_Production_2025!@#$%^&*()
BCRYPT_ROUNDS=12
HELMET_ENABLED=true
XSS_PROTECTION=true
CONTENT_SECURITY_POLICY=true

# =============================================================================
# PERFORMANCE CONFIGURATION (Optimized for 1 CPU)
# =============================================================================
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6
CLUSTER_ENABLED=false
CLUSTER_WORKERS=1

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
LOG_MAX_SIZE=10485760
LOG_MAX_FILES=5

# =============================================================================
# BACKUP CONFIGURATION
# =============================================================================
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *
BACKUP_RETENTION_DAYS=30
BACKUP_PATH=./backups

# =============================================================================
# REDIS CONFIGURATION
# =============================================================================
REDIS_PASSWORD=Mymeds2025!RedisSecure123!@#

# =============================================================================
# DEVELOPMENT OVERRIDES (DISABLE IN PRODUCTION)
# =============================================================================
DEBUG_MODE=false
VERBOSE_LOGGING=false
