<?php
/**
 * WordPress Configuration for MyMeds Pharmacy
 * This configuration sets up WordPress to work in the /shop subdirectory
 */

// ** Database settings ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'mymeds_wordpress' );

/** MySQL database username */
define( 'DB_USER', 'mymeds_wordpress_user' );

/** MySQL database password */
define( 'DB_PASSWORD', 'secure_wordpress_password' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 */
define( 'AUTH_KEY',         'your-auth-key-here' );
define( 'SECURE_AUTH_KEY',  'your-secure-auth-key-here' );
define( 'LOGGED_IN_KEY',    'your-logged-in-key-here' );
define( 'NONCE_KEY',        'your-nonce-key-here' );
define( 'AUTH_SALT',        'your-auth-salt-here' );
define( 'SECURE_AUTH_SALT', 'your-secure-auth-salt-here' );
define( 'LOGGED_IN_SALT',   'your-logged-in-salt-here' );
define( 'NONCE_SALT',       'your-nonce-salt-here' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 */
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

/**
 * WordPress Subdirectory Configuration
 * This is required for WordPress to work in /shop subdirectory
 */
define( 'WP_HOME', 'https://mymedspharmacyinc.com/shop' );
define( 'WP_SITEURL', 'https://mymedspharmacyinc.com/shop' );

/**
 * Security Configuration
 */
define( 'DISALLOW_FILE_EDIT', true );
define( 'DISALLOW_FILE_MODS', true );
define( 'FORCE_SSL_ADMIN', true );
define( 'WP_POST_REVISIONS', 3 );
define( 'AUTOSAVE_INTERVAL', 300 );

/**
 * Performance Configuration
 */
define( 'WP_CACHE', true );
define( 'COMPRESS_CSS', true );
define( 'COMPRESS_SCRIPTS', true );
define( 'ENFORCE_GZIP', true );
define( 'WP_MEMORY_LIMIT', '256M' );

/**
 * File Upload Configuration
 */
define( 'WP_MAX_MEMORY_LIMIT', '512M' );
define( 'UPLOADS', 'wp-content/uploads' );

/**
 * WooCommerce Specific Configuration
 */
define( 'WOOCOMMERCE_API_ENABLED', true );
define( 'WOOCOMMERCE_API_VERSION', 'wc/v3' );

/**
 * SSL Configuration
 */
define( 'FORCE_SSL', true );
if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ) {
    $_SERVER['HTTPS'] = 'on';
}

/**
 * CORS Configuration for API Integration
 */
header( 'Access-Control-Allow-Origin: https://mymedspharmacyinc.com' );
header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
header( 'Access-Control-Allow-Headers: Content-Type, Authorization' );

/**
 * Custom Upload Directory
 */
define( 'UPLOADS', 'wp-content/uploads' );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
