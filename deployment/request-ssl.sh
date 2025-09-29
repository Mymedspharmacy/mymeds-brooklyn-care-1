#!/bin/bash

# SSL Certificate Request Script
echo "🔒 Requesting SSL certificate for mymedspharmacyinc.com..."

# Request SSL certificate
sudo certbot --nginx -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com

# Test SSL configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

echo "✅ SSL certificate installed successfully!"
echo "Your site is now available at: https://mymedspharmacyinc.com"
