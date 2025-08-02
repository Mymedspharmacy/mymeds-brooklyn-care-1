import axios from 'axios';

// WordPress API configuration
const WORDPRESS_URL = import.meta.env.VITE_WORDPRESS_URL;

// Validate required environment variables
if (!WORDPRESS_URL) {
  console.error('❌ WordPress environment variables are not configured!');
  console.error('Please set: VITE_WORDPRESS_URL');
}

const wordpress = axios.create({
  baseURL: `${WORDPRESS_URL}/wp-json/wp/v2`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// WordPress API methods
export const wordPressAPI = {
  // Get posts
  getPosts: async (params = {}) => {
    try {
      const response = await wordpress.get('/posts', { 
        params: {
          _embed: true, // Include featured images and other embedded content
          ...params,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  // Get post by ID
  getPost: async (id: number) => {
    try {
      const response = await wordpress.get(`/posts/${id}`, {
        params: {
          _embed: true,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await wordpress.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get posts by category
  getPostsByCategory: async (categoryId: number, params = {}) => {
    try {
      const response = await wordpress.get('/posts', {
        params: {
          categories: categoryId,
          _embed: true,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      throw error;
    }
  },

  // Search posts
  searchPosts: async (searchTerm: string, params = {}) => {
    try {
      const response = await wordpress.get('/posts', {
        params: {
          search: searchTerm,
          _embed: true,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  },

  // Get featured posts
  getFeaturedPosts: async (params = {}) => {
    try {
      const response = await wordpress.get('/posts', {
        params: {
          sticky: true, // Get sticky posts (featured)
          _embed: true,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      throw error;
    }
  },

  // Get recent posts
  getRecentPosts: async (limit = 10, params = {}) => {
    try {
      const response = await wordpress.get('/posts', {
        params: {
          per_page: limit,
          _embed: true,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      throw error;
    }
  },
};

export default wordPressAPI; 