# HealthProtocol Deployment Monitor Script
Write-Host "=== HealthProtocol Deployment Monitor ===" -ForegroundColor Cyan
Write-Host ""

# Check GitHub Actions
Write-Host "1. GitHub Actions Status" -ForegroundColor Yellow
Write-Host "   Please check: https://github.com/drmweyers/evofithealthprotocol/actions" -ForegroundColor White
Write-Host ""

# Check secrets
Write-Host "2. Required GitHub Secrets Checklist" -ForegroundColor Yellow
Write-Host "   Ensure these are added in GitHub Settings > Secrets:" -ForegroundColor White
Write-Host "   [/] DIGITALOCEAN_ACCESS_TOKEN" -ForegroundColor Green
Write-Host "   [/] JWT_SECRET" -ForegroundColor Green
Write-Host "   [/] OPENAI_API_KEY" -ForegroundColor Green
Write-Host "   [?] RESEND_API_KEY" -ForegroundColor Yellow
Write-Host "   [?] FROM_EMAIL" -ForegroundColor Yellow
Write-Host "   [?] AWS_ACCESS_KEY_ID" -ForegroundColor Yellow
Write-Host "   [?] AWS_SECRET_ACCESS_KEY" -ForegroundColor Yellow
Write-Host ""

# Check registry
Write-Host "3. Container Registry Status" -ForegroundColor Yellow
Write-Host "   Checking registry: bci" -ForegroundColor White
doctl registry repository list-tags bci/evofithealthprotocol 2>&1 | Out-String | ForEach-Object {
    if ($_ -match "Error") {
        Write-Host "   Repository not found yet (will be created during deployment)" -ForegroundColor Yellow
    } else {
        Write-Host "   Repository exists!" -ForegroundColor Green
        Write-Host $_
    }
}
Write-Host ""

# Check app
Write-Host "4. DigitalOcean App Status" -ForegroundColor Yellow
$appList = doctl apps list --format "ID,Name" --no-header | Out-String
if ($appList -match "evofithealthprotocol") {
    Write-Host "   App found!" -ForegroundColor Green
    $appId = ($appList | Select-String "evofithealthprotocol" | ForEach-Object { ($_ -split '\s+')[0] })
    $appUrl = doctl apps get $appId --format "LiveURL" --no-header
    Write-Host "   URL: $appUrl" -ForegroundColor Cyan
} else {
    Write-Host "   App not found yet" -ForegroundColor Yellow
    Write-Host "   (This is normal if deployment hasn't completed)" -ForegroundColor White
}

Write-Host ""
Write-Host "5. Next Steps:" -ForegroundColor Yellow
Write-Host "   - Check GitHub Actions for workflow status" -ForegroundColor White
Write-Host "   - Add any missing secrets" -ForegroundColor White
Write-Host "   - Re-run workflow if needed" -ForegroundColor White
