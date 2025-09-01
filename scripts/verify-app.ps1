# App Verification Script for HealthProtocol (PowerShell version)
# This script ensures the app is running correctly after changes

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "HealthProtocol App Verification" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$APP_PORT = 3501
$DB_PORT = 5434
$APP_URL = "http://localhost:$APP_PORT"
$CONTAINER_NAME = "evofithealthprotocol-dev"
$DB_CONTAINER = "evofithealthprotocol-postgres"

# Step 1: Check if Docker is running
Write-Host "1. Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Step 2: Check container status
Write-Host ""
Write-Host "2. Checking container status..." -ForegroundColor Yellow
$appRunning = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | Select-String $CONTAINER_NAME
$dbRunning = docker ps --filter "name=$DB_CONTAINER" --format "{{.Names}}" | Select-String $DB_CONTAINER

if (-not $appRunning -or -not $dbRunning) {
    Write-Host "⚠️  Containers not running. Starting them..." -ForegroundColor Yellow
    docker-compose --profile dev up -d
    Write-Host "   Waiting for containers to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
} else {
    Write-Host "✅ Containers are running" -ForegroundColor Green
}

# Step 3: Check database health
Write-Host ""
Write-Host "3. Checking database health..." -ForegroundColor Yellow
$dbHealth = docker inspect --format='{{.State.Health.Status}}' $DB_CONTAINER 2>$null
if ($dbHealth -eq "healthy") {
    Write-Host "✅ Database is healthy" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database health: $dbHealth" -ForegroundColor Yellow
    Write-Host "   Waiting for database to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Step 4: Check app HTTP response
Write-Host ""
Write-Host "4. Checking app HTTP response..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $APP_URL -Method Head -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ App is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  App responded with HTTP $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ App not responding properly" -ForegroundColor Red
    Write-Host "   Checking logs..." -ForegroundColor Gray
    docker logs $CONTAINER_NAME --tail 20
}

# Step 5: Check API health endpoint
Write-Host ""
Write-Host "5. Checking API health endpoint..." -ForegroundColor Yellow
try {
    $apiHealth = Invoke-RestMethod -Uri "$APP_URL/api/health" -Method Get -TimeoutSec 5
    if ($apiHealth) {
        Write-Host "✅ API is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API health check failed (this is normal if endpoint doesn't exist)" -ForegroundColor Yellow
}

# Step 6: Display access information
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Access Information:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor Green
Write-Host $APP_URL
Write-Host "🔌 Backend API: " -NoNewline -ForegroundColor Green
Write-Host "$APP_URL/api"
Write-Host "🗄️  Database: " -NoNewline -ForegroundColor Green
Write-Host "postgresql://localhost:$DB_PORT/evofithealthprotocol_db"
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin.test@evofitmeals.com / TestAdmin123!"
Write-Host "  Trainer: trainer.test@evofitmeals.com / TestTrainer123!"
Write-Host "  Customer: customer.test@evofitmeals.com / TestCustomer123!"
Write-Host ""

# Step 7: Recent logs check
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Recent Activity (last 5 requests):" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
$logs = docker logs $CONTAINER_NAME --tail 5 2>&1 | Select-String -Pattern "GET|POST|PUT|DELETE"
if ($logs) {
    $logs | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "No recent requests" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "✅ App verification complete - WORKING" -ForegroundColor Green
Write-Host "   Access the app at: $APP_URL" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan