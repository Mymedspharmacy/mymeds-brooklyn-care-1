import { Router, Request, Response } from 'express';
import { unifiedAdminAuth } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import { AuthRequest } from '../types/express';
import { 
  getPostProperty,
  getMediaProperty,
  getCategoryProperty
} from '../core/utils/wordpressTypes';
import { isErrorWithMessage, isObject } from '../core/utils/typeGuards';

const router = Router();

// Import Prisma client directly
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configure multer for WordPress media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/wordpress-media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'wp-media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for WordPress media
  },
  fileFilter: (req, file, cb) => {
    // Allow common media types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|mp4|mp3|wav|webp|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, audio, and document files are allowed'));
    }
  }
});

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

const setCachedPosts = (key: string, data: unknown) => {
  postCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearPostCache = () => {
  postCache.clear();
};

// Dynamic content generation - creates new posts periodically
const generateDynamicPost = (baseId: number) => {
  const dynamicTopics = [
    {
      title: 'The Latest in Telemedicine: Connecting with Your Healthcare Provider',
      excerpt: 'Telemedicine has revolutionized healthcare delivery. Learn how virtual visits can provide convenient access to quality care.',
      content: '<p>Telemedicine has become an essential part of modern healthcare, offering patients convenient access to medical care from the comfort of their homes...</p>',
      author: 'Dr. Alex Thompson',
      category: 21,
      tag: 'telemedicine'
    },
    {
      title: 'Understanding Generic vs. Brand Name Medications',
      excerpt: 'Learn about the differences between generic and brand name medications, including safety, effectiveness, and cost considerations.',
      content: '<p>Generic medications offer the same therapeutic benefits as brand name drugs at a fraction of the cost...</p>',
      author: 'Pharmacist David Wilson',
      category: 9,
      tag: 'generic-medications'
    },
    {
      title: 'Sleep and Medication: How They Interact',
      excerpt: 'Discover how certain medications can affect your sleep patterns and what you can do to minimize disruptions.',
      content: '<p>Quality sleep is essential for overall health, but some medications can interfere with your natural sleep cycles...</p>',
      author: 'Dr. Rachel Green',
      category: 13,
      tag: 'sleep-health'
    },
    {
      title: 'Managing Medication Side Effects: A Practical Guide',
      excerpt: 'Learn how to identify, manage, and communicate about medication side effects with your healthcare team.',
      content: '<p>All medications can potentially cause side effects. Understanding how to manage them effectively is key to successful treatment...</p>',
      author: 'Dr. Mark Stevens',
      category: 3,
      tag: 'side-effects'
    },
    {
      title: 'Seasonal Depression and Treatment Options',
      excerpt: 'Seasonal Affective Disorder (SAD) affects many people during winter months. Explore treatment options and coping strategies.',
      content: '<p>Seasonal depression, or Seasonal Affective Disorder (SAD), is a type of depression that occurs at specific times of the year...</p>',
      author: 'Dr. Lisa Park',
      category: 13,
      tag: 'seasonal-depression'
    }
  ];

  const randomTopic = dynamicTopics[Math.floor(Math.random() * dynamicTopics.length)];
  const now = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30); // Random post within last 30 days
  const postDate = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

  return {
    id: baseId,
    title: randomTopic.title,
    content: randomTopic.content,
    excerpt: randomTopic.excerpt,
    author: randomTopic.author,
    date: postDate.toISOString(),
    modified: postDate.toISOString(),
    slug: randomTopic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    link: `/blog/${randomTopic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    featured_media: {
      id: 200 + baseId,
      source_url: `https://images.unsplash.com/photo-${1559757148 + baseId}?w=800&h=400&fit=crop`,
      alt_text: 'Healthcare and wellness'
    },
    categories: [randomTopic.category],
    tags: [{ id: 100 + baseId, name: randomTopic.tag, slug: randomTopic.tag }],
    _embedded: {
      author: [{ name: randomTopic.author, bio: 'Healthcare professional with expertise in patient care' }],
      'wp:featuredmedia': [{
        source_url: `https://images.unsplash.com/photo-${1559757148 + baseId}?w=800&h=400&fit=crop`,
        alt_text: 'Healthcare and wellness'
      }]
    }
  };
};

// Enhanced error handling with retry logic for production
const makeWordPressRequest = async (url: string, options: unknown = {}, params: unknown = {}, settings?: any) => {
  // Real WordPress API request
  console.log('📝 Making real WordPress API request to:', url);
  const retries = 3; // Default number of retries
  for (let i = 0; i < retries; i++) {
    try {
      // Use settings for authentication if provided, otherwise fall back to environment variables
      let wpUrl, wpUsername, wpAppPassword;
      
      if (settings) {
        wpUrl = settings.siteUrl;
        wpUsername = settings.username;
        wpAppPassword = settings.applicationPassword;
      } else {
        wpUrl = process.env.WORDPRESS_URL;
        wpUsername = process.env.WORDPRESS_USERNAME;
        wpAppPassword = process.env.WORDPRESS_APP_PASSWORD;
      }

      if (!wpUrl || !wpUsername || !wpAppPassword) {
        throw new Error('WordPress credentials not found in settings or environment variables');
      }

      // Build URL with query parameters if provided
      let requestUrl = url;
      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params as Record<string, string>).toString();
        // Check if url already contains wp-json to avoid duplication
        if (url.includes('/wp-json/')) {
          requestUrl = `${url}?${queryString}`;
        } else {
          requestUrl = `${wpUrl}/wp-json/wp/v2${url}?${queryString}`;
        }
      } else {
        // Check if url already contains wp-json to avoid duplication
        if (url.includes('/wp-json/')) {
          requestUrl = url;
        } else {
          requestUrl = `${wpUrl}/wp-json/wp/v2${url}`;
        }
      }
      
      // Create basic auth header
      const auth = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString('base64');
      
      console.log('📝 WordPress API URL:', requestUrl);
      const response = await fetch(requestUrl, {
        ...(isObject(options) ? options : {} as Record<string, unknown>),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          ...(isObject(options) && options.headers ? options.headers as Record<string, unknown> : {}),
        },
      });
      
      return response;
    } catch (error) {
      if (i === retries - 1) {
        console.error('📝 WordPress API failed after', retries, 'attempts:', isErrorWithMessage(error) ? error.message : 'Unknown error');
        throw new Error(`WordPress API request failed: ${isErrorWithMessage(error) ? error.message : 'Unknown error'}`);
      }
      
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
  } catch (err: unknown) {
    console.error('Error fetching WordPress settings:', err);
    res.status(500).json({ 
      error: 'Failed to fetch WordPress settings',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    const updateData: Record<string, unknown> = {
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
  } catch (err: unknown) {
    console.error('Error updating WordPress settings:', err);
    res.status(500).json({ 
      error: 'Failed to update WordPress settings',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
      },
      {},
      settings
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
  } catch (err: unknown) {
    console.error('Error testing WordPress connection:', err);
    res.status(500).json({ 
      error: 'Failed to test connection',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
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
          where: { slug: post.slug || `post-${post.id}` },
          update: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date)
          },
          create: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            slug: post.slug || `post-${post.id}`,
            createdAt: new Date(post.date)
          }
        });

        syncedCount++;
      } catch (postError: unknown) {
        errorCount++;
        errors.push(`Post ${post.id}: ${isErrorWithMessage(postError) ? postError.message : 'Unknown error'}`);
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
  } catch (err: unknown) {
    console.error('Error syncing WordPress posts:', err);
    
    // Update sync status with error
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastError: isErrorWithMessage(err) ? err.message : 'Unknown error',
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Failed to sync posts',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
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
  } catch (err: unknown) {
    console.error('Error fetching WordPress sync status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch sync status',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
  } catch (err: unknown) {
    console.error('Error creating WordPress post:', err);
    res.status(500).json({ 
      error: 'Failed to create post',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined,
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
      pages: pages.map((page: unknown) => ({
        id: getPostProperty(page, 'id', 0),
        title: (getPostProperty(page, 'title', {}) as any).rendered || '',
        content: (getPostProperty(page, 'content', {}) as any).rendered || '',
        excerpt: (getPostProperty(page, 'excerpt', {}) as any).rendered || '',
        status: getPostProperty(page, 'status', ''),
        date: getPostProperty(page, 'date', ''),
        modified: getPostProperty(page, 'modified', ''),
        slug: getPostProperty(page, 'slug', ''),
        link: getPostProperty(page, 'link', '')
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalPages || '0'),
        total_pages: parseInt(totalPagesCount || '0')
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching WordPress pages:', err);
    res.status(500).json({ 
      error: 'Failed to fetch pages',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
  } catch (err: unknown) {
    console.error('Error creating WordPress page:', err);
    res.status(500).json({ 
      error: 'Failed to create page',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
      media: media.map((item: unknown) => ({
        id: getMediaProperty(item, 'id', 0),
        title: (getMediaProperty(item, 'title', {}) as any).rendered || '',
        description: (getMediaProperty(item, 'description', {}) as any).rendered || '',
        caption: (getMediaProperty(item, 'caption', {}) as any).rendered || '',
        alt_text: getMediaProperty(item, 'alt_text', ''),
        media_type: getMediaProperty(item, 'media_type', ''),
        mime_type: getMediaProperty(item, 'mime_type', ''),
        source_url: getMediaProperty(item, 'source_url', ''),
        date: getMediaProperty(item, 'date', ''),
        modified: getMediaProperty(item, 'modified', ''),
        sizes: (getMediaProperty(item, 'media_details', {}) as any)?.sizes || {}
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalMedia || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching WordPress media:', err);
    res.status(500).json({ 
      error: 'Failed to fetch media',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Admin: upload media to WordPress (supports both file upload and remote URL)
router.post('/media', unifiedAdminAuth, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { file_url, title, description, caption, alt_text } = req.body;
    const uploadedFile = req.file;

    // Check if we have either a file upload or a remote URL
    if (!uploadedFile && !file_url) {
      return res.status(400).json({ error: 'Either file upload or file URL is required' });
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    let mediaData: unknown;
    let sourceUrl: string;

    if (uploadedFile) {
      // Handle file upload
      sourceUrl = `${req.protocol}://${req.get('host')}/uploads/wordpress-media/${uploadedFile.filename}`;
      
      // Create FormData for WordPress API
      const formData = new FormData();
      formData.append('file', fs.createReadStream(uploadedFile.path));
      formData.append('title', title || uploadedFile.originalname);
      formData.append('description', description || '');
      formData.append('caption', caption || '');
      formData.append('alt_text', alt_text || '');

      const response = await fetch(`${settings.siteUrl}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${settings.username}:${settings.applicationPassword}`).toString('base64')}`,
          ...formData.getHeaders()
        },
        body: formData as any
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`WordPress API error: ${response.status} - ${errorText}`);
      }

      mediaData = await response.json();
    } else {
      // Handle remote URL
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

      mediaData = await response.json();
      sourceUrl = file_url;
    }
    
    // Clear cache
    clearPostCache();
    
    res.json({
      success: true,
      message: 'Media uploaded successfully',
      media: {
        id: getMediaProperty(mediaData, 'id', 0),
        title: (getMediaProperty(mediaData, 'title', {}) as any)?.rendered || getMediaProperty(mediaData, 'title', ''),
        description: (getMediaProperty(mediaData, 'description', {}) as any)?.rendered || getMediaProperty(mediaData, 'description', ''),
        caption: (getMediaProperty(mediaData, 'caption', {}) as any)?.rendered || getMediaProperty(mediaData, 'caption', ''),
        alt_text: getMediaProperty(mediaData, 'alt_text', ''),
        source_url: getMediaProperty(mediaData, 'source_url', sourceUrl),
        link: getMediaProperty(mediaData, 'link', ''),
        mime_type: getMediaProperty(mediaData, 'mime_type', ''),
        media_type: getMediaProperty(mediaData, 'media_type', ''),
        date: getMediaProperty(mediaData, 'date', ''),
        modified: getMediaProperty(mediaData, 'modified', '')
      }
    });
  } catch (err: unknown) {
    console.error('Error uploading media to WordPress:', err);
    
    // Clean up uploaded file if it exists and there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to upload media',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
  } catch (err: unknown) {
    console.error('Error fetching WordPress post types:', err);
    res.status(500).json({ 
      error: 'Failed to fetch post types',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
      posts: posts.map((post: unknown) => ({
        id: getPostProperty(post, 'id', 0),
        title: (getPostProperty(post, 'title', {}) as any)?.rendered || getPostProperty(post, 'title', ''),
        content: (getPostProperty(post, 'content', {}) as any)?.rendered || getPostProperty(post, 'content', ''),
        excerpt: (getPostProperty(post, 'excerpt', {}) as any)?.rendered || getPostProperty(post, 'excerpt', ''),
        status: getPostProperty(post, 'status', ''),
        date: getPostProperty(post, 'date', ''),
        modified: getPostProperty(post, 'modified', ''),
        slug: getPostProperty(post, 'slug', ''),
        link: getPostProperty(post, 'link', '')
      })),
      pagination: {
        page: parseInt(page.toString()),
        per_page: parseInt(per_page.toString()),
        total: parseInt(totalPosts || '0'),
        total_pages: parseInt(totalPages || '0')
      }
    });
  } catch (err: unknown) {
    console.error(`Error fetching ${req.params.type} posts:`, err);
    res.status(500).json({ 
      error: `Failed to fetch ${req.params.type} posts`,
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
        } catch (error: unknown) {
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
  } catch (err: unknown) {
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
  } catch (err: unknown) {
    console.error('Error clearing cache:', err);
    res.status(500).json({ 
      error: 'Failed to clear cache',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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
          where: { slug: post.slug || `post-${post.id}` },
          update: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            createdAt: new Date(post.date),
            updatedAt: new Date()
          },
          create: {
            title: post.title.rendered,
            content: post.content.rendered,
            author: post.author || 'WordPress Admin',
            slug: post.slug || `post-${post.id}`,
            createdAt: new Date(post.date)
          }
        });

        syncedCount++;
      } catch (postError: unknown) {
        errorCount++;
        errors.push(`Post ${post.id}: ${isErrorWithMessage(postError) ? postError.message : 'Unknown error'}`);
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
  } catch (err: unknown) {
    console.error('Error in auto-sync:', err);
    
    // Update sync status with error
    await prisma.wordPressSettings.update({
      where: { id: 1 },
      data: { 
        lastError: isErrorWithMessage(err) ? err.message : 'Unknown error',
        lastSync: new Date()
      }
    });

    res.status(500).json({ 
      error: 'Auto-sync failed',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
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

    // Always try to fetch from real WordPress first, even if settings are not configured
    let realWordPressData = null;
    
    try {
      console.log('🔄 Attempting to fetch real WordPress data...');
      
      // Try to get WordPress data from environment variables or settings
      let wpUrl, wpUsername, wpAppPassword;
      
      if (settings && settings.enabled) {
        wpUrl = settings.siteUrl;
        wpUsername = settings.username;
        wpAppPassword = settings.applicationPassword;
        console.log('📝 Using WordPress settings from database');
      } else {
        wpUrl = process.env.WORDPRESS_URL || process.env.VITE_WORDPRESS_URL;
        wpUsername = process.env.WORDPRESS_USERNAME;
        wpAppPassword = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;
        console.log('📝 Using WordPress environment variables');
      }

      if (wpUrl && wpUsername && wpAppPassword) {
        console.log('📝 WordPress credentials found, attempting real API call...');
        
        // Build query parameters
        const params: Record<string, unknown> = {
          page: parseInt(page.toString()),
          per_page: parseInt(per_page.toString()),
          _embed: true
        };

        if (category) params.categories = category;
        if (search) params.search = search;
        if (featured === 'true') params.sticky = true;

        // Make real WordPress API request
        const response = await makeWordPressRequest(
          '/posts',
          {
            headers: {
              'Content-Type': 'application/json'
            }
          },
          params,
          { siteUrl: wpUrl, username: wpUsername, applicationPassword: wpAppPassword }
        );

        if (response && response.ok) {
          const posts = await response.json();
          const totalPosts = response.headers.get('X-WP-Total');
          const totalPages = response.headers.get('X-WP-TotalPages');

          if (Array.isArray(posts) && posts.length > 0) {
            console.log('✅ Successfully fetched real WordPress posts:', posts.length);
            
            realWordPressData = {
              posts: posts.map((post: unknown) => ({
                id: getPostProperty(post, 'id', 0),
                title: (getPostProperty(post, 'title', {}) as any)?.rendered || getPostProperty(post, 'title', ''),
                content: (getPostProperty(post, 'content', {}) as any)?.rendered || getPostProperty(post, 'content', ''),
                excerpt: (getPostProperty(post, 'excerpt', {}) as any)?.rendered || getPostProperty(post, 'excerpt', ''),
                author: getPostProperty(post, 'author', 'WordPress Admin'),
                date: getPostProperty(post, 'date', ''),
                modified: getPostProperty(post, 'modified', ''),
                slug: getPostProperty(post, 'slug', ''),
                link: getPostProperty(post, 'link', ''),
                featured_media: getPostProperty(post, 'featured_media', 0),
                categories: getPostProperty(post, 'categories', []),
                tags: getPostProperty(post, 'tags', []),
                _embedded: getPostProperty(post, '_embedded', {})
              })),
              pagination: {
                page: parseInt(page.toString()),
                per_page: parseInt(per_page.toString()),
                total: parseInt(totalPosts || '0'),
                total_pages: parseInt(totalPages || '0')
              }
            };
          }
        }
      } else {
        console.log('⚠️ WordPress credentials not found in settings or environment variables');
      }
    } catch (error) {
      console.error('❌ Failed to fetch real WordPress data:', isErrorWithMessage(error) ? error.message : 'Unknown error');
    }

    // Only use sample data if real WordPress data is not available
    if (!realWordPressData) {
      console.log('📝 Using sample data as fallback');
      
      // Return comprehensive sample blog posts with enhanced content
      const samplePosts = [
        {
          id: 1,
          title: 'Managing Seasonal Allergies: A Complete Guide',
          content: '<p>Spring and fall bring beautiful weather, but for many people, they also bring seasonal allergies. Here\'s how to manage your symptoms effectively...</p><p>Seasonal allergies affect over 50 million Americans each year. The most common triggers include pollen from trees, grasses, and weeds. Understanding your triggers and having a comprehensive management plan can significantly improve your quality of life during allergy season.</p><h3>Common Symptoms</h3><ul><li>Sneezing and runny nose</li><li>Itchy, watery eyes</li><li>Nasal congestion</li><li>Coughing and throat irritation</li></ul><h3>Treatment Options</h3><p>Over-the-counter antihistamines, nasal sprays, and eye drops can provide relief. For severe allergies, prescription medications or immunotherapy may be recommended.</p>',
          excerpt: 'Learn effective strategies for managing seasonal allergies, including medication options, lifestyle changes, and prevention tips.',
          author: 'Dr. Sarah Johnson',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'managing-seasonal-allergies',
          link: '/blog/managing-seasonal-allergies',
          featured_media: {
            id: 101,
            source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
            alt_text: 'Spring flowers and allergy relief'
          },
          categories: [1, 7],
          tags: [{ id: 1, name: 'allergies', slug: 'allergies' }, { id: 11, name: 'seasonal-health', slug: 'seasonal-health' }],
          _embedded: {
            author: [{ name: 'Dr. Sarah Johnson', bio: 'Board-certified allergist with 15 years of experience' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
              alt_text: 'Spring flowers and allergy relief'
            }]
          }
        },
        {
          id: 2,
          title: 'Vitamin D: The Sunshine Vitamin and Your Health',
          content: '<p>Vitamin D plays a crucial role in bone health, immune function, and overall well-being. Here\'s what you need to know...</p><p>Often called the "sunshine vitamin," Vitamin D is unique because our bodies can produce it when exposed to sunlight. However, many people are deficient in this essential nutrient, especially during winter months or in areas with limited sun exposure.</p><h3>Health Benefits</h3><ul><li>Strengthens bones and teeth</li><li>Supports immune system function</li><li>May reduce risk of certain cancers</li><li>Helps with mood regulation</li></ul><h3>Sources of Vitamin D</h3><p>Sunlight exposure, fatty fish, fortified dairy products, and supplements are the primary sources. Your healthcare provider can test your Vitamin D levels to determine if supplementation is needed.</p>',
          excerpt: 'Understanding the importance of Vitamin D, how to get enough through diet and sunlight, and when supplementation may be necessary.',
          author: 'Dr. Michael Chen',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          modified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'vitamin-d-sunshine-vitamin',
          link: '/blog/vitamin-d-sunshine-vitamin',
          featured_media: {
            id: 102,
            source_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
            alt_text: 'Sunshine and healthy lifestyle'
          },
          categories: [2, 8],
          tags: [{ id: 2, name: 'vitamin-d', slug: 'vitamin-d' }, { id: 12, name: 'nutrition', slug: 'nutrition' }],
          _embedded: {
            author: [{ name: 'Dr. Michael Chen', bio: 'Internal medicine physician specializing in preventive care' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
              alt_text: 'Sunshine and healthy lifestyle'
            }]
          }
        },
        {
          id: 3,
          title: 'Proper Medication Storage: Essential Safety Tips',
          content: '<p>Storing medications correctly is crucial for maintaining their effectiveness and ensuring safety. Here are the key guidelines...</p><p>Improper medication storage can lead to reduced effectiveness, contamination, or accidental poisoning. Following proper storage guidelines ensures your medications remain safe and effective throughout their shelf life.</p><h3>Storage Guidelines</h3><ul><li>Keep medications in their original containers</li><li>Store in a cool, dry place away from sunlight</li><li>Use child-resistant containers and locks</li><li>Check expiration dates regularly</li></ul><h3>Temperature Considerations</h3><p>Most medications should be stored at room temperature (68-77°F). Some medications require refrigeration - always check the label for specific storage instructions.</p>',
          excerpt: 'Essential tips for safe medication storage at home, including temperature control, humidity management, and child safety measures.',
          author: 'Pharmacist Lisa Rodriguez',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          modified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'proper-medication-storage',
          link: '/blog/proper-medication-storage',
          featured_media: {
            id: 103,
            source_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=400&fit=crop',
            alt_text: 'Proper medication storage and organization'
          },
          categories: [3, 9],
          tags: [{ id: 3, name: 'medication-safety', slug: 'medication-safety' }, { id: 13, name: 'pharmacy-tips', slug: 'pharmacy-tips' }],
          _embedded: {
            author: [{ name: 'Pharmacist Lisa Rodriguez', bio: 'Licensed pharmacist with expertise in medication management and patient safety' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=400&fit=crop',
              alt_text: 'Proper medication storage and organization'
            }]
          }
        },
        {
          id: 4,
          title: 'Adult Immunization Schedule: Stay Protected',
          content: '<p>Vaccines aren\'t just for children. Adults need immunizations too to stay protected against serious diseases...</p><p>Adult immunizations are essential for maintaining health and preventing the spread of infectious diseases. The CDC recommends specific vaccines for different age groups and health conditions.</p><h3>Essential Adult Vaccines</h3><ul><li>Influenza (flu) vaccine - annually</li><li>Tetanus, diphtheria, pertussis (Tdap) - every 10 years</li><li>Shingles vaccine - for adults 50+</li><li>Pneumococcal vaccine - for adults 65+</li></ul><h3>Special Considerations</h3><p>Adults with chronic conditions, pregnant women, and healthcare workers may need additional vaccines. Consult with your healthcare provider to determine your specific immunization needs.</p>',
          excerpt: 'Complete guide to adult immunizations, including recommended vaccines, schedules, and special considerations for different age groups.',
          author: 'Dr. Emily Watson',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          modified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'adult-immunization-schedule',
          link: '/blog/adult-immunization-schedule',
          featured_media: {
            id: 104,
            source_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
            alt_text: 'Adult vaccination and immunization'
          },
          categories: [4, 10],
          tags: [{ id: 4, name: 'vaccines', slug: 'vaccines' }, { id: 14, name: 'preventive-care', slug: 'preventive-care' }],
          _embedded: {
            author: [{ name: 'Dr. Emily Watson', bio: 'Family medicine physician specializing in preventive care and immunizations' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
              alt_text: 'Adult vaccination and immunization'
            }]
          }
        },
        {
          id: 5,
          title: 'Understanding Blood Pressure Medications',
          content: '<p>High blood pressure affects millions of Americans. Here\'s a comprehensive guide to understanding your medications...</p><p>Hypertension, or high blood pressure, is often called the "silent killer" because it typically has no symptoms but can lead to serious health complications. Effective management often requires medication in addition to lifestyle changes.</p><h3>Types of Blood Pressure Medications</h3><ul><li>ACE inhibitors - help relax blood vessels</li><li>Beta-blockers - reduce heart rate and blood pressure</li><li>Diuretics - help kidneys remove sodium and water</li><li>Calcium channel blockers - prevent calcium from entering heart and blood vessel cells</li></ul><h3>Important Considerations</h3><p>Work closely with your healthcare provider to find the right medication and dosage. Regular monitoring and lifestyle modifications are key to successful blood pressure management.</p>',
          excerpt: 'Learn about different types of blood pressure medications, how they work, and what to expect when starting treatment.',
          author: 'Dr. Robert Kim',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
          modified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'understanding-blood-pressure-medications',
          link: '/blog/understanding-blood-pressure-medications',
          featured_media: {
            id: 105,
            source_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
            alt_text: 'Blood pressure monitoring and heart health'
          },
          categories: [5, 11],
          tags: [{ id: 5, name: 'blood-pressure', slug: 'blood-pressure' }, { id: 15, name: 'heart-health', slug: 'heart-health' }],
          _embedded: {
            author: [{ name: 'Dr. Robert Kim', bio: 'Cardiologist with expertise in hypertension management and cardiovascular health' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
              alt_text: 'Blood pressure monitoring and heart health'
            }]
          }
        },
        {
          id: 6,
          title: 'Diabetes Management: Lifestyle and Medication',
          content: '<p>Managing diabetes effectively requires a combination of lifestyle changes and proper medication use. Here\'s your guide...</p><p>Diabetes management is a lifelong commitment that involves monitoring blood sugar, taking medications as prescribed, and maintaining a healthy lifestyle. With proper management, people with diabetes can lead full, active lives.</p><h3>Key Components of Diabetes Management</h3><ul><li>Regular blood glucose monitoring</li><li>Healthy eating and meal planning</li><li>Regular physical activity</li><li>Medication adherence</li><li>Regular healthcare visits</li></ul><h3>Lifestyle Modifications</h3><p>Diet and exercise play crucial roles in diabetes management. Working with a diabetes educator and nutritionist can help you develop a personalized plan that fits your lifestyle.</p>',
          excerpt: 'Comprehensive guide to diabetes management, including diet, exercise, medication adherence, and blood sugar monitoring.',
          author: 'Dr. Maria Gonzalez',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
          modified: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'diabetes-management-lifestyle-medication',
          link: '/blog/diabetes-management-lifestyle-medication',
          featured_media: {
            id: 106,
            source_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
            alt_text: 'Diabetes management and healthy lifestyle'
          },
          categories: [6, 12],
          tags: [{ id: 6, name: 'diabetes', slug: 'diabetes' }, { id: 16, name: 'chronic-disease', slug: 'chronic-disease' }],
          _embedded: {
            author: [{ name: 'Dr. Maria Gonzalez', bio: 'Endocrinologist specializing in diabetes care and metabolic disorders' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
              alt_text: 'Diabetes management and healthy lifestyle'
            }]
          }
        },
        {
          id: 7,
          title: 'Mental Health and Medication: Breaking the Stigma',
          content: '<p>Mental health medications are an important part of treatment for many conditions. Understanding these medications can help reduce stigma and improve outcomes...</p><p>Mental health conditions affect millions of Americans, and medications can be an effective part of treatment. It\'s important to understand that taking medication for mental health is just as valid as taking medication for physical conditions.</p><h3>Common Mental Health Medications</h3><ul><li>Antidepressants - for depression and anxiety</li><li>Mood stabilizers - for bipolar disorder</li><li>Anti-anxiety medications - for anxiety disorders</li><li>Antipsychotics - for schizophrenia and other conditions</li></ul><h3>Important Considerations</h3><p>Mental health medications work differently for each person. It may take time to find the right medication and dosage. Regular communication with your healthcare provider is essential.</p>',
          excerpt: 'Understanding mental health medications and reducing stigma around mental health treatment.',
          author: 'Dr. James Thompson',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          modified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'mental-health-medication-stigma',
          link: '/blog/mental-health-medication-stigma',
          featured_media: {
            id: 107,
            source_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
            alt_text: 'Mental health awareness and support'
          },
          categories: [13, 14],
          tags: [{ id: 17, name: 'mental-health', slug: 'mental-health' }, { id: 18, name: 'stigma', slug: 'stigma' }],
          _embedded: {
            author: [{ name: 'Dr. James Thompson', bio: 'Psychiatrist specializing in mental health medication management' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
              alt_text: 'Mental health awareness and support'
            }]
          }
        },
        {
          id: 8,
          title: 'Pediatric Medication Safety: A Parent\'s Guide',
          content: '<p>Ensuring medication safety for children requires special considerations and careful attention to dosing and administration...</p><p>Children\'s bodies process medications differently than adults, making pediatric medication safety a critical concern for parents and caregivers. Understanding proper dosing, administration techniques, and safety measures can help prevent medication errors.</p><h3>Key Safety Principles</h3><ul><li>Always use the measuring device provided</li><li>Check dosing based on weight, not age</li><li>Store medications out of reach of children</li><li>Never share medications between children</li></ul><h3>Common Mistakes to Avoid</h3><p>Using household spoons for measurement, guessing at doses, and not completing prescribed courses of medication are common mistakes that can be dangerous for children.</p>',
          excerpt: 'Essential safety tips for administering medications to children, including proper dosing and storage.',
          author: 'Dr. Patricia Williams',
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
          modified: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'pediatric-medication-safety',
          link: '/blog/pediatric-medication-safety',
          featured_media: {
            id: 108,
            source_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop',
            alt_text: 'Child medication safety and healthcare'
          },
          categories: [15, 9],
          tags: [{ id: 19, name: 'pediatric-care', slug: 'pediatric-care' }, { id: 20, name: 'medication-safety', slug: 'medication-safety' }],
          _embedded: {
            author: [{ name: 'Dr. Patricia Williams', bio: 'Pediatrician with expertise in medication safety and child health' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&h=400&fit=crop',
              alt_text: 'Child medication safety and healthcare'
            }]
          }
        },
        {
          id: 9,
          title: 'Senior Health: Medication Management for Older Adults',
          content: '<p>As we age, our medication needs change and managing multiple medications becomes increasingly important for maintaining health and independence...</p><p>Older adults often take multiple medications, which can increase the risk of drug interactions and side effects. Proper medication management becomes crucial for maintaining health and quality of life in our senior years.</p><h3>Challenges in Senior Medication Management</h3><ul><li>Multiple medications and complex dosing schedules</li><li>Changes in how the body processes medications</li><li>Increased risk of drug interactions</li><li>Memory and cognitive challenges</li></ul><h3>Management Strategies</h3><p>Using pill organizers, maintaining an updated medication list, and regular medication reviews with healthcare providers can help ensure safe and effective medication use.</p>',
          excerpt: 'Essential strategies for managing medications safely as we age, including organization tips and safety considerations.',
          author: 'Dr. Richard Davis',
          date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
          modified: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'senior-medication-management',
          link: '/blog/senior-medication-management',
          featured_media: {
            id: 109,
            source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
            alt_text: 'Senior health and medication management'
          },
          categories: [16, 17],
          tags: [{ id: 21, name: 'senior-health', slug: 'senior-health' }, { id: 22, name: 'medication-management', slug: 'medication-management' }],
          _embedded: {
            author: [{ name: 'Dr. Richard Davis', bio: 'Geriatrician specializing in senior health and medication optimization' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
              alt_text: 'Senior health and medication management'
            }]
          }
        },
        {
          id: 10,
          title: 'COVID-19 Vaccines: What You Need to Know in 2024',
          content: '<p>COVID-19 vaccines continue to evolve, and staying up-to-date with the latest recommendations is important for protecting yourself and your community...</p><p>As we continue to live with COVID-19, vaccines remain our best defense against severe illness and hospitalization. The CDC regularly updates vaccination recommendations based on the latest research and virus variants.</p><h3>Current Recommendations</h3><ul><li>Updated vaccines for current variants</li><li>Annual vaccination for most adults</li><li>Special considerations for high-risk groups</li><li>Combination with flu vaccines</li></ul><h3>Staying Protected</h3><p>Regular vaccination, combined with other preventive measures like good hygiene and staying home when sick, helps protect both individual and community health.</p>',
          excerpt: 'Latest information on COVID-19 vaccines, including updated recommendations and safety considerations.',
          author: 'Dr. Jennifer Martinez',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          modified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'covid-19-vaccines-2024',
          link: '/blog/covid-19-vaccines-2024',
          featured_media: {
            id: 110,
            source_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
            alt_text: 'COVID-19 vaccination and public health'
          },
          categories: [4, 18],
          tags: [{ id: 23, name: 'covid-19', slug: 'covid-19' }, { id: 24, name: 'vaccines', slug: 'vaccines' }],
          _embedded: {
            author: [{ name: 'Dr. Jennifer Martinez', bio: 'Infectious disease specialist and public health expert' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop',
              alt_text: 'COVID-19 vaccination and public health'
            }]
          }
        },
        {
          id: 11,
          title: 'Heart Health: Understanding Cholesterol Medications',
          content: '<p>Cholesterol management is crucial for heart health, and medications play an important role in reducing cardiovascular risk...</p><p>High cholesterol is a major risk factor for heart disease and stroke. While lifestyle changes are important, many people also need medication to achieve optimal cholesterol levels.</p><h3>Types of Cholesterol Medications</h3><ul><li>Statins - most commonly prescribed</li><li>Bile acid sequestrants</li><li>Cholesterol absorption inhibitors</li><li>PCSK9 inhibitors</li></ul><h3>Monitoring and Management</h3><p>Regular cholesterol testing and monitoring for side effects are important when taking cholesterol medications. Your healthcare provider will help determine the best treatment approach for your individual needs.</p>',
          excerpt: 'Comprehensive guide to cholesterol medications, including how they work and what to expect.',
          author: 'Dr. Robert Kim',
          date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
          modified: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'cholesterol-medications-heart-health',
          link: '/blog/cholesterol-medications-heart-health',
          featured_media: {
            id: 111,
            source_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
            alt_text: 'Heart health and cholesterol management'
          },
          categories: [5, 11],
          tags: [{ id: 25, name: 'cholesterol', slug: 'cholesterol' }, { id: 26, name: 'heart-health', slug: 'heart-health' }],
          _embedded: {
            author: [{ name: 'Dr. Robert Kim', bio: 'Cardiologist with expertise in hypertension management and cardiovascular health' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&h=400&fit=crop',
              alt_text: 'Heart health and cholesterol management'
            }]
          }
        },
        {
          id: 12,
          title: 'Women\'s Health: Hormone Therapy and Menopause',
          content: '<p>Menopause brings significant changes to women\'s health, and hormone therapy can be an effective treatment option for managing symptoms...</p><p>Menopause affects every woman differently, and hormone therapy can help manage symptoms like hot flashes, night sweats, and bone loss. Understanding the benefits and risks is important for making informed decisions.</p><h3>Types of Hormone Therapy</h3><ul><li>Estrogen-only therapy</li><li>Combined estrogen and progesterone therapy</li><li>Local vaginal estrogen</li><li>Bioidentical hormones</li></ul><h3>Benefits and Considerations</h3><p>Hormone therapy can effectively relieve menopausal symptoms and may provide other health benefits. However, it\'s not right for everyone, and the decision should be made with careful consideration of individual health factors.</p>',
          excerpt: 'Understanding hormone therapy options for menopause management, including benefits, risks, and considerations.',
          author: 'Dr. Amanda Foster',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          modified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'hormone-therapy-menopause',
          link: '/blog/hormone-therapy-menopause',
          featured_media: {
            id: 112,
            source_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
            alt_text: 'Women\'s health and menopause support'
          },
          categories: [19, 20],
          tags: [{ id: 27, name: 'womens-health', slug: 'womens-health' }, { id: 28, name: 'menopause', slug: 'menopause' }],
          _embedded: {
            author: [{ name: 'Dr. Amanda Foster', bio: 'Gynecologist specializing in women\'s health and menopause management' }],
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=400&fit=crop',
              alt_text: 'Women\'s health and menopause support'
            }]
          }
        }
      ];

      // Add dynamic posts for fresh content
      const dynamicPosts = [];
      for (let i = 13; i <= 15; i++) {
        dynamicPosts.push(generateDynamicPost(i));
      }

      // Combine static and dynamic posts
      const allSamplePosts = [...samplePosts, ...dynamicPosts];

      // Return comprehensive sample categories
      const sampleCategories = [
        { id: 1, name: 'Allergies & Immunology', slug: 'allergies-immunology', description: 'Managing allergies and immune system health', count: 1 },
        { id: 2, name: 'Nutrition & Supplements', slug: 'nutrition-supplements', description: 'Essential nutrients and dietary supplements', count: 1 },
        { id: 3, name: 'Medication Safety', slug: 'medication-safety', description: 'Safe medication storage and administration', count: 2 },
        { id: 4, name: 'Immunizations', slug: 'immunizations', description: 'Vaccines and preventive healthcare', count: 2 },
        { id: 5, name: 'Cardiovascular Health', slug: 'cardiovascular-health', description: 'Heart health and blood pressure management', count: 2 },
        { id: 6, name: 'Diabetes Care', slug: 'diabetes-care', description: 'Diabetes management and lifestyle', count: 1 },
        { id: 7, name: 'Seasonal Health', slug: 'seasonal-health', description: 'Health tips for different seasons', count: 1 },
        { id: 8, name: 'Preventive Care', slug: 'preventive-care', description: 'Preventive healthcare and wellness', count: 1 },
        { id: 9, name: 'Pharmacy Tips', slug: 'pharmacy-tips', description: 'Expert advice from pharmacists', count: 2 },
        { id: 10, name: 'Public Health', slug: 'public-health', description: 'Community health and disease prevention', count: 1 },
        { id: 11, name: 'Heart Health', slug: 'heart-health', description: 'Cardiovascular wellness and prevention', count: 2 },
        { id: 12, name: 'Chronic Disease Management', slug: 'chronic-disease-management', description: 'Living with chronic health conditions', count: 1 },
        { id: 13, name: 'Mental Health', slug: 'mental-health', description: 'Mental wellness and medication support', count: 1 },
        { id: 14, name: 'Healthcare Stigma', slug: 'healthcare-stigma', description: 'Breaking down barriers to care', count: 1 },
        { id: 15, name: 'Pediatric Care', slug: 'pediatric-care', description: 'Children\'s health and medication safety', count: 1 },
        { id: 16, name: 'Senior Health', slug: 'senior-health', description: 'Health and wellness for older adults', count: 1 },
        { id: 17, name: 'Medication Management', slug: 'medication-management', description: 'Organizing and managing multiple medications', count: 1 },
        { id: 18, name: 'Infectious Diseases', slug: 'infectious-diseases', description: 'Preventing and managing infectious diseases', count: 1 },
        { id: 19, name: 'Women\'s Health', slug: 'womens-health', description: 'Health issues specific to women', count: 1 },
        { id: 20, name: 'Menopause', slug: 'menopause', description: 'Menopause management and hormone therapy', count: 1 }
      ];

      return res.json({ 
        posts: allSamplePosts, 
        categories: sampleCategories,
        pagination: { 
          page: parseInt(page.toString()), 
          per_page: parseInt(per_page.toString()), 
          total: allSamplePosts.length, 
          total_pages: Math.ceil(allSamplePosts.length / parseInt(per_page.toString()))
        } 
      });
    } else {
      // Return real WordPress data
      console.log('✅ Returning real WordPress data');
      return res.json(realWordPressData);
    }

    // Build query parameters
    const params: Record<string, unknown> = {
      page: parseInt(page.toString()),
      per_page: parseInt(per_page.toString()),
      _embed: true
    };

    if (category) params.categories = category;
    if (search) params.search = search;
    if (featured === 'true') params.sticky = true;

    // Fetch from WordPress API
    const response = await makeWordPressRequest(
      '/posts',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      params,
      settings
    );

    if (!response) {
      throw new Error('No response received from WordPress API');
    }

    const posts = await response.json();
    const totalPosts = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');

    // Ensure posts is an array
    if (!Array.isArray(posts)) {
      console.error('WordPress API returned non-array posts:', posts);
      throw new Error('Invalid response format from WordPress API');
    }

    const result = {
      posts: posts.map((post: unknown) => ({
        id: getPostProperty(post, 'id', 0),
        title: (getPostProperty(post, 'title', {}) as any)?.rendered || getPostProperty(post, 'title', ''),
        content: (getPostProperty(post, 'content', {}) as any)?.rendered || getPostProperty(post, 'content', ''),
        excerpt: (getPostProperty(post, 'excerpt', {}) as any)?.rendered || getPostProperty(post, 'excerpt', ''),
        author: getPostProperty(post, 'author', 'WordPress Admin'),
        date: getPostProperty(post, 'date', ''),
        modified: getPostProperty(post, 'modified', ''),
        slug: getPostProperty(post, 'slug', ''),
        link: getPostProperty(post, 'link', ''),
        featured_media: getPostProperty(post, 'featured_media', 0),
        categories: getPostProperty(post, 'categories', []),
        tags: getPostProperty(post, 'tags', []),
        _embedded: getPostProperty(post, '_embedded', {})
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
  } catch (err: unknown) {
    console.error('Error fetching posts:', err);
    // Return empty posts instead of error for better UX
    res.json({ posts: [], pagination: { total: 0, pages: 0 } });
  }
});

// Public endpoint to get a post by ID (for frontend)
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await prisma.wordPressSettings.findUnique({ where: { id: 1 } });
    
    if (!settings || !settings.enabled) {
      // Return sample blog post for development/demo purposes
      const samplePost = {
        id: parseInt(id),
        title: { rendered: 'Managing Seasonal Allergies: A Complete Guide' },
        content: { rendered: '<p>Spring and fall bring beautiful weather, but for many people, they also bring seasonal allergies. Here\'s how to manage your symptoms effectively...</p><p>Seasonal allergies, also known as hay fever or allergic rhinitis, affect millions of people worldwide. The symptoms can range from mild to severe and can significantly impact your quality of life.</p><h3>Common Symptoms</h3><ul><li>Sneezing</li><li>Runny or stuffy nose</li><li>Itchy eyes, nose, or throat</li><li>Watery eyes</li><li>Coughing</li></ul><h3>Treatment Options</h3><p>There are several effective treatments available for seasonal allergies, including over-the-counter and prescription medications, as well as lifestyle changes that can help reduce symptoms.</p>' },
        excerpt: { rendered: 'Learn effective strategies for managing seasonal allergies, including medication options, lifestyle changes, and prevention tips.' },
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        slug: 'managing-seasonal-allergies',
        link: '/blog/managing-seasonal-allergies',
        author: 1,
        categories: [1],
        tags: [1],
        featured_media: 0
      };
      return res.json({ post: samplePost });
    }
    
    const response = await fetch(`${settings.siteUrl}/wp-json/wp/v2/posts/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = await response.json();
    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post', details: isErrorWithMessage(error) ? error.message : 'Unknown error' });
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

    // Always try to fetch from real WordPress first, even if settings are not configured
    let realWordPressCategories = null;
    
    try {
      console.log('🔄 Attempting to fetch real WordPress categories...');
      
      // Try to get WordPress data from environment variables or settings
      let wpUrl, wpUsername, wpAppPassword;
      
      if (settings && settings.enabled) {
        wpUrl = settings.siteUrl;
        wpUsername = settings.username;
        wpAppPassword = settings.applicationPassword;
        console.log('📝 Using WordPress settings from database for categories');
      } else {
        wpUrl = process.env.WORDPRESS_URL || process.env.VITE_WORDPRESS_URL;
        wpUsername = process.env.WORDPRESS_USERNAME;
        wpAppPassword = process.env.WORDPRESS_APP_PASSWORD || process.env.WORDPRESS_PASSWORD;
        console.log('📝 Using WordPress environment variables for categories');
      }

      if (wpUrl && wpUsername && wpAppPassword) {
        console.log('📝 WordPress credentials found, attempting real API call for categories...');
        
        // Make real WordPress API request for categories
    const response = await makeWordPressRequest(
      '/categories',
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      { per_page: 100 },
          { siteUrl: wpUrl, username: wpUsername, applicationPassword: wpAppPassword }
        );

        if (response && response.ok) {
          const categories = await response.json();

          if (Array.isArray(categories) && categories.length > 0) {
            console.log('✅ Successfully fetched real WordPress categories:', categories.length);
            
            realWordPressCategories = {
              categories: categories.map((category: unknown) => ({
                id: getCategoryProperty(category, 'id', 0),
                name: getCategoryProperty(category, 'name', ''),
                slug: getCategoryProperty(category, 'slug', ''),
                description: getCategoryProperty(category, 'description', ''),
                count: getCategoryProperty(category, 'count', 0)
              }))
            };
          }
        }
      } else {
        console.log('⚠️ WordPress credentials not found in settings or environment variables for categories');
      }
    } catch (error) {
      console.error('❌ Failed to fetch real WordPress categories:', isErrorWithMessage(error) ? error.message : 'Unknown error');
    }

    // Only use sample data if real WordPress data is not available
    if (!realWordPressCategories) {
      console.log('📝 Using sample categories as fallback');
      
      // Return sample categories for development/demo purposes
      const sampleCategories = [
        { id: 1, name: 'Seasonal Health', slug: 'seasonal-health', count: 1 },
        { id: 2, name: 'Nutrition', slug: 'nutrition', count: 1 },
        { id: 3, name: 'Medication Safety', slug: 'medication-safety', count: 1 },
        { id: 4, name: 'Preventive Care', slug: 'preventive-care', count: 1 },
        { id: 5, name: 'Cardiovascular Health', slug: 'cardiovascular-health', count: 1 },
        { id: 6, name: 'Chronic Conditions', slug: 'chronic-conditions', count: 1 }
      ];
      return res.json({ categories: sampleCategories });
    } else {
      // Return real WordPress categories
      console.log('✅ Returning real WordPress categories');
      return res.json(realWordPressCategories);
    }
  } catch (err: unknown) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: process.env.NODE_ENV === 'development' ? (err instanceof Error ? err.message : 'Unknown error') : undefined
    });
  }
});

// Serve uploaded WordPress media files
router.get('/uploads/wordpress-media/:filename', (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads/wordpress-media', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set appropriate headers
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  };
  
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error('Error streaming file:', err);
    res.status(500).json({ error: 'Error streaming file' });
  });
});

export default router; 