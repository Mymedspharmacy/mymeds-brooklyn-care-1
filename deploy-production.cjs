const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ProductionDeployer {
  constructor() {
    this.deploymentLog = [];
    this.errors = [];
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type}: ${message}`;
    this.deploymentLog.push(logEntry);
    console.log(logEntry);
  }

  async deploy() {
    try {
      console.log('🚀 Starting Production Deployment...');
      console.log('=====================================');

      // Step 1: Validate environment
      await this.validateEnvironment();

      // Step 2: Setup MySQL Database
      await this.setupMySQLDatabase();

      // Step 3: Configure Prisma for Production
      await this.configurePrismaProduction();

      // Step 4: Build Frontend for Production
      await this.buildFrontendProduction();

      // Step 5: Configure CORS and Security
      await this.configureSecurity();

      // Step 6: Setup File Uploads
      await this.setupFileUploads();

      // Step 7: Create Production Scripts
      await this.createProductionScripts();

      // Step 8: Final Validation
      await this.finalValidation();

      this.generateDeploymentReport();

    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'ERROR');
      this.errors.push(error.message);
      this.generateDeploymentReport();
      process.exit(1);
    }
  }

  async validateEnvironment() {
    this.log('Validating production environment...');
    
    // Check if production env file exists
    const envPath = path.join(__dirname, 'backend/env.production');
    if (!fs.existsSync(envPath)) {
      throw new Error('Production environment file not found');
    }

    // Check if production schema exists
    const schemaPath = path.join(__dirname, 'backend/prisma/schema-production.prisma');
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Production Prisma schema not found');
    }

    this.log('Environment validation passed');
  }

  async setupMySQLDatabase() {
    this.log('Setting up MySQL database...');

    try {
      // Create MySQL database setup script
      const mysqlSetupScript = `
-- MySQL Database Setup for MyMeds Pharmacy Production
-- Generated: September 4, 2025

-- Create database
CREATE DATABASE IF NOT EXISTS mymeds_production
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'mymeds_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123';

-- Grant privileges
GRANT ALL PRIVILEGES ON mymeds_production.* TO 'mymeds_user'@'localhost';

-- Grant additional privileges for development
GRANT CREATE, DROP, ALTER, INDEX ON mymeds_production.* TO 'mymeds_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Use database
USE mymeds_production;

-- Create indexes for better performance
-- (These will be created by Prisma, but we can add custom ones here)

-- Show database info
SHOW DATABASES LIKE 'mymeds_production';
SELECT USER(), DATABASE();
`;

      const mysqlScriptPath = path.join(__dirname, 'mysql-setup.sql');
      fs.writeFileSync(mysqlScriptPath, mysqlSetupScript);
      
      this.log('MySQL setup script created: mysql-setup.sql');
      this.log('Run: mysql -u root -p < mysql-setup.sql');

    } catch (error) {
      this.log(`MySQL setup failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async configurePrismaProduction() {
    this.log('Configuring Prisma for production...');

    try {
      // Copy production schema to main schema
      const productionSchemaPath = path.join(__dirname, 'backend/prisma/schema-production.prisma');
      const mainSchemaPath = path.join(__dirname, 'backend/prisma/schema.prisma');
      
      if (fs.existsSync(productionSchemaPath)) {
        fs.copyFileSync(productionSchemaPath, mainSchemaPath);
        this.log('Production schema copied to main schema');
      }

      // Create production .env file
      const envProductionPath = path.join(__dirname, 'backend/env.production');
      const envPath = path.join(__dirname, 'backend/.env');
      
      if (fs.existsSync(envProductionPath)) {
        fs.copyFileSync(envProductionPath, envPath);
        this.log('Production environment file copied to .env');
      }

      // Generate Prisma client
      this.log('Generating Prisma client...');
      execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
      
      this.log('Prisma production configuration completed');

    } catch (error) {
      this.log(`Prisma configuration failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async buildFrontendProduction() {
    this.log('Building frontend for production...');

    try {
      // Create production .env for frontend
      const frontendEnvContent = `VITE_API_URL=https://mymedspharmacyinc.com/api
VITE_APP_NAME="MyMeds Pharmacy Inc."
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
`;

      const frontendEnvPath = path.join(__dirname, '.env.production');
      fs.writeFileSync(frontendEnvPath, frontendEnvContent);
      this.log('Frontend production environment file created');

      // Build frontend
      this.log('Building frontend...');
      execSync('npm run build', { stdio: 'inherit' });
      
      this.log('Frontend production build completed');

    } catch (error) {
      this.log(`Frontend build failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async configureSecurity() {
    this.log('Configuring security settings...');

    try {
      // Create CORS configuration
      const corsConfig = `
// CORS Configuration for Production
const corsOptions = {
  origin: [
    'https://mymedspharmacyinc.com',
    'https://www.mymedspharmacyinc.com',
    'https://mymedspharmacyinc.com/blog',
    'https://mymedspharmacyinc.com/shop'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  maxAge: 86400 // 24 hours
};

module.exports = corsOptions;
`;

      const corsConfigPath = path.join(__dirname, 'backend/src/config/cors.js');
      const corsConfigDir = path.dirname(corsConfigPath);
      
      if (!fs.existsSync(corsConfigDir)) {
        fs.mkdirSync(corsConfigDir, { recursive: true });
      }
      
      fs.writeFileSync(corsConfigPath, corsConfig);
      this.log('CORS configuration created');

      // Create security middleware
      const securityConfig = `
// Security Configuration for Production
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://mymedspharmacyinc.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  }
};

module.exports = securityConfig;
`;

      const securityConfigPath = path.join(__dirname, 'backend/src/config/security.js');
      fs.writeFileSync(securityConfigPath, securityConfig);
      this.log('Security configuration created');

    } catch (error) {
      this.log(`Security configuration failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async setupFileUploads() {
    this.log('Setting up file uploads...');

    try {
      // Create uploads directory
      const uploadsPath = path.join(__dirname, 'backend/uploads');
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
        this.log('Uploads directory created');
      }

      // Create uploads subdirectories
      const subdirs = ['prescriptions', 'transfers', 'appointments', 'temp'];
      subdirs.forEach(dir => {
        const subdirPath = path.join(uploadsPath, dir);
        if (!fs.existsSync(subdirPath)) {
          fs.mkdirSync(subdirPath, { recursive: true });
        }
      });

      // Create .gitkeep to preserve directory structure
      const gitkeepPath = path.join(uploadsPath, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '# This file preserves the uploads directory structure');
      }

      this.log('File uploads setup completed');

    } catch (error) {
      this.log(`File uploads setup failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async createProductionScripts() {
    this.log('Creating production scripts...');

    try {
      // Create production start script
      const startScript = `#!/bin/bash
# Production Start Script for MyMeds Pharmacy
# Generated: September 4, 2025

echo "🚀 Starting MyMeds Pharmacy Production Server..."

# Set environment
export NODE_ENV=production

# Check if database is ready
echo "📊 Checking database connection..."
cd backend
npx prisma db push --accept-data-loss

# Start the server
echo "🌐 Starting server on port 4000..."
npm run start:prod

echo "✅ Production server started successfully!"
`;

      const startScriptPath = path.join(__dirname, 'start-production.sh');
      fs.writeFileSync(startScriptPath, startScript);
      
      // Make executable (Unix/Linux)
      try {
        execSync(`chmod +x ${startScriptPath}`);
      } catch (e) {
        // Windows doesn't have chmod
      }

      // Create production package.json scripts
      const packagePath = path.join(__dirname, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        packageJson.scripts = {
          ...packageJson.scripts,
          'start:prod': 'cd backend && npm run start:prod',
          'build:prod': 'npm run build && cd backend && npm run build',
          'deploy:prod': 'node deploy-production.cjs',
          'db:migrate:prod': 'cd backend && npx prisma migrate deploy',
          'db:seed:prod': 'cd backend && npm run seed:prod'
        };

        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        this.log('Production scripts added to package.json');
      }

      this.log('Production scripts created');

    } catch (error) {
      this.log(`Production scripts creation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async finalValidation() {
    this.log('Performing final validation...');

    try {
      // Check if all required files exist
      const requiredFiles = [
        'backend/.env',
        'backend/prisma/schema.prisma',
        'backend/uploads/.gitkeep',
        'dist/index.html',
        'start-production.sh'
      ];

      const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
      }

      this.log('Final validation passed');

    } catch (error) {
      this.log(`Final validation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  generateDeploymentReport() {
    const report = {
      timestamp: new Date().toISOString(),
      deploymentLog: this.deploymentLog,
      errors: this.errors,
      success: this.errors.length === 0,
      summary: {
        totalSteps: this.deploymentLog.length,
        errors: this.errors.length,
        warnings: this.deploymentLog.filter(log => log.includes('WARN')).length
      }
    };

    // Save report to file
    const reportPath = path.join(__dirname, 'deployment-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'deployment-report.html');
    fs.writeFileSync(htmlPath, htmlReport);

    console.log('\n📊 Production Deployment Report Generated:');
    console.log(`  📄 JSON: ${reportPath}`);
    console.log(`  🌐 HTML: ${htmlPath}`);
    
    if (report.success) {
      console.log('\n✅ Production deployment completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Set up MySQL database: mysql -u root -p < mysql-setup.sql');
      console.log('2. Update environment variables with real credentials');
      console.log('3. Run database migration: npm run db:migrate:prod');
      console.log('4. Start production server: npm run start:prod');
      console.log('5. Configure SSL certificates and domain settings');
    } else {
      console.log('\n❌ Production deployment failed!');
      console.log('Check the deployment report for details.');
    }
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Deployment Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .status { padding: 20px; border-radius: 8px; margin: 20px 0; font-size: 18px; font-weight: bold; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
        .log-entry { margin: 5px 0; padding: 5px; border-radius: 4px; }
        .log-entry.ERROR { background: #f8d7da; }
        .log-entry.WARN { background: #fff3cd; }
        .log-entry.INFO { background: #d1ecf1; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Production Deployment Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
    </div>
    
    <div class="status ${report.success ? 'success' : 'error'}">
        ${report.success ? '✅ DEPLOYMENT SUCCESSFUL' : '❌ DEPLOYMENT FAILED'}
    </div>
    
    <h2>📋 Deployment Log</h2>
    ${report.deploymentLog.map(entry => {
        const type = entry.includes('ERROR') ? 'ERROR' : entry.includes('WARN') ? 'WARN' : 'INFO';
        return `<div class="log-entry ${type}">${entry}</div>`;
    }).join('')}
    
    ${report.errors.length > 0 ? `
    <h2>❌ Errors</h2>
    <ul>
        ${report.errors.map(error => `<li>${error}</li>`).join('')}
    </ul>
    ` : ''}
</body>
</html>
    `;
  }
}

// Run the production deployment
const deployer = new ProductionDeployer();
deployer.deploy().catch(console.error);
