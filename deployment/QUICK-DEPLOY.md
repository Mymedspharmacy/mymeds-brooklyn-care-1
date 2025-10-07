# Quick VPS Deployment - One Command

## Single Command Deployment
```bash
curl -fsSL https://raw.githubusercontent.com/Mymedspharmacy/mymeds-brooklyn-care-1/latest/deployment/deploy-to-vps.sh | bash
```

## Or Download and Run
```bash
wget https://raw.githubusercontent.com/Mymedspharmacy/mymeds-brooklyn-care-1/latest/deployment/deploy-to-vps.sh && chmod +x deploy-to-vps.sh && ./deploy-to-vps.sh
```

## Essential Post-Deployment Commands

### 1. Update Environment Variables
```bash
nano /var/www/mymeds-pharmacy/backend/.env
# Update with your actual WooCommerce, WordPress, Stripe credentials
```

### 2. Restart Services
```bash
pm2 restart all
sudo systemctl restart nginx
```

### 3. Check Status
```bash
pm2 status
curl https://mymedspharmacyinc.com/api/health
```

### 4. View Logs
```bash
pm2 logs
```

## Quick Update Commands
```bash
cd /var/www/mymeds-pharmacy
git pull origin latest
cd backend && npm install --production
cd ../src && npm run build
pm2 restart all
```

## Emergency Commands
```bash
# Restart everything
pm2 restart all && sudo systemctl restart nginx

# Check what's running
pm2 status && sudo systemctl status nginx

# View error logs
pm2 logs --err
sudo tail -f /var/log/nginx/error.log
```


