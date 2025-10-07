# MyMeds Pharmacy - Complete Setup Guide

## Quick Start

### Development
```bash
# Frontend
npm run dev

# Backend (in separate terminal)
cd backend
npm run dev
```

### Production Deployment
```bash
# Automated deployment
chmod +x deployment/deploy-vps.sh
./deployment/deploy-vps.sh
```

## Admin Access
- **URL**: `/admin`
- **Email**: `mymedspharmacy@outlook.com`
- **Password**: `AdminPassword123!`

## Environment Setup

Create `.env` in backend directory:
```bash
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="mymeds-pharmacy-jwt-secret-key-minimum-32-characters-long-for-security"
JWT_EXPIRES_IN="24h"
NODE_ENV="development"
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="ck_53fdd27f30ed79ec853ec3b10c4a33166e598292"
WOOCOMMERCE_CONSUMER_SECRET="cs_32a8da67d460a141b453b732aaa685c29c584ad9"
PORT=3001
CORS_ORIGIN="http://localhost:3005"
ADMIN_EMAIL="mymedspharmacy@outlook.com"
ADMIN_PASSWORD="AdminPassword123!"
ADMIN_NAME="Admin User"
CSRF_SECRET="mymeds-pharmacy-csrf-secret-key-minimum-32-characters-long-for-security"
```

## Features
- Patient management portal
- Appointment booking system
- WooCommerce e-commerce integration
- Admin dashboard
- Form management
- WordPress blog integration

---

## Pre-Deployment Checklist

### ✅ **Before Pushing to Git:**

1. **Environment Configuration**
   - [ ] Update admin email to production email
   - [ ] Set strong JWT_SECRET (32+ characters)
   - [ ] Set strong CSRF_SECRET (32+ characters)
   - [ ] Configure production database URL
   - [ ] Set production WooCommerce credentials

2. **Security Check**
   - [ ] No hardcoded passwords in code
   - [ ] All secrets in environment variables
   - [ ] CSRF protection enabled
   - [ ] Rate limiting configured

3. **Build Test**
   - [ ] Frontend builds successfully (`npm run build`)
   - [ ] Backend builds successfully (`cd backend && npm run build`)
   - [ ] All TypeScript errors resolved

4. **Configuration Files**
   - [ ] PM2 ecosystem.config.js paths updated
   - [ ] Nginx configuration paths updated
   - [ ] Database schema ready for production

---

## Admin Authentication System

### Authentication Method: JWT + bcrypt

**Backend Authentication Flow:**
1. **Email/Password Login** → `/api/admin/login`
2. **bcrypt Password Verification** → Secure password hashing
3. **JWT Token Generation** → 2-hour expiration
4. **Session Management** → Database-tracked sessions
5. **CSRF Token** → Additional security layer

### Security Features

**1. Password Security:**
- **bcrypt Hashing**: Passwords stored as bcrypt hashes
- **Strong Requirements**: Minimum 12 characters
- **Password History**: Tracks last 5 passwords

**2. Rate Limiting:**
- **Failed Attempts**: Max 5 attempts per account
- **IP-based Limiting**: Max 10 attempts per IP per 15 minutes
- **Lockout Duration**: 15 minutes after max attempts

**3. Session Management:**
- **JWT Tokens**: 2-hour expiration
- **Session Timeout**: 30 minutes of inactivity
- **Token Blacklisting**: Logout invalidates tokens

### Environment Configuration

```bash
# Admin Credentials
ADMIN_EMAIL=mymedspharmacy@outlook.com
ADMIN_PASSWORD=AdminPassword123!
ADMIN_NAME=Admin User

# Security Configuration
JWT_SECRET=your_32_character_minimum_secret
CSRF_SECRET=your_32_character_minimum_csrf_secret
```

### API Endpoints

**Admin Login:**
```http
POST /api/admin/login
Content-Type: application/json

{
  "email": "mymedspharmacy@outlook.com",
  "password": "AdminPassword123!"
}
```

**Admin Logout:**
```http
POST /api/admin/logout
Authorization: Bearer jwt_token_here
X-CSRF-Token: csrf_token_here
```

---

## Adding Admin Users

### Admin User Details
**Email:** `mymedspharmacy@outlook.com`  
**Password:** `AdminPassword123!`  
**Name:** `Admin User`  
**Role:** `ADMIN`

### Environment Variables
```bash
# Second Admin User (Optional)
ADMIN2_EMAIL=mymedspharmacyinc@gmail.com
ADMIN2_PASSWORD_HASH=$2b$12$auPmZQBuFSoEiqpK1mTQWu7ItdaRkAQjKgK0xL/X8TDA3iuGEnNFa
ADMIN2_FIRST_NAME=MyMeds
ADMIN2_LAST_NAME=Admin
```

### Setup Commands
```bash
cd /var/www/mymeds-pharmacy/backend

# Using TypeScript
npx ts-node src/ensureAdminUser2.ts

# Using JavaScript
node add-admin-user.js mymedspharmacyinc@gmail.com "AdminPassword123!" "MyMeds" "Admin"
```

---

## WooCommerce Payment Setup

### Available Payment Gateways

**1. Direct Bank Transfer (BACS)**
- ✅ Enabled by default
- Manual payment via bank transfer
- Admin marks orders as "paid" after receiving payment

**2. Stripe (Credit Cards)**
- ⚠️ Requires setup
- Real-time credit card processing
- Setup Required: Stripe account and API keys

**3. PayPal**
- ⚠️ Requires setup  
- PayPal payment processing
- Setup Required: PayPal business account

### Setup Instructions

**Step 1: Access WooCommerce Settings**
1. Log into WordPress admin panel
2. Navigate to **WooCommerce > Settings > Payments**
3. Enable desired payment gateways

**Step 2: Configure Stripe**
1. Create Stripe account at https://stripe.com
2. Get API keys from Stripe Dashboard
3. In WooCommerce, enable Stripe payment gateway
4. Enter Stripe API keys:
   - **Publishable Key**: pk_test_...
   - **Secret Key**: sk_test_...

### Environment Variables
```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal Configuration  
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

---

## WordPress Setup

### Installation
1. Download WordPress latest version
2. Extract to `/var/www/wordpress`
3. Set proper permissions:
   ```bash
   chown -R www-data:www-data /var/www/wordpress
   chmod -R 755 /var/www/wordpress
   ```

### Database Setup
```bash
# Create WordPress database
mysql -u root -p -e "CREATE DATABASE wordpress CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Create WordPress user
mysql -u root -p -e "CREATE USER 'wordpress'@'localhost' IDENTIFIED BY 'strong_password_here';"

# Grant permissions
mysql -u root -p -e "GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

### Configuration
Copy `wp-config-sample.php` to `wp-config.php` and configure:
```php
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', 'your_strong_password_here');
define('DB_HOST', 'localhost');

// Security settings
define('WP_DEBUG', false);
define('DISALLOW_FILE_EDIT', true);
```

### WooCommerce Plugin
```bash
# Download and install WooCommerce
cd /var/www/wordpress
wget https://downloads.wordpress.org/plugin/woocommerce.latest-stable.zip
unzip woocommerce.latest-stable.zip -d wp-content/plugins/
chown -R www-data:www-data wp-content/plugins/woocommerce/
```

---

## Troubleshooting

### Common Issues

**1. Login Fails:**
- Check ADMIN_EMAIL and ADMIN_PASSWORD_HASH in .env
- Verify bcrypt hash format (starts with $2)
- Check JWT_SECRET is set and 32+ characters

**2. WordPress 500 Errors:**
- Check PHP error logs: `/var/log/php8.1-fpm.log`
- Verify database connection
- Check file permissions

**3. WooCommerce API Issues:**
- Verify WooCommerce REST API is enabled
- Check consumer key/secret permissions
- Test API connection via WooCommerce > Settings > Advanced > REST API

**4. Payment Gateway Issues:**
- Verify API keys are correct
- Check if gateway is enabled in WooCommerce settings
- Review WooCommerce logs for errors

### Testing Commands

```bash
# Test admin login
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mymedspharmacy@outlook.com","password":"AdminPassword123!"}'

# Test WordPress API
curl -I "https://yourdomain.com/wp-json/"

# Test WooCommerce API
curl -X GET "https://yourdomain.com/wp-json/wc/v3/products" \
  -u "consumer_key:consumer_secret"
```

---

## Security Best Practices

1. **Strong Password Requirements**
   - Minimum 12 characters
   - bcrypt hashing with salt rounds

2. **Rate Limiting**
   - Failed login attempt tracking
   - IP-based rate limiting
   - Account lockout after max attempts

3. **Session Security**
   - Short token expiration (2 hours)
   - Session timeout (30 minutes)
   - Token blacklisting on logout

4. **CSRF Protection**
   - CSRF tokens for state-changing operations
   - Token validation on server

5. **Production Security**
   - Always use HTTPS in production
   - Keep API keys secure
   - Use test keys during development
   - Enable fraud protection in payment gateways

---

## Support

For issues:
1. Check application logs
2. Verify database connectivity
3. Ensure all environment variables are set
4. Test API endpoints directly
5. Check browser console for frontend errors
