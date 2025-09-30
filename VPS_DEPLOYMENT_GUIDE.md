# VPS Deployment Guide - MyMeds Pharmacy

## 🚀 Quick Deployment Commands

### Option 1: Automated Deployment (Recommended)
```bash
# Run the deployment script
./deploy-to-vps.sh
```

### Option 2: Manual Deployment
Follow these steps to manually update your VPS:

## 📋 Manual Deployment Steps

### 1. Connect to VPS
```bash
ssh root@mymedspharmacyinc.com
```

### 2. Navigate to Project Directory
```bash
cd /var/www/mymeds
```

### 3. Create Backup
```bash
mkdir -p /var/backups/mymeds/$(date +%Y%m%d_%H%M%S)
cp -r /var/www/mymeds /var/backups/mymeds/$(date +%Y%m%d_%H%M%S)/
```

### 4. Pull Latest Code
```bash
git pull origin latest
```

### 5. Update Backend
```bash
cd backend
npm install
npx prisma generate
npm run build
```

### 6. Update Frontend
```bash
cd ..
npm install
npm run build
```

### 7. Update Environment Variables
```bash
cp env.production .env.production
```

### 8. Update Database Schema
```bash
cd backend
npx prisma db push
```

### 9. Restart Services
```bash
pm2 restart mymeds-backend
pm2 restart mymeds-frontend
```

### 10. Verify Deployment
```bash
pm2 status
curl -f http://localhost:4000/api/health
curl -f http://localhost:3000
```

## 🔧 Key Changes in This Update

### WordPress Integration
- ✅ Switched from API keys to basic authentication
- ✅ Updated environment variables for WordPress
- ✅ Fixed frontend blog to use backend API

### WooCommerce Integration
- ✅ Switched from consumer key/secret to basic authentication
- ✅ Updated Prisma schema for WooCommerce settings
- ✅ Fixed frontend shop to use backend API

### Admin Panel
- ✅ All tabs now fetch real data from backend APIs
- ✅ Orders, Refills, Transfers, Contacts, Appointments working
- ✅ Location management with "Add First Location" button
- ✅ Locations display on About page

### Environment Variables Updated
```bash
# WordPress Integration - Use basic authentication
WORDPRESS_ENABLED=true
WORDPRESS_SITE_URL="https://mymedspharmacyinc.com"
WORDPRESS_USERNAME="MyMedsPharmacy"
WORDPRESS_APPLICATION_PASSWORD="RADU 8OTf 3sO4 wiJt ywBj Mizx"

# WooCommerce Integration - Use basic authentication
WOOCOMMERCE_ENABLED=true
WOOCOMMERCE_STORE_URL="https://mymedspharmacyinc.com"
WOOCOMMERCE_USERNAME="MyMedsPharmacy"
WOOCOMMERCE_APPLICATION_PASSWORD="RADU 8OTf 3sO4 wiJt ywBj Mizx"

# Frontend WordPress Configuration
VITE_WORDPRESS_URL="https://mymedspharmacyinc.com"
```

## 🧪 Testing After Deployment

### 1. Test Blog Integration
- Visit: https://mymedspharmacyinc.com/blog
- Should display WordPress posts
- Add a post in WordPress admin to test

### 2. Test Shop Integration
- Visit: https://mymedspharmacyinc.com/shop
- Should display WooCommerce products
- Add a product in WooCommerce admin to test

### 3. Test Admin Panel
- Visit: https://mymedspharmacyinc.com/admin
- Login with admin credentials
- Test all tabs: Orders, Refills, Transfers, Contacts, Appointments, Locations

### 4. Test Location Management
- Go to Admin Panel → Locations tab
- Click "Add First Location" button
- Add a new business location
- Verify it appears on About page

## 🔍 Troubleshooting

### If Backend Fails to Start
```bash
cd /var/www/mymeds/backend
npm install
npx prisma generate
npm run build
pm2 restart mymeds-backend
```

### If Frontend Fails to Start
```bash
cd /var/www/mymeds
npm install
npm run build
pm2 restart mymeds-frontend
```

### If Database Issues
```bash
cd /var/www/mymeds/backend
npx prisma db push
npx prisma generate
```

### Check Logs
```bash
pm2 logs mymeds-backend
pm2 logs mymeds-frontend
```

## 📊 Service Status
```bash
pm2 status
```

## 🌐 Live URLs
- **Frontend**: https://mymedspharmacyinc.com
- **Backend API**: https://mymedspharmacyinc.com/api
- **Admin Panel**: https://mymedspharmacyinc.com/admin
- **Blog**: https://mymedspharmacyinc.com/blog
- **Shop**: https://mymedspharmacyinc.com/shop
- **About**: https://mymedspharmacyinc.com/about

## ✅ Success Indicators
- All PM2 processes running
- Blog page shows WordPress posts
- Shop page shows WooCommerce products
- Admin panel tabs load real data
- Location management works
- "Add First Location" button functional
- Locations display on About page

## 🆘 Rollback (If Needed)
```bash
# Restore from backup
cp -r /var/backups/mymeds/[BACKUP_FOLDER]/* /var/www/mymeds/
pm2 restart mymeds-backend
pm2 restart mymeds-frontend
```
