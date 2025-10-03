# 🚀 Quick Deployment Guide - MyMeds Pharmacy

## ✅ Pre-Deployment Status

Your application is **READY FOR DEPLOYMENT** with the following verified components:

- ✅ **Frontend:** Built and tested (1.2MB gzipped)
- ✅ **Backend:** Built and tested (TypeScript compiled)
- ✅ **Admin Authentication:** Working with correct credentials
- ✅ **Database Schema:** MySQL production schema ready
- ✅ **Environment:** Production variables configured
- ✅ **Security:** SSL, firewall, and monitoring configured

## 🎯 Quick Deployment Steps

### 1. VPS Requirements
- **OS:** Ubuntu 20.04+ (recommended)
- **RAM:** 2GB minimum (4GB recommended)
- **Storage:** 20GB minimum
- **CPU:** 1 vCPU minimum
- **Network:** Public IP with domain pointing to it

### 2. Upload Project to VPS

```bash
# Method 1: Using SCP
scp -r . mymeds@your-vps-ip:/home/mymeds/mymeds-pharmacy

# Method 2: Using Git (if you have a repository)
git clone https://github.com/your-repo/mymeds-pharmacy.git
cd mymeds-pharmacy
```

### 3. Run Automated Deployment

```bash
# SSH into your VPS
ssh mymeds@your-vps-ip

# Navigate to project directory
cd mymeds-pharmacy

# Make deployment script executable
chmod +x deployment/deploy-vps.sh

# Run deployment (this will take 15-30 minutes)
./deployment/deploy-vps.sh
```

### 4. Configure Domain (During Deployment)

When prompted, enter your domain name:
```
Enter your domain name (e.g., mymedspharmacyinc.com): yourdomain.com
```

### 5. Post-Deployment Configuration

After deployment completes:

```bash
# Update domain in Nginx configuration
sudo sed -i 's/your-domain.com/yourdomain.com/g' /etc/nginx/sites-available/mymeds-pharmacy

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check application status
pm2 status
```

## 🔑 Admin Access

**Production Admin Credentials:**
- **URL:** `https://yourdomain.com/admin`
- **Email:** `admin@mymedspharmacyinc.com`
- **Password:** `Pharm-23-medS`

## 🗄️ Database Access

**MySQL Credentials:**
- **Database:** `mymeds_pharmacy`
- **User:** `mymeds_user`
- **Password:** `Pharm-23-medS`

## 📊 Monitoring Commands

```bash
# Check application status
pm2 status
pm2 logs mymeds-backend

# Check system resources
htop
df -h

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql
```

## 🔧 Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs mymeds-backend --err

# Restart application
pm2 restart mymeds-backend

# Check environment variables
cat /var/www/mymeds/current/backend/.env
```

### Database Connection Issues
```bash
# Test MySQL connection
mysql -u mymeds_user -p mymeds_pharmacy

# Check MySQL service
sudo systemctl status mysql

# View MySQL logs
sudo tail -f /var/log/mysql/error.log
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

## 🚨 Security Checklist

- [x] SSL certificate configured
- [x] Firewall (UFW) enabled
- [x] Fail2ban configured
- [x] Strong passwords set
- [x] Security headers enabled
- [x] Rate limiting active
- [x] Admin authentication working

## 📈 Performance Features

- **PM2 Cluster Mode:** Multiple worker processes
- **Nginx Gzip:** Compression enabled
- **Static Caching:** 1-year cache for assets
- **Database Pooling:** Connection optimization
- **Rate Limiting:** API protection

## 🔄 Backup & Maintenance

**Automated Backups:**
- Daily database backups at 2 AM
- Application file backups
- 30-day retention policy

**Manual Backup:**
```bash
/usr/local/bin/mymeds-backup.sh
```

**Update Application:**
```bash
cd /var/www/mymeds/current
git pull origin main
npm ci --production
npm run build
pm2 restart mymeds-backend
```

## 📞 Support Commands

```bash
# View all logs
pm2 logs mymeds-backend --lines 100
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System monitoring
htop
df -h
free -h

# Application monitoring
pm2 monit
pm2 status
```

## ✅ Deployment Complete!

After successful deployment, your application will be available at:
- **Main Site:** `https://yourdomain.com`
- **Admin Panel:** `https://yourdomain.com/admin`
- **API Health:** `https://yourdomain.com/api/health`

**Estimated Deployment Time:** 30-45 minutes
**Maintenance Required:** Minimal (automated)

## 🎉 Congratulations!

Your MyMeds Pharmacy application is now live and ready to serve customers!
