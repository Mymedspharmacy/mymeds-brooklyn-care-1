# 🚀 MyMeds Pharmacy - VPS Update Guide

## 📋 Overview

This guide explains how to update your deployed MyMeds Pharmacy application on your VPS, including frontend, backend, and database migrations.

## 🎯 What the Update Process Does

### ✅ **Complete Update Process:**
1. **Dependency Validation** - Checks and installs all required dependencies
2. **Local Build** - Builds frontend and backend for production
3. **VPS Backup** - Creates backup of current deployment
4. **File Upload** - Uploads new builds to VPS
5. **Database Migration** - Runs Prisma migrations
6. **Process Restart** - Restarts PM2 processes
7. **Health Checks** - Verifies everything is working
8. **Cleanup** - Removes old backups (keeps last 5)

## 🚀 Quick Update Commands

### For Windows Users (PowerShell):
```bash
# Validate dependencies first (recommended)
npm run validate:deps

# Then run the update
npm run update:vps

# Or do everything in one command
npm run setup:deps
```

### For Linux/Mac Users (Bash):
```bash
# Validate dependencies first (recommended)
npm run validate:deps

# Then run the update
npm run update:vps:bash

# Or do everything in one command
npm run setup:deps
```

## ⚙️ Configuration Setup

### Step 1: Update VPS Configuration

Edit `vps-config.json` with your actual VPS details:

```json
{
  "vps": {
    "user": "your-vps-username",
    "host": "your-vps-ip-or-domain.com",
    "path": "/var/www/mymeds",
    "backupPath": "/var/www/backups"
  }
}
```

### Step 2: Update Script Parameters (Optional)

You can also pass parameters directly:

```bash
# PowerShell
powershell -ExecutionPolicy Bypass -File scripts/update-vps.ps1 -VPSUser "root" -VPSHost "your-vps.com" -VPSPath "/var/www/mymeds"

# Bash
./scripts/update-vps.sh
```

## 📋 Pre-Update Checklist

### ✅ **Before Running Update:**

1. **Local Changes** - Make sure all your changes are committed
2. **Environment Files** - Verify `frontend.env.production` and `backend/env.production` are up to date
3. **Database Schema** - Ensure Prisma schema changes are ready
4. **VPS Access** - Test SSH connection to your VPS
5. **Backup** - Ensure you have a recent backup (script will create one)

### 🔍 **Test Commands:**
```bash
# Test SSH connection
ssh your-user@your-vps.com

# Check current deployment
ssh your-user@your-vps.com 'pm2 status'

# Check database connection
ssh your-user@your-vps.com 'cd /var/www/mymeds/backend && npx prisma db execute --stdin <<< "SELECT 1;"'
```

## 🚀 Step-by-Step Update Process

### 1. **Prepare Your Changes**
```bash
# Make sure you're in the project root
cd /path/to/mymeds-brooklyn-care-1-1

# Check current status
git status
```

### 2. **Run the Update**
```bash
# For Windows (PowerShell)
npm run update:vps

# For Linux/Mac (Bash)
npm run update:vps:bash
```

### 3. **Monitor the Process**
The script will show progress for each step:
- ✅ Validating and installing dependencies
- ✅ Building applications
- ✅ Creating backup
- ✅ Uploading files
- ✅ Running migrations
- ✅ Restarting services
- ✅ Health checks

### 4. **Verify the Update**
```bash
# Check PM2 status
ssh your-user@your-vps.com 'pm2 status'

# Check application logs
ssh your-user@your-vps.com 'pm2 logs mymeds-backend'

# Test backend health
curl https://your-domain.com/api/health

# Test frontend
curl https://your-domain.com
```

## 🔧 Troubleshooting

### ❌ **Common Issues:**

#### 1. **SSH Connection Failed**
```bash
# Test SSH connection
ssh your-user@your-vps.com

# Check SSH key
ls -la ~/.ssh/
```

#### 2. **Build Failed**
```bash
# Check Node.js version
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Database Migration Failed**
```bash
# Check database connection
ssh your-user@your-vps.com 'cd /var/www/mymeds/backend && npx prisma db execute --stdin <<< "SELECT 1;"'

# Check Prisma status
ssh your-user@your-vps.com 'cd /var/www/mymeds/backend && npx prisma migrate status'
```

#### 4. **PM2 Process Not Starting**
```bash
# Check PM2 logs
ssh your-user@your-vps.com 'pm2 logs mymeds-backend'

# Restart PM2
ssh your-user@your-vps.com 'pm2 restart mymeds-backend'

# Check environment variables
ssh your-user@your-vps.com 'cd /var/www/mymeds/backend && cat env.production'
```

### 🔄 **Rollback Process**

If something goes wrong, you can rollback:

```bash
# Connect to VPS
ssh your-user@your-vps.com

# Stop current process
pm2 stop mymeds-backend

# Restore from backup
cd /var/www
tar -xzf backups/mymeds-backup-YYYYMMDD-HHMMSS.tar.gz -C mymeds/

# Restart process
cd mymeds/backend
pm2 start ecosystem.config.js --env production
```

## 📊 Monitoring After Update

### 🔍 **Health Check Commands:**
```bash
# Check PM2 status
pm2 status

# Monitor logs
pm2 logs mymeds-backend --lines 50

# Check memory usage
pm2 monit

# Test API endpoints
curl https://your-domain.com/api/health
curl https://your-domain.com/api/users
```

### 📈 **Performance Monitoring:**
```bash
# Check system resources
htop

# Check disk space
df -h

# Check database size
mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'mymeds_production';"
```

## 🔒 Security Considerations

### ✅ **Security Checklist:**
- [ ] Environment variables are secure
- [ ] Database passwords are strong
- [ ] JWT secrets are updated
- [ ] SSL certificates are valid
- [ ] Firewall rules are in place
- [ ] Regular backups are working

## 📞 Support

### 🆘 **If You Need Help:**

1. **Check the logs:**
   ```bash
   ssh your-user@your-vps.com 'pm2 logs mymeds-backend --lines 100'
   ```

2. **Check the backup:**
   ```bash
   ssh your-user@your-vps.com 'ls -la /var/www/backups/'
   ```

3. **Test connectivity:**
   ```bash
   ssh your-user@your-vps.com 'curl -f http://localhost:4000/api/health'
   ```

## 🎉 Success Indicators

Your update was successful if you see:
- ✅ All build steps completed
- ✅ Backup created successfully
- ✅ Files uploaded without errors
- ✅ Database migrations applied
- ✅ PM2 process started
- ✅ Health checks passed
- ✅ Application responding on your domain

---

**Remember:** Always test your application thoroughly after an update to ensure all functionality is working correctly!
