# VPS Commands Guide

## ✅ Step 1: Test Nginx Configuration (COMPLETED)

```bash
# Test the nginx configuration syntax
sudo nginx -t
# ✅ Result: nginx configuration test successful

# Reload nginx
sudo systemctl reload nginx

# Check nginx status
sudo systemctl status nginx
```

## 2. Remove Dummy Products from WooCommerce

### Option A: Using WP-CLI (Recommended)

```bash
# Navigate to WordPress directory
cd /var/www/wordpress

# List all products to see what's there
wp post list --post_type=product --allow-root

# Delete specific dummy products by ID (replace IDs with actual product IDs)
# Example: Delete products with IDs 15, 16, 17
wp post delete 15 16 17 --force --allow-root

# Or delete ALL products (use with caution!)
wp post delete $(wp post list --post_type=product --format=ids --allow-root) --force --allow-root
```

### Option B: Using MySQL Database (Alternative)

```bash
# Access WordPress database
mysql -u root -p

# Once in MySQL:
USE wordpress_db;  # Replace with your actual database name

# See all products
SELECT ID, post_title FROM wp_posts WHERE post_type = 'product';

# Delete specific products by ID
DELETE FROM wp_posts WHERE ID IN (15, 16, 17);  # Replace with actual IDs

# Clean up related metadata
DELETE FROM wp_postmeta WHERE post_id NOT IN (SELECT ID FROM wp_posts);

# Exit MySQL
EXIT;
```

## 3. Restart Services

```bash
# Restart backend API
pm2 restart backend

# Restart nginx
sudo systemctl restart nginx

# View PM2 processes
pm2 list

# View backend logs
pm2 logs backend
```

## 4. Clear Cache (Optional)

```bash
# Clear WordPress cache
cd /var/www/wordpress
wp cache flush --allow-root

# Clear WooCommerce transients
wp transient delete --all --allow-root
```

## 5. Verify Everything is Working

```bash
# Test backend API
curl http://localhost:4000/api/health

# Test WooCommerce products API
curl http://localhost:4000/api/woocommerce/products

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check backend logs
pm2 logs backend --lines 50
```

## Quick Commands Summary

```bash
# 1. Test nginx
sudo nginx -t && sudo systemctl reload nginx

# 2. List WooCommerce products
cd /var/www/wordpress && wp post list --post_type=product --allow-root

# 3. Delete dummy products (example IDs: 15, 16, 17)
wp post delete 15 16 17 --force --allow-root

# 4. Restart services
pm2 restart backend && sudo systemctl restart nginx

# 5. Check everything
pm2 list && sudo systemctl status nginx
```

## Troubleshooting

If you encounter issues:

```bash
# Check nginx configuration
sudo nginx -t

# View nginx error logs
sudo tail -50 /var/log/nginx/error.log

# Check backend status
pm2 status

# View backend errors
pm2 logs backend --err --lines 100

# Check WordPress permissions
sudo chown -R www-data:www-data /var/www/wordpress
sudo chmod -R 755 /var/www/wordpress
```

