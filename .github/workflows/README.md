# GitHub Actions Workflows for HealthProtocol

This directory contains automated workflows for deploying the EvoFitHealthProtocol application to DigitalOcean.

## Available Workflows

### 1. `deploy-digitalocean.yml` - Full Automated Deployment
**Trigger**: Push to `main` branch or manual workflow dispatch

This is the complete CI/CD pipeline that:
- Runs all tests (type checking, linting, unit/integration tests)
- Builds Docker image with production target
- Pushes to DigitalOcean Container Registry
- Deploys to DigitalOcean App Platform
- Verifies deployment health
- Cleans up old images

**Required Secrets**:
- `DIGITALOCEAN_ACCESS_TOKEN` - Your DigitalOcean API token
- `JWT_SECRET` - Production JWT secret
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `RESEND_API_KEY` - Email service API key
- `FROM_EMAIL` - Sender email address
- `AWS_ACCESS_KEY_ID` - DigitalOcean Spaces access key
- `AWS_SECRET_ACCESS_KEY` - DigitalOcean Spaces secret key

### 2. `deploy-simple.yml` - GitHub Integration Deployment
**Trigger**: Push to `main` or `staging` branches

This workflow is for when you're using DigitalOcean's GitHub integration:
- Runs comprehensive tests with PostgreSQL
- Creates deployment notifications
- Performs security scans
- DigitalOcean handles the actual deployment

**No additional secrets required** - DigitalOcean manages deployment

## Setup Instructions

### For Full Automated Deployment (`deploy-digitalocean.yml`)

1. **Create DigitalOcean API Token**:
   - Go to DigitalOcean → API → Tokens
   - Generate new token with read/write access
   - Save as `DIGITALOCEAN_ACCESS_TOKEN` in GitHub secrets

2. **Create Container Registry**:
   ```bash
   doctl registry create evofithealthprotocol
   ```

3. **Add GitHub Secrets**:
   - Go to GitHub repo → Settings → Secrets → Actions
   - Add all required secrets listed above

4. **First Deployment**:
   - Push to `main` branch or manually trigger workflow
   - Workflow will create app if it doesn't exist

### For Simple Deployment (`deploy-simple.yml`)

1. **Connect GitHub to DigitalOcean**:
   - In DigitalOcean → Apps → Create App
   - Choose GitHub as source
   - Select `drmweyers/evofithealthprotocol` repository
   - Enable auto-deploy for `main` branch

2. **Configure App**:
   - Set environment variables in DigitalOcean console
   - Add managed PostgreSQL database
   - Configure health checks

3. **Push Code**:
   - GitHub Actions runs tests
   - DigitalOcean automatically deploys on success

## Workflow Features

### Automated Testing
- TypeScript type checking
- ESLint code quality checks
- Unit and integration tests
- Build verification

### Security
- npm audit for vulnerabilities
- Secrets stored securely in GitHub
- Environment-specific configurations

### Deployment Strategies
- Blue-green deployments (via DigitalOcean)
- Health check verification
- Automatic rollback on failure
- Container image cleanup

### Notifications
- Commit status updates
- Deployment comments on commits
- GitHub deployment tracking

## Manual Deployment

To manually trigger deployment:

1. Go to Actions tab in GitHub
2. Select "Deploy to DigitalOcean" workflow
3. Click "Run workflow"
4. Choose branch and environment
5. Click "Run workflow" button

## Monitoring Deployments

### GitHub Actions
- Check Actions tab for workflow runs
- View logs for each step
- Download artifacts (build files, security reports)

### DigitalOcean Dashboard
- Monitor app health and metrics
- View deployment history
- Check application logs
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Tests Failing**:
   - Check test logs in GitHub Actions
   - Run tests locally: `npm test`
   - Ensure database migrations are up to date

2. **Docker Build Fails**:
   - Verify Dockerfile syntax
   - Check for missing dependencies
   - Ensure build context is correct

3. **Deployment Fails**:
   - Check DigitalOcean API token is valid
   - Verify app spec YAML is correct
   - Check environment variables are set
   - Review deployment logs in DigitalOcean

4. **Health Checks Fail**:
   - Ensure `/api/health` endpoint exists
   - Check application startup logs
   - Verify database connection
   - Check port configuration (3500)

### Getting Help

1. Check workflow logs in GitHub Actions
2. Review DigitalOcean app logs
3. Check `DIGITALOCEAN_DEPLOYMENT_GUIDE.md`
4. Contact DigitalOcean support if needed

## Best Practices

1. **Always test locally first**: `npm test`
2. **Use feature branches**: Don't commit directly to main
3. **Monitor deployments**: Watch the deployment progress
4. **Keep secrets secure**: Rotate API keys regularly
5. **Clean up resources**: Remove unused apps and images

---

For more details on DigitalOcean deployment, see `DIGITALOCEAN_DEPLOYMENT_GUIDE.md` in the root directory.
