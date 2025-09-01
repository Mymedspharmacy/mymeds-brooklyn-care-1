# 🚀 Automated Sync Setup Guide for MyMeds Pharmacy

## Overview

This guide sets up **fully automated synchronization** between your app and WooCommerce/WordPress **without requiring admin panel access** for daily operations. Your admin panel retains all existing functionality while automation runs in the background.

## ✨ What This Achieves

### **Fully Automated Operation:**
- ✅ **Products sync automatically** every 15 minutes from WooCommerce
- ✅ **Blog posts sync automatically** every 30 minutes from WordPress  
- ✅ **Webhooks provide instant updates** for critical changes
- ✅ **No admin panel login required** for regular operations
- ✅ **Real-time inventory updates** from WooCommerce
- ✅ **Instant blog publishing** from WordPress

### **Admin Panel Still Shows:**
- 🔧 **All existing orders and customer data**
- 📊 **Sync status and logs**
- 🚨 **Troubleshooting tools**
- ⚙️ **Settings management**
- 🛒 **Manual sync controls** (when needed)

## 🛠️ Setup Steps

### **Step 1: Deploy to VPS**

After deploying your app to VPS KVM1, run these commands:

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Navigate to your app directory
cd /var/www/mymeds-production

# Copy the automation files
# (You'll need to upload these files to your VPS)
```

### **Step 2: Run the Setup Script**

```bash
# Make the setup script executable
chmod +x setup-automated-sync.sh

# Run the setup script as root
sudo ./setup-automated-sync.sh
```

**What the script does:**
- Creates log directories
- Sets up cron jobs
- Configures log rotation
- Creates monitoring scripts
- Sets up systemd services

### **Step 3: Configure WooCommerce Webhooks**

**In your WooCommerce Admin:**

1. Go to **WooCommerce → Settings → Advanced → Webhooks**
2. Create these webhooks:

```
Name: Product Updates
Topic: product.created, product.updated, product.deleted
Delivery URL: https://www.mymedspharmacyinc.com/api/woocommerce/webhook
Status: Active

Name: Order Updates  
Topic: order.created, order.updated
Delivery URL: https://www.mymedspharmacyinc.com/api/woocommerce/webhook
Status: Active
```

### **Step 4: Configure WordPress Webhooks**

**Install WP Webhooks Plugin:**

1. Go to **WordPress Admin → Plugins → Add New**
2. Search for "WP Webhooks"
3. Install and activate the plugin
4. Go to **WP Webhooks → Manage Webhooks**
5. Create these webhooks:

```
Name: Post Updates
Topic: post.created, post.updated, post.deleted
Webhook URL: https://www.mymedspharmacyinc.com/api/wordpress/webhook
Status: Active
```

### **Step 5: Test the Setup**

```bash
# Test the automation script
cd /var/www/mymeds-production
node automated-sync.cjs

# Test individual syncs
node automated-sync.cjs woocommerce
node automated-sync.cjs wordpress
node automated-sync.cjs health

# Check cron jobs
crontab -l

# Monitor logs
tail -f /var/log/mymeds/auto-sync.log
```

## 🔄 How It Works

### **Automated Sync Process:**

1. **Cron Jobs Run Every:**
   - **15 minutes**: WooCommerce product sync
   - **30 minutes**: WordPress blog sync
   - **1 hour**: Full backup sync
   - **5 minutes**: Health checks

2. **Webhook Updates:**
   - **Instant**: When you add/edit/delete products in WooCommerce
   - **Instant**: When you publish/edit/delete blog posts in WordPress

3. **Data Flow:**
   ```
   WooCommerce/WordPress → Webhooks → Your App → Database
   WooCommerce/WordPress → Cron Sync → Your App → Database
   ```

### **Cache Management:**
- **5-minute cache** for products (performance)
- **10-minute cache** for blog posts (performance)
- **Automatic cache clearing** after updates

## 📊 Monitoring & Maintenance

### **View Sync Status:**

```bash
# Check sync logs
tail -f /var/log/mymeds/auto-sync.log
tail -f /var/log/mymeds/woocommerce-sync.log
tail -f /var/log/mymeds/wordpress-sync.log

# Run monitoring script
/usr/local/bin/mymeds-pharmacy-monitor.sh

# Check cron job status
crontab -l
systemctl status mymeds-pharmacy-sync.timer
```

### **Manual Sync (When Needed):**

```bash
# Full sync
cd /var/www/mymeds-production
node automated-sync.cjs

# WooCommerce only
node automated-sync.cjs woocommerce

# WordPress only  
node automated-sync.cjs wordpress
```

## 🎯 Daily Workflow (No Admin Panel Needed)

### **For Pharmacy Staff:**

1. **Add products** in WooCommerce → **Automatically appear** in your app
2. **Update prices** in WooCommerce → **Automatically updated** in your app
3. **Publish blog posts** in WordPress → **Automatically appear** in your app
4. **Manage inventory** in WooCommerce → **Real-time updates** in your app

### **For Administrators:**

- **Monitor sync status** in admin panel
- **View sync logs** and troubleshoot if needed
- **Manual sync** when required
- **All existing admin features** remain functional

## 🔧 Troubleshooting

### **Common Issues:**

**1. Sync Not Working:**
```bash
# Check if cron is running
systemctl status cron

# Check cron logs
tail -f /var/log/syslog | grep CRON

# Test script manually
cd /var/www/mymeds-production
node automated-sync.cjs health
```

**2. Webhooks Not Working:**
```bash
# Check webhook endpoints
curl -X POST https://www.mymedspharmacyinc.com/api/woocommerce/webhook \
  -H "Content-Type: application/json" \
  -d '{"action":"test","data":{"id":1}}'
```

**3. Log Files Too Large:**
```bash
# Clear old logs
find /var/log/mymeds -name "*.log" -mtime +30 -delete

# Check log rotation
cat /etc/logrotate.d/mymeds-pharmacy
```

### **Reset Everything:**
```bash
# Remove all cron jobs
crontab -r

# Stop systemd services
systemctl stop mymeds-pharmacy-sync.timer
systemctl disable mymeds-pharmacy-sync.timer

# Run setup script again
./setup-automated-sync.sh
```

## 📋 Verification Checklist

### **After Setup:**

- [ ] **Cron jobs configured** (`crontab -l` shows sync jobs)
- [ ] **Log directories created** (`/var/log/mymeds/` exists)
- [ ] **Automation script working** (`node automated-sync.cjs` runs)
- [ ] **Webhooks configured** in WooCommerce and WordPress
- [ ] **Systemd services active** (`systemctl status mymeds-pharmacy-sync.timer`)
- [ ] **Monitoring script working** (`/usr/local/bin/mymeds-pharmacy-monitor.sh`)

### **Test Scenarios:**

- [ ] **Add product in WooCommerce** → Appears in app within 15 minutes
- [ ] **Publish blog in WordPress** → Appears in app within 30 minutes
- [ ] **Update product price** → Changes reflect immediately via webhook
- [ ] **Delete product** → Removed from app immediately via webhook

## 🎉 Result

**Your MyMeds Pharmacy app now:**

✅ **Automatically syncs** with WooCommerce and WordPress  
✅ **Requires zero manual intervention** for daily operations  
✅ **Maintains all existing admin panel functionality**  
✅ **Provides real-time updates** via webhooks  
✅ **Runs reliable background sync** via cron jobs  
✅ **Includes comprehensive monitoring** and alerting  

**The admin panel continues to show:**
- All orders, customers, and pharmacy data
- Sync status and logs
- Manual controls when needed
- All existing features and functionality

**You've achieved "set it and forget it" automation while preserving full admin control!** 🚀
