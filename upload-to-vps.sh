#!/bin/bash

# Script to upload MyMeds project to VPS
# VPS IP: 72.60.116.253

VPS_IP="72.60.116.253"
VPS_USER="root"  # Change to your VPS username if needed

echo "Uploading MyMeds project to VPS at $VPS_IP..."

# Upload the entire project
echo "Uploading project files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'build' \
    ./ $VPS_USER@$VPS_IP:/var/www/mymeds/current/

echo "Uploading VPS setup script..."
scp vps-complete-setup.sh $VPS_USER@$VPS_IP:/root/

echo "Upload completed!"
echo ""
echo "Next steps:"
echo "1. SSH into your VPS: ssh $VPS_USER@$VPS_IP"
echo "2. Run the setup script: chmod +x vps-complete-setup.sh && ./vps-complete-setup.sh"
echo "3. Follow the prompts to complete setup"
echo ""
echo "Alternative upload method (if rsync not available):"
echo "scp -r . $VPS_USER@$VPS_IP:/var/www/mymeds/current/"
