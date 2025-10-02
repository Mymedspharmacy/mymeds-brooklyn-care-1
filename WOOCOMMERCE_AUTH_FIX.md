# 🔧 WooCommerce Authentication Fix

## ❌ **CURRENT ISSUE:**
```
Error: WooCommerce API error: 401 - {"code":"woocommerce_rest_cannot_view","message":"Sorry, you cannot list resources.","data":{"status":401}}
```

## 🔍 **ROOT CAUSE:**
The Consumer Key `ck_377d5e37088fb192960cfd6d5bc187fff882df0b` doesn't have **Read** permissions in WooCommerce.

## ✅ **SOLUTION:**

### **Step 1: Fix Consumer Key Permissions**

1. **Go to your WordPress Admin Panel**
2. **Navigate to:** WooCommerce → Settings → Advanced → REST API
3. **Find your Consumer Key:** `ck_377d5e37088fb192960cfd6d5bc187fff882df0b`
4. **Edit the key** and ensure it has:
   - ✅ **Read** permission (required for fetching products)
   - ✅ **Write** permission (required for creating orders)
5. **Save the changes**

### **Step 2: Alternative - Create New Consumer Key**

If you can't edit the existing key:

1. **Go to:** WooCommerce → Settings → Advanced → REST API
2. **Click "Add Key"**
3. **Set Description:** "MyMeds Pharmacy Integration"
4. **Set User:** Select your admin user
5. **Set Permissions:** **Read/Write**
6. **Click "Generate API Key"**
7. **Copy the new Consumer Key and Consumer Secret**

### **Step 3: Update Credentials**

If you get new credentials, update them in:

**Development Environment:**
```bash
# File: backend/env.development
WOOCOMMERCE_CONSUMER_KEY=your_new_consumer_key
WOOCOMMERCE_CONSUMER_SECRET=your_new_consumer_secret
```

**Production Environment:**
```bash
# File: env.production
WOOCOMMERCE_CONSUMER_KEY="your_new_consumer_key"
WOOCOMMERCE_CONSUMER_SECRET="your_new_consumer_secret"
```

### **Step 4: Update Database**

Run this script to update the database with new credentials:

```javascript
// File: backend/scripts/update-woocommerce-credentials.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateCredentials() {
  await prisma.wooCommerceSettings.update({
    where: { id: 1 },
    data: {
      consumerKey: 'your_new_consumer_key',
      consumerSecret: 'your_new_consumer_secret',
      updatedAt: new Date()
    }
  });
  console.log('✅ WooCommerce credentials updated!');
  await prisma.$disconnect();
}

updateCredentials();
```

## 🧪 **TESTING:**

After fixing permissions:

1. **Test API directly:**
   ```bash
   curl "https://mymedspharmacyinc.com/wp-json/wc/v3/products?per_page=1&consumer_key=YOUR_KEY&consumer_secret=YOUR_SECRET"
   ```

2. **Test backend API:**
   ```bash
   curl "http://localhost:4000/api/woocommerce/products?per_page=1"
   ```

3. **Test shop page:**
   ```bash
   # Visit: http://localhost:3000/shop
   # Expected: Products should load
   ```

## 📊 **EXPECTED RESULTS:**

- ✅ **WooCommerce API:** Should return products instead of 401 error
- ✅ **Backend API:** Should return products successfully
- ✅ **Shop Page:** Should display products from WooCommerce
- ✅ **Admin Panel:** WooCommerce connection test should show success

---

**The issue is definitely the Consumer Key permissions. Once you fix the permissions in WooCommerce admin, everything should work perfectly!** 🎉

