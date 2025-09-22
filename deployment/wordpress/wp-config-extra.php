<?php
// =============================================================================
// WORDPRESS CONFIGURATION EXTRA - MyMeds Pharmacy Inc.
// =============================================================================
// Additional WordPress configuration for production
// =============================================================================

// =============================================================================
// SECURITY CONFIGURATION
// =============================================================================

// Disable file editing
define('DISALLOW_FILE_EDIT', true);
define('DISALLOW_FILE_MODS', true);

// Force SSL
define('FORCE_SSL_ADMIN', true);

// Limit post revisions
define('WP_POST_REVISIONS', 3);

// =============================================================================
// PERFORMANCE CONFIGURATION
// =============================================================================

// Memory limits
define('WP_MEMORY_LIMIT', '512M');
define('WP_MAX_MEMORY_LIMIT', '512M');

// Enable caching
define('WP_CACHE', true);

// =============================================================================
// WOOCOMMERCE CONFIGURATION
// =============================================================================

// WooCommerce specific settings
define('WOOCOMMERCE_CHECKOUT_ENDPOINT', 'checkout');
define('WOOCOMMERCE_MY_ACCOUNT_ENDPOINT', 'my-account');
define('WOOCOMMERCE_CART_ENDPOINT', 'cart');

// =============================================================================
// REDIS CONFIGURATION
// =============================================================================

// Redis cache configuration
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_DATABASE', 0);
define('WP_REDIS_PASSWORD', 'Mymeds2025!RedisSecure123!@#');

// =============================================================================
// UPDATES CONFIGURATION
// =============================================================================

// Disable automatic updates
define('AUTOMATIC_UPDATER_DISABLED', true);
define('WP_AUTO_UPDATE_CORE', false);

// =============================================================================
// DEBUGGING CONFIGURATION
// =============================================================================

// Production debugging (disabled)
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

// =============================================================================
// MYMEDS INTEGRATION CONFIGURATION
// =============================================================================

// MyMeds API integration
define('MYMEDS_API_URL', 'http://mymeds-app:4000/api');
define('MYMEDS_API_KEY', 'Mymeds2025!IntegrationKey_Production_2025!@#');

// =============================================================================
// CUSTOM CONFIGURATION
// =============================================================================

// Custom uploads directory
define('UPLOADS', 'wp-content/uploads');

// Custom content directory
define('WP_CONTENT_DIR', '/var/www/html/wp-content');
define('WP_CONTENT_URL', 'https://mymedspharmacyinc.com/wp-content');

// =============================================================================
// SECURITY HEADERS
// =============================================================================

// Additional security measures
if (!headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

// Custom error handling
function mymeds_custom_error_handler($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) {
        return false;
    }
    
    error_log("MyMeds WordPress Error: [$errno] $errstr in $errfile on line $errline");
    return true;
}

set_error_handler('mymeds_custom_error_handler');

// =============================================================================
// INITIALIZATION COMPLETE
// =============================================================================

// Log successful configuration
error_log('MyMeds WordPress configuration loaded successfully');
?>
