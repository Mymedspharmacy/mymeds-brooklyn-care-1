# 🔐 GitHub Secrets Setup Guide

This guide explains how to set up the required GitHub secrets for automatic deployment to your VPS.

## Required Secrets

You need to add the following secrets to your GitHub repository:

### 1. VPS Connection Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | Your VPS IP address or domain | `192.168.1.100` or `your-vps.com` |
| `VPS_USER` | SSH username for VPS | `root` or `ubuntu` |
| `VPS_SSH_KEY` | Private SSH key for VPS access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### 2. Domain & SSL Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DOMAIN` | Your domain name | `mymedspharmacyinc.com` |
| `SSL_EMAIL` | Email for SSL certificate | `admin@mymedspharmacyinc.com` |

### 3. Optional Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `WEBHOOK_URL` | Discord/Slack webhook for notifications | `https://discord.com/api/webhooks/...` |

## How to Add Secrets

### Step 1: Go to Repository Settings
1. Navigate to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret
1. Click **New repository secret**
2. Enter the secret name (exactly as shown above)
3. Enter the secret value
4. Click **Add secret**

## SSH Key Setup

### Generate SSH Key (if you don't have one)
```bash
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
```

### Add Public Key to VPS
```bash
# Copy your public key to the VPS
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-vps-ip

# Or manually add to authorized_keys
cat ~/.ssh/id_rsa.pub | ssh user@your-vps-ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### Add Private Key to GitHub
1. Copy your private key content:
   ```bash
   cat ~/.ssh/id_rsa
   ```
2. Add it as `VPS_SSH_KEY` secret in GitHub

## VPS Preparation

Your VPS should have the following installed:

### Required Software
- **Node.js 18+**
- **npm**
- **PM2**
- **Nginx**
- **MySQL/PostgreSQL** (or SQLite for development)
- **Certbot** (for SSL certificates)
- **UFW** (firewall)

### Required Directories
```bash
sudo mkdir -p /var/www/mymeds
sudo mkdir -p /var/backups/mymeds
sudo mkdir -p /var/log/mymeds
sudo chown -R www-data:www-data /var/www/mymeds
```

### Required Ports
Make sure these ports are open:
- **22** (SSH)
- **80** (HTTP)
- **443** (HTTPS)
- **4000** (Backend API - internal only)

## Testing the Setup

### 1. Test SSH Connection
```bash
ssh -i ~/.ssh/id_rsa user@your-vps-ip
```

### 2. Test GitHub Actions
1. Push a commit to the `main` or `latest` branch
2. Go to **Actions** tab in your GitHub repository
3. Watch the deployment workflow run

### 3. Verify Deployment
- Check if your application is accessible at your domain
- Verify SSL certificate is working
- Test API endpoints

## Troubleshooting

### Common Issues

#### SSH Connection Failed
- Verify `VPS_HOST` and `VPS_USER` are correct
- Check if SSH key is properly added to VPS
- Ensure VPS allows SSH connections

#### Permission Denied
- Make sure the SSH user has sudo privileges
- Check if the user can write to `/var/www/mymeds`

#### SSL Certificate Issues
- Verify `DOMAIN` points to your VPS IP
- Check if `SSL_EMAIL` is valid
- Ensure ports 80 and 443 are open

#### Build Failures
- Check if all dependencies are properly installed
- Verify Node.js version compatibility
- Review build logs in GitHub Actions

### Debug Commands

#### Check VPS Status
```bash
# Check if services are running
sudo pm2 status
sudo systemctl status nginx

# Check logs
sudo pm2 logs
sudo tail -f /var/log/nginx/error.log
```

#### Check Application Health
```bash
# Test backend
curl http://localhost:4000/api/health

# Test frontend
curl http://localhost:80
```

## Security Best Practices

1. **Use a dedicated deployment user** instead of root
2. **Restrict SSH access** to specific IPs if possible
3. **Keep your VPS updated** regularly
4. **Monitor logs** for suspicious activity
5. **Use strong passwords** and SSH keys
6. **Enable firewall** and configure it properly

## Monitoring

### Health Checks
The deployment script includes automatic health checks:
- Backend API health endpoint
- Frontend accessibility
- SSL certificate validity
- Service status verification

### Logs
Important log locations:
- **Application logs**: `/var/log/mymeds/`
- **Nginx logs**: `/var/log/nginx/`
- **PM2 logs**: `pm2 logs`
- **Deployment logs**: `/var/log/mymeds-deployment.log`

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review VPS logs
3. Verify all secrets are correctly set
4. Test SSH connection manually
5. Check VPS system resources (CPU, memory, disk)

---

**Note**: Keep your secrets secure and never commit them to your repository!
