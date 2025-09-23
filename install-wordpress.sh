#!/bin/bash

# =============================================================================
# WordPress Installation Script for MyMeds Pharmacy
# =============================================================================

set -e

echo "🚀 Installing WordPress for MyMeds Pharmacy..."

# Create WordPress directory
mkdir -p wordpress
cd wordpress

# Download WordPress
echo "📥 Downloading WordPress..."
wget https://wordpress.org/latest.tar.gz
tar -xzf latest.tar.gz --strip-components=1
rm latest.tar.gz

# Create wp-config.php
echo "⚙️ Creating WordPress configuration..."
cat > wp-config.php << 'EOF'
<?php
// WordPress configuration for MyMeds Pharmacy

// Database settings
define('DB_NAME', 'wordpress');
define('DB_USER', 'mymeds_user');
define('DB_PASSWORD', 'Mymeds2025!UserSecure123!@#');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Authentication keys and salts
define('AUTH_KEY',         'MyMeds2025!AuthKey_PharmacySecure_2025!@#$%^&*()');
define('SECURE_AUTH_KEY',  'MyMeds2025!SecureAuthKey_PharmacySecure_2025!@#$%^&*()');
define('LOGGED_IN_KEY',    'MyMeds2025!LoggedInKey_PharmacySecure_2025!@#$%^&*()');
define('NONCE_KEY',        'MyMeds2025!NonceKey_PharmacySecure_2025!@#$%^&*()');
define('AUTH_SALT',        'MyMeds2025!AuthSalt_PharmacySecure_2025!@#$%^&*()');
define('SECURE_AUTH_SALT', 'MyMeds2025!SecureAuthSalt_PharmacySecure_2025!@#$%^&*()');
define('LOGGED_IN_SALT',   'MyMeds2025!LoggedInSalt_PharmacySecure_2025!@#$%^&*()');
define('NONCE_SALT',       'MyMeds2025!NonceSalt_PharmacySecure_2025!@#$%^&*()');

// WordPress table prefix
$table_prefix = 'wp_';

// Debug settings (disable in production)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// Memory limit
define('WP_MEMORY_LIMIT', '256M');

// File permissions
define('FS_METHOD', 'direct');

// Security settings
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', false);
define('AUTOMATIC_UPDATER_DISABLED', false);

// Performance settings
define('WP_CACHE', true);
define('COMPRESS_CSS', true);
define('COMPRESS_SCRIPTS', true);
define('ENFORCE_GZIP', true);

// Upload settings
define('WP_MEMORY_LIMIT', '256M');
define('MAX_FILE_SIZE', '64M');

// API settings
define('WP_REST_API_ENABLED', true);
define('JSON_API_ENABLED', true);

// WordPress URL (update for production)
define('WP_HOME', 'https://mymedspharmacyinc.com/blog');
define('WP_SITEURL', 'https://mymedspharmacyinc.com/blog');

// WordPress directory
define('WP_CONTENT_DIR', __DIR__ . '/wp-content');
define('WP_CONTENT_URL', 'https://mymedspharmacyinc.com/blog/wp-content');

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
EOF

# Set proper permissions
chmod 644 wp-config.php
chmod 755 wp-content
chmod 755 wp-content/uploads

echo "✅ WordPress installation completed!"
echo "📝 Next steps:"
echo "   1. Access WordPress at: http://localhost/wordpress"
echo "   2. Complete the WordPress setup wizard"
echo "   3. Install WooCommerce plugin"
echo "   4. Generate API keys in WooCommerce > Settings > Advanced > REST API"
echo "   5. Update environment variables with the generated keys"
