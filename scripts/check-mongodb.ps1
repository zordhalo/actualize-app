# Check if MongoDB is running locally
Write-Host "Checking MongoDB connection..." -ForegroundColor Cyan

$connectionString = "mongodb://localhost:27017"
if ($env:MONGODB_URI) {
    $connectionString = $env:MONGODB_URI
}

try {
    # Try to connect using MongoDB shell if available
    $mongoPath = Get-Command mongosh -ErrorAction SilentlyContinue
    if ($mongoPath) {
        Write-Host "MongoDB shell found. Testing connection..." -ForegroundColor Yellow
        mongosh --eval "db.adminCommand('ping')" --quiet 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MongoDB is running!" -ForegroundColor Green
            exit 0
        }
    }
    
    # Try using Test-NetConnection
    Write-Host "Checking if port 27017 is open..." -ForegroundColor Yellow
    $result = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ Port 27017 is open - MongoDB might be running" -ForegroundColor Green
        Write-Host "   Try running: npm run test:mongodb" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Port 27017 is not accessible" -ForegroundColor Red
        Write-Host "   MongoDB is not running or not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error checking MongoDB: $_" -ForegroundColor Red
}

Write-Host "`nTo start MongoDB:" -ForegroundColor Cyan
Write-Host "  1. Install Docker Desktop and run: docker compose up mongodb" -ForegroundColor Yellow
Write-Host "  2. Install MongoDB locally: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
Write-Host "  3. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
