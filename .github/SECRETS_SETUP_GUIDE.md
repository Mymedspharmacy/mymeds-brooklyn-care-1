# 🔐 GitHub Secrets Setup Guide for VPS KVM1 Deployment

## Overview
This guide explains how to set up all the required secrets in your GitHub repository for deploying your entire MyMeds Pharmacy application to Hostinger VPS KVM1.

## 📍 Where to Set Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Click on **Secrets and variables** → **Actions**
4. Click **New repository secret** to add each secret

## 🔑 Required Secrets for VPS KVM1

### **VPS Connection Details**
```bash
# Your VPS IP address
HOSTINGER_HOST=your_vps_ip_address

# SSH username (usually 'root')
HOSTINGER_USERNAME=root

# Your private SSH key content (not the public one)
HOSTINGER_SSH_KEY=your_private_ssh_key_content
```

### **Database Configuration**
```bash
# MySQL Database Password (for Hostinger VPS)
DB_PASSWORD=your_secure_mysql_password
```

### **JWT Security Keys**
```bash
# JWT Secret Key (minimum 64 characters)
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters-long

# JWT Refresh Secret Key (minimum 64 characters)
JWT_REFRESH_SECRET=another-super-secure-refresh-secret-minimum-64-characters-long
```

### **Optional: Slack Notifications**
```bash
# Slack Webhook URL (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
```

## 🚀 How to Get Each Secret

### **1. VPS IP Address (HOSTINGER_HOST)**
- Go to your Hostinger VPS control panel
- Copy the IP address shown in the VPS details
- Example: `123.456.789.012`

### **2. SSH Username (HOSTINGER_USERNAME)**
- For Hostinger VPS KVM1, this is typically `root`
- You can verify this in your VPS control panel

### **3. SSH Private Key (HOSTINGER_SSH_KEY)**
```bash
# Generate SSH key pair (if you don't have one):
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# Copy the PRIVATE key content (not the public one):
cat ~/.ssh/id_rsa

# Add the PUBLIC key to your VPS:
cat ~/.ssh/id_rsa.pub | ssh root@your_vps_ip "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### **4. Database Password (DB_PASSWORD)**
```bash
# On your Hostinger VPS, create MySQL user:
sudo mysql
CREATE USER 'mymeds_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';
GRANT ALL PRIVILEGES ON mymeds_staging.* TO 'mymeds_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### **5. JWT Secrets**
```bash
# Generate secure JWT secrets (run in terminal):
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **6. Slack Webhook (Optional)**
1. Go to [Slack Apps](https://api.slack.com/apps)
2. Create New App → **From scratch**
3. Add **Incoming Webhooks** feature
4. Create webhook for your channel
5. Copy the webhook URL

## ✅ Verification Checklist

- [ ] `HOSTINGER_HOST` - Your VPS IP address
- [ ] `HOSTINGER_USERNAME` - SSH username (usually 'root')
- [ ] `HOSTINGER_SSH_KEY` - Your private SSH key content
- [ ] `DB_PASSWORD` - MySQL password for Hostinger VPS
- [ ] `JWT_SECRET` - 64+ character secure JWT secret
- [ ] `JWT_REFRESH_SECRET` - 64+ character secure refresh secret
- [ ] `SLACK_WEBHOOK_URL` - Slack webhook URL (optional)

## 🔒 Security Best Practices

1. **Never commit secrets to your repository**
2. **Use strong, unique passwords for each service**
3. **Rotate secrets regularly**
4. **Use environment-specific secrets**
5. **Limit secret access to necessary users only**
6. **Keep your SSH private key secure and never share it**

## 🧪 Testing Your Secrets

After setting up all secrets, test your workflow:

1. **Push to develop branch** - Should trigger staging deployment to VPS KVM1
2. **Push to main branch** - Should trigger production deployment to VPS KVM1
3. **Check GitHub Actions** - Monitor the workflow execution
4. **Verify deployments** - Check if your apps are deployed successfully on VPS

## 🚨 Troubleshooting

### **Common Issues:**

1. **"Secret not found" errors**
   - Verify secret names match exactly (case-sensitive)
   - Check if secrets are set in the correct repository

2. **SSH connection failures**
   - Verify SSH key is correct
   - Check VPS firewall settings
   - Ensure SSH service is running
   - Verify the public key is added to VPS

3. **Database connection errors**
   - Verify MySQL user exists
   - Check database permissions
   - Ensure MySQL service is running

4. **Deployment failures**
   - Check VPS disk space
   - Verify Node.js and npm are installed
   - Check PM2 installation
   - Review deployment logs

## 📞 Support

If you encounter issues:
1. Check GitHub Actions logs for detailed error messages
2. Verify all secrets are set correctly
3. Test SSH connection manually: `ssh root@your_vps_ip`
4. Check VPS services: `systemctl status nginx mysql`
5. Review PM2 logs: `pm2 logs`

## 🎯 What Happens During Deployment

### **Staging Deployment (develop branch):**
- Deploys to `/var/www/mymeds-staging` on VPS KVM1
- Runs on port 3001
- Database: `mymeds_staging`
- Frontend: `https://staging.mymedspharmacyinc.com`
- Backend: `https://api-staging.mymedspharmacyinc.com`

### **Production Deployment (main branch):**
- Deploys to `/var/www/mymeds-production` on VPS KVM1
- Runs on port 3000
- Database: `mymeds_production`
- Frontend: `https://www.mymedspharmacyinc.com`
- Backend: `https://api.mymedspharmacyinc.com`

## 🚀 Ready to Deploy!

Once you've set up all the secrets:
1. Push your code to the `develop` branch for staging deployment
2. Push your code to the `main` branch for production deployment
3. Monitor the deployment in GitHub Actions
4. Your entire application will be running on VPS KVM1!

Your MyMeds Pharmacy application will be fully self-hosted on your Hostinger VPS KVM1 with automatic deployments! 🎉
