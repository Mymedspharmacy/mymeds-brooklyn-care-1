import { Router, Request, Response } from 'express';
import { unifiedAdminAuth } from './auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

interface AuthRequest extends Request {
  user?: any;
}

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

const setCachedPosts = (key: string, data: any) => {
  postCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const clearPostCache = () => {
  postCache.clear();
};

// Enhanced error handling with retry logic for production
const makeWordPressRequest = async (url: string, options: any = {}, params: any = {}) => {
  // Validate required environment variables for production
  if (!process.env.WORDPRESS_APP_PASSWORD || !process.env.WORDPRESS_URL || !process.env.WORDPRESS_USERNAME) {
    throw new Error('WordPress credentials not configured. Please set WORDPRESS_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD environment variables.');
  }

  // Real WordPress API request
  console.log('📝 Making real WordPress API request to:', url);
  const retries = 3; // Default number of retries
  for (let i = 0; i < retries; i++) {
    try {
      // Use environment variables for authentication
      const wpUrl = process.env.WORDPRESS_URL;
      const wpUsername = process.env.WORDPRESS_USERNAME;
      const wpAppPassword = process.env.WORDPRESS_APP_PASSWORD;

      if (!wpUrl || !wpUsername || !wpAppPassword) {
        throw new Error('WordPress credentials not found in environment variables');
      }

      // Build URL with query parameters if provided
      let requestUrl = url;
      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        requestUrl = `${wpUrl}/wp-json/wp/v2${url}?${queryString}`;
      } else {
        requestUrl = `${wpUrl}/wp-json/wp/v2${url}`;
      }
      
      // Create basic auth header
      const auth = Buffer.from(`${wpUsername}:${wpAppPassword}`).toString('base64');
      
      console.log('📝 WordPress API URL:', requestUrl);
      const response = await fetch(requestUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
          ...options.headers,
        },
      });
      
      return response;
    } catch (error) {
      if (i === retries - 1) {
        console.error('📝 WordPress API failed after', retries, 'attempts:', error.message);
        throw new Error(`WordPress API request failed: ${error.message}`);
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

    let mediaData: any;
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
        id: mediaData.id,
        title: mediaData.title?.rendered || mediaData.title || '',
        description: mediaData.description?.rendered || mediaData.description || '',
        caption: mediaData.caption?.rendered || mediaData.caption || '',
        alt_text: mediaData.alt_text || '',
        source_url: mediaData.source_url || sourceUrl,
        link: mediaData.link,
        mime_type: mediaData.mime_type,
        media_type: mediaData.media_type,
        date: mediaData.date,
        modified: mediaData.modified
      }
    });
  } catch (err: any) {
    console.error('Error uploading media to WordPress:', err);
    
    // Clean up uploaded file if it exists and there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
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
      // Return sample blog posts for development/demo purposes
      const samplePosts = [
        {
          id: 1,
          title: 'Managing Seasonal Allergies: A Complete Guide',
          content: '<p>Spring and fall bring beautiful weather, but for many people, they also bring seasonal allergies. Here\'s how to manage your symptoms effectively...</p>',
          excerpt: 'Learn effective strategies for managing seasonal allergies, including medication options, lifestyle changes, and prevention tips.',
          author: 'Dr. Sarah Johnson',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          modified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'managing-seasonal-allergies',
          link: '/blog/managing-seasonal-allergies',
          featured_media: null,
          categories: [1],
          tags: [{ id: 1, name: 'allergies', slug: 'allergies' }],
          _embedded: null
        },
        {
          id: 2,
          title: 'Vitamin D: The Sunshine Vitamin and Your Health',
          content: '<p>Vitamin D plays a crucial role in bone health, immune function, and overall well-being. Here\'s what you need to know...</p>',
          excerpt: 'Understanding the importance of Vitamin D, how to get enough through diet and sunlight, and when supplementation may be necessary.',
          author: 'Dr. Michael Chen',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          modified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'vitamin-d-sunshine-vitamin',
          link: '/blog/vitamin-d-sunshine-vitamin',
          featured_media: null,
          categories: [2],
          tags: [{ id: 2, name: 'vitamin-d', slug: 'vitamin-d' }],
          _embedded: null
        },
        {
          id: 3,
          title: 'Proper Medication Storage: Essential Safety Tips',
          content: '<p>Storing medications correctly is crucial for maintaining their effectiveness and ensuring safety. Here are the key guidelines...</p>',
          excerpt: 'Essential tips for safe medication storage at home, including temperature control, humidity management, and child safety measures.',
          author: 'Pharmacist Lisa Rodriguez',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          modified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'proper-medication-storage',
          link: '/blog/proper-medication-storage',
          featured_media: null,
          categories: [3],
          tags: [{ id: 3, name: 'medication-safety', slug: 'medication-safety' }],
          _embedded: null
        },
        {
          id: 4,
          title: 'Adult Immunization Schedule: Stay Protected',
          content: '<p>Vaccines aren\'t just for children. Adults need immunizations too to stay protected against serious diseases...</p>',
          excerpt: 'Complete guide to adult immunizations, including recommended vaccines, schedules, and special considerations for different age groups.',
          author: 'Dr. Emily Watson',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
          modified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'adult-immunization-schedule',
          link: '/blog/adult-immunization-schedule',
          featured_media: null,
          categories: [4],
          tags: [{ id: 4, name: 'vaccines', slug: 'vaccines' }],
          _embedded: null
        },
        {
          id: 5,
          title: 'Understanding Blood Pressure Medications',
          content: '<p>High blood pressure affects millions of Americans. Here\'s a comprehensive guide to understanding your medications...</p>',
          excerpt: 'Learn about different types of blood pressure medications, how they work, and what to expect when starting treatment.',
          author: 'Dr. Robert Kim',
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
          modified: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'understanding-blood-pressure-medications',
          link: '/blog/understanding-blood-pressure-medications',
          featured_media: null,
          categories: [5],
          tags: [{ id: 5, name: 'blood-pressure', slug: 'blood-pressure' }],
          _embedded: null
        },
        {
          id: 6,
          title: 'Diabetes Management: Lifestyle and Medication',
          content: '<p>Managing diabetes effectively requires a combination of lifestyle changes and proper medication use. Here\'s your guide...</p>',
          excerpt: 'Comprehensive guide to diabetes management, including diet, exercise, medication adherence, and blood sugar monitoring.',
          author: 'Dr. Maria Gonzalez',
          date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks ago
          modified: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          slug: 'diabetes-management-lifestyle-medication',
          link: '/blog/diabetes-management-lifestyle-medication',
          featured_media: null,
          categories: [6],
          tags: [{ id: 6, name: 'diabetes', slug: 'diabetes' }],
          _embedded: null
        }
      ];

      return res.json({ 
        posts: samplePosts, 
        pagination: { 
          page: parseInt(page.toString()), 
          per_page: parseInt(per_page.toString()), 
          total: samplePosts.length, 
          total_pages: Math.ceil(samplePosts.length / parseInt(per_page.toString()))
        } 
      });
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
      '/posts',
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

    // Ensure posts is an array
    if (!Array.isArray(posts)) {
      console.error('WordPress API returned non-array posts:', posts);
      throw new Error('Invalid response format from WordPress API');
    }

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
      return res.status(404).json({ error: 'WordPress integration is not enabled' });
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
    res.status(500).json({ error: 'Failed to fetch post', details: error.message });
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
    }

    // Fetch from WordPress API
    const response = await makeWordPressRequest(
      '/categories',
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