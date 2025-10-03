# MyMeds Pharmacy - VPS Deployment Guide

This guide will help you deploy the MyMeds Pharmacy application on a VPS with MySQL database.

## Prerequisites

- Ubuntu 20.04+ VPS with root access
- Domain name pointing to your VPS IP
- Basic knowledge of Linux commands

## Quick Deployment

### 1. Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create deployment user (recommended)
sudo adduser mymeds
sudo usermod -aG sudo mymeds
su - mymeds
```

### 2. Upload Application Files

```bash
# Clone or upload your application to the VPS
git clone https://github.com/your-repo/mymeds-pharmacy.git
cd mymeds-pharmacy

# Or upload via SCP
scp -r . mymeds@your-vps-ip:/home/mymeds/mymeds-pharmacy
```

### 3. Run Deployment Script

```bash
# Make script executable
chmod +x deployment/deploy-vps.sh

# Run deployment
./deployment/deploy-vps.sh
```

## Manual Deployment Steps

### 1. Install System Dependencies

```bash
# Update package list
sudo apt update

# Install required packages
sudo apt install -y \
    curl \
    wget \
    git \
    nginx \
    mysql-server \
    nodejs \
    npm \
    pm2 \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    unzip \
    build-essential
```

### 2. Configure MySQL

```bash
# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p < deployment/mysql-setup.sql
```

### 3. Configure Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
```

### 4. Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/mymeds
sudo chown -R $USER:$USER /var/www/mymeds

# Copy application files
cp -r . /var/www/mymeds/current
cd /var/www/mymeds/current

# Install dependencies
cd backend
npm ci --production

cd ../frontend
npm ci --production
npm run build

cd ../backend
npm run build
```

### 5. Configure Environment

```bash
# Copy environment file
cp deployment/env.production backend/.env

# Edit environment variables
nano backend/.env
```

**Important Environment Variables:**
```bash
# Database
DATABASE_URL="mysql://mymeds_user:your_password@localhost:3306/mymeds_pharmacy"

# Security
JWT_SECRET="your_32_character_jwt_secret_here"
CSRF_SECRET="your_32_character_csrf_secret_here"

# Admin credentials
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD_HASH="your_bcrypt_hash_here"

# Domain
FRONTEND_URL="https://yourdomain.com"
API_URL="https://yourdomain.com/api"
```

### 6. Run Database Migrations

```bash
cd /var/www/mymeds/current/backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 7. Configure PM2

```bash
# Create PM2 ecosystem file
cp deployment/ecosystem.config.js .

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp deployment/nginx.conf /etc/nginx/sites-available/mymeds-pharmacy

# Update domain name
sudo sed -i 's/your-domain.com/yourdomain.com/g' /etc/nginx/sites-available/mymeds-pharmacy

# Enable site
sudo ln -s /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 9. Configure SSL

```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 10. Configure Firewall

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Post-Deployment Configuration

### 1. Generate Admin Password Hash

```bash
# Generate bcrypt hash for admin password
node -e "console.log(require('bcrypt').hashSync('your_admin_password', 12))"
```

### 2. Configure Email (Optional)

Update SMTP settings in `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Configure WooCommerce Integration

```bash
WOOCOMMERCE_STORE_URL=https://yourdomain.com
WOOCOMMERCE_CONSUMER_KEY=ck_your_key_here
WOOCOMMERCE_CONSUMER_SECRET=cs_your_secret_here
```

### 4. Set Up Monitoring

```bash
# Check application status
pm2 status

# View logs
pm2 logs mymeds-backend

# Monitor system resources
htop
```

## Maintenance Commands

### Application Management

```bash
# Restart application
pm2 restart mymeds-backend

# View logs
pm2 logs mymeds-backend --lines 100

# Monitor application
pm2 monit

# Update application
cd /var/www/mymeds/current
git pull origin main
npm ci --production
npm run build
pm2 restart mymeds-backend
```

### Database Management

```bash
# Backup database
mysqldump -u mymeds_user -p mymeds_pharmacy > backup.sql

# Restore database
mysql -u mymeds_user -p mymeds_pharmacy < backup.sql

# Run migrations
cd /var/www/mymeds/current/backend
npx prisma migrate deploy
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Checklist

- [ ] Change default MySQL root password
- [ ] Use strong passwords for all accounts
- [ ] Configure firewall (UFW)
- [ ] Enable fail2ban
- [ ] Set up SSL certificates
- [ ] Configure security headers
- [ ] Enable rate limiting
- [ ] Set up regular backups
- [ ] Monitor system logs
- [ ] Keep system updated

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check PM2 status
   pm2 status
   
   # View error logs
   pm2 logs mymeds-backend --err
   
   # Check environment variables
   cat /var/www/mymeds/current/backend/.env
   ```

2. **Database connection issues**
   ```bash
   # Test MySQL connection
   mysql -u mymeds_user -p mymeds_pharmacy
   
   # Check MySQL status
   sudo systemctl status mysql
   
   # View MySQL logs
   sudo tail -f /var/log/mysql/error.log
   ```

3. **Nginx configuration errors**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check syntax
   sudo nginx -T
   
   # View error logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   
   # Test renewal
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Enable Gzip compression** (already configured in Nginx)
2. **Set up Redis caching** (optional)
3. **Configure CDN** for static assets
4. **Monitor resource usage**
5. **Optimize database queries**

## Backup Strategy

### Automated Backups

The deployment script creates a backup script that runs daily at 2 AM:

```bash
# Manual backup
/usr/local/bin/mymeds-backup.sh

# View backup script
cat /usr/local/bin/mymeds-backup.sh
```

### Backup Contents

- Database dump (MySQL)
- Application files
- Configuration files
- Uploaded files

### Restore from Backup

```bash
# Restore database
mysql -u mymeds_user -p mymeds_pharmacy < /var/www/mymeds/backups/db_backup_YYYYMMDD_HHMMSS.sql

# Restore application files
tar -xzf /var/www/mymeds/backups/app_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/mymeds/
```

## Monitoring and Alerts

### System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check application status
pm2 status
pm2 monit

# Check Nginx status
sudo systemctl status nginx

# Check MySQL status
sudo systemctl status mysql
```

### Log Monitoring

```bash
# Application logs
pm2 logs mymeds-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo tail -f /var/log/syslog
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Check system updates
   - Review application logs
   - Monitor disk space
   - Check backup status

2. **Monthly**
   - Update system packages
   - Review security logs
   - Test backup restoration
   - Monitor performance metrics

3. **Quarterly**
   - Security audit
   - Performance optimization
   - Dependency updates
   - Disaster recovery testing

### Getting Help

- Check application logs: `pm2 logs mymeds-backend`
- Check system logs: `sudo journalctl -u nginx`
- Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`
- Review Nginx configuration: `sudo nginx -t`

## Conclusion

Your MyMeds Pharmacy application should now be successfully deployed on your VPS with MySQL. The deployment includes:

- ✅ MySQL database configuration
- ✅ Node.js application with PM2
- ✅ Nginx reverse proxy
- ✅ SSL certificates
- ✅ Security configurations
- ✅ Backup system
- ✅ Monitoring setup

Access your application at `https://yourdomain.com` and the admin panel at `https://yourdomain.com/admin`.

