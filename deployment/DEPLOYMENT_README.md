# MyMeds Pharmacy VPS Deployment Guide

## 🚀 Quick Start

1. **Upload your code** to `/var/www/mymeds`
2. **Configure environment** variables in `.env.production`
3. **Run deployment**: `./deploy.sh`
4. **Request SSL**: `./request-ssl.sh`

## 📁 Directory Structure

```
/var/www/mymeds/          # MyMeds application
/var/www/wordpress/       # WordPress installation
/var/log/mymeds/          # Application logs
/var/backups/mymeds/      # Backup files
```

## 🔧 Configuration Files

- **Nginx**: `/etc/nginx/sites-available/mymeds`
- **PM2**: `ecosystem.config.js`
- **Environment**: `.env.production`
- **WordPress**: `/var/www/wordpress/wp-config.php`

## 📊 Monitoring

- **System Status**: `./monitor.sh`
- **PM2 Status**: `pm2 status`
- **Nginx Status**: `systemctl status nginx`
- **MySQL Status**: `systemctl status mysql`

## 🔒 SSL Certificate

- **Request**: `./request-ssl.sh`
- **Renewal**: Automatic via certbot
- **Status**: `certbot certificates`

## 💾 Backups

- **Manual**: `./backup.sh`
- **Automatic**: Daily via systemd timer
- **Location**: `/var/backups/mymeds/`

## 🌐 URLs

- **Frontend**: https://mymedspharmacyinc.com
- **Backend API**: https://mymedspharmacyinc.com/api/
- **WordPress Admin**: https://mymedspharmacyinc.com/wp-admin/
- **WordPress API**: https://mymedspharmacyinc.com/wp-json/

## 🔐 Default Credentials

- **MySQL Root**: Set during installation
- **MyMeds DB User**: mymeds_user
- **WordPress DB User**: wp_user
- **Admin Email**: admin@mymedspharmacyinc.com

## 📝 Environment Variables

Copy `.env.production.template` to `.env.production` and configure:

- Database credentials
- JWT secrets
- WordPress API credentials
- WooCommerce API credentials
- Email SMTP settings

## 🚨 Troubleshooting

- **Check logs**: `/var/log/mymeds/`
- **Check PM2**: `pm2 logs`
- **Check Nginx**: `sudo nginx -t`
- **Check MySQL**: `sudo systemctl status mysql`

## 📞 Support

For issues, check:
1. System logs
2. Application logs
3. Nginx error logs
4. MySQL error logs
