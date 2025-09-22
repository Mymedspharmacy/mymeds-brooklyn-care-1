# 🔐 SSL Certificate Setup Guide - MyMeds Pharmacy Inc.

## 📋 Overview

This guide provides comprehensive instructions for setting up Let's Encrypt SSL certificates with automated renewal for your MyMeds Pharmacy deployment.

## 🚀 Quick Start

### Option 1: Complete SSL-Enabled Deployment
```bash
# Run the complete SSL-enabled deployment
sudo ./deployment/scripts/deploy-with-ssl.sh
```

### Option 2: SSL Setup Only (for existing deployments)
```bash
# Set up SSL certificates only
sudo ./deployment/scripts/setup-ssl.sh
```

## 📁 SSL Scripts Overview

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `setup-ssl.sh` | Initial SSL certificate setup | First-time SSL setup |
| `deploy-with-ssl.sh` | Complete deployment with SSL | New deployments |
| `ssl-health-check.sh` | SSL certificate validation | Regular monitoring |
| `ssl-renewal-monitor.sh` | Renewal monitoring & alerts | Automated monitoring |

## 🔧 Prerequisites

### System Requirements
- Ubuntu 20.04+ or similar Linux distribution
- Root or sudo access
- Domain name pointing to your server
- Ports 80 and 443 open
- Docker and Docker Compose installed

### Domain Configuration
1. **DNS Setup**: Ensure your domain points to your server's IP
2. **Domain Verification**: Test with `curl http://yourdomain.com`
3. **Email Access**: Have access to admin email for Let's Encrypt

## 📋 Step-by-Step Setup

### Step 1: Prepare Your Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget certbot python3-certbot-nginx

# Verify domain accessibility
curl -I http://yourdomain.com
```

### Step 2: Configure Domain Variables

Edit the SSL scripts to match your domain:

```bash
# Edit setup-ssl.sh
DOMAIN="yourdomain.com"
WWW_DOMAIN="www.yourdomain.com"
EMAIL="admin@yourdomain.com"
```

### Step 3: Run SSL Setup

```bash
# Make scripts executable
sudo chmod +x deployment/scripts/*.sh

# Run SSL setup
sudo ./deployment/scripts/setup-ssl.sh
```

### Step 4: Update Docker Compose

The SSL setup will automatically update your `docker-compose.optimized.yml` with SSL volume mounts:

```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
    - /var/www/certbot:/var/www/certbot:ro
    - /etc/nginx/conf.d:/etc/nginx/conf.d:ro
```

### Step 5: Deploy with SSL

```bash
# Deploy complete application with SSL
sudo ./deployment/scripts/deploy-with-ssl.sh
```

## 🔍 SSL Configuration Details

### Certificate Location
- **Certificates**: `/etc/letsencrypt/live/yourdomain.com/`
- **Webroot**: `/var/www/certbot/`
- **Nginx Config**: `/etc/nginx/conf.d/`

### Security Features
- **TLS 1.2 & 1.3** support
- **HSTS** headers
- **Security headers** (X-Frame-Options, CSP, etc.)
- **HTTP to HTTPS** redirect
- **OCSP Stapling**

### Automated Renewal
- **Frequency**: Twice daily (2 AM & 2 PM)
- **Logs**: `/var/log/ssl-renewal.log`
- **Monitoring**: Daily at 6 AM
- **Alerts**: Email notifications for issues

## 📊 Monitoring & Maintenance

### Health Check Commands

```bash
# Check SSL certificate status
sudo ./deployment/scripts/ssl-health-check.sh

# View certificate details
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run

# Check renewal logs
sudo tail -f /var/log/ssl-renewal.log
```

### Monitoring Scripts

```bash
# Run SSL health check
sudo ./deployment/scripts/ssl-health-check.sh

# Run renewal monitoring
sudo ./deployment/scripts/ssl-renewal-monitor.sh
```

### Cron Jobs

The setup automatically configures these cron jobs:

```bash
# SSL renewal (twice daily)
0 2,14 * * * /usr/local/bin/renew-ssl.sh

# SSL monitoring (daily)
0 6 * * * /usr/local/bin/ssl-monitor.sh
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Domain Not Accessible
```bash
# Check DNS resolution
nslookup yourdomain.com

# Check if port 80 is open
sudo netstat -tlnp | grep :80

# Test HTTP access
curl -I http://yourdomain.com
```

#### 2. Certificate Generation Failed
```bash
# Check Let's Encrypt logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Verify webroot directory
ls -la /var/www/certbot/

# Test manual certificate request
sudo certbot certonly --webroot --webroot-path=/var/www/certbot -d yourdomain.com
```

#### 3. Nginx Configuration Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

#### 4. Docker Volume Mount Issues
```bash
# Check if SSL volumes are mounted
docker-compose -f docker-compose.optimized.yml ps

# Restart containers
docker-compose -f docker-compose.optimized.yml restart nginx
```

### SSL Certificate Issues

#### Certificate Expired
```bash
# Force renewal
sudo certbot renew --force-renewal

# Restart services
sudo systemctl reload nginx
docker-compose -f docker-compose.optimized.yml restart nginx
```

#### Certificate Not Found
```bash
# List all certificates
sudo certbot certificates

# Recreate certificate
sudo certbot certonly --webroot --webroot-path=/var/www/certbot -d yourdomain.com
```

## 📧 Email Alerts Configuration

### Set Up Email Alerts

```bash
# Install mail utilities
sudo apt install -y mailutils

# Configure email alerts
export ALERT_EMAIL="admin@yourdomain.com"

# Test email
echo "Test message" | mail -s "SSL Test" admin@yourdomain.com
```

### Alert Types

1. **Certificate Expiry**: 30 days, 7 days, expired
2. **Renewal Failures**: When automatic renewal fails
3. **Configuration Errors**: Nginx or SSL configuration issues
4. **Connectivity Issues**: HTTPS connection failures

## 🔒 Security Best Practices

### SSL Configuration
- ✅ **TLS 1.2+ only** (no older versions)
- ✅ **Strong cipher suites** (ECDHE, AES-GCM)
- ✅ **HSTS headers** (1 year max-age)
- ✅ **OCSP Stapling** enabled
- ✅ **Security headers** configured

### Certificate Management
- ✅ **Automated renewal** (twice daily)
- ✅ **Certificate monitoring** (daily checks)
- ✅ **Email alerts** for issues
- ✅ **Backup procedures** for certificates

### Access Control
- ✅ **Read-only mounts** for certificates
- ✅ **Proper file permissions** (600 for private keys)
- ✅ **Limited access** to certificate directories

## 📈 Performance Optimization

### SSL Performance
- **Session caching** (10MB shared cache)
- **Session tickets** disabled for security
- **Keep-alive** connections enabled
- **Gzip compression** for HTTPS content

### Monitoring Performance
- **Lightweight health checks** (30s intervals)
- **Efficient log rotation** (30 days retention)
- **Minimal resource usage** for monitoring scripts

## 🆘 Support & Resources

### Documentation
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)

### Useful Commands
```bash
# Check SSL rating (external)
curl -s "https://api.ssllabs.com/api/v3/analyze?host=yourdomain.com"

# Test SSL configuration
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Check certificate chain
openssl s_client -connect yourdomain.com:443 -showcerts
```

### Log Locations
- **SSL Renewal**: `/var/log/ssl-renewal.log`
- **SSL Monitoring**: `/var/log/ssl-monitor.log`
- **Let's Encrypt**: `/var/log/letsencrypt/letsencrypt.log`
- **Nginx**: `/var/log/nginx/error.log`

## ✅ Verification Checklist

After SSL setup, verify:

- [ ] HTTPS redirect working (`http://` → `https://`)
- [ ] SSL certificate valid and not expired
- [ ] All subdomains working (www, api, etc.)
- [ ] Security headers present
- [ ] Automated renewal configured
- [ ] Email alerts working
- [ ] Monitoring scripts running
- [ ] Docker containers using SSL volumes
- [ ] No mixed content warnings
- [ ] SSL Labs rating A or higher

## 🎉 Success!

Your MyMeds Pharmacy is now secured with SSL! 

**Service URLs:**
- 🌐 **Frontend**: `https://yourdomain.com`
- 🔧 **API**: `https://yourdomain.com/api`
- 📝 **WordPress**: `https://yourdomain.com/wp-admin`
- 🛒 **Shop**: `https://yourdomain.com/shop`

**Monitoring:**
- 📊 **Health Check**: `./deployment/scripts/ssl-health-check.sh`
- 🔄 **Renewal Status**: `certbot certificates`
- 📧 **Alerts**: Check email for notifications

---

*For additional support, check the troubleshooting section or review the script logs.*
