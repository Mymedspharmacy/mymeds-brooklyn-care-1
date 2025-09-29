#!/bin/bash

echo "🔒 Setting up HTTPS for MyMeds Pharmacy..."

# Update system packages
echo "📦 Updating system packages..."
apt update

# Install Certbot and Nginx plugin
echo "🔧 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Stop Nginx temporarily for certificate generation
echo "⏸️ Stopping Nginx..."
systemctl stop nginx

# Generate SSL certificate
echo "🔐 Generating SSL certificate for mymedspharmacyinc.com..."
certbot certonly --standalone -d mymedspharmacyinc.com -d www.mymedspharmacyinc.com --non-interactive --agree-tos --email admin@mymedspharmacyinc.com

# Check if certificate was generated
if [ -f "/etc/letsencrypt/live/mymedspharmacyinc.com/fullchain.pem" ]; then
    echo "✅ SSL certificate generated successfully!"
else
    echo "❌ SSL certificate generation failed!"
    exit 1
fi

echo "🎉 HTTPS setup complete!"
echo "Next: Update Nginx configuration and restart services"


