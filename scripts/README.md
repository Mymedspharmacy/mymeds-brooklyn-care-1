# MyMeds Pharmacy Deployment Scripts

## 🚀 Complete Automated Deployment

**Domain:** `mymedspharmacyinc.com`  
**VPS:** `72.60.116.253`

### Quick Start
```bash
# Upload to VPS
./scripts/windows-deploy.ps1 -VpsIP 72.60.116.253

# Deploy everything
ssh root@72.60.116.253
sudo ./deploy-mymeds.sh
```

## What Gets Deployed Automatically

✅ **MySQL Database** - Production + WordPress databases  
✅ **WordPress + WooCommerce** - Blog and shop  
✅ **React/Node.js App** - Frontend and backend  
✅ **SSL Certificates** - All domains  
✅ **Nginx Web Server** - Fully configured  
✅ **Security & Monitoring** - Firewall, backups, health checks  

## Required DNS
```
mymedspharmacyinc.com          A    72.60.116.253
www.mymedspharmacyinc.com     A    72.60.116.253  
blog.mymedspharmacyinc.com    A    72.60.116.253
shop.mymedspharmacyinc.com    A    72.60.116.253
```

## Access After Deployment
- **Main Site:** https://mymedspharmacyinc.com
- **Admin Panel:** https://mymedspharmacyinc.com/admin
- **Blog:** https://blog.mymedspharmacyinc.com
- **Shop:** https://shop.mymedspharmacyinc.com

All passwords generated automatically. Check `/var/www/mymeds/*-credentials.conf`