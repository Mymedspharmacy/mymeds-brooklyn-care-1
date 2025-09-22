// Centralized Configuration Management
// Clean Architecture: Configuration Layer

export interface AppConfig {
  // Server Configuration
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  
  // Database Configuration
  database: {
    url: string;
    maxConnections: number;
    connectionTimeout: number;
  };
  
  // Security Configuration
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    corsOrigins: string[];
  };
  
  // Rate Limiting Configuration
  rateLimit: {
    auth: {
      windowMs: number;
      max: number;
    };
    contact: {
      windowMs: number;
      max: number;
    };
    general: {
      windowMs: number;
      max: number;
    };
  };
  
  // External Services
  external: {
    woocommerce: {
      url: string;
      consumerKey: string;
      consumerSecret: string;
    };
    wordpress: {
      url: string;
      username: string;
      password: string;
    };
  };
  
  // Monitoring Configuration
  monitoring: {
    memoryThresholds: {
      warning: number;
      critical: number;
      max: number;
    };
    cacheConfig: {
      maxSize: number;
      defaultTtl: number;
      cleanupInterval: number;
    };
  };
}

// Environment validation
const validateEnvironment = (): void => {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET!.length < 32) {
    console.error('❌ JWT_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL!.startsWith('mysql://') && 
      !process.env.DATABASE_URL!.startsWith('postgresql://') &&
      !process.env.DATABASE_URL!.startsWith('file:')) {
    console.error('❌ DATABASE_URL must be a valid MySQL, PostgreSQL, or SQLite connection string');
    process.exit(1);
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'staging', 'production'];
  if (!validEnvs.includes(process.env.NODE_ENV!)) {
    console.error(`❌ NODE_ENV must be one of: ${validEnvs.join(', ')}`);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

// Configuration factory
export const createConfig = (): AppConfig => {
  validateEnvironment();
  
  const nodeEnv = process.env.NODE_ENV as 'development' | 'staging' | 'production';
  
  // Define allowed origins for CORS
  const allowedOrigins = [
    // Production Domains
    'https://www.mymedspharmacyinc.com',
    'https://mymedspharmacyinc.com',
    
    // VPS Deployment (Production) - Port-specific URLs
    'https://72.60.116.253',
    'http://72.60.116.253',
    'http://72.60.116.253:3000',  // MyMeds Frontend
    'http://72.60.116.253:4000',  // MyMeds Backend
    'http://72.60.116.253:8080',  // WordPress
    
    // Add localhost only for development environment
    ...(nodeEnv === 'development' ? [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:4000',
      'http://localhost:5173',
      'http://192.168.18.56:3000',
      'http://192.168.18.56:3001',
      'http://192.168.18.56:3002',
      'http://192.168.18.56:3003',
      'http://192.168.18.56:3004'
    ] : [])
  ];

  return {
    port: parseInt(process.env.PORT || '4000'),
    nodeEnv,
    
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
    },
    
    security: {
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
      corsOrigins: allowedOrigins
    },
    
    rateLimit: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_AUTH || '20')
      },
      contact: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_CONTACT || '50')
      },
      general: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: nodeEnv === 'production' ? 
          parseInt(process.env.RATE_LIMIT_GENERAL || '1000') : 
          parseInt(process.env.RATE_LIMIT_GENERAL || '5000')
      }
    },
    
    external: {
      woocommerce: {
        url: process.env.WOOCOMMERCE_STORE_URL || 'https://mymedspharmacyinc.com/shop',
        consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
        consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || ''
      },
      wordpress: {
        url: process.env.VITE_WORDPRESS_URL || 'https://mymedspharmacyinc.com/blog',
        username: process.env.WORDPRESS_USERNAME || '',
        password: process.env.WORDPRESS_PASSWORD || ''
      }
    },
    
    monitoring: {
      memoryThresholds: {
        warning: 1024,    // 1GB
        critical: 2048,   // 2GB
        max: 3072         // 3GB
      },
      cacheConfig: {
        maxSize: 1000,
        defaultTtl: 300000, // 5 minutes
        cleanupInterval: 5 * 60 * 1000 // 5 minutes
      }
    }
  };
};

// Export singleton instance
export const config = createConfig();
