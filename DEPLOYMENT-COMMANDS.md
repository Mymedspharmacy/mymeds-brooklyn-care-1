# 🚀 VPS Deployment Commands - MyMeds Pharmacy

## Prerequisites
- Ubuntu 20.04+ VPS with root access
- Domain name pointed to your VPS IP
- SSH access to your VPS

---

## Step 1: Connect to Your VPS

```bash
ssh root@your-vps-ip
```

---

## Step 2: Update System & Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server

# Install Nginx
apt install -y nginx

# Install PM2 globally
npm install -g pm2

# Install Git
apt install -y git

# Install certbot for SSL
apt install -y certbot python3-certbot-nginx

# Install PHP and WordPress dependencies
apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-curl php8.1-gd php8.1-mbstring php8.1-zip php8.1-intl php8.1-bcmath

# Install WP-CLI globally
curl -O https://raw.githubusercontent.com/wp-cli/wp-cli/stable/bin/wp-cli.phar
chmod +x wp-cli.phar
mv wp-cli.phar /usr/local/bin/wp

# Verify WP-CLI installation
wp --info
```

---

## Step 3: Configure MySQL Database

```bash
# Secure MySQL installation
mysql_secure_installation

# Login to MySQL
mysql -u root -p

# Create databases and users (run these in MySQL console)
CREATE DATABASE mymeds_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE wordpress_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'SecurePassword123!';
CREATE USER 'wp_user'@'localhost' IDENTIFIED BY 'WPSecurePassword123!';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
GRANT ALL PRIVILEGES ON wordpress_db.* TO 'wp_user'@'localhost';
FLUSH PRIVILEGES;
exit;
```

---

## Step 4: Install WordPress

```bash
# Create WordPress directory
mkdir -p /var/www/wordpress
cd /var/www/wordpress

# Download WordPress
wp core download --allow-root

# Create WordPress configuration
wp config create --dbname=wordpress_db --dbuser=wp_user --dbpass=WPSecurePassword123! --dbhost=localhost --allow-root

# Install WordPress
wp core install --url="https://mymedspharmacyinc.com" --title="MyMeds Pharmacy Blog" --admin_user=admin --admin_password=AdminSecure2025! --admin_email=admin@mymedspharmacyinc.com --allow-root

# Install WooCommerce plugin
wp plugin install woocommerce --activate --allow-root

# Install additional plugins for SEO and forms
wp plugin install wordpress-seo contact-form-7 --activate --allow-root

# Set proper permissions
chown -R www-data:www-data /var/www/wordpress
chmod -R 755 /var/www/wordpress
```

---

## Step 4: Upload Project to VPS

### Option A: Using SCP (from your local machine)
```bash
# From your local machine terminal:
scp -r . root@your-vps-ip:/root/mymeds-pharmacy
```

### Option B: Using Git (on VPS)
```bash
# On your VPS:
cd /root
git clone https://github.com/your-username/mymeds-pharmacy.git
cd mymeds-pharmacy
```

---

## Step 5: Install Project Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install --production
cd ..
```

---

## Step 6: Configure Environment Variables

```bash
# Create backend environment file
cat > backend/.env << EOF
NODE_ENV=production
PORT=4000
DATABASE_URL="mysql://mymeds_user:SecurePassword123!@localhost:3306/mymeds_production"
JWT_SECRET="your_super_secure_jwt_secret_key_minimum_64_characters_long_for_production_security_2025"
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
WOOCOMMERCE_STORE_URL=https://mymedspharmacyinc.com/wp-admin
WOOCOMMERCE_CONSUMER_KEY=ck_auto_generated_key
WOOCOMMERCE_CONSUMER_SECRET=cs_auto_generated_secret
VITE_WORDPRESS_URL=https://mymedspharmacyinc.com/wp-json
WORDPRESS_USERNAME=admin
WORDPRESS_PASSWORD=AdminSecure2025!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=support@mymedspharmacyinc.com
SMTP_PASS=your_smtp_password
FROM_EMAIL=support@mymedspharmacyinc.com
FROM_NAME="MyMeds Pharmacy Inc."
ADMIN_EMAIL=admin@mymedspharmacyinc.com
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
EOF
```

---

## Step 7: Build Applications

```bash
# Build frontend
npm run build

# Build backend
cd backend
npm run build
cd ..
```

---

## Step 8: Setup Database Schema

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

cd ..
```

---

## Step 9: Create Admin User (Optional)

```bash
cd backend
npm run postinstall
cd ..
```

---

## Step 10: Configure PM2

```bash
# Copy PM2 configuration
cp deployment/ecosystem.config.js .

# Start application with PM2
pm2 start deployment/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

## Step 11: Configure Nginx

```bash
# Copy Nginx configuration
cp deployment/nginx.conf /etc/nginx/sites-available/mymeds-pharmacy

# Update domain name in config
sed -i 's/your-domain.com/mymedspharmacyinc.com/g' /etc/nginx/sites-available/mymeds-pharmacy

# Enable site
ln -s /etc/nginx/sites-available/mymeds-pharmacy /etc/nginx/sites-enabled/

# Remove default Nginx site
rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

---

## Step 12: Configure Firewall

```bash
# Enable UFW firewall
ufw enable

# Allow SSH
ufw allow ssh

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Check firewall status
ufw status
```

---

## Step 13: Setup SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com

# Test auto-renewal
certbot renew --dry-run
```

---

## Step 14: Create Application Directories (If needed)

```bash
# Create application directory structure
mkdir -p /var/www/mymeds/current
cp -r . /var/www/mymeds/current/
cd /var/www/mymeds/current

# Set proper permissions
chown -R www-data:www-data /var/www/mymeds
chmod -R 755 /var/www/mymeds
```

---

## Step 14: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check PM2 logs
pm2 logs mymeds-backend

# Check Nginx status
systemctl status nginx

# Check MySQL status
systemctl status mysql

# Test application health
curl http://localhost:4000/api/health
```

---

## Step 15: Post-Deployment Tasks

```bash
# View application logs
pm2 logs mymeds-backend --lines 50

# Monitor application
pm2 monit

# Check disk space
df -h

# Check memory usage
free -h
```

---

## 🔧 Troubleshooting Commands

```bash
# Restart services
systemctl restart nginx
systemctl restart mysql
pm2 restart mymeds-backend

# View logs
pm2 logs mymeds-backend --err
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Test database connection
mysql -u mymeds_user -p mymeds_production

# Check network connectivity
curl -I https://mymedspharmacyinc.com
```

---

## 🎯 Quick Deployment Script

If you prefer an automated approach, you can run:

```bash
# Make deployment script executable
chmod +x deployment/deploy-vps.sh

# Run automated deployment
./deployment/deploy-vps.sh
```

---

## ✅ Verification Checklist

- [ ] Application running: `https://mymedspharmacyinc.com`
- [ ] Admin panel accessible: `https://mymedspharmacyinc.com/admin`
- [ ] API health check: `https://mymedspharmacyinc.com/api/health`
- [ ] SSL certificate active
- [ ] PM2 shows application running
- [ ] Nginx serving content properly
- [ ] Database connections working

---

## 🌟 **Your pharmacy management system is now live!**

**Admin Access:**
- URL: `https://mymedspharmacyinc.com/admin`
- Email: `admin@mymedspharmacyinc.com` 
- Password: Check your environment configuration

**Estimated deployment time: 30-45 minutes**
