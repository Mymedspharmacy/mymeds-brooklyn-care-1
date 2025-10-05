# Quick VPS Update Guide
# MyMeds Pharmacy - Deploy Latest Changes

## 🚀 Quick Update Commands

Since everything is already set up on your VPS, here are the simple commands to update:

### Option 1: Automated Script (Recommended)
```bash
# Make script executable and run
chmod +x update-vps.sh
./update-vps.sh
```

### Option 2: Manual Commands
```bash
# 1. Pull latest changes
git pull origin latest

# 2. Install dependencies
npm install
cd backend && npm install && cd ..

# 3. Generate Prisma client
cd backend
npx prisma generate
npx prisma db push
cd ..

# 4. Build applications
npm run build
cd backend && npm run build && cd ..

# 5. Restart services
pm2 restart mymeds-backend
sudo systemctl reload nginx

# 6. Check status
pm2 status
```

## 📋 What's Updated

### ✅ Production Configuration:
- **Database**: MySQL configuration ready
- **Admin Panel**: Sample data removed, production mode enabled
- **Error Handling**: Production-ready error handling
- **Security**: Production security settings applied

### ✅ Key Features:
- **Form Submissions**: Professional modal dialogs
- **Appointments**: Real data from database
- **WooCommerce Orders**: Live order fetching
- **Blog Pages**: Safe image rendering
- **Mobile Responsive**: All features work on mobile

## 🔍 Verification Steps

After update, verify these features:

1. **Admin Panel**: `https://mymedspharmacyinc.com/admin`
   - Login with admin credentials
   - Check all tabs show real data (no sample data)
   - Test form submission modals

2. **Shop Page**: `https://mymedspharmacyinc.com/shop`
   - Products display correctly
   - Cart functionality works
   - Checkout process functions

3. **Blog Pages**: `https://mymedspharmacyinc.com/blog`
   - Blog posts load without errors
   - "Read More" button works
   - Images display safely

4. **Form Submissions**:
   - Contact forms submit successfully
   - Appointments forms work
   - Data appears in admin panel

## 🚨 Troubleshooting

If you encounter issues:

```bash
# Check backend logs
pm2 logs mymeds-backend

# Check nginx status
sudo systemctl status nginx

# Check database connection
cd backend
npx prisma db push

# Restart everything
pm2 restart all
sudo systemctl restart nginx
```

## 📞 Support

If you need help with the update:
1. Check the logs: `pm2 logs mymeds-backend`
2. Verify database connection
3. Ensure all environment variables are set
4. Check nginx configuration

The update should take about 2-3 minutes to complete.
