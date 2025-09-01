# 🚀 VPS Deployment Quick Start Guide

## 📋 **Prerequisites**
- ✅ Hostinger VPS KVM purchased
- ✅ SSH access to your VPS
- ✅ Domain name configured
- ✅ GitHub repository ready

## 🎯 **Step-by-Step Deployment**

### **1. Connect to Your VPS**
```bash
ssh root@YOUR_VPS_IP
```

### **2. Run the Setup Script**
```bash
# Download the script
wget https://raw.githubusercontent.com/YOUR_USERNAME/mymeds-brooklyn-care/main/deploy-to-vps.sh

# Make it executable
chmod +x deploy-to-vps.sh

# Edit configuration
nano deploy-to-vps.sh

# Run the script
./deploy-to-vps.sh
```

### **3. Update Configuration Variables**
Edit `deploy-to-vps.sh` and update:
```bash
VPS_IP="YOUR_ACTUAL_VPS_IP"
DB_PASSWORD="YOUR_STRONG_DB_PASSWORD"
JWT_SECRET="YOUR_JWT_SECRET"
JWT_REFRESH_SECRET="YOUR_JWT_REFRESH_SECRET"
```

### **4. Clone Your Repository**
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/mymeds-brooklyn-care.git mymeds-production
cd mymeds-production
```

### **5. Setup Environment**
```bash
# Create production .env
cat > backend/.env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="mysql://mymeds_user:YOUR_PASSWORD@localhost:3306/mymeds_production"
JWT_SECRET=YOUR_JWT_SECRET
JWT_REFRESH_SECRET=YOUR_JWT_REFRESH_SECRET
FRONTEND_URL="https://www.mymedspharmacyinc.com"
BACKEND_URL="https://api.mymedspharmacyinc.com"
EOF
```

### **6. Install Dependencies & Build**
```bash
# Install frontend dependencies
npm ci

# Install backend dependencies
cd backend
npm ci

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build backend
npm run build

# Build frontend
cd ..
npm run build
```

### **7. Start Application**
```bash
# Start backend with PM2
cd backend
pm2 start dist/index.js --name "mymeds-production" --env production
pm2 save

# Copy frontend to Nginx
cd ..
cp -r dist/* /var/www/html/production/
chown -R www-data:www-data /var/www/html/production
```

### **8. Setup SSL (Optional but Recommended)**
```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d www.mymedspharmacyinc.com -d mymedspharmacyinc.com
```

## 🌐 **Access Your Application**

- **Frontend**: `http://YOUR_VPS_IP` (or your domain)
- **Backend API**: `http://YOUR_VPS_IP:3000/api`
- **PM2 Status**: `pm2 status`
- **Nginx Status**: `systemctl status nginx`

## 🔧 **Useful Commands**

```bash
# Check application status
pm2 status
pm2 logs mymeds-production

# Restart application
pm2 restart mymeds-production

# Check Nginx
nginx -t
systemctl reload nginx

# Check MySQL
systemctl status mysql
mysql -u mymeds_user -p

# Monitor system
htop
df -h
```

## 🚨 **Troubleshooting**

### **Application won't start?**
```bash
# Check logs
pm2 logs mymeds-production

# Check if port is in use
netstat -tlnp | grep :3000

# Restart PM2
pm2 kill
pm2 start dist/index.js --name "mymeds-production"
```

### **Database connection issues?**
```bash
# Check MySQL status
systemctl status mysql

# Test connection
mysql -u mymeds_user -p mymeds_production

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### **Nginx issues?**
```bash
# Check configuration
nginx -t

# Check error logs
tail -f /var/log/nginx/error.log

# Reload Nginx
systemctl reload nginx
```

## 🎉 **Success!**

Your MyMeds Pharmacy application is now running on your VPS! 

**Next steps:**
1. Test all functionality
2. Setup monitoring
3. Configure backups
4. Test WordPress integration
5. Monitor performance

## 📞 **Need Help?**

- Check PM2 logs: `pm2 logs`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`
- Check system logs: `journalctl -u nginx -f`
- Restart services: `systemctl restart nginx mysql`

