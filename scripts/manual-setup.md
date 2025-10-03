# 🚀 Manual CI/CD Setup for MyMeds Pharmacy

Since the PowerShell script has syntax issues, here's a manual setup guide for your Hostinger VPS.

## 📋 VPS Details
- **IP**: 72.60.116.253
- **Hostname**: srv983203.hstgr.cloud
- **OS**: Ubuntu 24.04 LTS
- **SSH**: root@72.60.116.253:22

## ⚡ Quick Setup Steps

### 1. Connect to Your VPS

```bash
ssh root@72.60.116.253
```

### 2. Install Required Packages

```bash
# Update system
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install other packages
sudo apt install -y nginx pm2 rsync curl git ufw mysql-server

# Start services
sudo systemctl start nginx mysql
sudo systemctl enable nginx mysql
```

### 3. Create Directories

```bash
# Create deployment directories
sudo mkdir -p /var/www/mymeds-pharmacy
sudo mkdir -p /var/backups/mymeds-pharmacy
sudo mkdir -p /opt/webhook-deploy

# Set permissions
sudo chown -R root:root /var/www/mymeds-pharmacy
sudo chown -R root:root /var/backups/mymeds-pharmacy
sudo chown -R root:root /opt/webhook-deploy
```

### 4. Setup Webhook Server

```bash
cd /opt/webhook-deploy

# Create package.json
cat > package.json << 'EOF'
{
  "name": "webhook-deploy",
  "version": "1.0.0",
  "main": "webhook-deploy.js",
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Install dependencies
npm install
```

### 5. Copy Files from Local Machine

From your Windows machine, run:

```powershell
# Copy webhook files to VPS
scp -P 22 scripts/webhook-deploy.js root@72.60.116.253:/opt/webhook-deploy/
scp -P 22 scripts/incremental-deploy.sh root@72.60.116.253:/opt/webhook-deploy/

# Make script executable
ssh root@72.60.116.253 "chmod +x /opt/webhook-deploy/incremental-deploy.sh"
```

### 6. Create Systemd Service

```bash
sudo tee /etc/systemd/system/webhook-deploy.service > /dev/null << 'EOF'
[Unit]
Description=Webhook Deployment Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/webhook-deploy
ExecStart=/usr/bin/node webhook-deploy.js
Restart=always
Environment=NODE_ENV=production
Environment=WEBHOOK_PORT=3001
Environment=WEBHOOK_SECRET=MyMeds-Webhook-Secret-2024-Pharmacy-Deploy

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable webhook-deploy
sudo systemctl start webhook-deploy
```

### 7. Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/webhook-deploy > /dev/null << 'EOF'
server {
    listen 80;
    server_name 72.60.116.253;
    
    location /webhook {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /deploy {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /status {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/webhook-deploy /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Configure Firewall

```bash
# Configure UFW
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

### 9. Test the Setup

```bash
# Check webhook service
sudo systemctl status webhook-deploy

# Check nginx
sudo systemctl status nginx

# Test webhook endpoint
curl http://72.60.116.253/webhook/health
```

## 🔧 GitHub Configuration

### 1. Add Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Name | Value |
|------|-------|
| `VPS_HOST` | `72.60.116.253` |
| `VPS_USERNAME` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Content of your `~/.ssh/id_rsa` file |
| `WEBHOOK_SECRET` | `MyMeds-Webhook-Secret-2024-Pharmacy-Deploy` |

### 2. Add GitHub Webhook

Go to your GitHub repository → Settings → Webhooks → Add webhook

- **Payload URL**: `http://72.60.116.253/webhook`
- **Content type**: `application/json`
- **Secret**: `MyMeds-Webhook-Secret-2024-Pharmacy-Deploy`
- **Events**: Select "Just the push event"
- **Active**: ✅ Checked

## 🚀 Deploy Your Code

```bash
# Add and commit changes
git add .
git commit -m "Add CI/CD pipeline"

# Push to trigger deployment
git push origin main
```

## 🔍 Monitoring

### Check Services

```bash
# SSH into VPS
ssh root@72.60.116.253

# Check webhook service
sudo systemctl status webhook-deploy

# Check nginx
sudo systemctl status nginx

# View logs
sudo journalctl -u webhook-deploy -f
```

### Test Endpoints

```bash
# Health check
curl http://72.60.116.253/webhook/health

# Manual deployment
curl -X POST http://72.60.116.253/deploy/frontend

# Status
curl http://72.60.116.253/status
```

## 🎯 How It Works

1. **You push code** → GitHub receives the push
2. **GitHub webhook** → Sends notification to your VPS
3. **Webhook server** → Analyzes changed files
4. **Smart deployment** → Deploys only what changed
5. **Health check** → Verifies deployment success
6. **Rollback** → Automatically rolls back if failed

## 🔧 Manual Commands

```bash
# Deploy specific components
npm run deploy:frontend    # Deploy frontend only
npm run deploy:backend     # Deploy backend only
npm run deploy:full        # Deploy everything

# Management
npm run deploy:status      # Check deployment status
npm run deploy:rollback    # Rollback to previous version
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Webhook Not Working
```bash
# Check service status
sudo systemctl status webhook-deploy

# Check logs
sudo journalctl -u webhook-deploy -f

# Restart service
sudo systemctl restart webhook-deploy
```

#### 2. Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# Reload configuration
sudo systemctl reload nginx
```

#### 3. Firewall Issues
```bash
# Check status
sudo ufw status

# Allow ports
sudo ufw allow 3001/tcp
```

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ **Automated deployments** on every push
- ✅ **Incremental updates** for faster deployments
- ✅ **Automatic rollback** on failures
- ✅ **Health monitoring** and alerts
- ✅ **Zero-downtime** deployments

## 📞 Support

If you encounter issues:

1. Check service statuses
2. Review logs for error messages
3. Test individual components
4. Verify firewall settings

---

**Your CI/CD pipeline is now ready! 🚀**

Every time you push code to GitHub, it will automatically deploy to your Hostinger VPS.
