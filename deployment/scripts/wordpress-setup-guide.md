# WordPress & WooCommerce Setup Guide

## 🚀 Complete WordPress and WooCommerce Configuration for MyMeds Pharmacy

This guide will help you set up WordPress and WooCommerce with your MyMeds Pharmacy application.

---

## 📋 Prerequisites

1. ✅ MyMeds application deployed and running
2. ✅ WordPress container accessible at `https://mymedspharmacyinc.com/wp-admin/`
3. ✅ Environment variables configured in `.env.production`
4. ✅ SSL certificates installed

---

## 🔧 Step 1: WordPress Initial Setup

### 1.1 Access WordPress Admin

1. Navigate to: `https://mymedspharmacyinc.com/wp-admin/`
2. Complete the WordPress installation wizard
3. Create your admin account
4. Choose a theme (recommended: Storefront for WooCommerce)

### 1.2 WordPress Configuration

1. **Go to Settings → General**
   - Site Title: `MyMeds Pharmacy Inc.`
   - Tagline: `Your Trusted Pharmacy Partner`
   - WordPress Address (URL): `https://mymedspharmacyinc.com/blog`
   - Site Address (URL): `https://mymedspharmacyinc.com/blog`

2. **Go to Settings → Permalinks**
   - Select: `Post name`
   - Save changes

---

## 🛒 Step 2: WooCommerce Setup

### 2.1 Install WooCommerce

1. **Go to Plugins → Add New**
2. Search for "WooCommerce"
3. Install and activate the WooCommerce plugin
4. Follow the WooCommerce setup wizard

### 2.2 WooCommerce Configuration

1. **Store Setup**
   - Country/Region: United States
   - Industry: Health and Beauty
   - Product Types: Physical products, Downloads
   - Business Details:
     - How many products: 1-10
     - Currently selling: No, I'm just starting

2. **Business Information**
   - Store Address: Your pharmacy address
   - Currency: USD ($)
   - Payment Methods: Choose appropriate options

### 2.3 WooCommerce Settings

1. **Go to WooCommerce → Settings**

2. **General Tab**
   - Base Location: United States
   - Currency: USD ($)
   - Thousand Separator: `,`
   - Decimal Separator: `.`
   - Number of Decimals: `2`

3. **Products Tab**
   - Shop page: Create a new page called "Shop"
   - Product data: Enable all options
   - Product ratings: Enable

4. **Shipping Tab**
   - Configure shipping zones for your area
   - Set up shipping methods (Free shipping, Flat rate)

5. **Payments Tab**
   - Enable payment methods:
     - Cash on delivery
     - Check payments
     - Bank transfer
     - Credit card (if you have a payment gateway)

---

## 🔑 Step 3: Generate API Credentials

### 3.1 Create WooCommerce API Keys

1. **Go to WooCommerce → Settings → Advanced → REST API**
2. **Click "Add Key"**
3. **Fill in the details:**
   - Description: `MyMeds Pharmacy API`
   - User: Select your admin user
   - Permissions: `Read/Write`
4. **Click "Generate API Key"**
5. **Copy the Consumer Key and Consumer Secret**

### 3.2 Update Environment Variables

Update your `.env.production` file with the generated keys:

```bash
WOOCOMMERCE_CONSUMER_KEY=ck_your_generated_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_generated_secret_here
WOOCOMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
```

---

## 🔐 Step 4: WordPress Application Password

### 4.1 Create Application Password

1. **Go to Users → Profile**
2. **Scroll down to "Application Passwords"**
3. **Enter Application Name:** `MyMeds Pharmacy API`
4. **Click "Add New Application Password"**
5. **Copy the generated password**

### 4.2 Update Environment Variables

Update your `.env.production` file:

```bash
WORDPRESS_USERNAME=your_admin_username
WORDPRESS_APP_PASSWORD=your_generated_app_password
```

---

## 📝 Step 5: WordPress Content Setup

### 5.1 Create Essential Pages

1. **Home Page**
   - Title: `Welcome to MyMeds Pharmacy`
   - Content: Your pharmacy introduction

2. **About Page**
   - Title: `About Us`
   - Content: Your pharmacy story and team

3. **Contact Page**
   - Title: `Contact Us`
   - Content: Contact information and form

4. **Privacy Policy**
   - Title: `Privacy Policy`
   - Content: Your privacy policy

5. **Terms of Service**
   - Title: `Terms of Service`
   - Content: Your terms and conditions

### 5.2 Configure Menus

1. **Go to Appearance → Menus**
2. **Create a new menu**
3. **Add pages and organize navigation**
4. **Assign to appropriate locations**

---

## 🏪 Step 6: WooCommerce Products Setup

### 6.1 Add Product Categories

1. **Go to Products → Categories**
2. **Add categories:**
   - Prescription Medications
   - Over-the-Counter
   - Health & Wellness
   - Personal Care
   - Medical Supplies

### 6.2 Add Sample Products

1. **Go to Products → Add New**
2. **Create sample products for each category**
3. **Add product images and descriptions**
4. **Set prices and inventory**

### 6.3 Configure Product Settings

1. **Go to WooCommerce → Settings → Products**
2. **Enable product reviews**
3. **Set up inventory management**
4. **Configure product data settings**

---

## 🔗 Step 7: Integration Testing

### 7.1 Test WordPress API

```bash
# Test WordPress REST API
curl -u "username:app_password" https://mymedspharmacyinc.com/blog/wp-json/wp/v2/posts
```

### 7.2 Test WooCommerce API

```bash
# Test WooCommerce API
curl -u "consumer_key:consumer_secret" https://mymedspharmacyinc.com/shop/wp-json/wc/v3/products
```

### 7.3 Test MyMeds Integration

1. **Visit your MyMeds application**
2. **Go to the Shop page**
3. **Verify products are loading from WooCommerce**
4. **Go to the Blog page**
5. **Verify posts are loading from WordPress**

---

## 🎨 Step 8: Theme Customization

### 8.1 Choose a Suitable Theme

Recommended themes for pharmacy businesses:
- **Storefront** (WooCommerce official theme)
- **Astra** (Lightweight and customizable)
- **GeneratePress** (Fast and flexible)

### 8.2 Customize Theme

1. **Go to Appearance → Customize**
2. **Customize colors to match your brand**
3. **Upload your logo**
4. **Configure layout and typography**
5. **Set up homepage sections**

---

## 🔒 Step 9: Security Configuration

### 9.1 Install Security Plugins

Recommended plugins:
- **Wordfence Security**
- **Sucuri Security**
- **iThemes Security**

### 9.2 Configure Security Settings

1. **Enable two-factor authentication**
2. **Set up login limits**
3. **Configure file monitoring**
4. **Enable firewall protection**

---

## 📊 Step 10: Performance Optimization

### 10.1 Install Performance Plugins

Recommended plugins:
- **WP Rocket** (Premium caching)
- **W3 Total Cache** (Free caching)
- **Smush** (Image optimization)
- **Autoptimize** (Code optimization)

### 10.2 Configure Caching

1. **Set up page caching**
2. **Configure object caching**
3. **Enable browser caching**
4. **Optimize database**

---

## ✅ Verification Checklist

- [ ] WordPress admin accessible at `/wp-admin/`
- [ ] WooCommerce installed and configured
- [ ] API credentials generated and working
- [ ] WordPress application password created
- [ ] Environment variables updated
- [ ] Products added to WooCommerce
- [ ] Blog posts created
- [ ] MyMeds app integration working
- [ ] SSL certificates working
- [ ] Security plugins installed
- [ ] Performance optimization completed

---

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check API credentials
   - Verify SSL certificates
   - Check firewall settings

2. **Products Not Loading**
   - Verify WooCommerce API keys
   - Check product permissions
   - Test API endpoints manually

3. **WordPress Posts Not Loading**
   - Check application password
   - Verify WordPress URL
   - Test REST API access

### Getting Help

1. **Check logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Test API endpoints:**
   ```bash
   curl -I https://mymedspharmacyinc.com/api/health
   curl -I https://mymedspharmacyinc.com/wp-json/wp/v2/posts
   ```

3. **Verify environment variables:**
   ```bash
   node deployment/scripts/validate-environment.js
   ```

---

## 🎉 Completion

Once all steps are completed, your MyMeds Pharmacy application will have:

- ✅ Full WordPress integration for blog content
- ✅ Complete WooCommerce integration for e-commerce
- ✅ Secure API connections
- ✅ Professional pharmacy website
- ✅ Product catalog and shopping cart
- ✅ Blog and content management
- ✅ Admin dashboard integration

Your pharmacy application is now ready for production use! 🚀
