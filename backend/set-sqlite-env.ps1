# PowerShell script to set SQLite environment for testing
$env:DATABASE_URL = "file:./dev.db"
Write-Host "Environment set for SQLite testing:"
Write-Host "DATABASE_URL = $env:DATABASE_URL"
Write-Host ""
Write-Host "You can now run:"
Write-Host "  npm run dev    (start development server)"
Write-Host "  npm run build  (build the project)"
Write-Host "  npx prisma studio (open Prisma Studio)"

