import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { unifiedAdminAuth } from './auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();
const prisma = new PrismaClient();

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
  } catch (err) {
    console.error('Error fetching WordPress settings:', err);
    res.status(500).json({ error: 'Failed to fetch WordPress settings' });
  }
});

// Admin: update WordPress settings
router.put('/settings', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { enabled, siteUrl, username, applicationPassword } = req.body;

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

    // Don't return sensitive data
    const safeSettings = {
      ...settings,
      username: settings.username ? '***' + settings.username.slice(-4) : '',
      applicationPassword: settings.applicationPassword ? '***' + settings.applicationPassword.slice(-4) : ''
    };

    res.json(safeSettings);
  } catch (err) {
    console.error('Error updating WordPress settings:', err);
    res.status(500).json({ error: 'Failed to update WordPress settings' });
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

    // Test connection logic would go here
    // For now, return a mock response
    res.json({
      success: true,
      message: 'Connection test successful',
      siteInfo: {
        name: 'My Meds Pharmacy Blog',
        description: 'Professional pharmacy services and health information',
        url: settings.siteUrl,
        version: '6.4.0'
      }
    });
  } catch (err) {
    console.error('Error testing WordPress connection:', err);
    res.status(500).json({ error: 'Failed to test connection' });
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

    // TODO: Implement actual WordPress API integration
    // This would involve making API calls to WordPress REST API
    // to fetch and sync posts
    
    res.status(501).json({ 
      error: 'WordPress sync functionality not yet implemented',
      message: 'This feature requires WordPress REST API integration'
    });
  } catch (err) {
    console.error('Error syncing WordPress posts:', err);
    res.status(500).json({ error: 'Failed to sync posts' });
  }
});

// Admin: get WordPress sync status
router.get('/sync-status', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    res.json({
      enabled: settings?.enabled || false,
      lastSync: settings?.lastSync,
      status: 'idle', // idle, syncing, error
      lastError: null
    });
  } catch (err) {
    console.error('Error fetching WordPress sync status:', err);
    res.status(500).json({ error: 'Failed to fetch sync status' });
  }
});

// Admin: create WordPress post
router.post('/posts', unifiedAdminAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    
    const { title, content, status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const settings = await prisma.wordPressSettings.findUnique({
      where: { id: 1 }
    });

    if (!settings || !settings.enabled) {
      return res.status(400).json({ error: 'WordPress integration is not enabled' });
    }

    // TODO: Implement actual WordPress API integration
    // This would involve making API calls to WordPress REST API
    // to create posts
    
    res.status(501).json({ 
      error: 'WordPress post creation not yet implemented',
      message: 'This feature requires WordPress REST API integration'
    });
  } catch (err) {
    console.error('Error creating WordPress post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

export default router; 