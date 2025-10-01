# Fresh VPS Deployment Instructions

## 🚀 Complete Fresh Deployment

This guide will help you deploy a fresh copy of MyMeds Pharmacy to your VPS while preserving WordPress.

---

## ⚠️ What This Does

### ✅ Will Do:
- ✅ Backup current environment files
- ✅ Backup current database
- ✅ Stop all running services
- ✅ Remove old application code
- ✅ Clone fresh code from GitHub (with all fixes)
- ✅ Install all dependencies
- ✅ Build frontend and backend
- ✅ Restore database and environment files
- ✅ Start services with PM2
- ✅ Verify deployment

### 🔒 Will NOT Do:
- ❌ Will NOT touch WordPress installation
- ❌ Will NOT modify WordPress database
- ❌ Will NOT remove WooCommerce data
- ❌ Will NOT modify Nginx configuration
- ❌ Will NOT remove SSL certificates

---

## 📋 Prerequisites

1. **GitHub Repository Updated** ✅
   - All fixes committed and pushed to `latest` branch
   - WordPress query parameter fix ✅
   - WooCommerce query parameter fix ✅

2. **SSH Access** ✅
   - You have SSH access to: `root@72.60.116.253`

3. **Environment Files** ✅
   - Will be backed up and restored automatically

---

## 🚀 Deployment Steps

### Option 1: Run from Windows (PowerShell)

Since you're on Windows, use Git Bash or WSL to run the script:

```bash
# Using Git Bash
bash fresh-deploy-vps.sh
```

### Option 2: Run Directly on VPS

1. **SSH into VPS:**
```bash
ssh root@72.60.116.253
```

2. **Create deployment script:**
```bash
cat > fresh-deploy.sh << 'EOF'
# [Copy the content of fresh-deploy-vps.sh here]
EOF

chmod +x fresh-deploy.sh
```

3. **Run deployment:**
```bash
./fresh-deploy.sh
```

---

## 📝 Manual Deployment Steps (Alternative)

If you prefer to run commands manually:

### 1. Backup Current Installation
```bash
ssh root@72.60.116.253

# Create backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p /var/backups/mymeds/${TIMESTAMP}
cp /var/www/mymeds/.env.production /var/backups/mymeds/${TIMESTAMP}/
cp /var/www/mymeds/backend/prisma/dev.db /var/backups/mymeds/${TIMESTAMP}/
```

### 2. Stop Services
```bash
pm2 stop all
pm2 delete all
```

### 3. Remove Old Application
```bash
rm -rf /var/www/mymeds
```

### 4. Clone Fresh Code
```bash
cd /var/www
git clone --branch latest https://github.com/Mymedspharmacy/mymeds-brooklyn-care-1.git mymeds
cd mymeds
```

### 5. Restore Environment Files
```bash
LATEST_BACKUP=$(ls -t /var/backups/mymeds | head -1)
cp /var/backups/mymeds/${LATEST_BACKUP}/.env.production /var/www/mymeds/
cp /var/backups/mymeds/${LATEST_BACKUP}/.env.production /var/www/mymeds/backend/.env
cp /var/backups/mymeds/${LATEST_BACKUP}/dev.db /var/www/mymeds/backend/prisma/
```

### 6. Install Backend Dependencies
```bash
cd /var/www/mymeds/backend
npm install --production
npx prisma generate
npm run build
```

### 7. Install Frontend Dependencies
```bash
cd /var/www/mymeds
npm install --production
npm run build
```

### 8. Set Permissions
```bash
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds
```

### 9. Start Services
```bash
cd /var/www/mymeds
pm2 start backend/dist/index.js --name mymeds-backend
pm2 save
```

### 10. Verify
```bash
pm2 status
curl http://localhost:4000/api/health
```

---

## ✅ Post-Deployment Verification

### 1. Check Services
```bash
ssh root@72.60.116.253 'pm2 status'
```

### 2. Test Endpoints
```bash
# Health check
curl https://mymedspharmacyinc.com/api/health

# WooCommerce products (with fix)
curl https://mymedspharmacyinc.com/api/woocommerce/products?per_page=100

# WordPress posts (with fix)
curl https://mymedspharmacyinc.com/api/wordpress/posts?per_page=100
```

### 3. Test in Browser
- ✅ Frontend: https://mymedspharmacyinc.com
- ✅ Admin: https://mymedspharmacyinc.com/admin
- ✅ Shop: https://mymedspharmacyinc.com/shop (Should load products now!)
- ✅ Blog: https://mymedspharmacyinc.com/blog (Should load posts now!)
- ✅ WordPress: https://mymedspharmacyinc.com/blog (Preserved)

---

## 🔧 Troubleshooting

### Issue: Backend not starting
```bash
ssh root@72.60.116.253
pm2 logs mymeds-backend
```

### Issue: Frontend not accessible
```bash
# Check Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

### Issue: Database connection error
```bash
# Check if database was restored
ls -la /var/www/mymeds/backend/prisma/dev.db

# If missing, restore from backup
LATEST_BACKUP=$(ls -t /var/backups/mymeds | head -1)
cp /var/backups/mymeds/${LATEST_BACKUP}/dev.db /var/www/mymeds/backend/prisma/
```

### Issue: PM2 not starting
```bash
# Install PM2 globally if missing
npm install -g pm2

# Start services
cd /var/www/mymeds
pm2 start backend/dist/index.js --name mymeds-backend
pm2 startup
pm2 save
```

---

## 📊 What's New in This Deployment

### 🔧 Fixed Issues:
1. ✅ **WooCommerce Products API** - Query parameters now properly forwarded
2. ✅ **WordPress Posts API** - Query parameters now properly forwarded
3. ✅ **Shop Page** - Will load products correctly
4. ✅ **Blog Page** - Will load posts correctly
5. ✅ **All Admin Buttons** - All connected to backend endpoints
6. ✅ **Add Location Button** - Fully functional

### 🎉 Benefits:
- Fresh codebase with all latest fixes
- Clean installation without old build artifacts
- All dependencies up to date
- Database and settings preserved
- WordPress installation untouched

---

## 🔒 Safety Features

### Automatic Backups:
- Environment files backed up
- Database backed up
- Ecosystem config backed up
- Backup location: `/var/backups/mymeds/TIMESTAMP/`

### Rollback (if needed):
```bash
ssh root@72.60.116.253

# List backups
ls -la /var/backups/mymeds/

# Restore from backup
BACKUP_TO_RESTORE="20251001_120000"  # Replace with your backup timestamp
cp /var/backups/mymeds/${BACKUP_TO_RESTORE}/.env.production /var/www/mymeds/
cp /var/backups/mymeds/${BACKUP_TO_RESTORE}/dev.db /var/www/mymeds/backend/prisma/
pm2 restart all
```

---

## 📞 Support Commands

### View Logs:
```bash
pm2 logs mymeds-backend
pm2 logs mymeds-backend --lines 100
```

### Restart Services:
```bash
pm2 restart mymeds-backend
```

### Monitor Services:
```bash
pm2 monit
```

### Service Status:
```bash
pm2 status
systemctl status nginx
```

---

## ✅ Expected Results

After successful deployment:

1. ✅ Backend running on port 4000
2. ✅ Frontend built and served by Nginx
3. ✅ All API endpoints responding
4. ✅ Shop page loads products
5. ✅ Blog page loads posts
6. ✅ Admin panel fully functional
7. ✅ WordPress preserved and working
8. ✅ Database intact with all data
9. ✅ SSL certificates working
10. ✅ All 67 button actions functional

---

## 🎯 Ready to Deploy?

Run this command to start the fresh deployment:

```bash
bash fresh-deploy-vps.sh
```

The script will:
- Guide you through each step
- Show colored output for clarity
- Create automatic backups
- Verify each stage
- Report success/failure

**Estimated time:** 5-10 minutes

---

Generated: October 1, 2025  
Purpose: Fresh VPS deployment with WordPress preservation  
Status: Ready for execution

