// Advanced Monitoring and Alerting Service
// Phase 3: Medium-term Scalability

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { shardingManager } from '../../config/database-sharding';
import { cdnService } from '../cdn/cdn-service';

export interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    load: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    available: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
    latency: number;
  };
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
    errors: number;
    responseTime: number;
  };
  application: {
    requests: number;
    errors: number;
    responseTime: number;
    uptime: number;
    memoryLeaks: boolean;
  };
  cdn: {
    health: boolean;
    cacheHitRate: number;
    bandwidth: number;
    errors: number;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  metric: keyof SystemMetrics;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldown: number; // seconds
  lastTriggered?: Date;
}

export interface Alert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface NotificationChannel {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AdvancedMonitoringService extends EventEmitter {
  private metrics: SystemMetrics[] = [];
  private alertRules: AlertRule[] = [];
  private activeAlerts: Alert[] = [];
  private notificationChannels: NotificationChannel[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsRetention: number = 24 * 60 * 60 * 1000; // 24 hours
  private maxMetrics: number = 1000;

  constructor() {
    super();
    this.initializeMonitoring();
    this.setupDefaultAlertRules();
    this.setupDefaultNotificationChannels();
  }

  private initializeMonitoring(): void {
    console.log('🚀 Initializing Advanced Monitoring Service');
    
    // Start monitoring interval (every 30 seconds)
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Cleanup old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000);
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.gatherSystemMetrics();
      this.metrics.push(metrics);
      
      // Limit metrics array size
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(-this.maxMetrics);
      }

      // Check alert rules
      await this.checkAlertRules(metrics);

      // Emit metrics event
      this.emit('metrics', metrics);

      // Log if there are any critical issues
      if (metrics.application.errors > 0 || metrics.database.errors > 0) {
        console.warn('⚠️ System issues detected:', {
          appErrors: metrics.application.errors,
          dbErrors: metrics.database.errors
        });
      }
    } catch (error) {
      console.error('❌ Error collecting metrics:', error);
      this.emit('error', error);
    }
  }

  private async gatherSystemMetrics(): Promise<SystemMetrics> {
    const startTime = performance.now();
    
    // Gather all metrics concurrently
    const [
      cpuMetrics,
      memoryMetrics,
      diskMetrics,
      networkMetrics,
      databaseMetrics,
      applicationMetrics,
      cdnMetrics
    ] = await Promise.all([
      this.getCPUMetrics(),
      this.getMemoryMetrics(),
      this.getDiskMetrics(),
      this.getNetworkMetrics(),
      this.getDatabaseMetrics(),
      this.getApplicationMetrics(),
      this.getCDNMetrics()
    ]);

    const endTime = performance.now();
    const collectionTime = endTime - startTime;

    return {
      timestamp: new Date(),
      cpu: cpuMetrics,
      memory: memoryMetrics,
      disk: diskMetrics,
      network: networkMetrics,
      database: databaseMetrics,
      application: applicationMetrics,
      cdn: cdnMetrics
    };
  }

  private async getCPUMetrics(): Promise<SystemMetrics['cpu']> {
    try {
      const cpus = require('os').cpus();
      const loadAvg = require('os').loadavg();
      
      // Calculate CPU usage
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach((cpu: any) => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });

      const idle = totalIdle / cpus.length;
      const total = totalTick / cpus.length;
      const usage = 100 - (100 * idle / total);

      return {
        usage: Math.round(usage * 100) / 100,
        load: loadAvg,
        cores: cpus.length
      };
    } catch (error) {
      console.error('Error getting CPU metrics:', error);
      return { usage: 0, load: [0, 0, 0], cores: 0 };
    }
  }

  private async getMemoryMetrics(): Promise<SystemMetrics['memory']> {
    try {
      const memUsage = process.memoryUsage();
      const total = memUsage.heapTotal;
      const used = memUsage.heapUsed;
      const free = total - used;
      const available = memUsage.rss;
      const usage = (used / total) * 100;

      return {
        total: Math.round(total / 1024 / 1024), // MB
        used: Math.round(used / 1024 / 1024), // MB
        free: Math.round(free / 1024 / 1024), // MB
        available: Math.round(available / 1024 / 1024), // MB
        usage: Math.round(usage * 100) / 100
      };
    } catch (error) {
      console.error('Error getting memory metrics:', error);
      return { total: 0, used: 0, free: 0, available: 0, usage: 0 };
    }
  }

  private async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    try {
      // Use actual disk usage library in production
      const diskusage = require('diskusage');
      const path = require('os').platform() === 'win32' ? 'c:' : '/';
      const info = await diskusage.check(path);
      
      const total = Math.round(info.total / 1024 / 1024); // MB
      const free = Math.round(info.free / 1024 / 1024);   // MB
      const used = total - free;
      const usage = Math.round((used / total) * 100);
      
      return {
        total,
        used,
        free,
        usage,
        iops: 0 // Would need additional monitoring for IOPS
      };
    } catch (error) {
      console.error('Error getting disk metrics:', error);
      return { total: 0, used: 0, free: 0, usage: 0, iops: 0 };
    }
  }

  private async getNetworkMetrics(): Promise<SystemMetrics['network']> {
    try {
      // Use actual network monitoring in production
      const os = require('os');
      const networkInterfaces = os.networkInterfaces();
      
      let bytesIn = 0;
      let bytesOut = 0;
      let connections = 0;
      
      // Calculate network stats from interfaces
      for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
          if (!iface.internal) {
            // This is a simplified approach - in production use dedicated network monitoring
            bytesIn += Math.floor(Math.random() * 1024 * 1024); // Simulated
            bytesOut += Math.floor(Math.random() * 512 * 1024); // Simulated
            connections += Math.floor(Math.random() * 100); // Simulated
          }
        }
      }
      
      return {
        bytesIn,
        bytesOut,
        connections,
        latency: 0 // Would need ping or similar for actual latency
      };
    } catch (error) {
      console.error('Error getting network metrics:', error);
      return { bytesIn: 0, bytesOut: 0, connections: 0, latency: 0 };
    }
  }

  private async getDatabaseMetrics(): Promise<SystemMetrics['database']> {
    try {
      // Get database health from sharding manager
      const shardHealth = await shardingManager.checkShardHealth();
      const shardStats = shardingManager.getShardStats();
      
      let healthyShards = 0;
      let totalShards = 0;
      
      for (const [_, isHealthy] of shardHealth) {
        totalShards++;
        if (isHealthy) healthyShards++;
      }

      // In production, these would come from actual database monitoring
      // For now, use reasonable defaults based on shard health
      const baseConnections = totalShards * 5; // 5 connections per shard
      const baseQueries = healthyShards * 100; // 100 queries per healthy shard
      
      return {
        connections: baseConnections,
        queries: baseQueries,
        slowQueries: Math.max(0, Math.floor(baseQueries * 0.01)), // 1% slow queries
        errors: totalShards - healthyShards,
        responseTime: healthyShards > 0 ? 50 : 1000 // 50ms if healthy, 1000ms if unhealthy
      };
    } catch (error) {
      console.error('Error getting database metrics:', error);
      return { connections: 0, queries: 0, slowQueries: 0, errors: 0, responseTime: 0 };
    }
  }

  private async getApplicationMetrics(): Promise<SystemMetrics['application']> {
    try {
      const uptime = process.uptime();
      const memUsage = process.memoryUsage();
      
      // Check for memory leaks (simplified)
      const memoryLeaks = memUsage.heapUsed > 1024 * 1024 * 1024; // 1GB

      // In production, these would come from actual application monitoring
      // For now, use reasonable defaults based on uptime
      const baseRequests = Math.floor(uptime / 60) * 10; // 10 requests per minute
      const baseErrors = Math.floor(baseRequests * 0.001); // 0.1% error rate
      
      return {
        requests: baseRequests,
        errors: baseErrors,
        responseTime: 100, // 100ms average response time
        uptime: Math.round(uptime),
        memoryLeaks
      };
    } catch (error) {
      console.error('Error getting application metrics:', error);
      return { requests: 0, errors: 0, responseTime: 0, uptime: 0, memoryLeaks: false };
    }
  }

  private async getCDNMetrics(): Promise<SystemMetrics['cdn']> {
    try {
      const cdnHealth = await cdnService.healthCheck();
      const cdnStats = await cdnService.getCDNStats();
      
      return {
        health: cdnHealth.healthy,
        cacheHitRate: cdnStats.cacheHitRate,
        bandwidth: cdnStats.bandwidth,
        errors: cdnStats.errors
      };
    } catch (error) {
      console.error('Error getting CDN metrics:', error);
      return { health: false, cacheHitRate: 0, bandwidth: 0, errors: 0 };
    }
  }

  private async checkAlertRules(metrics: SystemMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 1000) continue;
      }

      const shouldTrigger = this.evaluateAlertRule(rule, metrics);
      
      if (shouldTrigger) {
        await this.triggerAlert(rule, metrics);
      }
    }
  }

  private evaluateAlertRule(rule: AlertRule, metrics: SystemMetrics): boolean {
    const metricValue = this.getMetricValue(rule.metric, metrics);
    
    switch (rule.condition) {
      case 'gt':
        return metricValue > rule.threshold;
      case 'gte':
        return metricValue >= rule.threshold;
      case 'lt':
        return metricValue < rule.threshold;
      case 'lte':
        return metricValue <= rule.threshold;
      case 'eq':
        return metricValue === rule.threshold;
      default:
        return false;
    }
  }

  private getMetricValue(metricPath: string, metrics: SystemMetrics): number {
    const pathParts = metricPath.split('.');
    let value: any = metrics;
    
    for (const part of pathParts) {
      value = value[part];
      if (value === undefined) return 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private async triggerAlert(rule: AlertRule, metrics: SystemMetrics): Promise<void> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: `Alert: ${rule.name} - ${rule.metric} exceeded threshold`,
      metric: rule.metric,
      value: this.getMetricValue(rule.metric, metrics),
      threshold: rule.threshold,
      timestamp: new Date(),
      acknowledged: false
    };

    // Update rule last triggered
    rule.lastTriggered = new Date();

    // Add to active alerts
    this.activeAlerts.push(alert);

    // Emit alert event
    this.emit('alert', alert);

    // Send notifications
    await this.sendNotifications(alert);

    console.log(`🚨 Alert triggered: ${alert.message} (${alert.severity})`);
  }

  private async sendNotifications(alert: Alert): Promise<void> {
    const channels = this.notificationChannels.filter(
      channel => channel.enabled && this.shouldSendToChannel(channel, alert.severity)
    );

    for (const channel of channels) {
      try {
        await this.sendNotification(channel, alert);
      } catch (error) {
        console.error(`Failed to send notification via ${channel.type}:`, error);
      }
    }
  }

  private shouldSendToChannel(channel: NotificationChannel, alertSeverity: string): boolean {
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const alertLevel = severityLevels[alertSeverity as keyof typeof severityLevels] || 1;
    const channelLevel = severityLevels[channel.severity] || 1;
    
    return alertLevel >= channelLevel;
  }

  private async sendNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailNotification(channel, alert);
        break;
      case 'slack':
        await this.sendSlackNotification(channel, alert);
        break;
      case 'webhook':
        await this.sendWebhookNotification(channel, alert);
        break;
      case 'sms':
        await this.sendSMSNotification(channel, alert);
        break;
    }
  }

  private async sendEmailNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    try {
      // Implementation with SendGrid, AWS SES, or similar email service
      const emailService = this.getEmailService();
      await emailService.sendAlert(channel.config.email, alert);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private async sendSlackNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    try {
      // Implementation with Slack webhook
      const slackService = this.getSlackService();
      await slackService.sendAlert(channel.config.webhook, alert);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  private async sendWebhookNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    try {
      // Implementation with webhook POST
      const webhookService = this.getWebhookService();
      await webhookService.sendAlert(channel.config.url, alert);
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  private async sendSMSNotification(channel: NotificationChannel, alert: Alert): Promise<void> {
    try {
      // Implementation with Twilio, AWS SNS, or similar SMS service
      const smsService = this.getSMSService();
      await smsService.sendAlert(channel.config.phone, alert);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  // Service factory methods
  private getEmailService() {
    // Return appropriate email service based on configuration
    return {
      sendAlert: async (email: string, alert: Alert) => {
        // Implement actual email sending logic
        throw new Error('Email service not implemented');
      }
    };
  }

  private getSlackService() {
    return {
      sendAlert: async (webhook: string, alert: Alert) => {
        // Implement actual Slack webhook logic
        throw new Error('Slack service not implemented');
      }
    };
  }

  private getWebhookService() {
    return {
      sendAlert: async (url: string, alert: Alert) => {
        // Implement actual webhook POST logic
        throw new Error('Webhook service not implemented');
      }
    };
  }

  private getSMSService() {
    return {
      sendAlert: async (phone: string, alert: Alert) => {
        // Implement actual SMS sending logic
        throw new Error('SMS service not implemented');
      }
    };
  }

  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'cpu_high',
        name: 'High CPU Usage',
        metric: 'cpu' as keyof SystemMetrics,
        condition: 'gt',
        threshold: 80,
        severity: 'high',
        enabled: true,
        cooldown: 300 // 5 minutes
      },
      {
        id: 'memory_critical',
        name: 'Critical Memory Usage',
        metric: 'memory' as keyof SystemMetrics,
        condition: 'gt',
        threshold: 90,
        severity: 'critical',
        enabled: true,
        cooldown: 60 // 1 minute
      },
      {
        id: 'disk_full',
        name: 'Disk Space Low',
        metric: 'disk' as keyof SystemMetrics,
        condition: 'gt',
        threshold: 85,
        severity: 'high',
        enabled: true,
        cooldown: 600 // 10 minutes
      },
      {
        id: 'database_errors',
        name: 'Database Errors',
        metric: 'database' as keyof SystemMetrics,
        condition: 'gt',
        threshold: 0,
        severity: 'critical',
        enabled: true,
        cooldown: 60 // 1 minute
      },
      {
        id: 'app_errors',
        name: 'Application Errors',
        metric: 'application' as keyof SystemMetrics,
        condition: 'gt',
        threshold: 5,
        severity: 'high',
        enabled: true,
        cooldown: 300 // 5 minutes
      }
    ];
  }

  private setupDefaultNotificationChannels(): void {
    this.notificationChannels = [
      {
        id: 'email_admin',
        type: 'email',
        name: 'Admin Email',
        config: { email: 'admin@yourdomain.com' },
        enabled: true,
        severity: 'medium'
      },
      {
        id: 'slack_alerts',
        type: 'slack',
        name: 'Slack Alerts',
        config: { webhook: process.env.SLACK_WEBHOOK_URL },
        enabled: !!process.env.SLACK_WEBHOOK_URL,
        severity: 'high'
      }
    ];
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.metricsRetention;
    this.metrics = this.metrics.filter(metric => metric.timestamp.getTime() > cutoff);
    
    // Cleanup old alerts (older than 7 days)
    const alertCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.activeAlerts = this.activeAlerts.filter(alert => alert.timestamp.getTime() > alertCutoff);
  }

  // Public API methods
  public getMetrics(limit: number = 100): SystemMetrics[] {
    return this.metrics.slice(-limit);
  }

  public getActiveAlerts(): Alert[] {
    return this.activeAlerts.filter(alert => !alert.acknowledged);
  }

  public getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  public addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  public updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const ruleIndex = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;
    
    this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    return true;
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    return true;
  }

  public getSystemHealth(): { status: 'healthy' | 'warning' | 'critical'; issues: string[] } {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return { status: 'healthy', issues: [] };

    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check critical issues
    if (latestMetrics.memory.usage > 90) {
      issues.push('Critical memory usage');
      status = 'critical';
    } else if (latestMetrics.memory.usage > 80) {
      issues.push('High memory usage');
      status = status === 'healthy' ? 'warning' : status;
    }

    if (latestMetrics.cpu.usage > 90) {
      issues.push('Critical CPU usage');
      status = 'critical';
    } else if (latestMetrics.cpu.usage > 80) {
      issues.push('High CPU usage');
      status = status === 'healthy' ? 'warning' : status;
    }

    if (latestMetrics.database.errors > 0) {
      issues.push('Database errors detected');
      status = 'critical';
    }

    if (latestMetrics.application.errors > 10) {
      issues.push('High application error rate');
      status = status === 'healthy' ? 'warning' : status;
    }

    return { status, issues };
  }

  public stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('🛑 Advanced Monitoring Service stopped');
  }
}

// Export singleton instance
export const advancedMonitoring = new AdvancedMonitoringService();
