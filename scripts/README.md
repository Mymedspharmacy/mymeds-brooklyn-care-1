# MyMeds Pharmacy Deployment Scripts

Complete automation scripts for deploying MyMeds Pharmacy Inc. to your VPS.

## Domain Configuration
- **Domain:** `mymedsspharmaceuticals.com`
- **Subdomains:** `blog.mymedspharmaceuticals.com`, `shop.mymedspharmaceuticals.com`

## Script Overview

### 🚀 **Master Deployment Script**
**File:** `deploy-mymeds.sh`
**Purpose:** Master script that orchestrates the entire deployment process
**Usage:** `sudo ./de 플oy-mymeds.sh`

### 📊 **Individual Component Scripts**

#### 1. Database Setup
**File:** `setup-database.sh`
**Purpose:** Sets up MySQL database with secure configuration
**Features:**
- Installs MySQL server
- Creates production and WordPress databases
- Sets up secure authentication
- Configures automated backups
- Generates secure passwords

#### 2. WordPress Setup
**File:** `setup-wordpress.sh`
**Purpose:** Installs and configures WordPress for blog and WooCommerce shop
**Features:**
- Installs PHP 8.1 with required extensions
- Downloads and configures WordPress
- Sets up WooCommerce for e-commerce
- Installs security plugins
- Configures SSL-ready settings

#### 3. Application Setup
**File:** `setup-application.sh`
**Purpose:** Sets up the MyMeds React/Node.js application
**Features:**
- Installs Node.js 18+
- Sets up PM2 process manager
- Builds frontend and backend
- Configures production environment
- Creates admin user
- Runs database migrations

#### 4. SSL Certificate Setup
**File:** `setup-ssl.sh`
**Purpose:** Automates SSL certificate installation with Let's Encrypt
**Features:**
- Installs Certbot
- Obtains SSL certificates for all domains
- Configures auto-renewal
- Sets up monitoring
- Creates certificate backups

#### 5. Nginx Setup
**File:** `setup-nginx.sh`
**Purpose:** Configures Nginx web server with SSL and optimizations
**Features:**
- Installs and configures Nginx
- Sets up main and subdomain configurations
- Configures SSL termination
- Implements security headers
- Sets up rate limiting and caching

## Quick Start Guide

### Option 1: Complete Automated Deployment
```bash
# Run the master deployment script
sudo ./deploy-mymeds.sh
```

### Option 2: Step-by-Step Deployment
```bash
# 1. Update system and dependencies
sudo ./deploy-mymeds.sh

# 2. Setup database
sudo chmod +x scripts/setup-database.sh
sudo ./scripts/setup-database.sh

# 3. Setup WordPress
sudo chmod +x scripts/setup-wordpress.sh
sudo ./scripts/setup-wordpress.sh

# 4. Setup application
sudo chmod +x scripts/setup-application.sh
sudo ./scripts/setup-application.sh

# 5. Setup SSL certificates
sudo chmod +x scripts/setup-ssl.sh
sudo ./scripts/setup-ssl.sh

# 6. Setup Nginx
sudo chmod +x scripts/setup-nginx.sh
sudo ./scripts/setup-nginx.sh
```

## Prerequisites

### VPS Requirements
- Ubuntu 20.04 or later
- Minimum 2GB RAM
- Minimum 20GB disk space
- Root access

### DNS Configuration Required
Before running scripts, configure these DNS A records:

```
mymedspharmaceuticals.com        A    [YOUR_VPS_IP]
www.mymedspharmaceuticals.com   A    [YOUR_VPS_IP]
blog.mymedspharmaceuticals.com  A    [YOUR_VPS_IP]
shop.mymedspharmaceuticals.com  A    [YOUR_VPS_IP]
```

### Required Accounts/Keys (configure after deployment)
- Email service (Gmail recommended)
- WordPress admin credentials (auto-generated)
- MyMeds admin credentials (auto-generated)
- SSL certificates (auto-obtained)

## Detailed Usage Instructions

### 1. Database Setup (`setup-database.sh`)
```bash
sudo ./scripts/setup-database.sh
```
**What it does:**
- Generates secure MySQL passwords
- Creates `mymeds_production` database
- Creates `wp_mymeds` database for WordPress
- Sets up automated daily backups
- Creates `/var/www/mymeds/db-credentials.conf`

### 2. WordPress Setup (`setup-wordpress.sh`)
```bash
sudo ./scripts/setup-wordpress.sh
```
**What it does:**
- Installs PHP 8.1 with WordPress extensions
- Downloads WordPress for blog and shop
- Installs WooCommerce plugin
- Sets up SEO and security plugins
- Creates `/var/www/mymeds/wp-credentials.conf`

### 3. Application Setup (`setup-application.sh`)
```bash
sudo ./scripts/setup-application.sh
```
**What it does:**
- Builds React frontend and Node.js backend
- Sets up PM2 process manager
- Configures production environment
- Runs Prisma database migrations
- Creates admin user account
- Creates `/var/www/mymeds/app-credentials.conf`

### 4. SSL Setup (`setup-ssl.sh`)
```bash
sudo ./scripts/setup-ssl.sh
```
**What it does:**
- Installs Certbot
- Obtains SSL certificates for all domains
- Configures auto-renewal
- Sets up certificate monitoring
- Tests SSL configuration

### 5. Nginx Setup (`setup-nginx.sh`)
```bash
sudo ./scripts/setup-nginx.sh
```
**What it does:**
- Installs Nginx web server
- Configures main site and subdomains
- Sets up SSL termination
- Implements security headers
- Configures caching and rate limiting

## Generated Files and Credentials

### Credential Files
- `/var/www/mymeds/db-credentials.conf` - Database passwords
- `/var/www/mymeds/wp-credentials.conf` - WordPress admin access
- `/var/www/mymeds/app-credentials.conf` - MyMeds application access

### Configuration Files
- `/etc/nginx/sites-available/mymeds` - Main Nginx configuration
- `/etc/nginx/snippets/ssl-mymeds.conf` - SSL configuration
- `/var/www/mymeds/ecosystem.config.js` - PM2 configuration
- `/var/www/mymeds/.env.production` - Production environment

### Management Scripts
- `/usr/local/bin/mymeds-nginx.sh` - Nginx management
- `/usr/local/bin/mymeds-health-check.sh` - System health monitoring
- `/usr/local/bin/mymeds-db-backup.sh` - Database backup
- `/usr/local/bin/mymeds-ssl-backup.sh` - SSL certificate backup

## Access Information

After successful deployment, your application will be available at:

- **Main Site:** https://mymedspharmaceuticals.com
- **Admin Dashboard:** https://mymedspharmaceuticals.com/admin
- **WordPress Blog:** https://blog.mymedspharmaceuticals.com
- **WooCommerce Shop:** https://shop.mymedspharmaceuticals.com
- **WordPress Admin:** https://blog.mymedspharmaceuticals.com/wp-admin

## Post-Deployment Checklist

### Immediate Setup
1. ✅ Test all URLs and functionality
2. ✅ Change default passwords in credential files
3. ✅ Configure email settings in application
4. ✅ Update contact information
5. ✅ Configure WooCommerce settings

### Security
1. ✅ Setup firewall rules (`ufw status`)
2. ✅ Enable SSL monitoring
3. ✅ Configure regular backups
4. ✅ Test SSL certificate auto-renewal

### Monitoring
1. ✅ Setup log monitoring
2. ✅ Configure performance monitoring
3. ✅ Setup uptime monitoring
4. ✅ Configure backup verification

## Troubleshooting

### Common Issues

**Issue:** SSL certificate generation fails
**Solution:** Ensure DNS records are configured correctly before running SSL script

**Issue:** Nginx test fails
**Solution:** Check configuration syntax with `nginx -t`

**Issue:** MySQL connection fails
**Solution:** Verify credentials in `/var/www/mymeds/db-credentials.conf`

**Issue:** WordPress not loading
**Solution:** Check PHP-FPM service status with `systemctl status php8.1-fpm`

### Useful Commands

```bash
# Check all services
systemctl status nginx mysql php8.1-fpm pm2

# View application logs
pm2 logs mymeds-backend

# Test nginx configuration
sudo nginx -t

# Check SSL certificate status
sudo certbot certificates

# Run health check
sudo /usr/local/bin/mymeds-health-check.sh

# Manage Nginx
sudo /usr/local/bin/mymeds-nginx.sh status
```

## Customization

### Domain Change
To use a different domain, update the `DOMAIN` variable in each script:
```bash
DOMAIN="yourdomain.com"
```

### Port Change
To use different ports, update the port variables:
```bash
BACKEND_PORT="4000"
FRONTEND_PORT="3000"
```

### Additional Features
The scripts are modular and can be extended with:
- Email server configuration
- Additional monitoring
- Custom plugins
- Integration with CI/CD

## Support

For deployment issues:
1. Check the generated log files in `/var/log/`
2. Review script output for error messages
3. Check DNS configuration
4. Verify VPS resources (CPU, RAM, disk space)

## Security Notes

- Generated passwords are stored in credential files (keep secure)
- SSL certificates are automatically renewed
- Firewall rules are configured for security
- Regular backups are scheduled
- Log monitoring is configured

Remember to keep all credential files secure and never commit them to version control.


