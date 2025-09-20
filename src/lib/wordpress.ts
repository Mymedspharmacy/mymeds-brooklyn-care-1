import axios from 'axios';
import api from './api';

// WordPress API configuration
const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL;

// Validate required environment variables
if (!WORDPRESS_URL) {
  console.warn('⚠️ WordPress environment variables are not configured!');
  console.warn('Please set: VITE_WORDPRESS_URL');
  console.warn('Blog content will show fallback content instead.');
}

// In-memory cache for posts (in production, use a more robust solution)
const postCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Type definitions
interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface WordPressParams {
  [key: string]: string | number | boolean;
}

interface WordPressError {
  message: string;
  response?: {
    status: number;
    data: unknown;
  };
  request?: unknown;
}

// Cache management functions
const getCachedPosts = (key: string): unknown => {
  const cached = postCache.get(key) as CacheEntry | undefined;
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedPosts = (key: string, data: unknown): void => {
  postCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearPostCache = (): void => {
  postCache.clear();
};

// Enhanced error handling with retry logic (via backend proxy)
const makeWordPressRequest = async (url: string, params: WordPressParams = {}, retries = 3): Promise<unknown> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get(`/wordpress${url}`, { params });
      return response.data;
    } catch (error: unknown) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, i) * 1000;
      console.log(`WordPress API request failed, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const wordpress = axios.create();

// Add response interceptor for better error handling
wordpress.interceptors.response.use(
  (response) => response,
  (error: WordPressError) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let errorMessage = `WordPress API Error (${status})`;
      
      if (data && typeof data === 'object' && 'message' in data) {
        errorMessage += `: ${(data as { message: string }).message}`;
      } else if (status === 401) {
        errorMessage = 'Authentication failed. Please check your WordPress credentials.';
      } else if (status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (status >= 500) {
        errorMessage = 'WordPress server error. Please try again later.';
      }
      
      error.message = errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from WordPress. Please check your connection and try again.';
    } else {
      // Something else happened
      error.message = 'An unexpected error occurred while connecting to WordPress.';
    }
    
    throw error;
  }
);

// No fallback content - only show real WordPress posts

// WordPress API methods
export const wordPressAPI = {
  // Get posts with caching and fallback
  getPosts: async (params: WordPressParams = {}) => {
    try {
      const cacheKey = `posts_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached posts');
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        console.log('📝 WordPress not configured - returning empty posts array');
        return [];
      }

      console.log('🔄 Fetching posts from WordPress...');
      const posts = await makeWordPressRequest('/posts', {
        _embed: true, // Include featured images and other embedded content
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: unknown) {
      console.error('Error fetching posts:', error);
      console.log('📝 Error fetching posts - returning empty array');
      return [];
    }
  },

  // Get post by ID with caching
  getPost: async (id: number) => {
    try {
      const cacheKey = `post_${id}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached post ${id}`);
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        throw new Error('WordPress not configured');
      }

      console.log(`🔄 Fetching post ${id} from WordPress...`);
      const post = await makeWordPressRequest(`/posts/${id}`, {
        _embed: true,
      });
      
      // Cache the result
      setCachedPosts(cacheKey, post);
      
      return post;
    } catch (error: unknown) {
      console.error(`Error fetching post ${id}:`, error);
      throw new Error(`Failed to fetch post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get categories with caching and fallback
  getCategories: async () => {
    try {
      const cacheKey = 'categories';
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached categories');
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        console.log('📝 WordPress not configured - returning empty categories array');
        return [];
      }

      console.log('🔄 Fetching categories from WordPress...');
      const categories = await makeWordPressRequest('/categories');
      
      // Cache the results
      setCachedPosts(cacheKey, categories);
      
      return categories;
    } catch (error: unknown) {
      console.error('Error fetching categories:', error);
      console.log('📝 Error fetching categories - returning empty array');
      return [];
    }
  },

  // Get posts by category with caching
  getPostsByCategory: async (categoryId: number, params: WordPressParams = {}) => {
    try {
      const cacheKey = `category_posts_${categoryId}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached posts for category ${categoryId}`);
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        throw new Error('WordPress not configured');
      }

      console.log(`🔄 Fetching posts for category ${categoryId}...`);
      const posts = await makeWordPressRequest('/posts', {
        categories: categoryId,
        _embed: true,
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: unknown) {
      console.error(`Error fetching posts for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch posts by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Search posts with caching
  searchPosts: async (searchTerm: string, params: WordPressParams = {}) => {
    try {
      const cacheKey = `search_${searchTerm}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached search results for "${searchTerm}"`);
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        throw new Error('WordPress not configured');
      }

      console.log(`🔍 Searching posts for "${searchTerm}"...`);
      const posts = await makeWordPressRequest('/posts', {
        search: searchTerm,
        _embed: true,
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: unknown) {
      console.error('Error searching posts:', error);
      throw new Error(`Failed to search posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Get featured posts with caching and fallback
  getFeaturedPosts: async (params: WordPressParams = {}) => {
    try {
      const cacheKey = `featured_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached featured posts');
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        console.log('📝 WordPress not configured - returning empty featured posts array');
        return [];
      }

      console.log('🔄 Fetching featured posts from WordPress...');
      const posts = await makeWordPressRequest('/posts', {
        sticky: true, // Get sticky posts (featured)
        _embed: true,
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: unknown) {
      console.error('Error fetching featured posts:', error);
      console.log('📝 Error fetching featured posts - returning empty array');
      return [];
    }
  },

  // Get recent posts with caching
  getRecentPosts: async (limit = 10, params: WordPressParams = {}) => {
    try {
      const cacheKey = `recent_${limit}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached recent posts (${limit})`);
        return cached;
      }

      // Check if WordPress is configured
      if (!WORDPRESS_URL) {
        console.log(`📝 WordPress not configured - returning empty recent posts array`);
        return [];
      }

      console.log(`🔄 Fetching recent posts (${limit}) from WordPress...`);
      const posts = await makeWordPressRequest('/posts', {
        per_page: limit,
        _embed: true,
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: unknown) {
      console.error('Error fetching recent posts:', error);
      console.log(`📝 Error fetching recent posts - returning empty array`);
      return [];
    }
  },

  // Check if WordPress is configured and accessible
  isConfigured: () => {
    return !!WORDPRESS_URL;
  },

  // Test WordPress connection
  testConnection: async () => {
    try {
      if (!WORDPRESS_URL) {
        return { success: false, message: 'WordPress URL not configured' };
      }

      const response = await makeWordPressRequest('/posts', { per_page: 1 });
      return { success: true, message: 'WordPress connection successful' };
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Clear cache
  clearCache: () => {
    clearPostCache();
    console.log('🗑️ WordPress cache cleared');
  },

  // Get cache status
  getCacheStatus: () => {
    return {
      size: postCache.size,
      keys: Array.from(postCache.keys()),
      timestamp: Date.now()
    };
  }
};

export default wordPressAPI; 