import express from 'express';
import { Request, Response } from 'express';
import { secureAdminAuthMiddleware } from '../services/SecureAdminAuth';

const router = express.Router();

// Monitoring dashboard (admin only)
router.get('/dashboard', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const os = require('os');
    const { getSystemStats } = require('../../scripts/monitor-system');
    const { checkDatabaseHealth } = require('../../scripts/monitor-database');
    
    const [systemStats, dbHealth] = await Promise.all([
      getSystemStats(),
      checkDatabaseHealth()
    ]);
    
    const monitoringData = {
      system: systemStats,
      database: dbHealth,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json(monitoringData);
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    res.status(500).json({ error: 'Failed to load monitoring data' });
  }
});

// Log viewer (admin only)
router.get('/logs', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.json({ logs: [] });
    }
    
    const files = fs.readdirSync(logsDir)
      .filter((file: string) => file.endsWith('.log'))
      .map((file: string) => ({
        name: file,
        size: fs.statSync(path.join(logsDir, file)).size,
        modified: fs.statSync(path.join(logsDir, file)).mtime
      }));
    
    res.json({ logs: files });
  } catch (error) {
    console.error('Log viewer error:', error);
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

// System health check (admin only)
router.get('/health', secureAdminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { getSystemStats } = require('../../scripts/monitor-system');
    const { checkDatabaseHealth } = require('../../scripts/monitor-database');
    
    const [systemStats, dbHealth] = await Promise.all([
      getSystemStats(),
      checkDatabaseHealth()
    ]);
    
    const healthStatus = {
      status: 'healthy',
      system: systemStats,
      database: dbHealth,
      timestamp: new Date().toISOString()
    };
    
    // Check for warnings
    if (systemStats.memory.usagePercent > 80) {
      healthStatus.status = 'warning';
    }
    
    if (dbHealth.status !== 'healthy') {
      healthStatus.status = 'degraded';
    }
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
