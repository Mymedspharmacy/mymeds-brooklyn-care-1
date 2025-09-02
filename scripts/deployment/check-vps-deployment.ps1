# 🏥 MyMeds Pharmacy - VPS Deployment Check Script (PowerShell)
# This script checks the current deployment status on your VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$VPS_IP,
    
    [Parameter(Mandatory=$false)]
    [string]$VPS_USER = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$SSH_KEY_PATH = "$env:USERPROFILE\.ssh\id_rsa"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Configuration
$DEPLOY_DIR = "/var/www/mymeds"
$BACKUP_DIR = "/var/backups/mymeds"
$LOG_DIR = "/var/log/mymeds"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Color = $Green)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Log "[ERROR] $Message" $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Log "[WARNING] $Message" $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Log "[INFO] $Message" $Blue
}

# Execute remote command
function Invoke-RemoteCommand {
    param([string]$Command, [string]$Description = "")
    
    if ($Description) {
        Write-Log "Executing: $Description"
    }
    
    try {
        $sshCommand = "ssh -i `"$SSH_KEY_PATH`" -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP `"$Command`""
        $result = Invoke-Expression $sshCommand 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Command failed: $Command"
            Write-Error "Output: $result"
        }
        
        return $result
    }
    catch {
        Write-Error "SSH command failed: $($_.Exception.Message)"
    }
}

Write-Log "🔍 Checking MyMeds Pharmacy deployment status on VPS..."

# Check if deployment directory exists
$deployCheck = Invoke-RemoteCommand "test -d $DEPLOY_DIR && echo 'EXISTS' || echo 'NOT_EXISTS'" "Checking deployment directory"
if ($deployCheck -like "*EXISTS*") {
    Write-Log "✅ Deployment directory exists: $DEPLOY_DIR"
    
    # Check directory contents
    Write-Log "📁 Current deployment contents:"
    Invoke-RemoteCommand "ls -la $DEPLOY_DIR | head -20" "Listing deployment contents"
    
    # Check if it's a git repository
    $gitCheck = Invoke-RemoteCommand "test -d $DEPLOY_DIR/.git && echo 'GIT_REPO' || echo 'NOT_GIT'" "Checking if git repository"
    if ($gitCheck -like "*GIT_REPO*") {
        Write-Log "📦 Current deployment is a git repository"
        $gitStatus = Invoke-RemoteCommand "cd $DEPLOY_DIR && git status --short" "Checking git status"
        Write-Log "🔍 Current git status:"
        Write-Host $gitStatus
        
        $gitBranch = Invoke-RemoteCommand "cd $DEPLOY_DIR && git branch --show-current" "Getting current branch"
        Write-Log "📋 Current branch: $gitBranch"
        
        $gitCommit = Invoke-RemoteCommand "cd $DEPLOY_DIR && git log -1 --format='%h - %s (%cr)'" "Getting last commit"
        Write-Log "📅 Last commit: $gitCommit"
    } else {
        Write-Warning "⚠️ Current deployment is not a git repository"
    }
    
    # Check package.json version
    $frontendVersion = Invoke-RemoteCommand "grep '\"version\"' $DEPLOY_DIR/package.json 2>/dev/null || echo 'No version found'" "Checking frontend version"
    Write-Log "📋 Current frontend version: $frontendVersion"
    
    $backendVersion = Invoke-RemoteCommand "grep '\"version\"' $DEPLOY_DIR/backend/package.json 2>/dev/null || echo 'No version found'" "Checking backend version"
    Write-Log "📋 Current backend version: $backendVersion"
} else {
    Write-Warning "⚠️ Deployment directory does not exist: $DEPLOY_DIR"
}

# Check services status
Write-Log "🔧 Checking service status..."

# Check PM2 processes
$pm2Check = Invoke-RemoteCommand "command -v pm2 > /dev/null && echo 'PM2_EXISTS' || echo 'PM2_NOT_FOUND'" "Checking PM2"
if ($pm2Check -like "*PM2_EXISTS*") {
    Write-Log "📊 PM2 processes:"
    Invoke-RemoteCommand "pm2 status" "Getting PM2 status"
} else {
    Write-Warning "⚠️ PM2 not found"
}

# Check Nginx status
$nginxCheck = Invoke-RemoteCommand "command -v nginx > /dev/null && echo 'NGINX_EXISTS' || echo 'NGINX_NOT_FOUND'" "Checking Nginx"
if ($nginxCheck -like "*NGINX_EXISTS*") {
    Write-Log "🌐 Nginx status:"
    Invoke-RemoteCommand "systemctl status nginx --no-pager -l | head -10" "Getting Nginx status"
} else {
    Write-Warning "⚠️ Nginx not found"
}

# Check MySQL status
$mysqlCheck = Invoke-RemoteCommand "command -v mysql > /dev/null && echo 'MYSQL_EXISTS' || echo 'MYSQL_NOT_FOUND'" "Checking MySQL"
if ($mysqlCheck -like "*MYSQL_EXISTS*") {
    Write-Log "🗄️ MySQL status:"
    Invoke-RemoteCommand "systemctl status mysql --no-pager -l | head -10" "Getting MySQL status"
} else {
    Write-Warning "⚠️ MySQL not found"
}

# Check Redis status
$redisCheck = Invoke-RemoteCommand "command -v redis-server > /dev/null && echo 'REDIS_EXISTS' || echo 'REDIS_NOT_FOUND'" "Checking Redis"
if ($redisCheck -like "*REDIS_EXISTS*") {
    Write-Log "🔴 Redis status:"
    Invoke-RemoteCommand "systemctl status redis-server --no-pager -l | head -10" "Getting Redis status"
} else {
    Write-Warning "⚠️ Redis not found"
}

# Check disk space
Write-Log "💾 Disk space usage:"
Invoke-RemoteCommand "df -h" "Getting disk usage"

# Check memory usage
Write-Log "🧠 Memory usage:"
Invoke-RemoteCommand "free -h" "Getting memory usage"

# Check if application is responding
Write-Log "🏥 Testing application health..."

# Test backend health
$backendHealth = Invoke-RemoteCommand "curl -f http://localhost:4000/api/health > /dev/null 2>&1 && echo 'HEALTHY' || echo 'UNHEALTHY'" "Testing backend health"
if ($backendHealth -like "*HEALTHY*") {
    Write-Log "✅ Backend health check passed"
} else {
    Write-Error "❌ Backend health check failed"
}

# Test frontend
$frontendHealth = Invoke-RemoteCommand "curl -f http://localhost:80 > /dev/null 2>&1 && echo 'HEALTHY' || echo 'UNHEALTHY'" "Testing frontend health"
if ($frontendHealth -like "*HEALTHY*") {
    Write-Log "✅ Frontend is responding"
} else {
    Write-Error "❌ Frontend is not responding"
}

# Check recent logs
Write-Log "📋 Recent deployment logs:"
$deployLogCheck = Invoke-RemoteCommand "test -f /var/log/mymeds-deployment.log && echo 'EXISTS' || echo 'NOT_EXISTS'" "Checking deployment log"
if ($deployLogCheck -like "*EXISTS*") {
    Invoke-RemoteCommand "tail -20 /var/log/mymeds-deployment.log" "Getting recent deployment logs"
} else {
    Write-Warning "⚠️ No deployment log found"
}

# Check application logs
Write-Log "📋 Recent application logs:"
$appLogCheck = Invoke-RemoteCommand "test -d $LOG_DIR && echo 'EXISTS' || echo 'NOT_EXISTS'" "Checking application log directory"
if ($appLogCheck -like "*EXISTS*") {
    Invoke-RemoteCommand "find $LOG_DIR -name '*.log' -type f -exec tail -5 {} \; 2>/dev/null || echo 'No application logs found'" "Getting application logs"
} else {
    Write-Warning "⚠️ No application log directory found"
}

# Check backups
Write-Log "💾 Checking backups:"
$backupCheck = Invoke-RemoteCommand "test -d $BACKUP_DIR && echo 'EXISTS' || echo 'NOT_EXISTS'" "Checking backup directory"
if ($backupCheck -like "*EXISTS*") {
    Write-Log "📦 Available backups:"
    Invoke-RemoteCommand "ls -la $BACKUP_DIR | head -10" "Listing backups"
} else {
    Write-Warning "⚠️ No backup directory found"
}

# Check environment configuration
Write-Log "⚙️ Checking environment configuration:"
$envCheck = Invoke-RemoteCommand "test -f $DEPLOY_DIR/backend/.env && echo 'EXISTS' || echo 'NOT_EXISTS'" "Checking backend .env file"
if ($envCheck -like "*EXISTS*") {
    Write-Log "✅ Backend .env file exists"
    Invoke-RemoteCommand "grep -E '^(NODE_ENV|PORT|DATABASE_URL)' $DEPLOY_DIR/backend/.env 2>/dev/null || echo 'No environment variables found'" "Getting environment variables"
} else {
    Write-Warning "⚠️ Backend .env file not found"
}

# Summary
Write-Log "=== DEPLOYMENT CHECK SUMMARY ==="
Write-Log "Deployment Directory: $DEPLOY_DIR"
Write-Log "Backup Directory: $BACKUP_DIR"
Write-Log "Log Directory: $LOG_DIR"

if ($deployCheck -like "*EXISTS*") {
    Write-Log "✅ MyMeds Pharmacy is currently deployed"
    Write-Log "🔄 Ready for update/replacement"
} else {
    Write-Log "❌ No current deployment found"
    Write-Log "🚀 Ready for fresh installation"
}

Write-Log "🎯 Next steps:"
Write-Log "1. Review the current deployment status above"
Write-Log "2. Create backup if needed"
Write-Log "3. Deploy new version using GitHub Actions or manual deployment"
Write-Log "4. Verify new deployment is working"

Write-Log "✅ VPS deployment check completed!"
