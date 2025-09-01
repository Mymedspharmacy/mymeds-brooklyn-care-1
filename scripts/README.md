# MyMeds Scripts

This folder contains all utility scripts organized by category for the MyMeds application.

## 📁 Folder Structure

### 🚀 Deployment Scripts (`deployment/`)
Scripts for deploying the application to various environments.

#### Shell Scripts
- `deploy-production.sh` - Production deployment script
- `deploy.sh` - General deployment script
- `deploy-vps-kvm1.sh` - VPS KVM1 specific deployment
- `deploy-to-vps.sh` - VPS deployment script
- `deploy-everything.sh` - Complete deployment script
- `simple-deploy.sh` - Simplified deployment script

#### PowerShell Scripts
- `deploy-mymeds.ps1` - MyMeds PowerShell deployment
- `deploy-domain.ps1` - Domain deployment script
- `deploy-simple.ps1` - Simple PowerShell deployment
- `deploy-everything-from-windows.ps1` - Complete Windows deployment

#### Batch Files
- `deploy-now-simple.bat` - Simple batch deployment
- `deploy-everything-from-windows.bat` - Complete Windows batch deployment

#### Configuration Files
- `ecosystem.config.js` - PM2 ecosystem configuration
- `nginx-vps-config.conf` - Nginx VPS configuration

### 🗄️ Database Scripts (`database/`)
Scripts for database management and migrations.

- `check-database.cjs` - Database connection checker
- `railway-migration.cjs` - Railway database migration
- `railway-collation-fix.sh` - Railway collation fix script
- `fix-collation.js` - Database collation fix utility
- `fix-collation.sql` - SQL collation fix script

### 🛠️ Utility Scripts (`utilities/`)
General utility scripts for various tasks.

- `generate-secrets.js` - Secret generation utility
- `setup-smtp-env.cjs` - SMTP environment setup
- `setup-automated-sync.sh` - Automated sync setup
- `automated-sync.cjs` - Automated sync utility
- `Frontend (React App) - Main Application` - Frontend documentation
- `ystemctl status nginx` - Nginx status check
- `lighthouse-report.json` - Performance report
- `load-tests/` - Load testing configuration
- `test-files/` - Test file assets
- `bun.lockb` - Bun lock file

### ⚙️ Configuration Scripts (`config/`)
Configuration files for various services.

- `env-vps-kvm1.example` - VPS KVM1 environment example
- `vercel.json` - Vercel deployment configuration
- `.lighthouserc.js` - Lighthouse configuration
- `jest.config.cjs` - Jest testing configuration
- `components.json` - UI components configuration
- `env-examples/` - Environment variable examples

### 📚 Documentation Scripts (`docs/`)
Documentation and setup guides.

- `QUICK_DEPLOYMENT_SUMMARY.md` - Quick deployment guide
- `DEPLOYMENT_READY.md` - Deployment readiness checklist
- `DOMAIN_DEPLOYMENT_GUIDE.md` - Domain deployment guide
- `GITHUB_SECRETS_SETUP.md` - GitHub secrets setup guide

## 🚀 Usage

### Deployment
```bash
# Production deployment
./scripts/deployment/deploy-production.sh

# VPS deployment
./scripts/deployment/deploy-vps-kvm1.sh

# Windows deployment
./scripts/deployment/deploy-mymeds.ps1
```

### Database Management
```bash
# Check database connection
node scripts/database/check-database.cjs

# Run Railway migration
node scripts/database/railway-migration.cjs

# Fix collation
node scripts/database/fix-collation.js
```

### Utilities
```bash
# Generate secrets
node scripts/utilities/generate-secrets.js

# Setup SMTP environment
node scripts/utilities/setup-smtp-env.cjs

# Setup automated sync
./scripts/utilities/setup-automated-sync.sh

# Run load tests
artillery run scripts/utilities/load-tests/artillery-config.yml
```

### Documentation
```bash
# View deployment guides
cat scripts/docs/QUICK_DEPLOYMENT_SUMMARY.md
cat scripts/docs/DEPLOYMENT_READY.md
```

## 📋 Script Categories

### 🔧 Development Scripts
- Environment setup
- Secret generation
- Database management
- Configuration files

### 🚀 Deployment Scripts
- Production deployment
- VPS deployment
- Windows deployment
- Domain deployment

### 🗄️ Database Scripts
- Connection checking
- Migration scripts
- Collation fixes
- Database utilities

### 📊 Monitoring Scripts
- Performance reports
- Status checks
- Health monitoring

### 📚 Documentation Scripts
- Deployment guides
- Setup instructions
- Configuration examples

## ⚠️ Important Notes

1. **Permissions**: Make sure deployment scripts have execute permissions
2. **Environment**: Some scripts require specific environment variables
3. **Dependencies**: Database scripts require database connection
4. **Platform**: Some scripts are platform-specific (Windows/Linux)

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
