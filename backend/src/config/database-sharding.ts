// Database Sharding Strategy Implementation
// Phase 3: Medium-term Scalability

import { PrismaClient } from '@prisma/client';

export interface ShardConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  weight: number;
  isReadOnly: boolean;
  isActive: boolean;
}

export interface ShardRule {
  table: string;
  shardKey: string;
  strategy: 'hash' | 'range' | 'list';
  shards: string[];
}

export class DatabaseShardingManager {
  private shards: Map<string, PrismaClient> = new Map();
  private shardConfigs: ShardConfig[] = [];
  private shardRules: ShardRule[] = [];
  private currentShardIndex: number = 0;

  constructor() {
    this.initializeSharding();
  }

  private initializeSharding(): void {
    // Load shard configurations from environment
    this.loadShardConfigurations();
    
    // Initialize shard connections
    this.initializeShardConnections();
    
    // Setup sharding rules
    this.setupShardingRules();
  }

  private loadShardConfigurations(): void {
    // Primary shard (existing database)
    this.shardConfigs.push({
      id: 'shard-0',
      name: 'Primary Shard',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      database: process.env.DATABASE_NAME || 'mymeds_db',
      username: process.env.DATABASE_USER || 'mymeds_user',
      password: process.env.DATABASE_PASSWORD || '',
      weight: 1,
      isReadOnly: false,
      isActive: true
    });

    // Additional shards for horizontal scaling
    const shardCount = parseInt(process.env.SHARD_COUNT || '3');
    
    for (let i = 1; i < shardCount; i++) {
      this.shardConfigs.push({
        id: `shard-${i}`,
        name: `Shard ${i}`,
        host: process.env[`SHARD_${i}_HOST`] || process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env[`SHARD_${i}_PORT`] || process.env.DATABASE_PORT || '3306'),
        database: process.env[`SHARD_${i}_DATABASE`] || `${process.env.DATABASE_NAME || 'mymeds_db'}_shard_${i}`,
        username: process.env[`SHARD_${i}_USERNAME`] || process.env.DATABASE_USER || 'mymeds_user',
        password: process.env[`SHARD_${i}_PASSWORD`] || process.env.DATABASE_PASSWORD || '',
        weight: parseInt(process.env[`SHARD_${i}_WEIGHT`] || '1'),
        isReadOnly: process.env[`SHARD_${i}_READONLY`] === 'true',
        isActive: process.env[`SHARD_${i}_ACTIVE`] !== 'false'
      });
    }
  }

  private initializeShardConnections(): void {
    this.shardConfigs.forEach(config => {
      if (config.isActive) {
        try {
          const shardUrl = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
          
          const shardClient = new PrismaClient({
            datasources: {
              db: { url: shardUrl }
            },
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
          });

          this.shards.set(config.id, shardClient);
          console.log(`✅ Shard ${config.name} connected successfully`);
        } catch (error) {
          console.error(`❌ Failed to connect to shard ${config.name}:`, error);
        }
      }
    });
  }

  private setupShardingRules(): void {
    // User sharding by email hash
    this.shardRules.push({
      table: 'User',
      shardKey: 'email',
      strategy: 'hash',
      shards: this.shardConfigs.filter(s => s.isActive).map(s => s.id)
    });

    // Product sharding by category
    this.shardRules.push({
      table: 'Product',
      shardKey: 'categoryId',
      strategy: 'range',
      shards: this.shardConfigs.filter(s => s.isActive).map(s => s.id)
    });

    // Order sharding by date
    this.shardRules.push({
      table: 'Order',
      shardKey: 'createdAt',
      strategy: 'range',
      shards: this.shardConfigs.filter(s => s.isActive).map(s => s.id)
    });
  }

  // Get shard based on strategy
  public getShard(table: string, shardKey: string, value: any): PrismaClient {
    const rule = this.shardRules.find(r => r.table === table);
    if (!rule) {
      return this.getDefaultShard();
    }

    let shardId: string;

    switch (rule.strategy) {
      case 'hash':
        shardId = this.getHashShard(rule.shards, value);
        break;
      case 'range':
        shardId = this.getRangeShard(rule.shards, value);
        break;
      case 'list':
        shardId = this.getListShard(rule.shards, value);
        break;
      default:
        shardId = 'shard-0';
    }

    const shard = this.shards.get(shardId);
    if (!shard) {
      return this.getDefaultShard();
    }
    return shard;
  }

  private getHashShard(shards: string[], value: string): string {
    const hash = this.hashString(value);
    const shardIndex = hash % shards.length;
    return shards[shardIndex];
  }

  private getRangeShard(shards: string[], value: any): string {
    // Simple range distribution for now
    // Can be enhanced with more sophisticated range logic
    const shardIndex = this.currentShardIndex % shards.length;
    this.currentShardIndex = (this.currentShardIndex + 1) % shards.length;
    return shards[shardIndex];
  }

  private getListShard(shards: string[], value: any): string {
    // List-based sharding for specific values
    const shardIndex = this.currentShardIndex % shards.length;
    this.currentShardIndex = (this.currentShardIndex + 1) % shards.length;
    return shards[shardIndex];
  }

  public getDefaultShard(): PrismaClient {
    const defaultShard = this.shards.get('shard-0');
    if (!defaultShard) {
      throw new Error('Default shard not found');
    }
    return defaultShard;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Get read replica for read operations
  public getReadShard(): PrismaClient {
    const readShards = this.shardConfigs.filter(s => s.isReadOnly && s.isActive);
    if (readShards.length === 0) {
      return this.getDefaultShard();
    }

    // Round-robin selection for read replicas
    const shardIndex = this.currentShardIndex % readShards.length;
    this.currentShardIndex = (this.currentShardIndex + 1) % readShards.length;
    
    const selectedShard = readShards[shardIndex];
    return this.shards.get(selectedShard.id) || this.getDefaultShard();
  }

  // Get all active shards
  public getAllShards(): PrismaClient[] {
    return Array.from(this.shards.values());
  }

  // Health check for all shards
  public async checkShardHealth(): Promise<Map<string, boolean>> {
    const healthStatus = new Map<string, boolean>();

    for (const [shardId, client] of this.shards) {
      try {
        await client.$queryRaw`SELECT 1`;
        healthStatus.set(shardId, true);
      } catch (error) {
        healthStatus.set(shardId, false);
        console.error(`Shard ${shardId} health check failed:`, error);
      }
    }

    return healthStatus;
  }

  // Close all shard connections
  public async closeAllShards(): Promise<void> {
    for (const client of this.shards.values()) {
      await client.$disconnect();
    }
    this.shards.clear();
  }

  // Get shard statistics
  public getShardStats(): {
    totalShards: number;
    activeShards: number;
    readOnlyShards: number;
    totalWeight: number;
  } {
    const activeShards = this.shardConfigs.filter(s => s.isActive);
    const readOnlyShards = activeShards.filter(s => s.isReadOnly);
    const totalWeight = activeShards.reduce((sum, s) => sum + s.weight, 0);

    return {
      totalShards: this.shardConfigs.length,
      activeShards: activeShards.length,
      readOnlyShards: readOnlyShards.length,
      totalWeight
    };
  }
}

// Export singleton instance
export const shardingManager = new DatabaseShardingManager();

// Export types for external use
// Types already exported above
