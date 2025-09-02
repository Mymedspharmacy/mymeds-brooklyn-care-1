# 🚀 MyMeds Pharmacy - Complete Deployment Guide

This directory contains all the scripts and configurations needed to deploy the MyMeds Pharmacy application to a VPS with full CI/CD automation.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `deploy-production-complete.ps1` | PowerShell script for complete VPS setup |
| `deploy-vps.sh` | Bash script for deployment on VPS |
| `deploy-config.env` | Configuration file with all settings |
| `README.md` | This documentation file |

## 🎯 Quick Start

### 1. Local Testing (Already Completed ✅)
- ✅ Frontend running on http://localhost:3000
- ✅ Backend running on http://localhost:4000
- ✅ Database connected and working
- ✅ All tests passing

### 2. Setup GitHub Secrets
Follow the guide in `documentation/GITHUB_SECRETS_SETUP.md` to configure:
- `VPS_HOST` - Your VPS IP address
- `VPS_USER` - SSH username
- `VPS_SSH_KEY` - Private SSH key
- `DOMAIN` - Your domain name
- `SSL_EMAIL` - Email for SSL certificates

### 3. Deploy to VPS
Simply push to the `main` or `latest` branch and GitHub Actions will automatically:
- Run tests
- Build the application
- Deploy to your VPS
- Run health checks
- Send notifications

## 🔧 Manual Deployment

If you prefer manual deployment:

### Option 1: PowerShell Script (Windows)
```powershell
.\deploy-production-complete.ps1 -VPS_IP "your-vps-ip" -DOMAIN "your-domain.com" -SSL_EMAIL "your-email@domain.com"
```

### Option 2: Bash Script (Linux/Mac)
```bash
# Copy files to VPS first
scp -r . user@your-vps-ip:/tmp/mymeds-deploy/

# Then run deployment script on VPS
ssh user@your-vps-ip "cd /tmp/mymeds-deploy && chmod +x scripts/deployment/deploy-vps.sh && ./scripts/deployment/deploy-vps.sh"
```

## 🏗️ Architecture

### Frontend (React + Vite)
- **Port**: 3000 (dev), 80/443 (production)
- **Build**: `npm run build`
- **Output**: `dist/` directory
- **Features**: TypeScript, Tailwind CSS, ShadCN UI

### Backend (Node.js + Express)
- **Port**: 4000
- **Build**: `npm run build`
- **Output**: `backend/dist/` directory
- **Features**: TypeScript, Prisma ORM, JWT Auth

### Database (SQLite/MySQL)
- **Development**: SQLite (`dev.db`)
- **Production**: MySQL/PostgreSQL
- **ORM**: Prisma
- **Migrations**: Automatic via Prisma

### Web Server (Nginx)
- **Frontend**: Serves static files
- **Backend**: Proxies API requests
- **SSL**: Automatic via Certbot
- **Security**: Headers, rate limiting

### Process Manager (PM2)
- **Mode**: Cluster mode
- **Instances**: Max (CPU cores)
- **Restart**: Automatic on failure
- **Logs**: Centralized logging

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
1. **Test & Build**
   - Install dependencies
   - Run tests (frontend + backend)
   - Lint code
   - Build applications
   - Upload artifacts

2. **Deploy**
   - Download artifacts
   - Copy files to VPS
   - Create backup
   - Install dependencies
   - Run migrations
   - Start services
   - Health checks

3. **Security Scan**
   - CodeQL analysis
   - Dependency audit
   - Security checks

4. **Performance Test**
   - Load testing with Artillery
   - Performance metrics
   - Report generation

## 🛡️ Security Features

### Application Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation (Zod)
- SQL injection prevention
- XSS protection
- CSRF protection

### Server Security
- UFW firewall
- Fail2ban intrusion detection
- SSL/TLS encryption
- Security headers
- Rate limiting
- Regular updates

### Deployment Security
- SSH key authentication
- Non-root user execution
- Secure file permissions
- Environment variable protection
- Backup encryption

## 📊 Monitoring & Logging

### Application Monitoring
- PM2 process monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Uptime monitoring

### Server Monitoring
- System resource usage
- Disk space monitoring
- Network traffic
- Security logs
- Access logs

### Log Management
- Centralized logging
- Log rotation
- Error aggregation
- Performance logs
- Audit trails

## 🔧 Configuration

### Environment Variables
All configuration is managed through environment variables:

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

## 🚨 Troubleshooting

### Common Issues

#### Deployment Fails
1. Check GitHub Actions logs
2. Verify VPS connection
3. Check disk space
4. Verify permissions

#### Services Won't Start
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify port availability
4. Check configuration files

#### SSL Issues
1. Verify domain DNS
2. Check Certbot logs
3. Ensure ports 80/443 are open
4. Verify email configuration

#### Database Issues
1. Check connection string
2. Verify database exists
3. Check user permissions
4. Run migrations manually

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

## 📈 Performance Optimization

### Frontend Optimization
- Code splitting
- Image optimization
- Gzip compression
- CDN integration
- Caching strategies

### Backend Optimization
- Database indexing
- Query optimization
- Caching (Redis)
- Load balancing
- Connection pooling

### Server Optimization
- Nginx caching
- Gzip compression
- HTTP/2 support
- SSL optimization
- Resource monitoring

## 🔄 Backup & Recovery

### Automated Backups
- Daily database backups
- File system backups
- Configuration backups
- Retention policy (30 days)

### Manual Backup
```bash
# Database backup
mysqldump -u username -p database_name > backup.sql

# File backup
tar -czf backup.tar.gz /var/www/mymeds

# Configuration backup
cp -r /etc/nginx/sites-available /backup/nginx-config
```

### Recovery Process
1. Stop services
2. Restore from backup
3. Run migrations
4. Restart services
5. Verify functionality

## 📞 Support

### Documentation
- `documentation/` - Complete documentation
- `README.md` - Project overview
- `scripts/docs/` - Script documentation

### Monitoring
- GitHub Actions logs
- VPS system logs
- Application logs
- Performance metrics

### Contact
- GitHub Issues for bugs
- Documentation for questions
- Logs for troubleshooting

---

## 🎉 Success!

Once everything is set up, you'll have:
- ✅ Automated CI/CD pipeline
- ✅ Production-ready deployment
- ✅ SSL certificates
- ✅ Monitoring & logging
- ✅ Backup system
- ✅ Security hardening
- ✅ Performance optimization

Your MyMeds Pharmacy application will be live and automatically updated whenever you push to GitHub!