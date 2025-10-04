# Add Admin User Script for MyMeds Pharmacy
# Usage: .\add-admin-user.ps1 [email] [password] [firstName] [lastName]

param(
    [string]$Email = "admin2@mymedspharmacy.com",
    [string]$Password = "Admin123!",
    [string]$FirstName = "Admin",
    [string]$LastName = "User"
)

Write-Host "🔐 Adding new admin user..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "backend/package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📧 Email: $Email" -ForegroundColor Yellow
Write-Host "👤 Name: $FirstName $LastName" -ForegroundColor Yellow
Write-Host "🔑 Password: $Password" -ForegroundColor Yellow

# Run the Node.js script
try {
    Write-Host "🚀 Running admin user creation script..." -ForegroundColor Cyan
    node scripts/add-admin-user.js $Email $Password $FirstName $LastName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Admin user creation completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 New admin user added:" -ForegroundColor Green
        Write-Host "   Email: $Email" -ForegroundColor White
        Write-Host "   Password: $Password" -ForegroundColor White
        Write-Host "   Name: $FirstName $LastName" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  Please change the password after first login for security." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create admin user" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error running script: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "📝 To login to the admin panel:" -ForegroundColor Cyan
Write-Host "   1. Go to: http://your-domain/admin-signin" -ForegroundColor White
Write-Host "   2. Use the credentials above" -ForegroundColor White
Write-Host "   3. Change password after first login" -ForegroundColor White
