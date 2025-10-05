# Production Configuration Guide
# MyMeds Pharmacy Inc. - Production Deployment Settings

## Environment Variables Required for Production

Create a `.env` file in the `backend` directory with the following variables:

```bash
# Database Configuration (MySQL)
DATABASE_URL="mysql://username:password@localhost:3306/mymeds_production"

# JWT Configuration
JWT_SECRET="your-super-secure-production-jwt-secret-key-change-this"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN="https://mymedspharmacyinc.com"

# Rate Limiting (Production)
RATE_LIMIT_AUTH=10
RATE_LIMIT_CONTACT=20
RATE_LIMIT_GENERAL=1000

# WooCommerce Configuration
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="your-woocommerce-consumer-key"
WOOCOMMERCE_CONSUMER_SECRET="your-woocommerce-consumer-secret"

# WordPress Configuration
WORDPRESS_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="your-wordpress-username"
WORDPRESS_PASSWORD="your-wordpress-application-password"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Admin Configuration
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_NAME="Admin User"
ADMIN_PASSWORD="your-secure-admin-password"

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET="your-session-secret-key"
```

## Production Deployment Steps

1. **Database Setup:**
   - Install MySQL server
   - Create production database: `mymeds_production`
   - Update DATABASE_URL with correct credentials

2. **Prisma Setup:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

3. **Environment Configuration:**
   - Copy the environment variables above to `.env` file
   - Update all placeholder values with real credentials
   - Ensure all API keys are production keys (not test keys)

4. **Build and Deploy:**
   ```bash
   # Frontend
   npm run build
   
   # Backend
   cd backend
   npm run build
   ```

5. **Security Considerations:**
   - Use strong, unique passwords
   - Enable HTTPS in production
   - Configure proper CORS origins
   - Set up rate limiting
   - Use production API keys only

## Changes Made for Production

- ✅ Prisma schema updated to MySQL
- ✅ Sample data fallbacks removed from admin panel
- ✅ Error handling updated for production
- ✅ Environment configuration prepared
- ✅ Production deployment guide created
