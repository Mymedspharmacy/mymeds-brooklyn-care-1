# 🚀 VPS Deployment Update Guide

This guide will help you check your current VPS deployment and replace it with your updated MyMeds Pharmacy project.

## 📋 Prerequisites

- ✅ VPS server with SSH access
- ✅ SSH key configured
- ✅ Current project tested locally (✅ Frontend: http://localhost:3001, ✅ Backend: http://localhost:4000)

## 🔍 Step 1: Check Current VPS Deployment

### Option A: Using PowerShell Script (Windows)
```powershell
# Run the deployment check script
.\scripts\deployment\check-vps-deployment.ps1 -VPS_IP "your-vps-ip" -VPS_USER "root"
```

### Option B: Using Bash Script (Linux/Mac)
```bash
# Copy script to VPS and run
scp scripts/deployment/check-vps-deployment.sh root@your-vps-ip:/tmp/
ssh root@your-vps-ip "chmod +x /tmp/check-vps-deployment.sh && /tmp/check-vps-deployment.sh"
```

### Option C: Manual SSH Check
```bash
# Connect to your VPS
ssh root@your-vps-ip

# Check current deployment
ls -la /var/www/mymeds
pm2 status
systemctl status nginx
curl http://localhost:4000/api/health
curl http://localhost:80
```

## 🔄 Step 2: Update Deployment

### Option A: Automated GitHub Actions (Recommended)

1. **Push your changes to GitHub:**
   ```bash
   git add .
   git commit -m "Update MyMeds Pharmacy with latest features"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Run tests
   - Build applications
   - Deploy to VPS
   - Run health checks

### Option B: Manual Deployment

1. **Build your applications locally:**
   ```bash
   # Build frontend
   npm run build
   
   # Build backend
   cd backend
   npm run build
   ```

2. **Copy files to VPS:**
   ```bash
   # Copy all files to VPS
   scp -r . root@your-vps-ip:/tmp/mymeds-deploy/
   ```

3. **Run deployment update script:**
   ```bash
   # Copy and run update script
   scp scripts/deployment/update-vps-deployment.sh root@your-vps-ip:/tmp/
   ssh root@your-vps-ip "chmod +x /tmp/update-vps-deployment.sh && /tmp/update-vps-deployment.sh"
   ```

### Option C: PowerShell Deployment (Windows)

```powershell
# Use the complete deployment script
.\scripts\deployment\deploy-production-complete.ps1 -VPS_IP "your-vps-ip" -DOMAIN "your-domain.com" -SSL_EMAIL "your-email@domain.com"
```

## 🛠️ Step 3: Verify Deployment

### Health Checks
```bash
# Test backend API
curl http://localhost:4000/api/health

# Test frontend
curl http://localhost:80

# Test with domain (if configured)
curl https://your-domain.com/api/health
```

### Service Status
```bash
# Check PM2 processes
pm2 status

# Check Nginx
systemctl status nginx

# Check MySQL
systemctl status mysql

# Check Redis
systemctl status redis-server
```

### Application Logs
```bash
# Check deployment logs
tail -f /var/log/mymeds-deployment.log

# Check PM2 logs
pm2 logs

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

## 🔧 Step 4: Configuration Updates

### Environment Variables
If you need to update environment variables:

```bash
# Edit backend environment file
nano /var/www/mymeds/backend/.env

# Restart services after changes
pm2 restart mymeds-backend
systemctl restart nginx
```

### Database Migrations
If you have new database changes:

```bash
cd /var/www/mymeds/backend
npx prisma migrate deploy
npx prisma generate
pm2 restart mymeds-backend
```

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check PM2 logs
pm2 logs mymeds-backend

# Check system logs
journalctl -u nginx -f
journalctl -u mysql -f

# Restart services
pm2 restart mymeds-backend
systemctl restart nginx
```

#### Database Connection Issues
```bash
# Check database status
systemctl status mysql

# Test database connection
cd /var/www/mymeds/backend
npx prisma db pull

# Check environment variables
grep DATABASE_URL .env
```

#### SSL Certificate Issues
```bash
# Check certificate status
certbot certificates

# Renew certificate if needed
certbot renew

# Test SSL
curl -I https://your-domain.com
```

#### Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/mymeds
sudo chmod -R 755 /var/www/mymeds
sudo chmod -R 644 /var/www/mymeds/dist
```

### Rollback Procedure

If something goes wrong, you can rollback:

```bash
# Stop services
pm2 stop mymeds-backend
systemctl stop nginx

# Restore from backup
cd /var/backups/mymeds
sudo tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/mymeds

# Restart services
pm2 start mymeds-backend
systemctl start nginx
```

## 📊 Monitoring

### Health Monitoring
```bash
# Set up monitoring script
sudo crontab -e

# Add this line for every 5 minutes
*/5 * * * * /usr/local/bin/mymeds-monitor.sh
```

### Log Monitoring
```bash
# Monitor all logs
tail -f /var/log/mymeds-deployment.log /var/log/nginx/error.log

# Monitor PM2 logs
pm2 logs --lines 100
```

## 🎯 Success Checklist

After deployment, verify:

- ✅ **Frontend**: https://your-domain.com loads correctly
- ✅ **Backend**: https://your-domain.com/api/health returns 200
- ✅ **SSL**: Green lock icon in browser
- ✅ **Admin**: https://your-domain.com/admin accessible
- ✅ **Database**: All tables created and accessible
- ✅ **Monitoring**: PM2 shows all processes online
- ✅ **Backups**: Backup script runs successfully
- ✅ **Security**: Firewall active, fail2ban running
- ✅ **Performance**: Pages load quickly
- ✅ **CI/CD**: GitHub Actions deploy successfully

## 📞 Support

If you encounter issues:

1. **Check logs** first: `/var/log/mymeds-deployment.log`
2. **Verify services**: `pm2 status`, `systemctl status nginx`
3. **Test connectivity**: `curl http://localhost:4000/api/health`
4. **Check disk space**: `df -h`
5. **Review environment**: Check `.env` files

## 🎉 You're All Set!

Your MyMeds Pharmacy application should now be updated with all the latest features:

- ✅ **Admin Features** - Complete dashboard with analytics, order management, inventory, CRM
- ✅ **User Features** - Registration, authentication, profile management  
- ✅ **Patient Portal** - Account creation, prescriptions, appointments, health records
- ✅ **SMTP Email** - Notifications, password reset, contact forms, newsletters
- ✅ **WordPress Integration** - Blog sync, content management, API integration
- ✅ **WooCommerce Integration** - E-commerce, product sync, order management

**Your application is now live and ready to serve patients!** 🏥
