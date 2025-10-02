# MyMeds VPS Credentials Setup Guide

## Where to Add Credentials

### 1. Environment Variables File
**Location:** `/var/www/mymeds/.env.production`

Create this file on your VPS with the following structure:

```bash
# =============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================================================

# Server Configuration
NODE_ENV=production
PORT=4000
HOST=0.0.0.0

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
DATABASE_URL="mysql://mymeds_user:MyMeds2025!SecurePassword@localhost:3306/mymeds_db"

# =============================================================================
# JWT & AUTHENTICATION
# =============================================================================
# Generate secure JWT secret (use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET="YOUR_SUPER_SECURE_JWT_SECRET_KEY_HERE_64_CHARACTERS_MINIMUM"
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET="YOUR_SESSION_SECRET_KEY_HERE_64_CHARACTERS_MINIMUM"
BCRYPT_ROUNDS=12

# =============================================================================
# ADMIN CREDENTIALS
# =============================================================================
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_PASSWORD="YOUR_SECURE_ADMIN_PASSWORD_HERE"
ADMIN_FIRST_NAME="Admin"
ADMIN_LAST_NAME="User"

# =============================================================================
# WOOCOMMERCE INTEGRATION
# =============================================================================
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_CONSUMER_KEY="ck_YOUR_WOOCOMMERCE_CONSUMER_KEY_HERE"
WOOCOMMERCE_CONSUMER_SECRET="cs_YOUR_WOOCOMMERCE_CONSUMER_SECRET_HERE"
WOOCOMMERCE_WEBHOOK_SECRET="YOUR_WOOCOMMERCE_WEBHOOK_SECRET_HERE"
FEATURE_WOOCOMMERCE_ENABLED=true

# =============================================================================
# WORDPRESS INTEGRATION
# =============================================================================
WORDPRESS_SITE_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="YOUR_WORDPRESS_USERNAME"
WORDPRESS_APPLICATION_PASSWORD="YOUR_WORDPRESS_APP_PASSWORD"
WORDPRESS_APP_PASSWORD="YOUR_WORDPRESS_APP_PASSWORD"
FEATURE_WORDPRESS_ENABLED=true

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="mymedspharmacyinc@gmail.com"
EMAIL_PASSWORD="YOUR_GMAIL_APP_PASSWORD_HERE"
EMAIL_FROM="mymedspharmacyinc@gmail.com"
EMAIL_FROM_NAME="MyMeds Pharmacy Inc."

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
# CORS CONFIGURATION
# =============================================================================
CORS_ORIGIN="https://mymedspharmacyinc.com,https://www.mymedspharmacyinc.com"
CORS_CREDENTIALS=true
CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS,PATCH"
CORS_ALLOWED_HEADERS="Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control"

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================
LOG_LEVEL="info"
LOG_FILE_PATH="./logs/app.log"

# =============================================================================
# PERFORMANCE CONFIGURATION
# =============================================================================
COMPRESSION_ENABLED=true
CLUSTER_ENABLED=true
CACHE_ENABLED=true
CACHE_TTL=300000

# =============================================================================
# DEBUG & DEVELOPMENT (DISABLE IN PRODUCTION)
# =============================================================================
DEBUG_MODE=false
VERBOSE_LOGGING=false
ENABLE_DEV_TOOLS=false
```

## How to Get Each Credential

### 1. WooCommerce Consumer Key (ck_) and Consumer Secret (cs_)

**Steps:**
1. Log into your WordPress admin: `https://mymedspharmacyinc.com/wp-admin`
2. Go to **WooCommerce** → **Settings** → **Advanced** → **REST API**
3. Click **Add Key**
4. Fill in:
   - **Description:** MyMeds API
   - **User:** Select your admin user
   - **Permissions:** Read/Write
5. Click **Generate API Key**
6. Copy the **Consumer Key** and **Consumer Secret**

**Add to .env.production:**
```bash
WOOCOMMERCE_CONSUMER_KEY="ck_1234567890abcdef"
WOOCOMMERCE_CONSUMER_SECRET="cs_abcdef1234567890"
```

### 2. WordPress Application Password

**Steps:**
1. Log into WordPress admin: `https://mymedspharmacyinc.com/wp-admin`
2. Go to **Users** → **Profile**
3. Scroll down to **Application Passwords**
4. Enter **Application Name:** MyMeds API
5. Click **Add New Application Password**
6. Copy the generated password (it will only show once)

**Add to .env.production:**
```bash
WORDPRESS_USERNAME="your_wp_username"
WORDPRESS_APPLICATION_PASSWORD="abcd efgh ijkl mnop qrst uvwx"
```

### 3. JWT Secret

**Generate on VPS:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Add to .env.production:**
```bash
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8"
```

### 4. Admin Credentials

**Choose secure credentials:**
```bash
ADMIN_EMAIL="admin@mymedspharmacyinc.com"
ADMIN_PASSWORD="YourSecureAdminPassword123!"
```

### 5. Gmail App Password (for email notifications)

**Steps:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to **Security** → **App passwords**
4. Generate password for "MyMeds Pharmacy"
5. Use this password (not your regular Gmail password)

**Add to .env.production:**
```bash
EMAIL_PASSWORD="your_16_character_app_password"
```

## Security Best Practices

### 1. File Permissions
```bash
# Set secure permissions for .env.production
chmod 600 /var/www/mymeds/.env.production
chown www-data:www-data /var/www/mymeds/.env.production
```

### 2. Database Security
```bash
# Use strong database password
# Example: MyMeds2025!SecurePassword
```

### 3. JWT Security
- Use at least 64 characters
- Include numbers, letters, and special characters
- Never share or commit to version control

### 4. Admin Password
- Minimum 12 characters
- Include uppercase, lowercase, numbers, and symbols
- Example: `AdminPass123!@#`

## Verification Steps

### 1. Test WooCommerce Connection
```bash
curl -u "ck_your_key:cs_your_secret" \
  "https://mymedspharmacyinc.com/wp-json/wc/v3/products?per_page=1"
```

### 2. Test WordPress Connection
```bash
curl -u "username:app_password" \
  "https://mymedspharmacyinc.com/wp-json/wp/v2/posts?per_page=1"
```

### 3. Test Admin Login
- Visit: `https://mymedspharmacyinc.com/admin`
- Use your admin credentials

## Troubleshooting

### Common Issues:

1. **WooCommerce API Error 401**
   - Check consumer key and secret
   - Verify user permissions
   - Ensure WooCommerce is active

2. **WordPress API Error 401**
   - Check application password
   - Verify username
   - Ensure REST API is enabled

3. **JWT Token Error**
   - Check JWT secret length (64+ characters)
   - Verify JWT_EXPIRES_IN format

4. **Database Connection Error**
   - Check DATABASE_URL format
   - Verify MySQL user permissions
   - Test database connection

## File Locations on VPS

```
/var/www/mymeds/
├── .env.production          # Main environment file
├── backend/
│   ├── dist/               # Built backend
│   └── prisma/
│       └── schema.prisma   # Database schema
├── dist/                   # Built frontend
└── logs/                   # Application logs
```

## Next Steps After Setup

1. **Test all connections**
2. **Verify admin panel access**
3. **Test WooCommerce integration**
4. **Test WordPress integration**
5. **Monitor logs for errors**
6. **Set up monitoring and alerts**

---

**Important:** Never commit the `.env.production` file to version control. Keep it secure and backed up separately.

