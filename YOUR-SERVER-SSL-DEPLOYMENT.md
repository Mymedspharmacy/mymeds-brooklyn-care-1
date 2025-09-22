# 🚀 SSL Deployment Guide for Your VPS

## 📋 Your Server Details
- **IP Address**: 72.60.116.253
- **OS**: Ubuntu 24.04 LTS
- **Resources**: 1 CPU, 4GB RAM, 50GB Storage
- **Access**: `ssh root@72.60.116.253`

## 🎯 Quick SSL Setup Commands

### Step 1: Connect to Your Server
```bash
ssh root@72.60.116.253
```

### Step 2: Upload SSL Scripts to Your Server
```bash
# From your local machine, upload the scripts
scp -r deployment/scripts/ root@72.60.116.253:/tmp/
scp docker-compose.optimized.yml root@72.60.116.253:/tmp/
scp -r deployment/nginx/ root@72.60.116.253:/tmp/
```

### Step 3: Set Up Your Domain DNS
**IMPORTANT**: Before running SSL setup, ensure your domain DNS points to your server:

1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Update DNS A record**:
   - **Type**: A
   - **Name**: @ (or your domain)
   - **Value**: `72.60.116.253`
   - **TTL**: 300 (5 minutes)
3. **Update www subdomain**:
   - **Type**: A
   - **Name**: www
   - **Value**: `72.60.116.253`
   - **TTL**: 300 (5 minutes)

### Step 4: Verify DNS Propagation
```bash
# Check if DNS is pointing to your server
nslookup mymedspharmacyinc.com
# Should return: 72.60.116.253

# Test HTTP access (should work after DNS propagates)
curl -I http://mymedspharmacyinc.com
```

### Step 5: Run SSL Setup on Your Server
```bash
# On your server (72.60.116.253)
cd /tmp
chmod +x scripts/*.sh

# Run SSL setup
./scripts/setup-ssl.sh
```

### Step 6: Deploy with SSL
```bash
# Deploy complete application with SSL
./scripts/deploy-with-ssl.sh
```

## 🔧 Alternative: Complete Deployment in One Command

If you want to deploy everything at once:

```bash
# On your server
cd /tmp
./scripts/deploy-with-ssl.sh
```

## 📊 After Deployment - Verify Everything Works

### Check SSL Certificate
```bash
# Check certificate status
./scripts/ssl-health-check.sh

# View certificate details
certbot certificates
```

### Test Your Website
- **HTTPS Frontend**: https://mymedspharmacyinc.com
- **HTTPS API**: https://mymedspharmacyinc.com/api/health
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin
- **WooCommerce Shop**: https://mymedspharmacyinc.com/shop

### Monitor SSL Status
```bash
# Check renewal logs
tail -f /var/log/ssl-renewal.log

# Check monitoring logs
tail -f /var/log/ssl-monitor.log

# View running containers
docker-compose -f docker-compose.optimized.yml ps
```

## 🚨 Troubleshooting

### If DNS is not ready yet:
```bash
# You can still run the setup, but you'll need to:
# 1. Set up a temporary HTTP server
# 2. Run the SSL setup
# 3. Update DNS later

# Temporary HTTP server for Let's Encrypt validation
python3 -m http.server 80 --directory /var/www/html
```

### If SSL setup fails:
```bash
# Check Let's Encrypt logs
tail -f /var/log/letsencrypt/letsencrypt.log

# Test manual certificate request
certbot certonly --webroot --webroot-path=/var/www/certbot -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com
```

### If containers won't start:
```bash
# Check Docker logs
docker-compose -f docker-compose.optimized.yml logs

# Restart services
docker-compose -f docker-compose.optimized.yml restart
```

## 📧 Email Alerts Setup

To receive SSL expiry alerts:

```bash
# Install mail utilities
apt install -y mailutils

# Configure email (replace with your email)
export ALERT_EMAIL="your-email@example.com"

# Test email
echo "SSL setup test" | mail -s "SSL Test" your-email@example.com
```

## ✅ Success Checklist

After deployment, verify:

- [ ] DNS points to 72.60.116.253
- [ ] HTTPS redirect works (http → https)
- [ ] SSL certificate is valid
- [ ] All services are running
- [ ] Email alerts are configured
- [ ] Automated renewal is working

## 🎉 Your SSL-Enabled MyMeds Pharmacy

Once complete, your pharmacy will be accessible at:
- **Main Site**: https://mymedspharmacyinc.com
- **Admin Panel**: https://mymedspharmacyinc.com/admin
- **API Health**: https://mymedspharmacyinc.com/api/health

**Default Login Credentials:**
- **WordPress**: admin / Mymeds2025!AdminSecure123!@#
- **MyMeds Admin**: admin@mymedspharmacyinc.com / Mymeds2025!AdminSecure123!@#

---

**Need Help?** Check the logs or run the health check script for detailed diagnostics.
