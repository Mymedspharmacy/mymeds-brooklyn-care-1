# CI/CD Pipeline Setup Guide

This guide will help you set up a complete CI/CD pipeline for MyMeds Pharmacy that automatically deploys changes to your VPS when you push code to GitHub.

## 🚀 Features

- **Automated Deployment**: Deploy on every push to main/latest branch
- **Incremental Updates**: Deploy only changed components (frontend/backend/full)
- **Webhook Integration**: Real-time deployment triggers
- **Rollback Support**: Automatic rollback on deployment failure
- **Health Monitoring**: Continuous health checks and monitoring
- **Zero Downtime**: Minimal downtime deployments

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ 
- Node.js 18+ installed on VPS
- GitHub repository
- SSH access to VPS
- Domain name (optional but recommended)

## 🛠️ Setup Instructions

### 1. Initial Setup

Run the setup script to configure everything:

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Set your VPS details
export VPS_HOST="your-vps-ip"
export VPS_USER="root"
export VPS_PORT="22"

# Run setup
npm run deploy:setup
```

### 2. GitHub Configuration

#### Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

```
VPS_HOST: your-vps-ip
VPS_USERNAME: root
VPS_PORT: 22
VPS_SSH_KEY: [Your private SSH key content]
WEBHOOK_SECRET: [Generated webhook secret]
```

#### Add Webhook

Go to your GitHub repository → Settings → Webhooks → Add webhook

- **Payload URL**: `http://your-vps-ip/webhook`
- **Content type**: `application/json`
- **Secret**: Use the generated webhook secret
- **Events**: Select "Just the push event"
- **Active**: Checked

### 3. SSH Key Setup

Generate SSH key if you don't have one:

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

Add public key to VPS:

```bash
# Copy public key to VPS
ssh-copy-id -p 22 root@your-vps-ip

# Or manually add to authorized_keys
cat ~/.ssh/id_rsa.pub | ssh -p 22 root@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## 🔄 Deployment Types

The system automatically determines deployment type based on changed files:

### Frontend Deployment
Triggers when:
- Files in `src/`, `public/`
- `.tsx`, `.ts`, `.css` files
- `package.json`, `vite.config.ts`, `tailwind.config.ts`

### Backend Deployment
Triggers when:
- Files in `backend/`
- `.js`, `.ts` files
- `backend/package.json`, `backend/prisma/schema.prisma`

### Full Deployment
Triggers when:
- Both frontend and backend files changed
- Database schema changes
- Major configuration changes

## 📡 API Endpoints

### Webhook Server Endpoints

- **Health Check**: `GET http://your-vps-ip/webhook/health`
- **Manual Deploy**: `POST http://your-vps-ip/deploy/frontend|backend|full`
- **Status**: `GET http://your-vps-ip/status`

### GitHub Actions

- **Automatic**: Triggers on push to main/latest
- **Manual**: Can be triggered from GitHub Actions tab

## 🎯 Usage Examples

### Automatic Deployment

```bash
# Make changes to your code
git add .
git commit -m "Add new feature"
git push origin main

# Deployment happens automatically!
```

### Manual Deployment

```bash
# Deploy frontend only
npm run deploy:frontend

# Deploy backend only
npm run deploy:backend

# Deploy everything
npm run deploy:full

# Check deployment status
npm run deploy:status

# Rollback if needed
npm run deploy:rollback
```

### Webhook API Usage

```bash
# Manual deployment via API
curl -X POST http://your-vps-ip/deploy/frontend

# Check status
curl http://your-vps-ip/status

# Health check
curl http://your-vps-ip/webhook/health
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# VPS Configuration
VPS_HOST=your-vps-ip
VPS_USER=root
VPS_PORT=22

# Webhook Configuration
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your-webhook-secret

# GitHub Configuration
GITHUB_TOKEN=your-github-token
```

### VPS Configuration

The setup script automatically configures:

- **Nginx**: Reverse proxy and SSL termination
- **PM2**: Process management for Node.js apps
- **Systemd**: Service management
- **Cron**: Monitoring and health checks
- **Backup**: Automatic backup before deployments

## 📊 Monitoring

### Health Checks

The system performs automatic health checks:

- **Backend**: `http://localhost:4000/api/health`
- **Frontend**: `http://localhost/`
- **Webhook**: `http://localhost:3001/health`

### Logs

Check logs for troubleshooting:

```bash
# Webhook server logs
sudo journalctl -u webhook-deploy -f

# Backend logs
pm2 logs mymeds-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Deployment logs
tail -f /var/log/mymeds-pharmacy/deployment.log
```

### Monitoring Script

The system includes a monitoring script that runs every 5 minutes:

- Checks webhook server health
- Checks backend health
- Checks nginx health
- Restarts services if needed

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Test SSH connection
ssh -p 22 root@your-vps-ip

# Check SSH key
ssh-add -l

# Regenerate SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

#### 2. Webhook Not Triggering
```bash
# Check webhook server status
sudo systemctl status webhook-deploy

# Check webhook logs
sudo journalctl -u webhook-deploy -f

# Test webhook manually
curl -X POST http://your-vps-ip/deploy/frontend
```

#### 3. Deployment Fails
```bash
# Check deployment status
npm run deploy:status

# Check PM2 processes
ssh -p 22 root@your-vps-ip "pm2 list"

# Check nginx status
ssh -p 22 root@your-vps-ip "sudo systemctl status nginx"

# Rollback deployment
npm run deploy:rollback
```

#### 4. Health Check Fails
```bash
# Check backend health
curl http://your-vps-ip/api/health

# Check frontend
curl http://your-vps-ip/

# Check webhook
curl http://your-vps-ip/webhook/health
```

### Debug Commands

```bash
# Check all services
ssh -p 22 root@your-vps-ip "sudo systemctl status webhook-deploy nginx"

# Check PM2 processes
ssh -p 22 root@your-vps-ip "pm2 list"

# Check disk space
ssh -p 22 root@your-vps-ip "df -h"

# Check memory usage
ssh -p 22 root@your-vps-ip "free -h"

# Check network connectivity
ssh -p 22 root@your-vps-ip "netstat -tlnp"
```

## 🔒 Security

### Best Practices

1. **Use SSH Keys**: Never use password authentication
2. **Firewall**: Configure UFW to only allow necessary ports
3. **SSL/TLS**: Use Let's Encrypt for HTTPS
4. **Secrets**: Store sensitive data in GitHub secrets
5. **Updates**: Keep system and dependencies updated

### Firewall Configuration

```bash
# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow webhook port (if different)
sudo ufw allow 3001

# Enable firewall
sudo ufw enable
```

### SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📈 Performance

### Optimization Tips

1. **CDN**: Use Cloudflare or similar for static assets
2. **Caching**: Enable nginx caching for static files
3. **Compression**: Enable gzip compression
4. **Database**: Optimize database queries and indexes
5. **Monitoring**: Use monitoring tools like New Relic or DataDog

### Scaling

For high traffic, consider:

1. **Load Balancer**: Use nginx or HAProxy
2. **Multiple Instances**: Run multiple PM2 instances
3. **Database**: Use read replicas
4. **Caching**: Use Redis for session storage
5. **CDN**: Use CloudFront or Cloudflare

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ Automated deployments on every push
- ✅ Incremental updates for faster deployments
- ✅ Automatic rollback on failures
- ✅ Health monitoring and alerts
- ✅ Zero-downtime deployments
- ✅ Complete audit trail

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Test individual components
4. Use the debug commands provided
5. Check GitHub Actions logs for CI/CD issues

## 🔄 Updates

To update the CI/CD pipeline:

```bash
# Pull latest changes
git pull origin main

# Update deployment scripts
npm run deploy:setup

# Restart webhook server
ssh -p 22 root@your-vps-ip "sudo systemctl restart webhook-deploy"
```

---

**Happy Deploying! 🚀**
