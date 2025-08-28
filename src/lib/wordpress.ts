import axios from 'axios';

// WordPress API configuration
const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL;

// Validate required environment variables
if (!WORDPRESS_URL) {
  console.error('❌ WordPress environment variables are not configured!');
  console.error('Please set: VITE_WORDPRESS_URL');
}

// In-memory cache for posts (in production, use a more robust solution)
const postCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Cache management functions
const getCachedPosts = (key: string) => {
  const cached = postCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedPosts = (key: string, data: any) => {
  postCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearPostCache = () => {
  postCache.clear();
};

// Enhanced error handling with retry logic
const makeWordPressRequest = async (url: string, params = {}, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        params,
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
      console.log(`WordPress API request failed, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const wordpress = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for better error handling
wordpress.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      let errorMessage = `WordPress API Error (${status})`;
      
      if (data && data.message) {
        errorMessage += `: ${data.message}`;
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

// WordPress API methods
export const wordPressAPI = {
  // Get posts with caching
  getPosts: async (params = {}) => {
    try {
      const cacheKey = `posts_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached posts');
        return cached;
      }

      console.log('🔄 Fetching posts from WordPress...');
      const posts = await makeWordPressRequest('/posts', {
        _embed: true, // Include featured images and other embedded content
        ...params,
      });
      
      // Cache the results
      setCachedPosts(cacheKey, posts);
      
      return posts;
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      throw new Error(`Failed to fetch posts: ${error.message}`);
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

      console.log(`🔄 Fetching post ${id} from WordPress...`);
      const post = await makeWordPressRequest(`/posts/${id}`, {
        _embed: true,
      });
      
      // Cache the result
      setCachedPosts(cacheKey, post);
      
      return post;
    } catch (error: any) {
      console.error(`Error fetching post ${id}:`, error);
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
  },

  // Get categories with caching
  getCategories: async () => {
    try {
      const cacheKey = 'categories';
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached categories');
        return cached;
      }

      console.log('🔄 Fetching categories from WordPress...');
      const categories = await makeWordPressRequest('/categories');
      
      // Cache the results
      setCachedPosts(cacheKey, categories);
      
      return categories;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  },

  // Get posts by category with caching
  getPostsByCategory: async (categoryId: number, params = {}) => {
    try {
      const cacheKey = `category_posts_${categoryId}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached posts for category ${categoryId}`);
        return cached;
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
    } catch (error: any) {
      console.error(`Error fetching posts for category ${categoryId}:`, error);
      throw new Error(`Failed to fetch posts by category: ${error.message}`);
    }
  },

  // Search posts with caching
  searchPosts: async (searchTerm: string, params = {}) => {
    try {
      const cacheKey = `search_${searchTerm}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached search results for "${searchTerm}"`);
        return cached;
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
    } catch (error: any) {
      console.error('Error searching posts:', error);
      throw new Error(`Failed to search posts: ${error.message}`);
    }
  },

  // Get featured posts with caching
  getFeaturedPosts: async (params = {}) => {
    try {
      const cacheKey = `featured_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log('📝 Returning cached featured posts');
        return cached;
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
    } catch (error: any) {
      console.error('Error fetching featured posts:', error);
      throw new Error(`Failed to fetch featured posts: ${error.message}`);
    }
  },

  // Get recent posts with caching
  getRecentPosts: async (limit = 10, params = {}) => {
    try {
      const cacheKey = `recent_${limit}_${JSON.stringify(params)}`;
      const cached = getCachedPosts(cacheKey);
      
      if (cached) {
        console.log(`📝 Returning cached recent posts (${limit})`);
        return cached;
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
    } catch (error: any) {
      console.error('Error fetching recent posts:', error);
      throw new Error(`Failed to fetch recent posts: ${error.message}`);
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