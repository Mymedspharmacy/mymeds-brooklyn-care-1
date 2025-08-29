import axios from 'axios';

// WooCommerce API configuration
const WOOCOMMERCE_URL = import.meta.env.VITE_WOOCOMMERCE_URL;
const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;

// Validate required environment variables
if (!WOOCOMMERCE_URL || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
  console.error('❌ WooCommerce environment variables are not configured!');
  console.error('Please set: VITE_WOOCOMMERCE_URL, VITE_WOOCOMMERCE_CONSUMER_KEY, VITE_WOOCOMMERCE_CONSUMER_SECRET');
}

// In-memory cache for products (in production, use a more robust solution)
const productCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache management functions
const getCachedProducts = (key: string) => {
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedProducts = (key: string, data: any) => {
  productCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearProductCache = () => {
  productCache.clear();
};

// Enhanced error handling with retry logic
const makeWooCommerceRequest = async (url: string, params = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        params,
        auth: {
          username: WOOCOMMERCE_CONSUMER_KEY,
          password: WOOCOMMERCE_CONSUMER_SECRET,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      return response.data;
    } catch (error: any) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, i) * 1000;
      console.log(`WooCommerce API request failed, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const woocommerce = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
  auth: {
    username: WOOCOMMERCE_CONSUMER_KEY,
    password: WOOCOMMERCE_CONSUMER_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
woocommerce.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let errorMessage = `WooCommerce API Error (${status})`;
      
      if (data && data.message) {
        errorMessage += `: ${data.message}`;
      } else if (status === 401) {
        errorMessage = 'Authentication failed. Please check your WooCommerce credentials.';
      } else if (status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (status >= 500) {
        errorMessage = 'WooCommerce server error. Please try again later.';
      }
      
      error.message = errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from WooCommerce. Please check your connection and try again.';
    } else {
      // Something else happened
      error.message = 'An unexpected error occurred while connecting to WooCommerce.';
    }
    
    throw error;
  }
);

// WooCommerce API methods
export const wooCommerceAPI = {
  // Get products with caching
  getProducts: async (params = {}) => {
    try {
      const cacheKey = `products_${JSON.stringify(params)}`;
      const cached = getCachedProducts(cacheKey);
      
      if (cached) {
        console.log('📦 Returning cached products');
        return cached;
      }

      console.log('🔄 Fetching products from WooCommerce...');
      const products = await makeWooCommerceRequest('/products', params);
      
      // Cache the results
      setCachedProducts(cacheKey, products);
      
      return products;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  },

  // Get product by ID with caching
  getProduct: async (id: number) => {
    try {
      const cacheKey = `product_${id}`;
      const cached = getCachedProducts(cacheKey);
      
      if (cached) {
        console.log(`📦 Returning cached product ${id}`);
        return cached;
      }

      console.log(`🔄 Fetching product ${id} from WooCommerce...`);
      const product = await makeWooCommerceRequest(`/products/${id}`);
      
      // Cache the result
      setCachedProducts(cacheKey, product);
      
      return product;
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  },

  // Get product categories with caching
  getCategories: async () => {
    try {
      const cacheKey = 'categories';
      const cached = getCachedProducts(cacheKey);
      
      if (cached) {
        console.log('📦 Returning cached categories');
        return cached;
      }

      console.log('🔄 Fetching categories from WooCommerce...');
      const categories = await makeWooCommerceRequest('/products/categories');
      
      // Cache the results
      setCachedProducts(cacheKey, categories);
      
      return categories;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  },

  // Search products with caching
  searchProducts: async (searchTerm: string, params = {}) => {
    try {
      const cacheKey = `search_${searchTerm}_${JSON.stringify(params)}`;
      const cached = getCachedProducts(cacheKey);
      
      if (cached) {
        console.log(`📦 Returning cached search results for "${searchTerm}"`);
        return cached;
      }

      console.log(`🔍 Searching products for "${searchTerm}"...`);
      const products = await makeWooCommerceRequest('/products', {
        search: searchTerm,
        ...params,
      });
      
      // Cache the results
      setCachedProducts(cacheKey, products);
      
      return products;
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error.message}`);
    }
  },

  // Get products by category with caching
  getProductsByCategory: async (categoryId: number, params = {}) => {
    try {
      const cacheKey = `category_${categoryId}_${JSON.stringify(params)}`;
      const cached = getCachedProducts(cacheKey);
      
      if (cached) {
        console.log(`📦 Returning cached products for category ${categoryId}`);
        return cached;
      }

      console.log(`🔄 Fetching products for category ${categoryId}...`);
      const products = await makeWooCommerceRequest('/products', {
        category: categoryId,
        ...params,
      });
      
      // Cache the results
      setCachedProducts(cacheKey, products);
      
      return products;
    } catch (error: any) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch products by category: ${error.message}`);
    }
  },

  // Clear cache
  clearCache: () => {
    clearProductCache();
    console.log('🗑️ WooCommerce cache cleared');
  },

  // Get cache status
  getCacheStatus: () => {
    return {
      size: productCache.size,
      keys: Array.from(productCache.keys()),
      timestamp: Date.now()
    };
  },

  // Create order in WooCommerce
  createOrder: async (orderData: {
    customer_id?: number;
    billing: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      address_1: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
    shipping: {
      first_name: string;
      last_name: string;
      address_1: string;
      city: string;
      state: string;
      postcode: string;
      country: string;
    };
    line_items: Array<{
      product_id: number;
      quantity: number;
    }>;
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    customer_note?: string;
  }) => {
    try {
      console.log('🛒 Creating order in WooCommerce...');
      
      const response = await woocommerce.post('/orders', orderData);
      
      if (response.data) {
        console.log('✅ Order created successfully:', response.data.id);
        return response.data;
      } else {
        throw new Error('No response data received from WooCommerce');
      }
    } catch (error: any) {
      console.error('Error creating WooCommerce order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  },

  // Get order by ID
  getOrder: async (orderId: number) => {
    try {
      console.log(`📦 Fetching order ${orderId} from WooCommerce...`);
      
      const response = await woocommerce.get(`/orders/${orderId}`);
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('No response data received from WooCommerce');
      }
    } catch (error: any) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: number, status: string) => {
    try {
      console.log(`📝 Updating order ${orderId} status to ${status}...`);
      
      const response = await woocommerce.put(`/orders/${orderId}`, {
        status: status
      });
      
      if (response.data) {
        console.log(`✅ Order ${orderId} status updated to ${status}`);
        return response.data;
      } else {
        throw new Error('No response data received from WooCommerce');
      }
    } catch (error: any) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  },

  // Get available payment gateways
  getPaymentGateways: async () => {
    try {
      console.log('💳 Fetching payment gateways from WooCommerce...');
      
      const response = await woocommerce.get('/payment_gateways');
      
      if (response.data) {
        return response.data;
      } else {
        throw new Error('No response data received from WooCommerce');
      }
    } catch (error: any) {
      console.error('Error fetching payment gateways:', error);
      throw new Error(`Failed to fetch payment gateways: ${error.message}`);
    }
  }
};

export default wooCommerceAPI; 