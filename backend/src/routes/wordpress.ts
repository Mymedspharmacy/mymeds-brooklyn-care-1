import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

// In-memory cache for posts (in production, use Redis)
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
const makeWordPressRequest = async (url: string, options: any = {}, params: any = {}) => {
  const retries = 3; // Default number of retries
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Admin: get WordPress settings
router.get('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    let settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      settings = await prisma.wordPressSettings.create({
        data: {
          id: 1,
          enabled: false,
          siteUrl: '',
          username: '',
          applicationPassword: '',
          updatedAt: new Date()
        }
      });
    }

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      username: settings.username ? '***' + settings.username.slice(-4) : '',
      applicationPassword: settings.applicationPassword ? '***' + settings.applicationPassword.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err: any) {
    console.error('Error fetching WordPress settings:', err);
    res.status(500).json({ 
      error: 'Failed to fetch WordPress settings',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: update WordPress settings
router.put('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { enabled, siteUrl, username, applicationPassword } = req.body;

    // Validate required fields when enabling
    if (enabled && (!siteUrl || !username || !applicationPassword)) {
      return res.status(400).json({ 
        error: 'Site URL, Username, and Application Password are required when enabling WordPress integration' 
      });
    }

    const updateData: any = {
      enabled: enabled || false,
      updatedAt: new Date()
    };

    if (siteUrl !== undefined) updateData.siteUrl = siteUrl;
    if (username !== undefined) updateData.username = username;
    if (applicationPassword !== undefined) updateData.applicationPassword = applicationPassword;

    const settings = await prisma.wordPressSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: {
        id: 1,
        enabled: enabled || false,
        siteUrl: siteUrl || '',
        username: username || '',
        applicationPassword: applicationPassword || '',
        updatedAt: new Date()
      }
    });

    // Clear cache when settings change
    clearPostCache();

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      username: settings.username ? '***' + settings.username.slice(-4) : '',
      applicationPassword: settings.applicationPassword ? '***' + settings.applicationPassword.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err: any) {
    console.error('Error updating WordPress settings:', err);
    res.status(500).json({ 
      error: 'Failed to update WordPress settings',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: test WordPress connection
router.post('/test-connection', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    if (!settings.siteUrl || !settings.username || !settings.applicationPassword) {
      return res.status(400).json({ error: 'Missing required WordPress credentials' });
    }

    // Test connection with retry logic
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const siteInfo = await response.json();
    
    res.json({
      success: true,
      message: 'Connection test successful',
      siteInfo: {
        name: siteInfo.name || 'WordPress Site',
        description: siteInfo.description || '',
        url: settings.siteUrl,
        version: siteInfo.version || 'Unknown',
        apiStatus: 'Connected'
      }
    });
  } catch (err: any) {
    console.error('Error testing WordPress connection:', err);
    res.status(500).json({ 
      error: 'Failed to test connection',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      suggestion: 'Check your WordPress site URL, username, and application password'
    });
  }
});

// Admin: sync posts from WordPress
router.post('/sync-posts', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    // Update sync status
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: null
      }
    });

    // Fetch posts with retry logic
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/posts?per_page=100&_embed`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const posts = await response.json();
    
    // Sync posts to local database using existing Blog model
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const post of posts) {
      try {
        await prisma.blog.upsert({
          where: { id: post.id },
          update: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date)
          },
          create: {
            id: post.id,
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date)
          }
        });

        syncedCount++;
      } catch (postError: any) {
        errorCount++;
        errors.push(`Post ${post.id}: ${postError.message}`);
      }
    }

    // Clear cache after sync
    clearPostCache();

    // Update sync status
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: errorCount > 0 ? `Sync completed with ${errorCount} errors` : null
      }
    });

    res.json({
      success: true,
      message: `Sync completed: ${syncedCount} posts synced, ${errorCount} errors`,
      synced: syncedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    console.error('Error syncing WordPress posts:', err);
    
    // Update sync status with error
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastError: err.message,
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Failed to sync posts',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      suggestion: 'Check your WordPress credentials and site URL'
    });
  }
});

// Admin: get WordPress sync status
router.get('/sync-status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    // Get post count for status
    const postCount = await prisma.blog.count();

    res.json({
      enabled: settings?.enabled || false,
      lastSync: settings?.lastSync,
      lastError: settings?.lastError,
      postCount,
      cacheStatus: postCache.size > 0 ? 'active' : 'empty',
      status: settings?.lastError ? 'error' : 'idle' // idle, syncing, error
    });
  } catch (err: any) {
    console.error('Error fetching WordPress sync status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch sync status',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: create WordPress post
router.post('/posts', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { title, content, status = 'draft', excerpt, categories } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    // Create post with retry logic
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/posts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          status,
          excerpt: excerpt || content.substring(0, 150) + '...',
          categories: categories || []
        })
      }
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const newPost = await response.json();
    
    // Clear cache after creating new post
    clearPostCache();
    
    res.json({
      success: true,
      message: 'Post created successfully',
      post: {
        id: newPost.id,
        title: newPost.title.rendered,
        status: newPost.status,
        link: newPost.link,
        date: newPost.date
      }
    });
  } catch (err: any) {
    console.error('Error creating WordPress post:', err);
    res.status(500).json({ 
      error: 'Failed to create post',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
      suggestion: 'Check your WordPress credentials and ensure the post content is valid'
    });
  }
});

// Admin: get WordPress pages
router.get('/pages', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { page = 1, per_page = 20, status = 'publish' } = req.query;
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/pages?page=${page}&per_page=${per_page}&status=${status}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('Failed to fetch WordPress pages');
    }

    const pages = await response.json();
    const totalPages = response.headers.get('X-WP-Total');
    const totalPagesCount = response.headers.get('X-WP-TotalPages');

    res.json({
      pages: pages.map((page: any) => ({
        id: page.id,
        title: page.title.rendered,
        content: page.content.rendered,
        excerpt: page.excerpt.rendered,
        status: page.status,
        date: page.date,
        modified: page.modified,
        slug: page.slug,
        link: page.link
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalPages || '0'),
        total_pages: parseInt(totalPagesCount || '0')
      }
    });
  } catch (err: any) {
    console.error('Error fetching WordPress pages:', err);
    res.status(500).json({ 
      error: 'Failed to fetch pages',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: create WordPress page
router.post('/pages', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { title, content, excerpt, status = 'draft', slug, parent = 0 } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/pages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 150) + '...',
          status,
          slug,
          parent
        })
      }
    );

    if (!response) {
      throw new Error('Failed to create WordPress page');
    }

    const newPage = await response.json();
    
    // Clear cache
    clearPostCache();
    
    res.json({
      success: true,
      message: 'Page created successfully',
      page: {
        id: newPage.id,
        title: newPage.title.rendered,
        status: newPage.status,
        link: newPage.link,
        date: newPage.date
      }
    });
  } catch (err: any) {
    console.error('Error creating WordPress page:', err);
    res.status(500).json({ 
      error: 'Failed to create page',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: get WordPress media
router.get('/media', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { page = 1, per_page = 20, media_type } = req.query;
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    let url = `${settings.siteUrl}/wp-json/wp/v2/media?page=${page}&per_page=${per_page}`;
    if (media_type) {
      url += `&media_type=${media_type}`;
    }

    const response = await makeWordPressRequest(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response) {
      throw new Error('Failed to fetch WordPress media');
    }

    const media = await response.json();
    const totalMedia = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    res.json({
      media: media.map((item: any) => ({
        id: item.id,
        title: item.title.rendered,
        description: item.description.rendered,
        caption: item.caption.rendered,
        alt_text: item.alt_text,
        media_type: item.media_type,
        mime_type: item.mime_type,
        source_url: item.source_url,
        date: item.date,
        modified: item.modified,
        sizes: item.media_details?.sizes || {}
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalMedia || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    });
  } catch (err: any) {
    console.error('Error fetching WordPress media:', err);
    res.status(500).json({ 
      error: 'Failed to fetch media',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: upload media to WordPress
router.post('/media', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { file_url, title, description, caption, alt_text } = req.body;

    if (!file_url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    // For file uploads, you would typically handle multipart/form-data
    // This is a simplified version for remote URLs
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/media`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_url: file_url,
          title: title || '',
          description: description || '',
          caption: caption || '',
          alt_text: alt_text || ''
        })
      }
    );

    if (!response) {
      throw new Error('Failed to upload media to WordPress');
    }

    const newMedia = await response.json();
    
    // Clear cache
    clearPostCache();
    
    res.json({
      success: true,
      message: 'Media uploaded successfully',
      media: {
        id: newMedia.id,
        title: newMedia.title.rendered,
        source_url: newMedia.source_url,
        link: newMedia.link
      }
    });
  } catch (err: any) {
    console.error('Error uploading media to WordPress:', err);
    res.status(500).json({ 
      error: 'Failed to upload media',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: get custom post types
router.get('/post-types', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/types`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('Failed to fetch WordPress post types');
    }

    const postTypes = await response.json();

    res.json({
      postTypes: Object.keys(postTypes).map(key => ({
        name: key,
        ...postTypes[key]
      }))
    });
  } catch (err: any) {
    console.error('Error fetching WordPress post types:', err);
    res.status(500).json({ 
      error: 'Failed to fetch post types',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Admin: get posts by custom post type
router.get('/post-types/:type/posts', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { type } = req.params;
    const { page = 1, per_page = 20, status = 'publish' } = req.query;
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/${type}?page=${page}&per_page=${per_page}&status=${status}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error(`Failed to fetch ${type} posts`);
    }

    const posts = await response.json();
    const totalPosts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    res.json({
      postType: type,
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.title?.rendered || post.title || '',
        content: post.content?.rendered || post.content || '',
        excerpt: post.excerpt?.rendered || post.excerpt || '',
        status: post.status,
        date: post.date,
        modified: post.modified,
        slug: post.slug,
        link: post.link
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalPosts || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    });
  } catch (err: any) {
    console.error(`Error fetching ${req.params.type} posts:`, err);
    res.status(500).json({ 
      error: `Failed to fetch ${req.params.type} posts`,
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Webhook endpoint for real-time updates
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration not enabled' });
    }

    const { action, data } = req.body;

    switch (action) {
      case 'post.created':
      case 'post.updated':
        // Clear cache and trigger sync for specific post
        clearPostCache();
        console.log(`Webhook: Post ${action} - ID: ${data.id}`);
        break;
      
      case 'post.deleted':
        // Remove post from local database
        try {
          await prisma.blog.delete({
            where: { id: data.id }
          });
          clearPostCache();
          console.log(`Webhook: Post deleted - ID: ${data.id}`);
        } catch (error: any) {
          console.error(`Error deleting post ${data.id}:`, error);
        }
        break;
      
      case 'page.created':
      case 'page.updated':
        // Handle page updates if needed
        console.log(`Webhook: Page ${action} - ID: ${data.id}`);
        break;
      
      default:
        console.log(`Webhook: Unknown action - ${action}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err: any) {
    console.error('Error processing WordPress webhook:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Admin: clear cache
router.post('/clear-cache', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    clearPostCache();
    
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (err: any) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Automated sync endpoint (can be called by cron jobs)
router.post('/auto-sync', async (req: Request, res: Response) => {
  try {
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration not enabled' });
    }

    // Update sync status
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: null
      }
    });

    // Fetch posts with retry logic
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/posts?per_page=100&_embed`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const posts = await response.json();
    
    // Sync posts to local database using existing Blog model
    let syncedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const post of posts) {
      try {
        await prisma.blog.upsert({
          where: { id: post.id },
          update: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date),
            updatedAt: new Date()
          },
          create: {
            id: post.id,
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date)
          }
        });

        syncedCount++;
      } catch (postError: any) {
        errorCount++;
        errors.push(`Post ${post.id}: ${postError.message}`);
      }
    }

    // Clear cache after sync
    clearPostCache();

    // Update sync status
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastSync: new Date(),
        lastError: errorCount > 0 ? `Auto-sync completed with ${errorCount} errors` : null
      }
    });

    res.json({
      success: true,
      message: `Auto-sync completed: ${syncedCount} posts synced, ${errorCount} errors`,
      synced: syncedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
      timestamp: new Date()
    });
  } catch (err: any) {
    console.error('Error in auto-sync:', err);
    
    // Update sync status with error
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastError: err.message,
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Auto-sync failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Public endpoint to get posts (for frontend)
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { page = '1', per_page = '20', category, search, featured } = req.query;
    
    // Check cache first
    const cacheKey = `posts_${page}_${per_page}_${category}_${search}_${featured}`;
    const cached = getCachedPosts(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.json({ posts: [], pagination: { total: 0, pages: 0 } });
    }

    // Build query parameters
    const params: any = {
      page: parseInt(page.toString()),
      per_page: parseInt(per_page.toString()),
      _embed: true
    };

    if (category) params.categories = category;
    if (search) params.search = search;
    if (featured === 'true') params.sticky = true;

    // Fetch from WordPress API
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/posts`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      params
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const posts = await response.json();
    const totalPosts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    const result = {
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.title?.rendered || post.title || '',
        content: post.content?.rendered || post.content || '',
        excerpt: post.excerpt?.rendered || post.excerpt || '',
        author: post.author || 'WordPress Admin',
        date: post.date,
        modified: post.modified,
        slug: post.slug,
        link: post.link,
        featured_media: post.featured_media,
        categories: post.categories,
        tags: post.tags,
        _embedded: post._embedded
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalPosts || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    };

    // Cache the result
    setCachedPosts(cacheKey, result);

    res.json(result);
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ 
      error: 'Failed to fetch posts',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Public endpoint to get categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    // Check cache first
    const cacheKey = 'categories_all';
    const cached = getCachedPosts(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.json([]);
    }

    // Fetch from WordPress API
    const response = await makeWordPressRequest(
      `${settings.siteUrl}/wp-json/wp/v2/categories`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      { per_page: 100 }
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const categoriesData = await response.json();
    const categories = categoriesData.map((category: any) => ({
      id: category.id,
      name: category.name,
      count: category.count,
      description: category.description,
      slug: category.slug
    }));

    // Cache the result
    setCachedPosts(cacheKey, categories);

    res.json(categories);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router; 