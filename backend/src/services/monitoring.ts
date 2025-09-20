/**
 * Service Monitoring System
 * Monitors the health and availability of external services
 */

import axios from 'axios';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastChecked: Date;
  error?: string;
  details?: any;
}

interface MonitoringConfig {
  services: {
    name: string;
    url: string;
    timeout: number;
    retries: number;
    interval: number;
  }[];
  alertThresholds: {
    responseTime: number; // milliseconds
    errorRate: number; // percentage
  };
}

class ServiceMonitor {
  private services: Map<string, ServiceStatus> = new Map();
  private config: MonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor() {
    this.config = {
      services: [
        {
          name: 'WooCommerce',
          url: process.env.WOOCOMMERCE_STORE_URL || 'https://mymedspharmacyinc.com/shop',
          timeout: 10000,
          retries: 3,
          interval: 60000 // 1 minute
        },
        {
          name: 'WordPress',
          url: process.env.VITE_WORDPRESS_URL || 'https://mymedspharmacyinc.com/blog',
          timeout: 10000,
          retries: 3,
          interval: 60000 // 1 minute
        },
        {
          name: 'Database',
          url: 'internal', // Special case for database
          timeout: 5000,
          retries: 2,
          interval: 30000 // 30 seconds
        }
      ],
      alertThresholds: {
        responseTime: 5000, // 5 seconds
        errorRate: 10 // 10%
      }
    };

    this.initializeServices();
  }

  private initializeServices(): void {
    this.config.services.forEach(service => {
      this.services.set(service.name, {
        name: service.name,
        url: service.url,
        status: 'unhealthy',
        lastChecked: new Date()
      });
    });
  }

  /**
   * Start monitoring all services
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('Service monitoring is already running');
      return;
    }

    console.log('🚀 Starting service monitoring...');
    this.isMonitoring = true;

    // Initial health check
    this.checkAllServices();

    // Set up interval monitoring
    this.monitoringInterval = setInterval(() => {
      this.checkAllServices();
    }, 30000); // Check every 30 seconds

    console.log('✅ Service monitoring started');
  }

  /**
   * Stop monitoring all services
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.log('Service monitoring is not running');
      return;
    }

    console.log('🛑 Stopping service monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Service monitoring stopped');
  }

  /**
   * Check all services health
   */
  private async checkAllServices(): Promise<void> {
    const promises = this.config.services.map(service => 
      this.checkService(service.name)
    );

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.error('Error during service health check:', error);
    }
  }

  /**
   * Check individual service health
   */
  private async checkService(serviceName: string): Promise<void> {
    const serviceConfig = this.config.services.find(s => s.name === serviceName);
    if (!serviceConfig) {
      console.error(`Service configuration not found: ${serviceName}`);
      return;
    }

    const startTime = Date.now();
    let status: ServiceStatus['status'] = 'unhealthy';
    let error: string | undefined;
    let details: any = {};

    try {
      if (serviceName === 'Database') {
        // Special handling for database
        const dbStatus = await this.checkDatabaseHealth();
        status = dbStatus.healthy ? 'healthy' : 'unhealthy';
        error = dbStatus.error;
        details = dbStatus.details;
      } else {
        // HTTP service check
        const response = await this.makeHttpRequest(serviceConfig);
        status = response.status;
        error = response.error;
        details = response.details;
      }

      const responseTime = Date.now() - startTime;

      // Update service status
      this.services.set(serviceName, {
        name: serviceName,
        url: serviceConfig.url,
        status,
        responseTime,
        lastChecked: new Date(),
        error,
        details
      });

      // Log status
      const statusEmoji = status === 'healthy' ? '✅' : status === 'degraded' ? '⚠️' : '❌';
      console.log(`${statusEmoji} ${serviceName}: ${status} (${responseTime}ms)`);

      // Alert if unhealthy
      if (status === 'unhealthy') {
        this.sendAlert(serviceName, error || 'Service is unhealthy');
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.services.set(serviceName, {
        name: serviceName,
        url: serviceConfig.url,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date(),
        error: errorMessage
      });

      console.error(`❌ ${serviceName}: Error - ${errorMessage}`);
      this.sendAlert(serviceName, errorMessage);
    }
  }

  /**
   * Make HTTP request to check service health
   */
  private async makeHttpRequest(serviceConfig: any): Promise<{
    status: ServiceStatus['status'];
    error?: string;
    details?: any;
  }> {
    try {
      const response = await axios.get(serviceConfig.url, {
        timeout: serviceConfig.timeout,
        validateStatus: (status) => status < 500 // Accept 4xx as healthy (service is responding)
      });

      const responseTime = response.headers['x-response-time'] || 0;
      const isSlow = responseTime > this.config.alertThresholds.responseTime;

      return {
        status: isSlow ? 'degraded' : 'healthy',
        details: {
          statusCode: response.status,
          responseTime,
          headers: response.headers
        }
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          // For external services that are not available, mark as degraded instead of unhealthy
          // This allows the system to continue working with fallback data
          return {
            status: 'degraded',
            error: 'External service not accessible - using fallback data',
            details: {
              fallbackMode: true,
              externalService: true,
              errorCode: error.code
            }
          };
        }

        if (error.response) {
          // Service is responding but with error
          return {
            status: 'degraded',
            error: `HTTP ${error.response.status}: ${error.response.statusText}`,
            details: {
              statusCode: error.response.status,
              statusText: error.response.statusText
            }
          };
        }
      }

      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<{
    healthy: boolean;
    error?: string;
    details?: any;
  }> {
    try {
      // Import Prisma client dynamically to avoid circular dependencies
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Simple query to test database connection
      await prisma.$queryRaw`SELECT 1`;

      await prisma.$disconnect();

      return {
        healthy: true,
        details: {
          connection: 'active',
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Send alert for unhealthy service
   */
  private sendAlert(serviceName: string, message: string): void {
    console.error(`🚨 ALERT: ${serviceName} is unhealthy - ${message}`);
    
    // In production, you would send alerts to:
    // - Email notifications
    // - Slack/Discord webhooks
    // - SMS alerts
    // - Monitoring services (DataDog, New Relic, etc.)
    
    // For now, just log the alert
    console.error(`Alert details: Service=${serviceName}, Message=${message}, Time=${new Date().toISOString()}`);
  }

  /**
   * Get current status of all services
   */
  public getServiceStatus(): ServiceStatus[] {
    return Array.from(this.services.values());
  }

  /**
   * Get status of specific service
   */
  public getServiceStatusByName(name: string): ServiceStatus | undefined {
    return this.services.get(name);
  }

  /**
   * Get overall system health
   */
  public getSystemHealth(): {
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: ServiceStatus[];
    summary: {
      total: number;
      healthy: number;
      degraded: number;
      unhealthy: number;
    };
  } {
    const services = this.getServiceStatus();
    const healthy = services.filter(s => s.status === 'healthy').length;
    const degraded = services.filter(s => s.status === 'degraded').length;
    const unhealthy = services.filter(s => s.status === 'unhealthy').length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthy > 0) {
      overall = 'unhealthy';
    } else if (degraded > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      services,
      summary: {
        total: services.length,
        healthy,
        degraded,
        unhealthy
      }
    };
  }

  /**
   * Force health check of all services
   */
  public async forceHealthCheck(): Promise<void> {
    console.log('🔄 Forcing health check of all services...');
    await this.checkAllServices();
    console.log('✅ Health check completed');
  }

  /**
   * Get monitoring configuration
   */
  public getConfig(): MonitoringConfig {
    return this.config;
  }

  /**
   * Update monitoring configuration
   */
  public updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('📝 Monitoring configuration updated');
  }
}

// Export singleton instance
export const serviceMonitor = new ServiceMonitor();
export default serviceMonitor;
