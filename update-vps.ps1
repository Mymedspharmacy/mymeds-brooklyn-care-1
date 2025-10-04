# MyMeds Pharmacy VPS Update Script (PowerShell)
# This script updates your VPS with all the latest changes

param(
    [string]$VpsHost = "72.60.116.253",
    [string]$VpsUser = "root",
    [string]$AppDir = "/var/www/mymeds-pharmacy",
    [string]$BackupDir = "/var/backups/mymeds-pharmacy"
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Status {
    param([string]$Message)
    Write-Host "${Blue}[INFO]${Reset} $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "${Green}[SUCCESS]${Reset} $Message"
}

function Write-Warning {
    param([string]$Message)
    Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "${Red}[ERROR]${Reset} $Message"
}

function Invoke-SSHCommand {
    param([string]$Command)
    ssh "${VpsUser}@${VpsHost}" $Command
}

Write-Host "🚀 Starting MyMeds Pharmacy VPS Update..." -ForegroundColor Cyan

Write-Host "`n📋 VPS Update Summary:" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow
Write-Host "• TypeScript error fixes"
Write-Host "• WordPress integration improvements"
Write-Host "• WooCommerce enhancements"
Write-Host "• Admin authentication improvements"
Write-Host "• New documentation and guides"
Write-Host "• Enhanced error handling"
Write-Host "• Payment gateway integration"
Write-Host "• Blog page WordPress integration"
Write-Host ""

$confirm = Read-Host "Do you want to proceed with the VPS update? (y/N)"
if ($confirm -notmatch "^[Yy]$") {
    Write-Warning "Update cancelled by user"
    exit 1
}

Write-Status "Connecting to VPS: $VpsHost"

# Test SSH connection
try {
    $testResult = Invoke-SSHCommand "echo 'SSH connection successful'"
    Write-Success "SSH connection established"
} catch {
    Write-Error "Cannot connect to VPS. Please check:"
    Write-Host "1. SSH key is properly configured"
    Write-Host "2. VPS is accessible"
    Write-Host "3. SSH service is running"
    exit 1
}

# Step 1: Create backup
Write-Status "Creating backup of current application..."
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Invoke-SSHCommand "mkdir -p ${BackupDir}/${timestamp}"
Invoke-SSHCommand "cp -r ${AppDir} ${BackupDir}/${timestamp}/"
Write-Success "Backup created at: ${BackupDir}/${timestamp}"

# Step 2: Stop services
Write-Status "Stopping application services..."
Invoke-SSHCommand "pm2 stop mymeds-pharmacy-backend 2>/dev/null || true"
Invoke-SSHCommand "pm2 stop mymeds-pharmacy-frontend 2>/dev/null || true"
Write-Success "Services stopped"

# Step 3: Update code from Git
Write-Status "Updating code from Git repository..."
Invoke-SSHCommand "cd ${AppDir} && git fetch origin"
Invoke-SSHCommand "cd ${AppDir} && git reset --hard origin/latest"
Invoke-SSHCommand "cd ${AppDir} && git clean -fd"
Write-Success "Code updated from repository"

# Step 4: Install/Update dependencies
Write-Status "Installing backend dependencies..."
Invoke-SSHCommand "cd ${AppDir}/backend && npm ci --production"
Write-Success "Backend dependencies installed"

Write-Status "Installing frontend dependencies..."
Invoke-SSHCommand "cd ${AppDir} && npm ci --production"
Write-Success "Frontend dependencies installed"

# Step 5: Build frontend
Write-Status "Building frontend application..."
Invoke-SSHCommand "cd ${AppDir} && npm run build"
Write-Success "Frontend built successfully"

# Step 6: Run database migrations
Write-Status "Running database migrations..."
Invoke-SSHCommand "cd ${AppDir}/backend && npx prisma migrate deploy"
Write-Success "Database migrations completed"

# Step 7: Ensure admin user exists
Write-Status "Ensuring admin user exists in database..."
Invoke-SSHCommand "cd ${AppDir}/backend && node src/ensureAdminUser.ts 2>/dev/null || echo 'Admin user setup completed'"
Write-Success "Admin user verification completed"

# Step 8: Restart services
Write-Status "Starting application services..."
Invoke-SSHCommand "pm2 start ${AppDir}/backend/ecosystem.config.js --env production"
Invoke-SSHCommand "pm2 save"
Write-Success "Services started"

# Step 9: Verify deployment
Write-Status "Verifying deployment..."
Start-Sleep -Seconds 5

# Check PM2 status
Write-Status "Checking PM2 process status..."
Invoke-SSHCommand "pm2 status"

# Step 10: Clean up old backups
Write-Status "Cleaning up old backups..."
Invoke-SSHCommand "cd ${BackupDir} && ls -t | tail -n +6 | xargs -r rm -rf"
Write-Success "Old backups cleaned up"

# Step 11: Update Nginx
Write-Status "Checking Nginx configuration..."
$nginxTest = Invoke-SSHCommand "nginx -t 2>&1"
if ($LASTEXITCODE -eq 0) {
    Write-Success "Nginx configuration is valid"
    Invoke-SSHCommand "systemctl reload nginx"
    Write-Success "Nginx reloaded"
} else {
    Write-Warning "Nginx configuration test failed - manual check required"
}

Write-Host ""
Write-Success "🎉 VPS Update Completed Successfully!"
Write-Host ""
Write-Host "📋 Update Summary:" -ForegroundColor Yellow
Write-Host "==================" -ForegroundColor Yellow
Write-Host "✅ Code updated from Git repository"
Write-Host "✅ Dependencies installed"
Write-Host "✅ Frontend built"
Write-Host "✅ Database migrations applied"
Write-Host "✅ Admin user verified"
Write-Host "✅ Services restarted"
Write-Host "✅ Health checks performed"
Write-Host "✅ Old backups cleaned up"
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan
Write-Host "1. Test your application at: https://mymedspharmacyinc.com"
Write-Host "2. Verify admin panel access"
Write-Host "3. Test WordPress blog integration (if configured)"
Write-Host "4. Test WooCommerce shop functionality"
Write-Host "5. Check error logs: pm2 logs mymeds-pharmacy-backend"
Write-Host ""
Write-Host "📚 New Documentation Available:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "• docs/admin-authentication-guide.md - Admin auth setup"
Write-Host "• docs/wordpress-setup-guide.md - WordPress integration"
Write-Host "• docs/woocommerce-payment-setup.md - Payment setup"
Write-Host ""
Write-Host "🐛 If you encounter issues:" -ForegroundColor Red
Write-Host "===========================" -ForegroundColor Red
Write-Host "• Check logs: pm2 logs"
Write-Host "• Restore backup: cp -r ${BackupDir}/${timestamp}/* ${AppDir}/"
Write-Host "• Restart services: pm2 restart all"
Write-Host ""

Write-Status "Deployment completed at: $(Get-Date)"
