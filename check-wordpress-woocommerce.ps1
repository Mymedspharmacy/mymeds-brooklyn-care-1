# WordPress and WooCommerce Status Check Script (PowerShell)
# This script checks if WordPress and WooCommerce are installed and configured

Write-Host "🔍 Checking WordPress and WooCommerce Status..." -ForegroundColor Blue

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "LOCAL ENVIRONMENT CHECK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we're in the project directory
if (Test-Path "backend" -PathType Container) {
    Write-Success "MyMeds project structure found"
} else {
    Write-Warning "MyMeds project structure not found in current directory"
}

# Check for environment files
Write-Status "Checking environment files..."

$envFiles = @(
    "backend\.env",
    "backend\env.production",
    ".env"
)

foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Success "Environment file found: $file"
        
        # Check for WordPress/WooCommerce variables
        $content = Get-Content $file -ErrorAction SilentlyContinue
        if ($content -match "WORDPRESS|WOOCOMMERCE") {
            Write-Success "WordPress/WooCommerce environment variables found"
            $content | Where-Object { $_ -match "WORDPRESS|WOOCOMMERCE" } | ForEach-Object {
                $line = $_ -replace "=.*", "=***"
                Write-Host "  $line" -ForegroundColor Gray
            }
        } else {
            Write-Warning "No WordPress/WooCommerce environment variables found"
        }
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "REMOTE SERVER CHECK INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Status "To check your server, run these commands on your Linux VPS:"
Write-Host ""
Write-Host "1. SSH into your server:" -ForegroundColor Yellow
Write-Host "   ssh root@your-server-ip" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Upload and run the check script:" -ForegroundColor Yellow
Write-Host "   chmod +x check-wordpress-woocommerce.sh" -ForegroundColor Gray
Write-Host "   sudo ./check-wordpress-woocommerce.sh" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Or run these manual checks:" -ForegroundColor Yellow
Write-Host "   # Check for WordPress installations" -ForegroundColor Gray
Write-Host "   find /var/www -name 'wp-config.php' 2>/dev/null" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Check for WooCommerce plugin" -ForegroundColor Gray
Write-Host "   find /var/www -path '*/wp-content/plugins/woocommerce' 2>/dev/null" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Check web server status" -ForegroundColor Gray
Write-Host "   systemctl status apache2 nginx" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Check MySQL status" -ForegroundColor Gray
Write-Host "   systemctl status mysql" -ForegroundColor Gray
Write-Host ""
Write-Host "   # Check for WordPress databases" -ForegroundColor Gray
Write-Host "   mysql -e 'SHOW DATABASES;' | grep -E '(wordpress|wp_|mymeds|blog|shop)'" -ForegroundColor Gray

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "QUICK WEB CHECKS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Status "You can also check these URLs in your browser:"
Write-Host ""
Write-Host "WordPress URLs to check:" -ForegroundColor Yellow
Write-Host "  https://mymedspharmacyinc.com" -ForegroundColor Gray
Write-Host "  https://mymedspharmacyinc.com/blog" -ForegroundColor Gray
Write-Host "  https://mymedspharmacyinc.com/shop" -ForegroundColor Gray
Write-Host ""
Write-Host "WooCommerce API endpoints:" -ForegroundColor Yellow
Write-Host "  https://mymedspharmacyinc.com/wp-json/wc/v3/" -ForegroundColor Gray
Write-Host "  https://mymedspharmacyinc.com/shop/wp-json/wc/v3/" -ForegroundColor Gray
Write-Host ""
Write-Host "WordPress REST API:" -ForegroundColor Yellow
Write-Host "  https://mymedspharmacyinc.com/wp-json/wp/v2/" -ForegroundColor Gray
Write-Host "  https://mymedspharmacyinc.com/blog/wp-json/wp/v2/" -ForegroundColor Gray

Write-Host ""
Write-Status "Check complete! 🎉"
