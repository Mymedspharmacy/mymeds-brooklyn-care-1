/**
 * Utility function to redirect users to the WooCommerce store
 * This ensures all shop buttons consistently redirect to the actual store
 * Uses the same domain as the current application
 */

// Dynamically get the WooCommerce store URL based on current domain
const getWooCommerceStoreUrl = (): string => {
  const currentHost = window.location.host;
  
  // If running locally, use your development WordPress/WooCommerce store
  if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    // TEMPORARY: WordPress server needs to be set up
    // The server at 72.60.116.253 is not responding
    // You need to install/configure WordPress first
    
    // Option 1: Use a working WordPress site for testing
    // return 'https://mymedspharmacyinc.com/shop'; // If you have a working production site
    
    // Option 2: Point to the server that needs WordPress setup
    // return 'http://72.60.116.253/'; // Your server - needs WordPress installation
    
    // WordPress URL is set to /shop, so we need to access it correctly
    return 'http://72.60.116.253/shop'; // Your WordPress site with /shop URL
    
    // Option 3: Use a demo WordPress site for testing
    // return 'https://demo.woocommerce.com/';
    
    // Once WordPress is properly installed and configured:
    // return 'http://72.60.116.253/shop'; // After WordPress + WooCommerce setup
  }
  
  // For production, use the same domain with /shop path
  const protocol = window.location.protocol;
  return `${protocol}//${currentHost}/shop`;
};

export const WOOCOMMERCE_STORE_URL = getWooCommerceStoreUrl();

/**
 * Opens the WooCommerce store in a new tab
 * @param category - Optional category to filter products (not implemented yet)
 */
export const redirectToShop = (category?: string) => {
  const url = category ? `${WOOCOMMERCE_STORE_URL}?category=${category}` : WOOCOMMERCE_STORE_URL;
  window.open(url, '_blank');
};

/**
 * Redirects to the WooCommerce store in the same tab
 * @param category - Optional category to filter products (not implemented yet)
 */
export const redirectToShopSameTab = (category?: string) => {
  const url = category ? `${WOOCOMMERCE_STORE_URL}?category=${category}` : WOOCOMMERCE_STORE_URL;
  window.location.href = url;
};

/**
 * Gets the WooCommerce store URL
 * @param category - Optional category to filter products (not implemented yet)
 */
export const getShopUrl = (category?: string) => {
  return category ? `${WOOCOMMERCE_STORE_URL}?category=${category}` : WOOCOMMERCE_STORE_URL;
};
