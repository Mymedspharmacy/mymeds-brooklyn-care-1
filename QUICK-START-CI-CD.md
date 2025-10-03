# 🚀 Quick Start CI/CD Setup for MyMeds Pharmacy

This guide will help you set up automated deployment to your Hostinger VPS (72.60.116.253) in just a few minutes.

## 📋 Prerequisites

- ✅ Windows 10/11 with PowerShell
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ SSH client (OpenSSH or Git Bash)

## ⚡ Quick Setup (Windows)

### 1. Run the Setup Script

```powershell
# Navigate to your project directory
cd C:\Users\horizon\mymeds-brooklyn-care-1-4

# Run the automated setup
npm run deploy:setup:windows
```

This script will:
- ✅ Generate SSH keys if needed
- ✅ Test SSH connection to your VPS
- ✅ Install required packages on VPS
- ✅ Set up webhook server
- ✅ Configure nginx
- ✅ Set up firewall
- ✅ Create systemd services

### 2. GitHub Configuration

After the setup completes, you'll see output like this:

```
📋 Next Steps:
1. Add GitHub Secrets to your repository:
   - VPS_HOST: 72.60.116.253
   - VPS_USERNAME: root
   - VPS_PORT: 22
   - VPS_SSH_KEY: [Your private SSH key content]
   - WEBHOOK_SECRET: MyMeds-Webhook-Secret-2024-Pharmacy-Deploy

2. Add GitHub Webhook:
   - URL: http://72.60.116.253/webhook
   - Secret: MyMeds-Webhook-Secret-2024-Pharmacy-Deploy
   - Events: Just the push event
```

#### Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value |
|------|-------|
| `VPS_HOST` | `72.60.116.253` |
| `VPS_USERNAME` | `root` |
| `VPS_PORT` | `22` |
| `VPS_SSH_KEY` | Content of `~/.ssh/id_rsa` file |
| `WEBHOOK_SECRET` | `MyMeds-Webhook-Secret-2024-Pharmacy-Deploy` |

#### Add GitHub Webhook

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks**
3. Click **Add webhook**
4. Configure:
   - **Payload URL**: `http://72.60.116.253/webhook`
   - **Content type**: `application/json`
   - **Secret**: `MyMeds-Webhook-Secret-2024-Pharmacy-Deploy`
   - **Events**: Select "Just the push event"
   - **Active**: ✅ Checked

### 3. Test the Setup

```powershell
# Test webhook health
curl http://72.60.116.253/webhook/health

# Test manual deployment
curl -X POST http://72.60.116.253/deploy/frontend

# Check status
curl http://72.60.116.253/status
```

### 4. Deploy Your Code

```powershell
# Add and commit your changes
git add .
git commit -m "Add CI/CD pipeline"

# Push to trigger deployment
git push origin main
```

## 🎯 How It Works

### Automatic Deployment Flow

1. **You push code** → GitHub receives the push
2. **GitHub webhook** → Sends notification to your VPS
3. **Webhook server** → Analyzes changed files
4. **Smart deployment** → Deploys only what changed:
   - `src/`, `public/` → Frontend deployment
   - `backend/` → Backend deployment
   - Both → Full deployment
5. **Health check** → Verifies deployment success
6. **Rollback** → Automatically rolls back if failed

### Deployment Types

| Changed Files | Deployment Type | What Gets Deployed |
|---------------|----------------|-------------------|
| `src/`, `public/`, `.tsx`, `.css` | Frontend | React app, static assets |
| `backend/`, `.js`, `.ts` | Backend | Node.js API, database |
| Both frontend + backend | Full | Complete application |
| Database schema | Full | App + database migrations |

## 🔧 Manual Commands

```powershell
# Deploy specific components
npm run deploy:frontend    # Deploy frontend only
npm run deploy:backend     # Deploy backend only
npm run deploy:full        # Deploy everything

# Management commands
npm run deploy:status      # Check deployment status
npm run deploy:rollback    # Rollback to previous version

# Webhook server
npm run webhook:start      # Start webhook server
npm run webhook:dev        # Start in development mode
```

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook/health` | GET | Health check |
| `/deploy/frontend` | POST | Manual frontend deploy |
| `/deploy/backend` | POST | Manual backend deploy |
| `/deploy/full` | POST | Manual full deploy |
| `/status` | GET | Deployment status |

## 🔍 Monitoring

### Check Services

```powershell
# SSH into your VPS
ssh root@72.60.116.253

# Check webhook service
sudo systemctl status webhook-deploy

# Check nginx
sudo systemctl status nginx

# Check PM2 processes
pm2 list

# View logs
sudo journalctl -u webhook-deploy -f
pm2 logs mymeds-backend
```

### Health Checks

The system automatically monitors:
- ✅ Webhook server health
- ✅ Backend API health
- ✅ Frontend accessibility
- ✅ Database connectivity

## 🚨 Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```powershell
# Test SSH connection
ssh root@72.60.116.253

# Check SSH key
Get-Content ~/.ssh/id_rsa.pub
```

#### 2. Webhook Not Working
```powershell
# Check webhook service
ssh root@72.60.116.253 "sudo systemctl status webhook-deploy"

# Check webhook logs
ssh root@72.60.116.253 "sudo journalctl -u webhook-deploy -f"

# Test webhook manually
curl http://72.60.116.253/webhook/health
```

#### 3. Deployment Fails
```powershell
# Check deployment status
npm run deploy:status

# Check PM2 processes
ssh root@72.60.116.253 "pm2 list"

# Rollback if needed
npm run deploy:rollback
```

#### 4. Port Issues
```powershell
# Check if ports are open
ssh root@72.60.116.253 "sudo ufw status"
ssh root@72.60.116.253 "netstat -tlnp"
```

## 🔒 Security Features

- ✅ SSH key authentication
- ✅ Webhook signature verification
- ✅ Firewall configuration (UFW)
- ✅ Automatic backups before deployment
- ✅ Health monitoring and alerts
- ✅ Rollback on failure

## 📊 VPS Specifications

Your Hostinger VPS details:
- **IP**: 72.60.116.253
- **Hostname**: srv983203.hstgr.cloud
- **OS**: Ubuntu 24.04 LTS
- **CPU**: 1 core
- **RAM**: 4 GB
- **Storage**: 50 GB
- **Location**: United States - Boston

## 🎉 Success!

Once setup is complete, you'll have:

- ✅ **Automated deployments** on every push
- ✅ **Incremental updates** for faster deployments
- ✅ **Automatic rollback** on failures
- ✅ **Health monitoring** and alerts
- ✅ **Zero-downtime** deployments
- ✅ **Complete audit trail**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Test individual components
4. Use the debug commands provided

## 🔄 Updates

To update the CI/CD pipeline:

```powershell
# Pull latest changes
git pull origin main

# Update deployment scripts
npm run deploy:setup:windows

# Restart webhook server
ssh root@72.60.116.253 "sudo systemctl restart webhook-deploy"
```

---

**Happy Deploying! 🚀**

Your MyMeds Pharmacy application will now automatically deploy to your Hostinger VPS whenever you push code to GitHub!
