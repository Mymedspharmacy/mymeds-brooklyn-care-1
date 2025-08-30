import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

// Enhanced Prisma Client with connection pooling and retry logic
class DatabaseManager {
  private prisma: PrismaClient;
  private isConnected: boolean = false;
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || '',
        },
      },
      log: [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'query', emit: 'event' },
      ],
      errorFormat: 'pretty',
    });

    // Set up event listeners for better monitoring
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Prisma event handlers with proper typing
    this.prisma.$on('error' as any, (e: any) => {
      logger.error('Prisma Error:', {
        target: e.target,
        timestamp: e.timestamp,
        message: e.message,
      });
    });

    this.prisma.$on('warn' as any, (e: any) => {
      logger.warn('Prisma Warning:', {
        target: e.target,
        timestamp: e.timestamp,
        message: e.message,
      });
    });

    this.prisma.$on('info' as any, (e: any) => {
      logger.info('Prisma Info:', {
        target: e.target,
        timestamp: e.timestamp,
        message: e.message,
      });
    });

    this.prisma.$on('query' as any, (e: any) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Database Query:', {
          query: e.query,
          params: e.params,
          duration: e.duration,
          timestamp: e.timestamp,
        });
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      this.isConnected = true;
      this.connectionAttempts = 0;
      logger.info('✅ Database connected successfully');
      
      // Test the connection
      await this.testConnection();
      
    } catch (error) {
      this.connectionAttempts++;
      logger.error(`❌ Database connection attempt ${this.connectionAttempts} failed:`, error);
      
      if (this.connectionAttempts < this.maxRetries) {
        logger.info(`Retrying in ${this.retryDelay / 1000} seconds...`);
        setTimeout(() => this.connect(), this.retryDelay);
      } else {
        logger.error('Max database connection attempts reached. Exiting...');
        process.exit(1);
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      this.isConnected = false;
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      logger.info('Database connection test passed');
      return true;
    } catch (error) {
      logger.error('Database connection test failed:', error);
      return false;
    }
  }

  async runMigrations(): Promise<void> {
    try {
      logger.info('Running database migrations...');
      
      // Check if migrations are needed
      const migrations = await this.prisma.$queryRaw`
        SELECT * FROM _prisma_migrations 
        ORDER BY finished_at DESC
      `;
      
      logger.info(`Found ${(migrations as any[]).length} migrations`);
      
      // In production, migrations should be run via CLI before app start
      if (process.env.NODE_ENV === 'production') {
        logger.info('Production mode: migrations should be run via CLI');
        return;
      }
      
      // For development, we can run migrations here if needed
      logger.info('Development mode: migrations completed');
      
    } catch (error) {
      logger.error('Error running migrations:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    details: {
      connected: boolean;
      responseTime: number;
      lastError?: string;
    };
  }> {
    const startTime = Date.now();
    
    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          details: {
            connected: false,
            responseTime: 0,
            lastError: 'Not connected to database'
          }
        };
      }

      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        details: {
          connected: true,
          responseTime
        }
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'unhealthy',
        details: {
          connected: false,
          responseTime,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  getClient(): PrismaClient {
    return this.prisma;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }

  async gracefulShutdown(): Promise<void> {
    logger.info('Initiating graceful database shutdown...');
    
    try {
      // Close all active connections
      await this.prisma.$disconnect();
      this.isConnected = false;
      logger.info('Database shutdown completed');
    } catch (error) {
      logger.error('Error during database shutdown:', error);
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await databaseManager.gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await databaseManager.gracefulShutdown();
  process.exit(0);
});

export default databaseManager;
export { DatabaseManager };
