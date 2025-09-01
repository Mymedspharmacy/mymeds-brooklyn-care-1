# GitHub Secrets Setup for CI/CD

To enable the CI/CD pipeline, you need to add these secrets to your GitHub repository:

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### 1. VPS_HOST
- **Name**: `VPS_HOST`
- **Value**: `72.60.116.253`

### 2. VPS_USER
- **Name**: `VPS_USER`
- **Value**: `root`

### 3. VPS_SSH_KEY
- **Name**: `VPS_SSH_KEY`
- **Value**: Your private SSH key content

## Generate SSH Key for CI/CD

Run these commands on your VPS to generate a dedicated SSH key for GitHub Actions:

```bash
# Generate SSH key for CI/CD
ssh-keygen -t ed25519 -C "github-actions@mymedspharmacy" -f ~/.ssh/github_actions_key -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Display private key (copy this to GitHub secret VPS_SSH_KEY)
cat ~/.ssh/github_actions_key

# Set proper permissions
chmod 600 ~/.ssh/github_actions_key
chmod 644 ~/.ssh/github_actions_key.pub
```

## Test the Setup

After adding the secrets, push any change to trigger the workflow:

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin latest
```

## Monitoring

- Check GitHub Actions tab for deployment status
- Monitor PM2 processes: `pm2 monit`
- Check logs: `pm2 logs`
- Nginx logs: `sudo tail -f /var/log/nginx/error.log`
