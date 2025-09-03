# 🔧 API Configuration Guide

## Overview
This guide helps you configure external APIs for MyMeds Pharmacy.

## 1. WooCommerce Configuration

### Step 1: Generate WooCommerce API Keys
1. Go to your WooCommerce admin: `https://mymedspharmacyinc.com/shop/wp-admin`
2. Navigate to **WooCommerce > Settings > Advanced > REST API**
3. Click **Add Key**
4. Set:
   - **Description**: MyMeds Pharmacy Integration
   - **Permissions**: Read/Write
   - **User**: Select an admin user
5. Click **Generate API Key**
6. Copy the **Consumer Key** and **Consumer Secret**

### Step 2: Update Environment Variables
Update `backend/env.production`:
```env
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/shop
WOOCOMMERCE_CONSUMER_KEY=ck_your_actual_consumer_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_actual_consumer_secret_here
WOOCOMMERCE_VERSION=wc/v3
WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
```

## 2. WordPress Configuration

### Step 1: Create Application Password
1. Go to your WordPress admin: `https://mymedspharmacyinc.com/blog/wp-admin`
2. Navigate to **Users > Profile**
3. Scroll down to **Application Passwords**
4. Set:
   - **Name**: MyMeds Pharmacy Integration
   - **Permissions**: Full access
5. Click **Add New Application Password**
6. Copy the generated password

### Step 2: Update Environment Variables
Update `backend/env.production`:
```env
WORDPRESS_URL=https://mymedspharmacyinc.com/blog
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APPLICATION_PASSWORD=your_application_password_here
```

## 3. OpenFDA Configuration

### Step 1: Get API Key (Optional)
1. Go to: https://open.fda.gov/apis/authentication/
2. Register for a free API key
3. The API works without a key but has rate limits

### Step 2: Update Environment Variables
Update `backend/env.production`:
```env
OPENFDA_API_URL=https://api.fda.gov
OPENFDA_API_KEY=your_api_key_here  # Optional
OPENFDA_RATE_LIMIT=1000  # Requests per day
```

## 4. Email Configuration (SMTP)

### Step 1: Create Gmail App Password
1. Go to your Google Account settings
2. Navigate to **Security > 2-Step Verification**
3. Create an **App Password** for "Mail"
4. Copy the generated password

### Step 2: Update Environment Variables
Update `backend/env.production`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=mymedspharmacyinc@gmail.com
SMTP_PASS=your_gmail_app_password_here
EMAIL_FROM=mymedspharmacyinc@gmail.com
```

## 5. Testing Configuration

### Test WooCommerce
```bash
curl -X GET "https://mymedspharmacyinc.com/shop/wp-json/wc/v3/products" \
  -u "consumer_key:consumer_secret"
```

### Test WordPress
```bash
curl -X GET "https://mymedspharmacyinc.com/blog/wp-json/wp/v2/posts" \
  -H "Authorization: Basic base64_encoded_credentials"
```

### Test OpenFDA
```bash
curl -X GET "https://api.fda.gov/drug/label.json?search=generic_name:aspirin&limit=1"
```

## 6. Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Monitor API usage for unusual activity
- Use HTTPS for all API communications

## 7. Troubleshooting

### Common Issues:
1. **WooCommerce 401 Error**: Check consumer key/secret
2. **WordPress 403 Error**: Verify application password
3. **OpenFDA Rate Limit**: Implement caching
4. **SMTP Connection Failed**: Check app password and 2FA

### Debug Commands:
```bash
# Test WooCommerce connection
curl -X GET "https://mymedspharmacyinc.com/shop/wp-json/wc/v3/system_status" \
  -u "consumer_key:consumer_secret"

# Test WordPress connection
curl -X GET "https://mymedspharmacyinc.com/blog/wp-json/wp/v2/users/me" \
  -H "Authorization: Basic base64_encoded_credentials"
```

## 8. Production Checklist

- [ ] WooCommerce API keys configured
- [ ] WordPress application password set
- [ ] OpenFDA API key obtained (optional)
- [ ] SMTP credentials configured
- [ ] All endpoints tested
- [ ] Rate limiting configured
- [ ] Error handling implemented
- [ ] Monitoring enabled
- [ ] Backup procedures in place
