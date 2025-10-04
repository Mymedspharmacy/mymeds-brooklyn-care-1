# Manual VPS Update Commands

## 🚀 Quick VPS Update Guide

Since you've already committed and pushed all changes to Git, here are the manual commands to update your VPS:

### Step 1: Connect to Your VPS
```bash
ssh root@72.60.116.253
```

### Step 2: Navigate to Application Directory
```bash
cd /var/www/mymeds-pharmacy
```

### Step 3: Stop Services (Optional - for zero downtime, skip this)
```bash
pm2 stop mymeds-pharmacy-backend
pm2 stop mymeds-pharmacy-frontend
```

### Step 4: Create Backup (Recommended)
```bash
# Create backup directory
mkdir -p /var/backups/mymeds-pharmacy/$(date +%Y%m%d_%H%M%S)

# Backup current application
cp -r /var/www/mymeds-pharmacy /var/backups/mymeds-pharmacy/$(date +%Y%m%d_%H%M%S)/
```

### Step 5: Update Code from Git
```bash
# Fetch latest changes
git fetch origin

# Reset to latest commit
git reset --hard origin/latest

# Clean untracked files
git clean -fd
```

### Step 6: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm ci --production

# Install frontend dependencies
cd ..
npm ci --production
```

### Step 7: Build Frontend
```bash
npm run build
```

### Step 8: Run Database Migrations
```bash
cd backend
npx prisma migrate deploy
```

### Step 9: Ensure Admin User Exists
```bash
node src/ensureAdminUser.ts
```

### Step 10: Restart Services
```bash
# Start services with PM2
pm2 start backend/ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Check status
pm2 status
```

### Step 11: Reload Nginx (if needed)
```bash
# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

### Step 12: Verify Deployment
```bash
# Check if backend is responding
curl http://localhost:4000/api/health

# Check PM2 logs
pm2 logs mymeds-pharmacy-backend --lines 20
```

## 🎯 What's Been Updated

### Major Changes Deployed:
- ✅ **TypeScript Error Fixes** - All TypeScript compilation errors resolved
- ✅ **WordPress Integration** - Enhanced to fetch real blog posts from WP admin
- ✅ **WooCommerce Improvements** - Better stock status handling and payment integration
- ✅ **Admin Authentication** - Enhanced security and error handling
- ✅ **Footer Enhancement** - Added Patient Resources link
- ✅ **Payment Gateway Integration** - Full WooCommerce payment support
- ✅ **Error Handling** - Comprehensive error handling throughout the app
- ✅ **Documentation** - New guides for WordPress, WooCommerce, and admin setup

### New Files Added:
- `docs/admin-authentication-guide.md` - Complete admin auth documentation
- `docs/wordpress-setup-guide.md` - WordPress integration guide
- `docs/woocommerce-payment-setup.md` - Payment gateway setup
- `src/components/WooCommercePaymentGateways.tsx` - Dynamic payment gateway component
- `scripts/configure-wordpress.js` - WordPress configuration helper
- `scripts/test-wordpress-connection.js` - WordPress connection tester

### Files Modified:
- Backend TypeScript fixes across all route files
- Frontend components for better WooCommerce integration
- WordPress routes for real data fetching
- Admin authentication improvements
- Error handling enhancements

## 🔧 Post-Update Configuration

### 1. WordPress Integration (Optional)
If you want to connect your WordPress blog:
```bash
# Add to your .env file in backend directory
VITE_WORDPRESS_URL=https://yourdomain.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_PASSWORD=your_application_password
```

### 2. Admin Credentials
Ensure your admin credentials are set in `.env`:
```bash
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD_HASH=$2b$10$your_bcrypt_hash_here
JWT_SECRET=your_32_character_minimum_secret
```

### 3. Test Your Application
- Visit: https://mymedspharmacyinc.com
- Test admin panel: https://mymedspharmacyinc.com/admin-signin
- Test blog page: https://mymedspharmacyinc.com/blog
- Test shop functionality: https://mymedspharmacyinc.com/shop

## 🐛 Troubleshooting

### If Services Won't Start:
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs mymeds-pharmacy-backend

# Restart all services
pm2 restart all
```

### If Database Issues:
```bash
# Check database connection
cd backend
npx prisma db pull

# Reset database if needed (CAUTION: This will delete data)
npx prisma migrate reset
```

### If Frontend Issues:
```bash
# Rebuild frontend
npm run build

# Check build output
ls -la dist/
```

### If WordPress Integration Issues:
```bash
# Test WordPress connection
node scripts/test-wordpress-connection.js

# Check WordPress settings in admin panel
```

## 📚 New Documentation

After the update, you'll have access to these new guides:

1. **Admin Authentication Guide** (`docs/admin-authentication-guide.md`)
   - Complete admin auth setup
   - Security features overview
   - Troubleshooting guide

2. **WordPress Setup Guide** (`docs/wordpress-setup-guide.md`)
   - WordPress integration setup
   - API configuration
   - Testing procedures

3. **WooCommerce Payment Setup** (`docs/woocommerce-payment-setup.md`)
   - Payment gateway configuration
   - Stripe and PayPal setup
   - Testing procedures

## 🎉 Success Indicators

Your update was successful if:
- ✅ PM2 shows services running
- ✅ Website loads without errors
- ✅ Admin panel is accessible
- ✅ Blog page shows content (WordPress or sample data)
- ✅ Shop page shows products
- ✅ No TypeScript compilation errors
- ✅ No critical errors in PM2 logs

## 📞 Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `tail -f /var/log/nginx/error.log`
3. Restore from backup if needed
4. Review the documentation in the `docs/` folder

**Your MyMeds Pharmacy application is now updated with all the latest improvements!** 🎉
