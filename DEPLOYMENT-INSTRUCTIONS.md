# Fresh VPS Deployment Instructions

## Prerequisites

- VPS with Ubuntu 20.04/22.04 LTS
- SSH access to VPS (root or sudo user)
- Domain name (optional but recommended)
- At least 2GB RAM, 2 CPU cores, 20GB storage

## Quick Start - 3 Methods

### Method 1: Automated Deployment from Windows

**Steps:**
1. Open PowerShell as Administrator
2. Run the deployment script:
```powershell
.\deploy-vps-windows.ps1 -VpsIp "YOUR_VPS_IP" -VpsUser "root"
```

This will:
- Build your applications locally
- Upload files to VPS
- Run the deployment script automatically
- Setup everything for you

### Method 2: Manual Deployment (Linux/Mac)

**Steps:**
1. Build applications locally:
```bash
npm run build
cd backend && npm run build && cd ..
```

2. Upload to VPS:
```bash
# Upload deployment script
scp deploy-vps.sh root@YOUR_VPS_IP:/tmp/

# Upload application files
scp -r dist backend/dist backend/node_modules backend/package*.json backend/prisma root@YOUR_VPS_IP:/tmp/mymeds/
```

3. SSH into VPS and run deployment:
```bash
ssh root@YOUR_VPS_IP
chmod +x /tmp/deploy-vps.sh
sudo bash /tmp/deploy-vps.sh
```

### Method 3: Direct VPS Deployment

**Steps:**
1. SSH into your VPS:
```bash
ssh root@YOUR_VPS_IP
```

2. Clone or upload your repository to VPS:
```bash
cd /var/www
git clone YOUR_REPO_URL mymeds
# OR upload files via SCP/FTP
```

3. Download and run the deployment script:
```bash
cd /var/www/mymeds
chmod +x deploy-vps.sh
sudo bash deploy-vps.sh
```

## What the Deployment Script Does

The `deploy-vps.sh` script performs a complete fresh deployment:

### 1. System Setup
- Updates system packages
- Installs Node.js 18.x
- Installs MySQL 8.0
- Installs Nginx
- Installs PM2 process manager
- Installs SSL tools (Certbot)

### 2. Directory Structure
```
/var/www/mymeds/          # Application root
├── dist/                 # Frontend build
├── backend/              # Backend application
│   ├── dist/            # Backend build
│   ├── uploads/         # User uploads
│   └── logs/            # Application logs
├── ecosystem.config.js   # PM2 configuration
└── .env.production      # Environment variables

/var/log/mymeds/          # Application logs
/var/backups/mymeds/      # Database backups
```

### 3. Database Setup
- Creates `mymeds_production` database
- Creates `mymeds_user` with full privileges
- Runs Prisma migrations
- Generates Prisma client

### 4. Application Build
- Installs production dependencies
- Builds frontend (React + Vite)
- Builds backend (TypeScript compilation)
- Generates optimized assets

### 5. Process Management
- Configures PM2 for automatic restarts
- Sets up startup scripts
- Enables auto-start on server reboot
- Configures log rotation

### 6. Web Server (Nginx)
- Configures reverse proxy
- Serves frontend static files
- Proxies API requests to backend
- Enables compression
- Sets up logging

### 7. Security
- Configures firewall (UFW)
- Sets file permissions
- Prepares for SSL certificate

## Post-Deployment Steps

### 1. Verify Deployment

Check if services are running:
```bash
# Check PM2 status
pm2 status

# Check backend API
curl http://localhost:4000/api/health

# Check frontend
curl http://localhost
```

### 2. Setup SSL Certificate (Recommended)

```bash
# Install SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### 3. Update Admin Password

```bash
cd /var/www/mymeds/backend
npm run create-admin
```

### 4. Configure Environment Variables

Edit backend environment:
```bash
nano /var/www/mymeds/backend/.env
```

Update these critical values:
- `JWT_SECRET` - Generate new: `openssl rand -hex 32`
- `SESSION_SECRET` - Generate new: `openssl rand -hex 32`
- `ADMIN_PASSWORD` - Set secure password
- `EMAIL_PASSWORD` - Gmail app password
- `WOOCOMMERCE_CONSUMER_KEY` - Your WooCommerce key
- `WORDPRESS_APP_PASSWORD` - Your WordPress password

### 5. Point Domain to VPS

In your domain registrar (e.g., GoDaddy, Namecheap):
1. Add A record: `@` → `YOUR_VPS_IP`
2. Add A record: `www` → `YOUR_VPS_IP`
3. Wait for DNS propagation (5-60 minutes)

### 6. Test Application

Visit your domain:
- Frontend: `https://mymedspharmacyinc.com`
- API Health: `https://mymedspharmacyinc.com/api/health`
- Admin: `https://mymedspharmacyinc.com/admin-signin`

## Monitoring & Maintenance

### View Logs
```bash
# PM2 logs (real-time)
pm2 logs

# Backend logs only
pm2 logs mymeds-backend

# Nginx access logs
tail -f /var/log/nginx/mymeds-access.log

# Nginx error logs
tail -f /var/log/nginx/mymeds-error.log
```

### Restart Services
```bash
# Restart all PM2 apps
pm2 restart all

# Restart backend only
pm2 restart mymeds-backend

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

### Monitor Resources
```bash
# PM2 monitoring dashboard
pm2 monit

# System resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Database Backup
```bash
# Manual backup
cd /var/www/mymeds/backend
npm run backup:database

# Setup automatic backups (daily at 2 AM)
crontab -e
# Add: 0 2 * * * cd /var/www/mymeds/backend && npm run backup:database
```

## Troubleshooting

### Backend not responding
```bash
# Check backend logs
pm2 logs mymeds-backend

# Check backend is running
pm2 status

# Restart backend
pm2 restart mymeds-backend

# Check port 4000 is listening
netstat -tulpn | grep 4000
```

### Database connection errors
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test database connection
mysql -u mymeds_user -p mymeds_production

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Nginx errors
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Permission errors
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/mymeds
sudo chmod -R 755 /var/www/mymeds
sudo chmod -R 777 /var/www/mymeds/backend/uploads
```

## Updating the Application

### Method 1: Quick Update
```bash
# On your local machine
npm run build
cd backend && npm run build && cd ..

# Upload to VPS
scp -r dist root@YOUR_VPS_IP:/var/www/mymeds/
scp -r backend/dist root@YOUR_VPS_IP:/var/www/mymeds/backend/

# SSH to VPS and restart
ssh root@YOUR_VPS_IP
pm2 restart all
```

### Method 2: Git Pull
```bash
# On VPS
cd /var/www/mymeds
git pull
npm install
npm run build
cd backend
npm install
npm run build
cd ..
pm2 restart all
```

## Support

### Useful Resources
- PM2 Documentation: https://pm2.keymetrics.io/docs/
- Nginx Documentation: https://nginx.org/en/docs/
- MySQL Documentation: https://dev.mysql.com/doc/
- Let's Encrypt: https://letsencrypt.org/docs/

### Common Issues
1. **Port already in use**: Change PORT in .env file
2. **Database migration failed**: Run `npx prisma migrate reset`
3. **SSL renewal failed**: Check Certbot logs in `/var/log/letsencrypt/`
4. **Out of memory**: Increase VPS RAM or add swap space
5. **High CPU usage**: Check PM2 logs for errors or loops

### Performance Optimization
```bash
# Enable Nginx caching
sudo nano /etc/nginx/nginx.conf
# Add caching directives

# Configure PM2 clustering (if needed)
pm2 start ecosystem.config.js -i max

# Optimize MySQL
sudo mysql_secure_installation
```

## Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured (UFW)
- [ ] Strong admin password set
- [ ] JWT secrets generated (not defaults)
- [ ] Database password changed from default
- [ ] SSH key authentication enabled
- [ ] Root login disabled (optional)
- [ ] Fail2ban installed (optional)
- [ ] Regular backups configured
- [ ] Monitoring alerts set up

## Success Indicators

✓ PM2 shows both apps running
✓ `curl http://localhost:4000/api/health` returns healthy status
✓ Website accessible at domain
✓ Admin panel login works
✓ SSL certificate valid (green padlock)
✓ All forms submit successfully
✓ Database queries work
✓ Logs show no errors

---

**Need help?** Check the logs first:
```bash
pm2 logs --lines 100
sudo tail -100 /var/log/nginx/error.log
```

