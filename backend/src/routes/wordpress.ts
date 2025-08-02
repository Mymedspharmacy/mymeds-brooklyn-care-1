import { Router, Request, Response } from 'express';
import { adminAuthMiddleware } from '../adminAuth';

const router = Router();

// WordPress API configuration
const WORDPRESS_CONFIG = {
  url: process.env.WORDPRESS_URL,
  username: process.env.WORDPRESS_USERNAME,
  password: process.env.WORDPRESS_APPLICATION_PASSWORD,
};

// Helper function to make WordPress API calls
async function makeWordPressRequest(endpoint: string, method: string = 'GET', data?: any) {
  if (!WORDPRESS_CONFIG.url || !WORDPRESS_CONFIG.username || !WORDPRESS_CONFIG.password) {
    throw new Error('WordPress configuration is incomplete');
  }

  const url = `${WORDPRESS_CONFIG.url}/wp-json/wp/v2/${endpoint}`;
  
  const auth = Buffer.from(`${WORDPRESS_CONFIG.username}:${WORDPRESS_CONFIG.password}`).toString('base64');
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get all posts
router.get('/posts', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const posts = await makeWordPressRequest('posts');
    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching WordPress posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get a specific post
router.get('/posts/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await makeWordPressRequest(`posts/${req.params.id}`);
    res.json(post);
  } catch (error: any) {
    console.error('Error fetching WordPress post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create a new post
router.post('/posts', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await makeWordPressRequest('posts', 'POST', req.body);
    res.json(post);
  } catch (error: any) {
    console.error('Error creating WordPress post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update a post
router.put('/posts/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const post = await makeWordPressRequest(`posts/${req.params.id}`, 'PUT', req.body);
    res.json(post);
  } catch (error: any) {
    console.error('Error updating WordPress post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/posts/:id', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    await makeWordPressRequest(`posts/${req.params.id}`, 'DELETE');
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting WordPress post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get pages
router.get('/pages', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const pages = await makeWordPressRequest('pages');
    res.json(pages);
  } catch (error: any) {
    console.error('Error fetching WordPress pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// Get categories
router.get('/categories', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = await makeWordPressRequest('categories');
    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching WordPress categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get tags
router.get('/tags', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const tags = await makeWordPressRequest('tags');
    res.json(tags);
  } catch (error: any) {
    console.error('Error fetching WordPress tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get media
router.get('/media', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const media = await makeWordPressRequest('media');
    res.json(media);
  } catch (error: any) {
    console.error('Error fetching WordPress media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Upload media
router.post('/media', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const media = await makeWordPressRequest('media', 'POST', req.body);
    res.json(media);
  } catch (error: any) {
    console.error('Error uploading WordPress media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Sync posts from WordPress to local database
router.post('/sync-posts', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const wpPosts = await makeWordPressRequest('posts');
    
    for (const wpPost of wpPosts) {
      await prisma.blog.upsert({
        where: { id: wpPost.id },
        update: {
          title: wpPost.title.rendered,
          content: wpPost.content.rendered,
          author: wpPost.author || 'Admin',
        },
        create: {
          id: wpPost.id,
          title: wpPost.title.rendered,
          content: wpPost.content.rendered,
          author: wpPost.author || 'Admin',
        },
      });
    }
    
    await prisma.$disconnect();
    res.json({ success: true, message: `Synced ${wpPosts.length} posts` });
  } catch (error: any) {
    console.error('Error syncing posts:', error);
    res.status(500).json({ error: 'Failed to sync posts' });
  }
});

// Get site info
router.get('/site-info', adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${WORDPRESS_CONFIG.url}/wp-json/`);
    const siteInfo = await response.json();
    res.json(siteInfo);
  } catch (error: any) {
    console.error('Error fetching WordPress site info:', error);
    res.status(500).json({ error: 'Failed to fetch site info' });
  }
});

export default router; 