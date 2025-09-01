#!/usr/bin/env node

/**
 * Automated Sync Script for WooCommerce and WordPress
 * This script can be run via cron jobs for automatic synchronization
 * 
 * Usage:
 * - Manual: node automated-sync.cjs
 * - Cron: */15 * * * * /usr/bin/node /path/to/automated-sync.cjs
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Your app's base URL
  APP_BASE_URL: process.env.APP_BASE_URL || 'https://www.mymedspharmacyinc.com',
  
  // Sync intervals (in minutes)
  WOOCOMMERCE_SYNC_INTERVAL: 15,
  WORDPRESS_SYNC_INTERVAL: 30,
  
  // Logging
  LOG_FILE: process.env.LOG_FILE || '/var/log/mymeds/auto-sync.log',
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000 // 5 seconds
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MyMeds-AutoSync/1.0',
        ...options.headers
      },
      timeout: 30000 // 30 seconds
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Logging function
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file if specified
  if (CONFIG.LOG_FILE) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Ensure log directory exists
      const logDir = path.dirname(CONFIG.LOG_FILE);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file:', error.message);
    }
  }
}

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = CONFIG.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = Math.pow(2, attempt - 1) * 1000;
      log(`Attempt ${attempt} failed, retrying in ${delay}ms...`, 'WARN');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// WooCommerce sync function
async function syncWooCommerce() {
  try {
    log('Starting WooCommerce sync...');
    
    const response = await retryWithBackoff(() => 
      makeRequest(`${CONFIG.APP_BASE_URL}/api/woocommerce/auto-sync`)
    );
    
    if (response.status === 200) {
      log(`WooCommerce sync completed: ${response.data.synced} products synced, ${response.data.errors} errors`);
      
      if (response.data.errors > 0) {
        log(`WooCommerce sync errors: ${JSON.stringify(response.data.errorDetails)}`, 'WARN');
      }
    } else {
      log(`WooCommerce sync failed with status ${response.status}: ${JSON.stringify(response.data)}`, 'ERROR');
    }
    
    return response;
  } catch (error) {
    log(`WooCommerce sync error: ${error.message}`, 'ERROR');
    throw error;
  }
}

// WordPress sync function
async function syncWordPress() {
  try {
    log('Starting WordPress sync...');
    
    const response = await retryWithBackoff(() => 
      makeRequest(`${CONFIG.APP_BASE_URL}/api/wordpress/auto-sync`)
    );
    
    if (response.status === 200) {
      log(`WordPress sync completed: ${response.data.synced} posts synced, ${response.data.errors} errors`);
      
      if (response.data.errors > 0) {
        log(`WordPress sync errors: ${JSON.stringify(response.data.errorDetails)}`, 'WARN');
      }
    } else {
      log(`WordPress sync failed with status ${response.status}: ${JSON.stringify(response.data)}`, 'ERROR');
    }
    
    return response;
  } catch (error) {
    log(`WordPress sync error: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Health check function
async function healthCheck() {
  try {
    log('Performing health check...');
    
    const response = await makeRequest(`${CONFIG.APP_BASE_URL}/api/health`);
    
    if (response.status === 200) {
      log('Health check passed');
      return true;
    } else {
      log(`Health check failed with status ${response.status}`, 'WARN');
      return false;
    }
  } catch (error) {
    log(`Health check error: ${error.message}`, 'ERROR');
    return false;
  }
}

// Main sync function
async function performSync() {
  const startTime = Date.now();
  
  try {
    log('=== Starting automated sync process ===');
    
    // Perform health check first
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      log('Application is not healthy, skipping sync', 'WARN');
      return;
    }
    
    // Perform syncs in parallel
    const [wooCommerceResult, wordPressResult] = await Promise.allSettled([
      syncWooCommerce(),
      syncWordPress()
    ]);
    
    // Log results
    if (wooCommerceResult.status === 'fulfilled') {
      log('WooCommerce sync completed successfully');
    } else {
      log(`WooCommerce sync failed: ${wooCommerceResult.reason.message}`, 'ERROR');
    }
    
    if (wordPressResult.status === 'fulfilled') {
      log('WordPress sync completed successfully');
    } else {
      log(`WordPress sync failed: ${wordPressResult.reason.message}`, 'ERROR');
    }
    
    const duration = Date.now() - startTime;
    log(`=== Sync process completed in ${duration}ms ===`);
    
  } catch (error) {
    log(`Sync process failed: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  switch (args[0]) {
    case 'woocommerce':
      log('Running WooCommerce sync only...');
      syncWooCommerce()
        .then(() => {
          log('WooCommerce sync completed');
          process.exit(0);
        })
        .catch((error) => {
          log(`WooCommerce sync failed: ${error.message}`, 'ERROR');
          process.exit(1);
        });
      break;
      
    case 'wordpress':
      log('Running WordPress sync only...');
      syncWordPress()
        .then(() => {
          log('WordPress sync completed');
          process.exit(0);
        })
        .catch((error) => {
          log(`WordPress sync failed: ${error.message}`, 'ERROR');
          process.exit(1);
        });
      break;
      
    case 'health':
      log('Running health check...');
      healthCheck()
        .then((isHealthy) => {
          if (isHealthy) {
            log('Health check passed');
            process.exit(0);
          } else {
            log('Health check failed', 'ERROR');
            process.exit(1);
          }
        })
        .catch((error) => {
          log(`Health check error: ${error.message}`, 'ERROR');
          process.exit(1);
        });
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log(`
Automated Sync Script for MyMeds Pharmacy

Usage:
  node automated-sync.cjs [command]

Commands:
  woocommerce    Sync WooCommerce products only
  wordpress      Sync WordPress posts only
  health         Perform health check only
  help           Show this help message
  (no args)      Perform full sync (WooCommerce + WordPress)

Examples:
  node automated-sync.cjs                    # Full sync
  node automated-sync.cjs woocommerce        # WooCommerce only
  node automated-sync.cjs wordpress          # WordPress only
  node automated-sync.cjs health             # Health check

Environment Variables:
  APP_BASE_URL    Your app's base URL (default: https://www.mymedspharmacyinc.com)
  LOG_FILE        Log file path (default: /var/log/mymeds/auto-sync.log)

Cron Job Examples:
  # Sync products every 15 minutes
  */15 * * * * /usr/bin/node /path/to/automated-sync.cjs woocommerce
  
  # Sync blog posts every 30 minutes
  */30 * * * * /usr/bin/node /path/to/automated-sync.cjs wordpress
  
  # Full sync every hour
  0 * * * * /usr/bin/node /path/to/automated-sync.cjs
      `);
      break;
      
    default:
      // Full sync
      performSync()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          log(`Sync failed: ${error.message}`, 'ERROR');
          process.exit(1);
        });
  }
}

module.exports = {
  syncWooCommerce,
  syncWordPress,
  healthCheck,
  performSync
};
