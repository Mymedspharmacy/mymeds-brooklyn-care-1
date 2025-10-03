# MyMeds Pharmacy Windows Deployment Helper
# This script helps Windows users upload and run the deployment scripts on their VPS

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "mymedspharmaceuticals.com"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  MyMeds Pharmacy Windows Deployment Helper" -ForegroundColor Yellow
Write-Host "  VPS IP: $VpsIP" -ForegroundColor Green
Write-Host "  Domain: $Domain" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Error "SSH client not found. Please install OpenSSH or PuTTY"
    exit 1
}

Write-Host "Uploading deployment scripts to VPS..." -ForegroundColor Yellow

# Create directories on VPS
ssh $Username@$VpsIP "mkdir -p /root/scripts"

# Upload all shell scripts
$scripts = @(
    "setup-database.sh",
    "setup-wordpress.sh", 
    "setup-application.sh",
    "setup-ssl.sh",
    "setup-nginx.sh",
    "deploy-mymeds.sh"
)

foreach ($script in $scripts) {
    if (Test-Path "scripts\$script") {
        Write-Host "Uploading $script..." -ForegroundColor Green
        scp "scripts\$script" "$Username@$VpsIP:/root/scripts/"
        
        # Make executable
        ssh $Username@$VpsIP "chmod +x /root/scripts/$script"
        Write-Host "✓ $script uploaded and made executable" -ForegroundColor Green
    } else {
        Write-Warning "Script $script not found, skipping..."
    }
}

# Upload README
if (Test-Path "scripts/README.md") {
    scp "scripts/README.md" "$Username@$VpsIP:/root/"
    Write-Host "✓ README.md uploaded" -ForegroundColor Green
}

Write-Host "`nAll scripts uploaded successfully!" -ForegroundColor Yellow
Write-Host "`nTo deploy MyMeds Pharmacy:" -ForegroundColor Cyan
Write-Host "1. Connect to your VPS:" -ForegroundColor White
Write-Host "   ssh $Username@$VpsIP" -ForegroundColor Gray
Write-Host "`n2. Run the deployment script:" -ForegroundColor White
Write-Host "   cd /root/scripts" -ForegroundColor Gray
Write-Host "   sudo ./deploy-mymeds.sh" -ForegroundColor Gray
Write-Host "`n3. Or run individual scripts:" -ForegroundColor White
Write-Host "   sudo ./setup-database.sh" -ForegroundColor Gray
Write-Host "   sudo ./setup-wordpress.sh" -ForegroundColor Gray
Write-Host "   sudo ./setup-application.sh" -ForegroundColor Gray
Write-Host "   sudo ./setup-ssl.sh" -ForegroundColor Gray
Write-Host "   sudo ./setup-nginx.sh" -ForegroundColor Gray

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Deployment scripts ready on VPS!" -ForegroundColor Green
Write-Host "Don't forget to configure DNS records first!" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
