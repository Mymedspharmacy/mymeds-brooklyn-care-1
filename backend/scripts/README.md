# Backend Scripts

This folder contains all utility scripts for the MyMeds backend, organized by category.

## 📁 Folder Structure

### 🚀 Deployment Scripts (`deployment/`)
Scripts for deploying the backend to various environments.

- `deploy.sh` - Main deployment script
- `deploy-vps-kvm1.sh` - VPS KVM1 specific deployment
- `verify-deployment.sh` - Deployment verification
- `nginx-production.conf` - Nginx production configuration
- `Dockerfile` - Docker container configuration
- `pre-deploy-backup.sh` - Pre-deployment backup script

### 🗄️ Database Scripts (`database/`)
Scripts for database management and migrations.

- `check-database.cjs` - Database connection checker
- `check-tables.js` - Database table verification
- `create-admin-user.js` - Admin user creation
- `create-missing-tables.js` - Missing table creation
- `create-newsletter-table.js` - Newsletter table creation
- `add-error-tracking-fields.js` - Error tracking field addition
- `check-admin-user.cjs` - Admin user verification

### 🛠️ Utility Scripts (`utilities/`)
General utility scripts for various backend tasks.

- `generate-admin-jwt.js` - Admin JWT token generation
- `generate-jwt-secret.js` - JWT secret generation
- `security-monitor.js` - Security monitoring utility
- `production-fixes.js` - Production environment fixes
- `newrelic.js` - New Relic monitoring configuration
- `monitor-database.js` - Database monitoring
- `monitor-system.js` - System monitoring
- `backup-env.js` - Environment backup
- `backup-files.js` - File backup utility
- `backup-database.js` - Database backup utility

### ⚙️ Configuration Scripts (`config/`)
Configuration files for the backend.

- `env.production` - Production environment variables
- `env.production.example` - Production environment template
- `env.test.example` - Test environment template
- `jest.config.js` - Jest testing configuration

### 📚 Documentation Scripts (`docs/`)
Documentation and setup guides.

- `DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `DEPLOYMENT_SUMMARY.md` - Deployment summary
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `PRODUCTION_READINESS_FINAL.md` - Production readiness guide

## 🚀 Usage

### Deployment
```bash
# Main deployment
./scripts/deployment/deploy.sh

# VPS deployment
./scripts/deployment/deploy-vps-kvm1.sh

# Verify deployment
./scripts/deployment/verify-deployment.sh

# Pre-deployment backup
./scripts/deployment/pre-deploy-backup.sh
```

### Database Management
```bash
# Check database connection
node scripts/database/check-database.cjs

# Check tables
node scripts/database/check-tables.js

# Create admin user
node scripts/database/create-admin-user.js

# Create missing tables
node scripts/database/create-missing-tables.js
```

### Utilities
```bash
# Generate JWT secret
node scripts/utilities/generate-jwt-secret.js

# Generate admin JWT
node scripts/utilities/generate-admin-jwt.js

# Monitor database
node scripts/utilities/monitor-database.js

# Monitor system
node scripts/utilities/monitor-system.js

# Backup environment
node scripts/utilities/backup-env.js
```

### Configuration
```bash
# Copy production environment
cp scripts/config/env.production.example .env.production

# Setup test environment
cp scripts/config/env.test.example .env.test
```

## 📋 Script Categories

### 🔧 Development Scripts
- Database setup and management
- User creation and verification
- Table creation and modification
- Environment configuration

### 🚀 Deployment Scripts
- Production deployment
- VPS deployment
- Deployment verification
- Pre-deployment backups

### 🗄️ Database Scripts
- Connection checking
- Table verification
- User management
- Schema modifications

### 📊 Monitoring Scripts
- Database monitoring
- System monitoring
- Security monitoring
- Performance tracking

### 🔒 Security Scripts
- JWT secret generation
- Admin token generation
- Security monitoring
- Access verification

## ⚠️ Important Notes

1. **Environment Variables**: Most scripts require proper environment variables
2. **Database Connection**: Database scripts need active database connection
3. **Permissions**: Deployment scripts may require elevated permissions
4. **Dependencies**: Ensure all dependencies are installed before running scripts

## 🔒 Security

- Never commit sensitive information in scripts
- Use environment variables for secrets
- Review scripts before execution
- Test in development environment first

## 📝 Maintenance

- Keep scripts updated with latest dependencies
- Test scripts after major changes
- Document any new scripts added
- Remove obsolete scripts regularly

## 🏗️ Backend Architecture

The backend uses:
- **Node.js** with Express
- **Prisma ORM** for database management
- **JWT** for authentication
- **PM2** for process management
- **Nginx** for reverse proxy
- **New Relic** for monitoring
