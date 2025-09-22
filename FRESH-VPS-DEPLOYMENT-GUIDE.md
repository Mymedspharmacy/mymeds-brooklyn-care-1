# 🚀 Fresh VPS Deployment Guide - MyMeds Pharmacy Inc.

## 📋 Overview

This guide will help you deploy your MyMeds Pharmacy application on a fresh Ubuntu VPS. The deployment is optimized for your VPS specifications:
- **VPS IP**: 72.60.116.253
- **OS**: Ubuntu (fresh install)
- **CPU**: 1 core
- **RAM**: 4GB
- **Storage**: 50GB

## 🎯 Deployment Strategy

I've created **modular deployment scripts** that break down the deployment into manageable stages:

### 📁 Script Structure
```
deployment/scripts/
├── 00-deploy-all.sh          # Complete deployment orchestrator
├── 01-upload-files.sh        # File upload script
├── 02-setup-environment.sh   # System environment setup
├── 03-install-dependencies.sh # Install Node.js, WordPress plugins, etc.
├── 04-setup-database.sh      # Database setup and migrations
├── 05-deploy-application.sh  # Deploy complete application stack
└── 06-setup-wordpress.sh     # WordPress & WooCommerce configuration
```

## 🚀 Quick Start (Recommended)

### Option 1: Complete Automated Deployment
```bash
# 1. Upload files to VPS
./upload-to-vps.bat  # Windows
# OR
./upload-to-vps.sh   # Linux/Mac

# 2. SSH into VPS and run complete deployment
ssh root@72.60.116.253
cd /var/www/mymeds
./deployment/scripts/00-deploy-all.sh
```

### Option 2: Step-by-Step Deployment
```bash
# 1. Upload files (same as above)

# 2. SSH into VPS
ssh root@72.60.116.253
cd /var/www/mymeds

# 3. Run each script individually
./deployment/scripts/02-setup-environment.sh
./deployment/scripts/03-install-dependencies.sh
./deployment/scripts/04-setup-database.sh
./deployment/scripts/05-deploy-application.sh
./deployment/scripts/06-setup-wordpress.sh
```

## 📋 Detailed Script Descriptions

### 01-upload-files.sh
- **Purpose**: Uploads application files to VPS
- **What it does**:
  - Creates directory structure on VPS
  - Uploads application files (excluding node_modules, logs, etc.)
  - Uploads environment template
  - Sets proper file permissions
- **Run from**: Local machine

### 02-setup-environment.sh
- **Purpose**: Sets up system environment and Docker
- **What it does**:
  - Updates system packages
  - Installs Docker and Docker Compose
  - Configures firewall rules
  - Sets up system optimizations
  - Creates system users
- **Run from**: VPS

### 03-install-dependencies.sh
- **Purpose**: Installs application dependencies
- **What it does**:
  - Installs Node.js 18 LTS
  - Downloads WordPress plugins (WooCommerce, Redis Cache, etc.)
  - Downloads WordPress themes
  - Generates SSL certificates
  - Installs application dependencies
  - Builds applications
- **Run from**: VPS

### 04-setup-database.sh
- **Purpose**: Sets up database and runs migrations
- **What it does**:
  - Starts MySQL and Redis containers
  - Creates databases (MyMeds + WordPress)
  - Runs Prisma migrations
  - Creates admin user
  - Initializes integrations
  - Creates initial backups
- **Run from**: VPS

### 05-deploy-application.sh
- **Purpose**: Deploys the complete application stack
- **What it does**:
  - Builds Docker images
  - Deploys services in stages (memory optimized)
  - Performs health checks
  - Sets up WordPress integration
- **Run from**: VPS

### 06-setup-wordpress.sh
- **Purpose**: Configures WordPress and WooCommerce
- **What it does**:
  - Installs WordPress
  - Installs and activates WooCommerce
  - Installs essential plugins
  - Creates pharmacy-specific pages
  - Configures menus and settings
- **Run from**: VPS

## 🔧 What Gets Deployed

### Core Services
- ✅ **MySQL Database** (1GB RAM limit)
- ✅ **Redis Cache** (256MB RAM limit)
- ✅ **WordPress** (1GB RAM limit)
- ✅ **WooCommerce** (included with WordPress)
- ✅ **MyMeds Application** (1.5GB RAM limit)
- ✅ **Nginx Reverse Proxy** (128MB RAM limit)

### WordPress Plugins
- ✅ WooCommerce (E-commerce)
- ✅ Redis Cache (Performance)
- ✅ WP Super Cache (Additional caching)
- ✅ Wordfence (Security)
- ✅ Yoast SEO (SEO optimization)
- ✅ WP Mail SMTP (Email delivery)

### WordPress Themes
- ✅ Storefront (WooCommerce optimized)
- ✅ Astra (Alternative theme)

## 🌐 Service URLs (After Deployment)

### Direct IP Access
- **MyMeds Frontend**: http://72.60.116.253:3000
- **MyMeds Backend API**: http://72.60.116.253:4000
- **WordPress Admin**: http://72.60.116.253:8080/wp-admin
- **WooCommerce Shop**: http://72.60.116.253:8080/shop
- **Blog**: http://72.60.116.253:8080/blog
- **Database**: 72.60.116.253:3306
- **Admin Panel**: http://72.60.116.253:3000/admin
- **Health Check**: http://72.60.116.253:4000/api/health

## 🔐 Default Credentials

### WordPress Admin
- **Username**: admin
- **Password**: Mymeds2025!AdminSecure123!@#
- **Email**: admin@mymedspharmacyinc.com

### MyMeds Admin
- **Email**: admin@mymedspharmacyinc.com
- **Password**: Mymeds2025!AdminSecure123!@#

### Database
- **Root Password**: Mymeds2025!RootSecure123!@#
- **User**: mymeds_user
- **Password**: Mymeds2025!UserSecure123!@#

## ⚙️ Memory Optimization

The deployment is optimized for your 4GB RAM VPS:

| Service | Memory Limit | Purpose |
|---------|-------------|---------|
| MySQL | 1GB | Database operations |
| WordPress | 1GB | Content management |
| MyMeds App | 1.5GB | Main application |
| Redis | 256MB | Caching |
| Nginx | 128MB | Reverse proxy |
| **Total** | **~3.8GB** | **Within 4GB limit** |

## 📊 Monitoring Commands

### Check Container Status
```bash
docker-compose -f docker-compose.optimized.yml ps
```

### View Resource Usage
```bash
docker stats
```

### View Logs
```bash
docker-compose -f docker-compose.optimized.yml logs -f [service-name]
```

### Health Checks
```bash
curl http://72.60.116.253:4000/api/health
curl http://72.60.116.253:8080
```

## 🔧 Troubleshooting

### If a script fails:
1. Check the error message
2. Fix any issues mentioned
3. Re-run the specific script
4. Continue with the next script

### Common issues:
- **Memory issues**: Restart containers with `docker-compose restart`
- **Permission issues**: Run `chmod +x deployment/scripts/*.sh`
- **Network issues**: Check firewall settings

### Get help:
```bash
# View script help
bash deployment/scripts/[script-name] --help

# View container logs
docker-compose -f docker-compose.optimized.yml logs [service-name]

# Check system resources
free -h
df -h
```

## 🎯 Post-Deployment Steps

1. **Test all services** by visiting the URLs above
2. **Configure domain DNS** to point to 72.60.116.253
3. **Set up SSL certificates** for HTTPS
4. **Configure WordPress** and WooCommerce settings
5. **Add products** to your pharmacy shop
6. **Test MyMeds integration** with WordPress
7. **Set up monitoring** and automated backups

## 🚨 Important Notes

### Resource Limitations
- Your VPS has **1 CPU core** and **4GB RAM**
- All services are optimized for these specifications
- Monitor memory usage regularly

### Security
- Firewall is configured with necessary ports
- Strong passwords are set by default
- SSL certificates are prepared for HTTPS

### Performance
- Redis caching is enabled for better performance
- Database is optimized for low memory usage
- Staged deployment prevents memory issues

## 🎉 Success!

After successful deployment, you'll have:
- ✅ Complete MyMeds pharmacy management system
- ✅ WordPress blog with full content management
- ✅ WooCommerce shop with e-commerce functionality
- ✅ Optimized for your VPS specifications
- ✅ Production-ready security and performance

**Your complete pharmacy ecosystem is now live and optimized for your VPS!**

