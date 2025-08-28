# HealthProtocol Deployment Monitor Script
# This script helps monitor the deployment status of your HealthProtocol app

Write-Host "=== HealthProtocol Deployment Monitor ===" -ForegroundColor Cyan
Write-Host ""

# Function to check if app exists
function Check-AppExists {
    $app = doctl apps list --format "Name" --no-header | Select-String "evofithealthprotocol"
    return $app -ne $null
}

# Function to get app details
function Get-AppDetails {
    $appId = doctl apps list --format "ID,Name" --no-header | Select-String "evofithealthprotocol" | ForEach-Object { ($_ -split '\s+')[0] }
    if ($appId) {
        Write-Host "App found! Getting details..." -ForegroundColor Green
        doctl apps get $appId
        
        Write-Host "`nApp URL:" -ForegroundColor Yellow
        $url = doctl apps get $appId --format "LiveURL" --no-header
        Write-Host $url -ForegroundColor Cyan
        
        Write-Host "`nChecking deployment status..." -ForegroundColor Yellow
        $deployment = doctl apps get-deployment $appId (doctl apps list-deployments $appId --format "ID" --no-header | Select-Object -First 1)
        Write-Host $deployment
    }
}

# Check GitHub Actions (manual check required)
Write-Host "1. GitHub Actions Status" -ForegroundColor Yellow
Write-Host "   Please check: https://github.com/drmweyers/evofithealthprotocol/actions" -ForegroundColor White
Write-Host "   Look for the 'Deploy to DigitalOcean' workflow" -ForegroundColor White
Write-Host ""

# Check if secrets are likely configured
Write-Host "2. Required GitHub Secrets Checklist" -ForegroundColor Yellow
Write-Host "   Ensure these are added in GitHub Settings > Secrets:" -ForegroundColor White
Write-Host "   ✓ DIGITALOCEAN_ACCESS_TOKEN" -ForegroundColor Green
Write-Host "   ✓ JWT_SECRET" -ForegroundColor Green
Write-Host "   ✓ OPENAI_API_KEY" -ForegroundColor Green
Write-Host "   ? RESEND_API_KEY (or use dummy: re_dummy_key_update_later)" -ForegroundColor Yellow
Write-Host "   ? FROM_EMAIL (or use dummy: noreply@evofithealthprotocol.com)" -ForegroundColor Yellow
Write-Host "   ? AWS_ACCESS_KEY_ID (or use dummy: DO_SPACES_KEY_UPDATE_LATER)" -ForegroundColor Yellow
Write-Host "   ? AWS_SECRET_ACCESS_KEY (or use dummy: DO_SPACES_SECRET_UPDATE_LATER)" -ForegroundColor Yellow
Write-Host ""

# Check container registry
Write-Host "3. Container Registry Status" -ForegroundColor Yellow
Write-Host "   Registry: bci" -ForegroundColor White
$tags = doctl registry repository list-tags bci/evofithealthprotocol 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Repository exists with tags:" -ForegroundColor Green
    Write-Host $tags
}
else {
    Write-Host "   ⚠ Repository not found yet (will be created during first deployment)" -ForegroundColor Yellow
}
Write-Host ""

# Check if app exists
Write-Host "4. DigitalOcean App Status" -ForegroundColor Yellow
if (Check-AppExists) {
    Get-AppDetails
}
else {
    Write-Host "   App 'evofithealthprotocol' not found yet." -ForegroundColor Yellow
    Write-Host "   This is normal if the deployment is still running or hasn't started." -ForegroundColor White
}

Write-Host ""
Write-Host "5. Next Steps:" -ForegroundColor Yellow
Write-Host "   - If GitHub Actions is still running, wait for it to complete" -ForegroundColor White
Write-Host "   - If it failed, check the logs and add any missing secrets" -ForegroundColor White
Write-Host "   - Once secrets are added, re-run the workflow from GitHub Actions" -ForegroundColor White
Write-Host ""
Write-Host "Run this script again to refresh the status." -ForegroundColor Cyan
