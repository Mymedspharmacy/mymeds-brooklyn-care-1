# 🚀 MyMeds Pharmacy - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the MyMeds Pharmacy application with full CI/CD automation.

## 📋 Prerequisites

### Required Accounts & Services
- ✅ GitHub repository
- ✅ VPS server (Ubuntu 20.04+ recommended)
- ✅ Domain name
- ✅ SSH access to VPS

### Required Software (Local)
- ✅ Node.js 18+
- ✅ npm
- ✅ Git
- ✅ SSH client

## 🎯 Deployment Options

### Option 1: Automated CI/CD (Recommended)
**When you push to GitHub, everything happens automatically!**

### Option 2: Manual Deployment
**For testing or one-time deployments**

---

## 🚀 Option 1: Automated CI/CD Deployment

### Step 1: Prepare Your VPS

#### 1.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
```

#### 1.2 Run the Setup Script
```bash
# Download and run the setup script
curl -o setup-vps.sh https://raw.githubusercontent.com/your-repo/main/scripts/deployment/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh your-domain.com your-email@domain.com
```

This script will:
- ✅ Update system packages
- ✅ Install Node.js, Nginx, MySQL, Redis
- ✅ Configure firewall
- ✅ Setup SSL certificates
- ✅ Create necessary directories
- ✅ Configure monitoring and backups

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `VPS_HOST` | Your VPS IP | `192.168.1.100` |
| `VPS_USER` | SSH username | `root` |
| `VPS_SSH_KEY` | Private SSH key | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DOMAIN` | Your domain | `mymedspharmacyinc.com` |
| `SSL_EMAIL` | Email for SSL | `admin@mymedspharmacyinc.com` |

#### 2.1 Generate SSH Key (if needed)
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

#### 2.2 Add Public Key to VPS
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub root@your-vps-ip
```

#### 2.3 Add Private Key to GitHub
Copy your private key content and add it as `VPS_SSH_KEY` secret.

### Step 3: Deploy!

Simply push to the `main` or `latest` branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. 🧪 Run tests
2. 🏗️ Build applications
3. 🚀 Deploy to VPS
4. 🏥 Run health checks
5. 📢 Send notifications

### Step 4: Verify Deployment

Visit your domain: `https://your-domain.com`

You should see:
- ✅ MyMeds Pharmacy homepage
- ✅ SSL certificate working
- ✅ All pages loading correctly
- ✅ API endpoints responding

---

## 🔧 Option 2: Manual Deployment

### Step 1: Build Applications

#### 1.1 Build Frontend
```bash
npm install
npm run build
```

#### 1.2 Build Backend
```bash
cd backend
npm install
npm run build
```

### Step 2: Deploy to VPS

#### 2.1 Copy Files
```bash
# Copy all files to VPS
scp -r . root@your-vps-ip:/tmp/mymeds-deploy/
```

#### 2.2 Run Deployment Script
```bash
ssh root@your-vps-ip
cd /tmp/mymeds-deploy
chmod +x scripts/deployment/deploy-vps.sh
./scripts/deployment/deploy-vps.sh
```

---

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Technology**: React 18, TypeScript, Tailwind CSS, ShadCN UI
- **Port**: 3000 (dev), 80/443 (production)
- **Build**: Optimized production build
- **Features**: PWA, responsive design, modern UI

### Backend (Node.js + Express)
- **Technology**: Node.js 18, Express, TypeScript, Prisma ORM
- **Port**: 4000
- **Database**: MySQL/PostgreSQL (production), SQLite (dev)
- **Features**: JWT auth, API endpoints, file uploads

### Web Server (Nginx)
- **Role**: Reverse proxy, static file serving, SSL termination
- **Features**: Gzip compression, caching, security headers
- **SSL**: Automatic via Let's Encrypt

### Process Manager (PM2)
- **Role**: Process management, clustering, auto-restart
- **Features**: Load balancing, monitoring, logging

---

## 🔒 Security Features

### Application Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Input validation (Zod)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection

### Server Security
- ✅ UFW firewall
- ✅ Fail2ban intrusion detection
- ✅ SSL/TLS encryption
- ✅ Security headers
- ✅ Rate limiting
- ✅ Regular updates

### Deployment Security
- ✅ SSH key authentication
- ✅ Non-root user execution
- ✅ Secure file permissions
- ✅ Environment variable protection
- ✅ Backup encryption

---

## 📊 Monitoring & Logging

### Application Monitoring
- **PM2 Dashboard**: Process monitoring
- **Health Endpoints**: `/api/health`
- **Performance Metrics**: Response times, memory usage
- **Error Tracking**: Centralized error logging

### Server Monitoring
- **System Resources**: CPU, memory, disk usage
- **Service Status**: Nginx, MySQL, Redis, PM2
- **Network Traffic**: Bandwidth monitoring
- **Security Logs**: Failed login attempts, suspicious activity

### Log Locations
- **Application Logs**: `/var/log/mymeds/`
- **Nginx Logs**: `/var/log/nginx/`
- **PM2 Logs**: `pm2 logs`
- **System Logs**: `/var/log/syslog`

---

## 🔄 Backup & Recovery

### Automated Backups
- **Database**: Daily MySQL dumps
- **Files**: Daily file system backups
- **Configuration**: Nginx, PM2 configs
- **Retention**: 30 days

### Manual Backup
```bash
# Database backup
mysqldump -u mymeds_user -p mymeds_production > backup.sql

# File backup
tar -czf backup.tar.gz /var/www/mymeds

# Configuration backup
cp -r /etc/nginx/sites-available /backup/nginx-config
```

### Recovery Process
1. Stop services
2. Restore from backup
3. Run database migrations
4. Restart services
5. Verify functionality

---

## 🚨 Troubleshooting

### Common Issues

#### Deployment Fails
1. **Check GitHub Actions logs**
2. **Verify VPS connection**
3. **Check disk space**
4. **Verify permissions**

#### Services Won't Start
1. **Check PM2 logs**: `pm2 logs`
2. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`
3. **Verify port availability**
4. **Check configuration files**

#### SSL Issues
1. **Verify domain DNS**
2. **Check Certbot logs**
3. **Ensure ports 80/443 are open**
4. **Verify email configuration**

#### Database Issues
1. **Check connection string**
2. **Verify database exists**
3. **Check user permissions**
4. **Run migrations manually**

### Debug Commands

```bash
# Check service status
sudo pm2 status
sudo systemctl status nginx

# Check logs
sudo pm2 logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/mymeds-deployment.log

# Test connectivity
curl http://localhost:4000/api/health
curl http://localhost:80

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

---

## 📈 Performance Optimization

### Frontend Optimization
- ✅ Code splitting
- ✅ Image optimization
- ✅ Gzip compression
- ✅ CDN integration
- ✅ Caching strategies

### Backend Optimization
- ✅ Database indexing
- ✅ Query optimization
- ✅ Caching (Redis)
- ✅ Load balancing
- ✅ Connection pooling

### Server Optimization
- ✅ Nginx caching
- ✅ Gzip compression
- ✅ HTTP/2 support
- ✅ SSL optimization
- ✅ Resource monitoring

---

## 🔧 Configuration

### Environment Variables

#### Development
- `backend/env.development`
- `src/lib/env.ts`

#### Production
- GitHub Secrets
- VPS environment files
- Nginx configuration

### Database Configuration
- **Development**: SQLite (file-based)
- **Production**: MySQL/PostgreSQL
- **Migrations**: Prisma handles automatically
- **Backups**: Automated daily backups

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly**: Check logs, update packages
- **Monthly**: Review security, test backups
- **Quarterly**: Performance review, capacity planning

### Monitoring
- **GitHub Actions**: Deployment status
- **VPS Monitoring**: System resources
- **Application Monitoring**: Performance metrics
- **Security Monitoring**: Intrusion detection

### Documentation
- **README.md**: Project overview
- **Documentation/**: Complete guides
- **Scripts/docs/**: Script documentation

---

## 🎉 Success Checklist

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

---

## 🚀 Next Steps

1. **Configure Domain**: Point your domain to VPS IP
2. **Setup Monitoring**: Configure alerts and notifications
3. **Test Everything**: Verify all functionality works
4. **Setup Backups**: Test backup and recovery process
5. **Security Review**: Review and harden security settings
6. **Performance Tuning**: Optimize for your traffic
7. **Documentation**: Update any custom configurations

---

**🎉 Congratulations! Your MyMeds Pharmacy application is now live and automatically deploying from GitHub!**

For support, check the logs, documentation, or create a GitHub issue.