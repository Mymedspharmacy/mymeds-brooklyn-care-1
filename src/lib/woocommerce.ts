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

const woocommerce = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
  auth: {
    username: WOOCOMMERCE_CONSUMER_KEY,
    password: WOOCOMMERCE_CONSUMER_SECRET,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// WooCommerce API methods
export const wooCommerceAPI = {
  // Get products
  getProducts: async (params = {}) => {
    try {
      const response = await woocommerce.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (id: number) => {
    try {
      const response = await woocommerce.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await woocommerce.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (searchTerm: string, params = {}) => {
    try {
      const response = await woocommerce.get('/products', {
        params: {
          search: searchTerm,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: number, params = {}) => {
    try {
      const response = await woocommerce.get('/products', {
        params: {
          category: categoryId,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },
};

export default wooCommerceAPI; 