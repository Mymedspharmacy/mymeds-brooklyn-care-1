# Monitoring and Backup Strategy for MyMeds Pharmacy

## Overview
This guide provides comprehensive monitoring and backup strategies to ensure your MyMeds Pharmacy application runs reliably in production.

## 1. Application Monitoring

### 1.1 Health Check Endpoints

Your application already has health check endpoints. Let's enhance them:

#### Enhanced Health Check Implementation
Update `backend/src/index.ts`:

```typescript
// Enhanced Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: 'unknown',
      memory: 'unknown',
      disk: 'unknown'
    }
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.checks.database = 'healthy';
  } catch (error) {
    healthStatus.checks.database = 'unhealthy';
    healthStatus.status = 'degraded';
  }

  // Memory usage check
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };

  if (memUsageMB.heapUsed > 500) { // 500MB threshold
    healthStatus.checks.memory = 'warning';
  } else {
    healthStatus.checks.memory = 'healthy';
  }

  healthStatus.responseTime = Date.now() - startTime;
  
  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Detailed Database Health Check
app.get('/api/health/db', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test database connection
    await prisma.$connect();
    
    // Check table counts
    const [users, orders, prescriptions] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.prescription.count()
    ]);
    
    const dbStatus = {
      status: 'healthy',
      connection: 'connected',
      responseTime: Date.now() - startTime,
      tableCounts: {
        users,
        orders,
        prescriptions
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(dbStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});
```

### 1.2 Application Performance Monitoring

#### Install Monitoring Dependencies
```bash
cd backend
npm install winston winston-daily-rotate-file express-status-monitor
```

#### Enhanced Logging Configuration
Create `backend/src/utils/logger.ts`:

```typescript
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Console logging
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Daily rotating file for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Daily rotating file for all logs
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

export default logger;
```

#### Performance Monitoring Middleware
Update `backend/src/index.ts`:

```typescript
import statusMonitor from 'express-status-monitor';
import logger from './utils/logger';

// Status monitoring
app.use(statusMonitor({
  title: 'MyMeds Pharmacy Status',
  path: '/status',
  spans: [{
    interval: 1,
    retention: 60
  }, {
    interval: 5,
    retention: 60
  }, {
    interval: 15,
    retention: 60
  }]
}));

// Enhanced logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
});
```

### 1.3 Error Monitoring

#### Global Error Handler Enhancement
Update the error handler in `backend/src/index.ts`:

```typescript
// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Don't expose internal errors in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  res.status(500).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
});
```

## 2. Database Monitoring and Backup

### 2.1 Database Backup Strategy

#### Automated Database Backup Script
Create `backend/scripts/backup-database.js`:

```javascript
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

// Extract database connection details
const url = new URL(DATABASE_URL);
const host = url.hostname;
const port = url.port || 5432;
const database = url.pathname.slice(1);
const username = url.username;
const password = url.password;

const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f ${backupFile}`;

console.log('Starting database backup...');

exec(pgDumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup failed:', error);
    process.exit(1);
  }
  
  console.log('Backup completed successfully:', backupFile);
  
  // Clean up old backups (keep last 7 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const oldFiles = files
    .filter(file => file.startsWith('backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .slice(7);
    
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old backup:', file.name);
  });
});
```

#### Backup Cron Job
Add to crontab:

```bash
# Daily database backup at 2 AM
0 2 * * * cd /path/to/mymeds-brooklyn-care/backend && node scripts/backup-database.js

# Weekly full backup on Sunday at 3 AM
0 3 * * 0 cd /path/to/mymeds-brooklyn-care/backend && node scripts/backup-database.js
```

### 2.2 Database Monitoring

#### Database Health Monitoring Script
Create `backend/scripts/monitor-database.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const logger = require('../src/utils/logger').default;

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    // Test connection
    await prisma.$connect();
    
    // Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY tablename, attname;
    `;
    
    // Check for long-running queries
    const longQueries = await prisma.$queryRaw`
      SELECT 
        pid,
        now() - pg_stat_activity.query_start AS duration,
        query
      FROM pg_stat_activity
      WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
      AND state = 'active';
    `;
    
    const healthStatus = {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      tableStats: tableSizes,
      longQueries: longQueries.length,
      timestamp: new Date().toISOString()
    };
    
    if (longQueries.length > 0) {
      healthStatus.status = 'warning';
      logger.warn('Long running queries detected', { longQueries });
    }
    
    logger.info('Database health check', healthStatus);
    return healthStatus;
    
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return { status: 'unhealthy', error: error.message };
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  checkDatabaseHealth()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { checkDatabaseHealth };
```

## 3. System Monitoring

### 3.1 System Resource Monitoring

#### System Monitoring Script
Create `backend/scripts/monitor-system.js`:

```javascript
const os = require('os');
const fs = require('fs');
const logger = require('../src/utils/logger').default;

function getSystemStats() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem) * 100;
  
  const cpuUsage = os.loadavg();
  const uptime = os.uptime();
  
  // Disk usage (Linux/Unix)
  let diskUsage = null;
  try {
    const df = require('child_process').execSync('df -h /').toString();
    const lines = df.split('\n');
    const diskLine = lines[1].split(/\s+/);
    diskUsage = {
      total: diskLine[1],
      used: diskLine[2],
      available: diskLine[3],
      usagePercent: diskLine[4]
    };
  } catch (error) {
    // Windows or error
    diskUsage = { error: 'Unable to get disk usage' };
  }
  
  const stats = {
    memory: {
      total: Math.round(totalMem / 1024 / 1024),
      used: Math.round(usedMem / 1024 / 1024),
      free: Math.round(freeMem / 1024 / 1024),
      usagePercent: Math.round(memUsagePercent)
    },
    cpu: {
      load1: cpuUsage[0],
      load5: cpuUsage[1],
      load15: cpuUsage[2]
    },
    uptime,
    disk: diskUsage,
    timestamp: new Date().toISOString()
  };
  
  // Log warnings for high resource usage
  if (memUsagePercent > 80) {
    logger.warn('High memory usage detected', { memory: stats.memory });
  }
  
  if (cpuUsage[0] > os.cpus().length) {
    logger.warn('High CPU load detected', { cpu: stats.cpu });
  }
  
  return stats;
}

// Run monitoring
function startMonitoring() {
  setInterval(() => {
    const stats = getSystemStats();
    logger.info('System stats', stats);
  }, 60000); // Every minute
}

// Run if called directly
if (require.main === module) {
  startMonitoring();
}

module.exports = { getSystemStats, startMonitoring };
```

### 3.2 Process Monitoring

#### PM2 Configuration
Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'mymeds-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 8000
  }]
};
```

## 4. Alerting and Notifications

### 4.1 Email Alerts

#### Alert Service
Create `backend/src/services/alertService.ts`:

```typescript
import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface AlertConfig {
  type: 'error' | 'warning' | 'info';
  subject: string;
  message: string;
  data?: any;
}

class AlertService {
  private transporter: nodemailer.Transporter;
  
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  async sendAlert(config: AlertConfig) {
    try {
      const emailContent = `
        <h2>MyMeds Pharmacy Alert</h2>
        <p><strong>Type:</strong> ${config.type}</p>
        <p><strong>Subject:</strong> ${config.subject}</p>
        <p><strong>Message:</strong> ${config.message}</p>
        ${config.data ? `<pre>${JSON.stringify(config.data, null, 2)}</pre>` : ''}
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `;
      
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ALERT_EMAIL || process.env.SMTP_USER,
        subject: `[MyMeds Alert] ${config.subject}`,
        html: emailContent
      });
      
      logger.info('Alert sent successfully', config);
    } catch (error) {
      logger.error('Failed to send alert', { error: error.message, config });
    }
  }
  
  async sendErrorAlert(error: Error, context?: string) {
    await this.sendAlert({
      type: 'error',
      subject: 'Application Error',
      message: error.message,
      data: {
        stack: error.stack,
        context
      }
    });
  }
  
  async sendSystemAlert(message: string, data?: any) {
    await this.sendAlert({
      type: 'warning',
      subject: 'System Alert',
      message,
      data
    });
  }
}

export default new AlertService();
```

### 4.2 Slack/Discord Integration

#### Webhook Alert Service
Create `backend/src/services/webhookAlertService.ts`:

```typescript
import axios from 'axios';
import logger from '../utils/logger';

interface WebhookAlert {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  data?: any;
}

class WebhookAlertService {
  private webhookUrl: string;
  
  constructor() {
    this.webhookUrl = process.env.WEBHOOK_URL || '';
  }
  
  async sendAlert(alert: WebhookAlert) {
    if (!this.webhookUrl) {
      logger.warn('Webhook URL not configured');
      return;
    }
    
    try {
      const payload = {
        embeds: [{
          title: alert.title,
          description: alert.message,
          color: this.getColor(alert.type),
          fields: alert.data ? Object.entries(alert.data).map(([key, value]) => ({
            name: key,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            inline: true
          })) : [],
          timestamp: new Date().toISOString()
        }]
      };
      
      await axios.post(this.webhookUrl, payload);
      logger.info('Webhook alert sent', alert);
    } catch (error) {
      logger.error('Failed to send webhook alert', { error: error.message, alert });
    }
  }
  
  private getColor(type: string): number {
    switch (type) {
      case 'error': return 0xFF0000; // Red
      case 'warning': return 0xFFA500; // Orange
      case 'info': return 0x0000FF; // Blue
      default: return 0x808080; // Gray
    }
  }
}

export default new WebhookAlertService();
```

## 5. Backup Strategy

### 5.1 File Backup Strategy

#### File Backup Script
Create `backend/scripts/backup-files.js`:

```javascript
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const BACKUP_DIR = path.join(__dirname, '../backups/files');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const LOGS_DIR = path.join(__dirname, '../logs');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `files-backup-${timestamp}.zip`);

const output = fs.createWriteStream(backupFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('File backup completed:', backupFile);
  console.log('Total size:', archive.pointer() + ' bytes');
  
  // Clean up old backups (keep last 7 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const oldFiles = files
    .filter(file => file.startsWith('files-backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .slice(7);
    
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old backup:', file.name);
  });
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Add uploads directory
if (fs.existsSync(UPLOADS_DIR)) {
  archive.directory(UPLOADS_DIR, 'uploads');
}

// Add logs directory
if (fs.existsSync(LOGS_DIR)) {
  archive.directory(LOGS_DIR, 'logs');
}

archive.finalize();
```

### 5.2 Environment Backup

#### Environment Backup Script
Create `backend/scripts/backup-env.js`:

```javascript
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups/env');
const ENV_FILE = path.join(__dirname, '../.env');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `env-backup-${timestamp}.env`);

if (fs.existsSync(ENV_FILE)) {
  fs.copyFileSync(ENV_FILE, backupFile);
  console.log('Environment backup completed:', backupFile);
  
  // Clean up old backups (keep last 30 days)
  const files = fs.readdirSync(BACKUP_DIR);
  const oldFiles = files
    .filter(file => file.startsWith('env-backup-'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)
    .slice(30);
    
  oldFiles.forEach(file => {
    fs.unlinkSync(file.path);
    console.log('Deleted old env backup:', file.name);
  });
} else {
  console.log('No .env file found to backup');
}
```

## 6. Monitoring Dashboard

### 6.1 Simple Monitoring Dashboard
Create `backend/src/routes/monitoring.ts`:

```typescript
import express from 'express';
import { adminAuthMiddleware } from '../adminAuth';
import logger from '../utils/logger';

const router = express.Router();

// Monitoring dashboard (admin only)
router.get('/dashboard', adminAuthMiddleware, async (req, res) => {
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
    logger.error('Monitoring dashboard error', { error: error.message });
    res.status(500).json({ error: 'Failed to load monitoring data' });
  }
});

// Log viewer (admin only)
router.get('/logs', adminAuthMiddleware, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(__dirname, '../../logs');
    
    if (!fs.existsSync(logsDir)) {
      return res.json({ logs: [] });
    }
    
    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.log'))
      .map(file => ({
        name: file,
        size: fs.statSync(path.join(logsDir, file)).size,
        modified: fs.statSync(path.join(logsDir, file)).mtime
      }));
    
    res.json({ logs: files });
  } catch (error) {
    logger.error('Log viewer error', { error: error.message });
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

export default router;
```

## 7. Deployment Scripts

### 7.1 Production Deployment Script
Create `backend/scripts/deploy-production.sh`:

```bash
#!/bin/bash

echo "Starting production deployment..."

# Stop current application
pm2 stop mymeds-backend || true

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Build application
npm run build

# Start application
pm2 start ecosystem.config.js --env production

# Check health
sleep 10
curl -f http://localhost:4000/api/health || exit 1

echo "Production deployment completed successfully!"
```

### 7.2 Backup Before Deployment
Create `backend/scripts/pre-deploy-backup.sh`:

```bash
#!/bin/bash

echo "Creating pre-deployment backup..."

# Create backup directory
mkdir -p backups/pre-deploy

# Database backup
node scripts/backup-database.js

# File backup
node scripts/backup-files.js

# Environment backup
node scripts/backup-env.js

echo "Pre-deployment backup completed!"
```

## 8. Environment Variables for Monitoring

Add these to your `.env` file:

```env
# Monitoring Configuration
LOG_LEVEL=info
ALERT_EMAIL=admin@mymedspharmacyinc.com
WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Backup Configuration
BACKUP_RETENTION_DAYS=7
BACKUP_RETENTION_WEEKS=4

# Monitoring Thresholds
MEMORY_WARNING_THRESHOLD=80
CPU_WARNING_THRESHOLD=80
DISK_WARNING_THRESHOLD=85
```

## 9. Monitoring Checklist

- [ ] Health check endpoints implemented
- [ ] Logging system configured
- [ ] Database backup script created
- [ ] File backup script created
- [ ] System monitoring implemented
- [ ] Alert system configured
- [ ] Monitoring dashboard created
- [ ] PM2 configuration set up
- [ ] Cron jobs configured
- [ ] Environment variables set
- [ ] Pre-deployment backup script created
- [ ] Production deployment script created
- [ ] SSL certificate monitoring configured
- [ ] Database performance monitoring active
- [ ] Error tracking implemented
- [ ] Resource usage alerts configured
- [ ] Backup retention policy defined
- [ ] Recovery procedures documented
- [ ] Monitoring dashboard accessible
- [ ] Alert notifications tested

## 10. Next Steps

1. Install required dependencies
2. Configure monitoring scripts
3. Set up cron jobs
4. Test alert systems
5. Configure backup retention
6. Set up monitoring dashboard
7. Test recovery procedures
8. Document monitoring procedures
9. Train team on monitoring tools
10. Set up automated reporting
