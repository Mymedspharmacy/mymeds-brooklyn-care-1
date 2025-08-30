import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface IntegrationHealth {
  service: 'woocommerce' | 'wordpress';
  status: 'healthy' | 'warning' | 'error' | 'offline';
  lastSync: Date | null;
  lastError: string | null;
  syncCount: number;
  errorCount: number;
  responseTime: number;
  cacheStatus: 'active' | 'empty' | 'expired';
  recommendations: string[];
  performance: {
    avgResponseTime: number;
    successRate: number;
    cacheHitRate: number;
    syncFrequency: number;
  };
}

export interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncDuration: number;
  dataVolume: number;
  performance: {
    apiCallsPerHour: number;
    dataTransferMB: number;
    errorRate: number;
    uptime: number;
  };
}

export interface InventoryMetrics {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
  stockTurnoverRate: number;
  categoryDistribution: any[];
  stockAlerts: any[];
}

export interface OrderMetrics {
  totalOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  topSellingProducts: any[];
  orderStatusDistribution: any[];
}

export class IntegrationMonitorService {
  private static instance: IntegrationMonitorService;
  private healthChecks: Map<string, IntegrationHealth> = new Map();
  private metrics: Map<string, SyncMetrics> = new Map();
  private inventoryMetrics: Map<string, InventoryMetrics> = new Map();
  private orderMetrics: Map<string, OrderMetrics> = new Map();
  private performanceHistory: Map<string, any[]> = new Map();

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): IntegrationMonitorService {
    if (!IntegrationMonitorService.instance) {
      IntegrationMonitorService.instance = new IntegrationMonitorService();
    }
    return IntegrationMonitorService.instance;
  }

  private async initializeMonitoring() {
    // Start periodic health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Start metrics collection
    setInterval(() => {
      this.collectMetrics();
    }, 15 * 60 * 1000); // Every 15 minutes

    // Start inventory monitoring
    setInterval(() => {
      this.collectInventoryMetrics();
    }, 30 * 60 * 1000); // Every 30 minutes

    // Start order monitoring
    setInterval(() => {
      this.collectOrderMetrics();
    }, 60 * 60 * 1000); // Every hour

    logger.info('Enhanced integration monitoring service initialized');
  }

  public async performHealthChecks(): Promise<void> {
    try {
      await this.checkWooCommerceHealth();
      await this.checkWordPressHealth();
      logger.info('Enhanced health checks completed');
    } catch (error) {
      logger.error('Error performing health checks:', error);
    }
  }

  private async checkWooCommerceHealth(): Promise<void> {
    try {
      const settings = await prisma.wooCommerceSettings.findUnique({
        where: { id: 1 }
      });

      if (!settings || !settings.enabled) {
        this.healthChecks.set('woocommerce', {
          service: 'woocommerce',
          status: 'offline',
          lastSync: null,
          lastError: null,
          syncCount: 0,
          errorCount: 0,
          responseTime: 0,
          cacheStatus: 'empty',
          recommendations: ['Enable WooCommerce integration to start monitoring'],
          performance: {
            avgResponseTime: 0,
            successRate: 0,
            cacheHitRate: 0,
            syncFrequency: 0
          }
        });
        return;
      }

      // Test connection with performance measurement
      const startTime = Date.now();
      let responseTime = 0;
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let recommendations: string[] = [];

      try {
        const response = await fetch(`${settings.storeUrl}/wp-json/wc/v3/products?per_page=1`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${settings.consumerKey}:${settings.consumerSecret}`).toString('base64')}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        responseTime = Date.now() - startTime;

        if (!response.ok) {
          status = 'error';
          recommendations.push(`API returned status ${response.status}`);
        } else if (responseTime > 5000) {
          status = 'warning';
          recommendations.push('API response time is slow (>5s)');
        }

        // Check last sync status
        if (settings.lastError) {
          status = status === 'healthy' ? 'warning' : 'error';
          recommendations.push('Last sync had errors');
        }

        // Check sync frequency
        if (settings.lastSync) {
          const hoursSinceLastSync = (Date.now() - settings.lastSync.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastSync > 24) {
            status = status === 'healthy' ? 'warning' : 'error';
            recommendations.push('No sync in over 24 hours');
          }
        }

        // Calculate performance metrics
        const performance = await this.calculateWooCommercePerformance();

        this.healthChecks.set('woocommerce', {
          service: 'woocommerce',
          status,
          lastSync: settings.lastSync,
          lastError: settings.lastError,
          syncCount: await this.getWooCommerceSyncCount(),
          errorCount: await this.getWooCommerceErrorCount(),
          responseTime,
          cacheStatus: 'active',
          recommendations,
          performance
        });

      } catch (error: any) {
        this.healthChecks.set('woocommerce', {
          service: 'woocommerce',
          status: 'error',
          lastSync: settings.lastSync,
          lastError: settings.lastError || error.message,
          syncCount: await this.getWooCommerceSyncCount(),
          errorCount: await this.getWooCommerceErrorCount(),
          responseTime: Date.now() - startTime,
          cacheStatus: 'empty',
          recommendations: ['Check store URL and credentials', 'Verify API access'],
          performance: {
            avgResponseTime: 0,
            successRate: 0,
            cacheHitRate: 0,
            syncFrequency: 0
          }
        });
      }

    } catch (error) {
      logger.error('Error checking WooCommerce health:', error);
    }
  }

  private async checkWordPressHealth(): Promise<void> {
    try {
      const settings = await prisma.wordPressSettings.findUnique({
        where: { id: 1 }
      });

      if (!settings || !settings.enabled) {
        this.healthChecks.set('wordpress', {
          service: 'wordpress',
          status: 'offline',
          lastSync: null,
          lastError: null,
          syncCount: 0,
          errorCount: 0,
          responseTime: 0,
          cacheStatus: 'empty',
          recommendations: ['Enable WordPress integration to start monitoring'],
          performance: {
            avgResponseTime: 0,
            successRate: 0,
            cacheHitRate: 0,
            syncFrequency: 0
          }
        });
        return;
      }

      // Test connection with performance measurement
      const startTime = Date.now();
      let responseTime = 0;
      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      let recommendations: string[] = [];

      try {
        const response = await fetch(`${settings.siteUrl}/wp-json/wp/v2/`, {
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        responseTime = Date.now() - startTime;

        if (!response.ok) {
          status = 'error';
          recommendations.push(`API returned status ${response.status}`);
        } else if (responseTime > 5000) {
          status = 'warning';
          recommendations.push('API response time is slow (>5s)');
        }

        // Check last sync status
        if (settings.lastError) {
          status = status === 'healthy' ? 'warning' : 'error';
          recommendations.push('Last sync had errors');
        }

        // Check sync frequency
        if (settings.lastSync) {
          const hoursSinceLastSync = (Date.now() - settings.lastSync.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastSync > 24) {
            status = status === 'healthy' ? 'warning' : 'error';
            recommendations.push('No sync in over 24 hours');
          }
        }

        // Calculate performance metrics
        const performance = await this.calculateWordPressPerformance();

        this.healthChecks.set('wordpress', {
          service: 'wordpress',
          status,
          lastSync: settings.lastSync,
          lastError: settings.lastError,
          syncCount: await this.getWordPressSyncCount(),
          errorCount: await this.getWordPressErrorCount(),
          responseTime,
          cacheStatus: 'active',
          recommendations,
          performance
        });

      } catch (error: any) {
        this.healthChecks.set('wordpress', {
          service: 'wordpress',
          status: 'error',
          lastSync: settings.lastSync,
          lastError: settings.lastError || error.message,
          syncCount: await this.getWordPressSyncCount(),
          errorCount: await this.getWordPressErrorCount(),
          responseTime: Date.now() - startTime,
          cacheStatus: 'empty',
          recommendations: ['Check site URL and credentials', 'Verify API access'],
          performance: {
            avgResponseTime: 0,
            successRate: 0,
            cacheHitRate: 0,
            syncFrequency: 0
          }
        });
      }

    } catch (error) {
      logger.error('Error checking WordPress health:', error);
    }
  }

  private async calculateWooCommercePerformance(): Promise<any> {
    try {
      // Get recent performance data
      const recentChecks = this.performanceHistory.get('woocommerce') || [];
      const last24Hours = recentChecks.filter(check => 
        Date.now() - check.timestamp < 24 * 60 * 60 * 1000
      );

      if (last24Hours.length === 0) {
        return {
          avgResponseTime: 0,
          successRate: 0,
          cacheHitRate: 0,
          syncFrequency: 0
        };
      }

      const avgResponseTime = last24Hours.reduce((sum, check) => sum + check.responseTime, 0) / last24Hours.length;
      const successRate = (last24Hours.filter(check => check.status === 'healthy').length / last24Hours.length) * 100;
      const cacheHitRate = 80; // This would need to be calculated from actual cache usage
      const syncFrequency = last24Hours.length / 24; // checks per hour

      return {
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate),
        cacheHitRate: Math.round(cacheHitRate),
        syncFrequency: Math.round(syncFrequency * 100) / 100
      };
    } catch (error) {
      logger.error('Error calculating WooCommerce performance:', error);
      return {
        avgResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        syncFrequency: 0
      };
    }
  }

  private async calculateWordPressPerformance(): Promise<any> {
    try {
      // Get recent performance data
      const recentChecks = this.performanceHistory.get('wordpress') || [];
      const last24Hours = recentChecks.filter(check => 
        Date.now() - check.timestamp < 24 * 60 * 60 * 1000
      );

      if (last24Hours.length === 0) {
        return {
          avgResponseTime: 0,
          successRate: 0,
          cacheHitRate: 0,
          syncFrequency: 0
        };
      }

      const avgResponseTime = last24Hours.reduce((sum, check) => sum + check.responseTime, 0) / last24Hours.length;
      const successRate = (last24Hours.filter(check => check.status === 'healthy').length / last24Hours.length) * 100;
      const cacheHitRate = 75; // This would need to be calculated from actual cache usage
      const syncFrequency = last24Hours.length / 24; // checks per hour

      return {
        avgResponseTime: Math.round(avgResponseTime),
        successRate: Math.round(successRate),
        cacheHitRate: Math.round(cacheHitRate),
        syncFrequency: Math.round(syncFrequency * 100) / 100
      };
    } catch (error) {
      logger.error('Error calculating WordPress performance:', error);
      return {
        avgResponseTime: 0,
        successRate: 0,
        cacheHitRate: 0,
        syncFrequency: 0
      };
    }
  }

  public async collectInventoryMetrics(): Promise<void> {
    try {
      const totalProducts = await prisma.product.count();
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: {
            lte: 5,
            gt: 0
          }
        }
      });

      const outOfStockProducts = await prisma.product.findMany({
        where: { stock: 0 }
      });

      const categoryDistribution = await prisma.$queryRaw`
        SELECT c.name, COUNT(p.id) as product_count, SUM(p.stock) as total_stock
        FROM "Category" c
        LEFT JOIN "Product" p ON c.id = p."categoryId"
        GROUP BY c.id, c.name
        ORDER BY total_stock DESC
      `;

      const totalStockValue = lowStockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

      this.inventoryMetrics.set('woocommerce', {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue,
        stockTurnoverRate: 0, // Would need historical data to calculate
        categoryDistribution,
        stockAlerts: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          price: p.price
        }))
      });

      logger.info('Inventory metrics collected successfully');
    } catch (error) {
      logger.error('Error collecting inventory metrics:', error);
    }
  }

  public async collectOrderMetrics(): Promise<void> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), now.getMonth() - 1, now.getDate());

      const totalOrders = await prisma.order.count();
      const ordersToday = await prisma.order.count({
        where: { createdAt: { gte: today } }
      });
      const ordersThisWeek = await prisma.order.count({
        where: { createdAt: { gte: weekAgo } }
      });
      const ordersThisMonth = await prisma.order.count({
        where: { createdAt: { gte: monthAgo } }
      });

      const orderValues = await prisma.order.findMany({
        select: { total: true }
      });

      const averageOrderValue = orderValues.length > 0 
        ? orderValues.reduce((sum, order) => sum + order.total, 0) / orderValues.length 
        : 0;

      const topSellingProducts = await prisma.$queryRaw`
        SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as total_revenue
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi."productId"
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 10
      `;

      const orderStatusDistribution = await prisma.$queryRaw`
        SELECT status, COUNT(*) as count
        FROM "Order"
        GROUP BY status
        ORDER BY count DESC
      `;

      this.orderMetrics.set('woocommerce', {
        totalOrders,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth,
        averageOrderValue,
        topSellingProducts,
        orderStatusDistribution
      });

      logger.info('Order metrics collected successfully');
    } catch (error) {
      logger.error('Error collecting order metrics:', error);
    }
  }

  private async getWooCommerceSyncCount(): Promise<number> {
    try {
      const productCount = await prisma.product.count();
      return productCount;
    } catch (error) {
      logger.error('Error getting WooCommerce sync count:', error);
      return 0;
    }
  }

  private async getWooCommerceErrorCount(): Promise<number> {
    try {
      const settings = await prisma.wooCommerceSettings.findUnique({
        where: { id: 1 }
      });
      return settings?.lastError ? 1 : 0;
    } catch (error) {
      logger.error('Error getting WooCommerce error count:', error);
      return 0;
    }
  }

  private async getWordPressSyncCount(): Promise<number> {
    try {
      const postCount = await prisma.blog.count();
      return postCount;
    } catch (error) {
      logger.error('Error getting WordPress sync count:', error);
      return 0;
    }
  }

  private async getWordPressErrorCount(): Promise<number> {
    try {
      const settings = await prisma.wordPressSettings.findUnique({
        where: { id: 1 }
      });
      return settings?.lastError ? 1 : 0;
    } catch (error) {
      logger.error('Error getting WordPress error count:', error);
      return 0;
    }
  }

  public async collectMetrics(): Promise<void> {
    try {
      await this.collectWooCommerceMetrics();
      await this.collectWordPressMetrics();
      logger.info('Metrics collection completed');
    } catch (error) {
      logger.error('Error collecting metrics:', error);
    }
  }

  private async collectWooCommerceMetrics(): Promise<void> {
    try {
      const settings = await prisma.wooCommerceSettings.findUnique({
        where: { id: 1 }
      });

      if (!settings) return;

      const productCount = await prisma.product.count();
      const hasErrors = settings.lastError ? 1 : 0;

      this.metrics.set('woocommerce', {
        totalSyncs: settings.lastSync ? 1 : 0,
        successfulSyncs: hasErrors ? 0 : 1,
        failedSyncs: hasErrors,
        averageSyncTime: 0, // Would need to track actual sync times
        lastSyncDuration: 0, // Would need to track actual sync times
        dataVolume: productCount,
        performance: {
          apiCallsPerHour: 0, // Would need to track actual API calls
          dataTransferMB: 0, // Would need to track actual data transfer
          errorRate: 0, // Would need to track actual error rate
          uptime: 0 // Would need to track actual uptime
        }
      });

    } catch (error) {
      logger.error('Error collecting WooCommerce metrics:', error);
    }
  }

  private async collectWordPressMetrics(): Promise<void> {
    try {
      const settings = await prisma.wordPressSettings.findUnique({
        where: { id: 1 }
      });

      if (!settings) return;

      const postCount = await prisma.blog.count();
      const hasErrors = settings.lastError ? 1 : 0;

      this.metrics.set('wordpress', {
        totalSyncs: settings.lastSync ? 1 : 0,
        successfulSyncs: hasErrors ? 0 : 1,
        failedSyncs: hasErrors,
        averageSyncTime: 0, // Would need to track actual sync times
        lastSyncDuration: 0, // Would need to track actual sync times
        dataVolume: postCount,
        performance: {
          apiCallsPerHour: 0, // Would need to track actual API calls
          dataTransferMB: 0, // Would need to track actual data transfer
          errorRate: 0, // Would need to track actual error rate
          uptime: 0 // Would need to track actual uptime
        }
      });

    } catch (error) {
      logger.error('Error collecting WordPress metrics:', error);
    }
  }

  public getHealthStatus(service?: 'woocommerce' | 'wordpress'): IntegrationHealth | Map<string, IntegrationHealth> {
    if (service) {
      return this.healthChecks.get(service) || {
        service,
        status: 'offline',
        lastSync: null,
        lastError: null,
        syncCount: 0,
        errorCount: 0,
        responseTime: 0,
        cacheStatus: 'empty',
        recommendations: ['Service not configured or monitoring not available']
      };
    }
    return this.healthChecks;
  }

  public getMetrics(service?: 'woocommerce' | 'wordpress'): SyncMetrics | Map<string, SyncMetrics> {
    if (service) {
      return this.metrics.get(service) || {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        averageSyncTime: 0,
        lastSyncDuration: 0,
        dataVolume: 0
      };
    }
    return this.metrics;
  }

  public getInventoryMetrics(): InventoryMetrics | null {
    return this.inventoryMetrics.get('woocommerce') || null;
  }

  public getOrderMetrics(): OrderMetrics | null {
    return this.orderMetrics.get('woocommerce') || null;
  }

  public async generateHealthReport(): Promise<string> {
    const healthChecks = Array.from(this.healthChecks.values());
    const metrics = Array.from(this.metrics.values());

    let report = '🔍 Integration Health Report\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Health Summary
    report += '📊 Health Summary:\n';
    const healthy = healthChecks.filter(h => h.status === 'healthy').length;
    const warning = healthChecks.filter(h => h.status === 'warning').length;
    const error = healthChecks.filter(h => h.status === 'error').length;
    const offline = healthChecks.filter(h => h.status === 'offline').length;

    report += `✅ Healthy: ${healthy}\n`;
    report += `⚠️ Warning: ${warning}\n`;
    report += `❌ Error: ${error}\n`;
    report += `🔴 Offline: ${offline}\n\n`;

    // Service Details
    for (const health of healthChecks) {
      report += `🔧 ${health.service.toUpperCase()}:\n`;
      report += `   Status: ${health.status}\n`;
      report += `   Last Sync: ${health.lastSync ? health.lastSync.toISOString() : 'Never'}\n`;
      report += `   Sync Count: ${health.syncCount}\n`;
      report += `   Error Count: ${health.errorCount}\n`;
      report += `   Response Time: ${health.responseTime}ms\n`;
      report += `   Cache Status: ${health.cacheStatus}\n`;
      
      if (health.recommendations.length > 0) {
        report += `   Recommendations:\n`;
        health.recommendations.forEach(rec => {
          report += `     • ${rec}\n`;
        });
      }
      report += '\n';
    }

    // Metrics Summary
    report += '📈 Performance Metrics:\n';
    for (const metric of metrics) {
      report += `   Total Syncs: ${metric.totalSyncs}\n`;
      report += `   Success Rate: ${metric.totalSyncs > 0 ? ((metric.successfulSyncs / metric.totalSyncs) * 100).toFixed(1) : 0}%\n`;
      report += `   Data Volume: ${metric.dataVolume} items\n\n`;
    }

    return report;
  }

  public async generateComprehensiveReport(): Promise<string> {
    const healthChecks = Array.from(this.healthChecks.values());
    const metrics = Array.from(this.metrics.values());
    const inventoryMetrics = this.getInventoryMetrics();
    const orderMetrics = this.getOrderMetrics();

    let report = '🔍 Comprehensive Integration Health Report\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Health Summary
    report += '📊 Health Summary:\n';
    const healthy = healthChecks.filter(h => h.status === 'healthy').length;
    const warning = healthChecks.filter(h => h.status === 'warning').length;
    const error = healthChecks.filter(h => h.status === 'error').length;
    const offline = healthChecks.filter(h => h.status === 'offline').length;

    report += `✅ Healthy: ${healthy}\n`;
    report += `⚠️ Warning: ${warning}\n`;
    report += `❌ Error: ${error}\n`;
    report += `🔴 Offline: ${offline}\n\n`;

    // Service Details with Performance
    for (const health of healthChecks) {
      report += `🔧 ${health.service.toUpperCase()}:\n`;
      report += `   Status: ${health.status}\n`;
      report += `   Last Sync: ${health.lastSync ? health.lastSync.toISOString() : 'Never'}\n`;
      report += `   Sync Count: ${health.syncCount}\n`;
      report += `   Error Count: ${health.errorCount}\n`;
      report += `   Response Time: ${health.responseTime}ms\n`;
      report += `   Cache Status: ${health.cacheStatus}\n`;
      report += `   Performance:\n`;
      report += `     • Avg Response Time: ${health.performance.avgResponseTime}ms\n`;
      report += `     • Success Rate: ${health.performance.successRate}%\n`;
      report += `     • Cache Hit Rate: ${health.performance.cacheHitRate}%\n`;
      report += `     • Sync Frequency: ${health.performance.syncFrequency}/hr\n`;
      
      if (health.recommendations.length > 0) {
        report += `   Recommendations:\n`;
        health.recommendations.forEach(rec => {
          report += `     • ${rec}\n`;
        });
      }
      report += '\n';
    }

    // Inventory Metrics
    if (inventoryMetrics) {
      report += '📦 Inventory Metrics:\n';
      report += `   Total Products: ${inventoryMetrics.totalProducts}\n`;
      report += `   Low Stock: ${inventoryMetrics.lowStockCount}\n`;
      report += `   Out of Stock: ${inventoryMetrics.outOfStockCount}\n`;
      report += `   Total Stock Value: $${inventoryMetrics.totalStockValue.toFixed(2)}\n\n`;
    }

    // Order Metrics
    if (orderMetrics) {
      report += '🛒 Order Metrics:\n';
      report += `   Total Orders: ${orderMetrics.totalOrders}\n`;
      report += `   Orders Today: ${orderMetrics.ordersToday}\n`;
      report += `   Orders This Week: ${orderMetrics.ordersThisWeek}\n`;
      report += `   Orders This Month: ${orderMetrics.ordersThisMonth}\n`;
      report += `   Average Order Value: $${orderMetrics.averageOrderValue.toFixed(2)}\n\n`;
    }

    return report;
  }

  public async sendHealthAlert(service: string, status: string, message: string): Promise<void> {
    try {
      // Log the alert
      logger.warn(`Health Alert - ${service}: ${status} - ${message}`);

      // Here you could integrate with notification services like:
      // - Email notifications
      // - Slack webhooks
      // - SMS alerts
      // - PagerDuty
      
      // For now, just log it
      console.log(`🚨 HEALTH ALERT: ${service} is ${status} - ${message}`);
      
    } catch (error) {
      logger.error('Error sending health alert:', error);
    }
  }
}

export default IntegrationMonitorService;
