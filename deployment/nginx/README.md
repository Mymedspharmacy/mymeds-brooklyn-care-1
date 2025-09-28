# Nginx Configuration for MyMeds Pharmacy Inc.

This directory contains nginx configurations for the MyMeds Pharmacy application, supporting both the React frontend and WordPress backend integration.

## Files Overview

### Main Configuration Files

1. **`nginx.conf`** - Main nginx configuration
   - Worker processes and performance settings
   - Gzip compression
   - Rate limiting zones
   - Security headers
   - Logging configuration

2. **`nginx-ssl.conf`** - Production SSL server configuration
   - HTTPS with Let's Encrypt certificates
   - WordPress admin panel routing
   - WooCommerce shop routing
   - React app SPA routing
   - Backend API proxy
   - Static file caching
   - Security configurations

3. **`nginx-dev.conf`** - Development server configuration
   - HTTP only (no SSL)
   - Simplified routing for development
   - No caching for easier debugging

4. **`wordpress-nginx.conf`** - WordPress container nginx config
   - WordPress-specific routing
   - PHP-FPM configuration
   - WooCommerce support
   - WordPress permalinks

## URL Routing Structure

### React App Routes (Handled by Frontend)
```
/                           → Homepage
/shop                       → Shop page (WooCommerce integration)
/services                   → Services page
/special-offers             → Special offers page
/blog                       → Blog page (WordPress integration)
/blog/:id                   → Individual blog post
/about                      → About page
/contact                    → Contact page
/admin                      → Admin dashboard (React)
/admin-signin               → Admin login (React)
/admin-reset                → Admin password reset (React)
/patient-portal             → Patient portal
/patient-account-creation   → Patient account creation
/patient-resources          → Patient resources
/privacy-policy             → Privacy policy
/terms-of-service           → Terms of service
/hipaa-notice               → HIPAA notice
/medication-interaction-checker → Medication checker
/product/:productId         → Product view page
```

### WordPress Routes (Handled by WordPress Container)
```
/wp-admin/                  → WordPress admin panel
/wp-login.php              → WordPress login
/wp-json/                  → WordPress REST API
/wp-content/               → WordPress uploads and assets
/wp-includes/              → WordPress core files
/wp-cron.php               → WordPress cron jobs
/shop/                     → WooCommerce shop pages
/cart/                     → WooCommerce cart
/checkout/                 → WooCommerce checkout
/my-account/               → WooCommerce account
/wc-api/                   → WooCommerce API
```

### Backend API Routes (Handled by Node.js Backend)
```
/api/                      → All backend API endpoints
/api/health                → Health check
/api/admin/*               → Admin API endpoints
/api/prescriptions/*       → Prescription management
/api/orders/*              → Order management
/api/contact               → Contact form submissions
/api/woocommerce/*         → WooCommerce integration
/api/wordpress/*           → WordPress integration
```

## Deployment Instructions

### Production Deployment

1. **SSL Certificates**: Ensure Let's Encrypt certificates are properly configured
2. **Environment Variables**: Set all required environment variables
3. **Docker Compose**: Use `docker-compose.prod.yml`
4. **Nginx Configuration**: Use `nginx-ssl.conf`

### Development Deployment

1. **Use HTTP**: No SSL certificates needed
2. **Docker Compose**: Use development configuration
3. **Nginx Configuration**: Use `nginx-dev.conf`

## Key Features

### Security
- SSL/TLS encryption
- Rate limiting for API endpoints
- Security headers (HSTS, XSS protection, etc.)
- Access control for sensitive files
- CORS configuration for WordPress API

### Performance
- Gzip compression
- Static file caching
- Browser caching headers
- Connection keep-alive
- Worker process optimization

### WordPress Integration
- WordPress admin panel access
- WordPress REST API support
- WooCommerce shop functionality
- WordPress permalinks support
- WordPress upload handling

### React SPA Support
- Client-side routing support
- Fallback to index.html for SPA routes
- Static asset serving
- Development vs production caching

## Troubleshooting

### Common Issues

1. **404 errors on React routes**: Ensure `try_files $uri $uri/ /index.html;` is configured
2. **WordPress admin not accessible**: Check proxy_pass configuration to WordPress container
3. **API calls failing**: Verify backend container is running and accessible
4. **Static files not loading**: Check file permissions and nginx document root

### Logs
- Access logs: `/var/log/nginx/access.log`
- Error logs: `/var/log/nginx/error.log`
- Backend logs: Check Docker container logs

## Configuration Updates

When updating configurations:
1. Test configurations with `nginx -t`
2. Reload nginx: `nginx -s reload`
3. For Docker: Restart the nginx container
4. Monitor logs for any issues

## Environment-Specific Settings

### Production
- SSL certificates required
- Rate limiting enabled
- Caching enabled
- Security headers enabled
- Error logging enabled

### Development
- No SSL required
- No rate limiting
- No caching
- Verbose logging
- CORS headers for API access
