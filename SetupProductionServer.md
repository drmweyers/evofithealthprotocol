# DigitalOcean Production Server Setup Guide

**Last Updated**: 2025-01-03  
**Project**: EvoFitHealthProtocol  
**Platform**: DigitalOcean App Platform

---

## 📋 Overview

This guide provides step-by-step instructions for deploying the HealthProtocol application to DigitalOcean App Platform. Follow these steps carefully to ensure a successful production deployment.

## 🔐 Prerequisites

Before starting, ensure you have:
- [ ] GitHub repository with the HealthProtocol code
- [ ] DigitalOcean account with billing enabled
- [ ] OpenAI API key for AI features
- [ ] Email service credentials (Resend, SendGrid, or SMTP)

## 📝 Deployment Checklist

### Step 1: GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Required | Example/Dummy Value |
|------------|-------------|----------|-------------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DigitalOcean API token | ✅ Yes | Get from DO dashboard |
| `JWT_SECRET` | JWT authentication secret | ✅ Yes | `8818e87ab164bb1bcb3feb1d21466e01023c56cc247d48ec3975f84c8f94e15c` |
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes | Your actual API key |
| `RESEND_API_KEY` | Email service API key | ⚠️ Can use dummy | `resend_dummy_key` |
| `FROM_EMAIL` | Sender email address | ⚠️ Can use dummy | `noreply@evofithealthprotocol.com` |
| `AWS_ACCESS_KEY_ID` | DigitalOcean Spaces key | ⚠️ Can use dummy | `spaces_dummy_key` |
| `AWS_SECRET_ACCESS_KEY` | DigitalOcean Spaces secret | ⚠️ Can use dummy | `spaces_dummy_secret` |

### Step 2: DigitalOcean Container Registry Setup

```bash
# Install doctl CLI (if not installed)
# Windows: Download from https://github.com/digitalocean/doctl/releases
# Or use: choco install doctl

# Authenticate doctl
doctl auth init
# Enter your DigitalOcean API token when prompted

# Create container registry
doctl registry create evofithealthprotocol --region nyc3
```

### Step 3: Create App in DigitalOcean Dashboard

1. **Navigate to App Platform**
   - Go to: https://cloud.digitalocean.com/apps
   - Click **Create App**

2. **Configure Source**
   - Source: **GitHub**
   - Repository: `drmweaver/HealthProtocol`
   - Branch: `main`
   - Autodeploy: ✅ Enabled
   - Click **Next**

3. **Configure Resources**
   - Type: **Web Service**
   - Name: `web`
   - Instance Size: **Basic - $5/month** (can scale later)
   - HTTP Port: `3500`
   - Health Check Path: `/api/health`

4. **Add Database**
   - Click **Add Resource**
   - Select **Dev Database** (PostgreSQL)
   - Name: `db`
   - Version: PostgreSQL 15

### Step 4: Environment Variables Configuration

Add these environment variables in the DigitalOcean App Platform dashboard:

#### Core Configuration
```env
NODE_ENV=production
PORT=${PORT}
DATABASE_URL=${db.DATABASE_URL}
```

#### Authentication & Security
```env
JWT_SECRET=8818e87ab164bb1bcb3feb1d21466e01023c56cc247d48ec3975f84c8f94e15c
```
Mark as: **SECRET** ✅

#### OpenAI Integration
```env
OPENAI_API_KEY=<your-actual-openai-api-key>
```
Mark as: **SECRET** ✅

#### Email Configuration
```env
RESEND_API_KEY=<your-resend-api-key-or-dummy>
FROM_EMAIL=noreply@evofithealthprotocol.com
```
Mark RESEND_API_KEY as: **SECRET** ✅

#### File Storage (DigitalOcean Spaces)
```env
AWS_ACCESS_KEY_ID=<your-spaces-key-or-dummy>
AWS_SECRET_ACCESS_KEY=<your-spaces-secret-or-dummy>
AWS_REGION=nyc3
AWS_S3_BUCKET=evofithealthprotocol-uploads
```
Mark both keys as: **SECRET** ✅

#### Application URL
```env
APP_URL=${_self.PUBLIC_URL}
```

### Step 5: App Specification File

The app specification is defined in `.do/app.yaml`:

```yaml
name: evofithealthprotocol
region: nyc
services:
- name: web
  source_dir: /
  github:
    repo: drmweaver/HealthProtocol
    branch: main
    deploy_on_push: true
  dockerfile_path: Dockerfile
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3500
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "${PORT}"
  - key: DATABASE_URL
    value: "${db.DATABASE_URL}"
  - key: JWT_SECRET
    value: "8818e87ab164bb1bcb3feb1d21466e01023c56cc247d48ec3975f84c8f94e15c"
    type: SECRET
  - key: OPENAI_API_KEY
    value: ${OPENAI_API_KEY}
  - key: RESEND_API_KEY
    value: ${RESEND_API_KEY}
  - key: FROM_EMAIL
    value: ${FROM_EMAIL}
  - key: AWS_ACCESS_KEY_ID
    value: ${AWS_ACCESS_KEY_ID}
  - key: AWS_SECRET_ACCESS_KEY
    value: ${AWS_SECRET_ACCESS_KEY}
  - key: AWS_REGION
    value: ${AWS_REGION}
  - key: AWS_S3_BUCKET
    value: ${AWS_S3_BUCKET}
  - key: APP_URL
    value: "${_self.PUBLIC_URL}"
  health_check:
    http_path: /api/health
  routes:
  - path: /
    preserve_path_prefix: true

databases:
- name: db
  engine: PG
  version: "15"
  production: false
```

### Step 6: Deploy Application

1. **Review Configuration**
   - Verify all environment variables are set
   - Confirm database is configured
   - Check instance size and region

2. **Create Resources**
   - Click **Create Resources**
   - Monitor deployment progress (15-20 minutes for first deployment)

3. **Access Application**
   - URL format: `https://evofithealthprotocol-xxxxx.ondigitalocean.app`
   - Note the actual URL from the dashboard

### Step 7: Post-Deployment Verification

```bash
# Test health endpoint
curl https://evofithealthprotocol-xxxxx.ondigitalocean.app/api/health

# Expected response
{"status":"ok","timestamp":"..."}
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Build Failures
- **Check build logs** in DigitalOcean dashboard
- **Verify Dockerfile** builds locally: `docker build -t test .`
- **Ensure dependencies** are correctly specified in package.json

#### Database Connection Issues
- **Verify** `DATABASE_URL` uses binding: `${db.DATABASE_URL}`
- **Check** database is provisioned and running
- **Confirm** migrations run successfully

#### Environment Variable Issues
- **Double-check** all required variables are set
- **Verify** SECRET variables are marked as encrypted
- **Ensure** variable names match exactly

#### Port Configuration Issues
- **Confirm** app listens on port 3500
- **Check** Dockerfile EXPOSE statement
- **Verify** server configuration uses `process.env.PORT || 3500`

### Debug Commands

```bash
# View application logs
doctl apps logs <app-id>

# Check deployment status
doctl apps list

# Get app details
doctl apps get <app-id>

# Force redeploy
doctl apps create-deployment <app-id>
```

## 🚀 Scaling and Optimization

### Scaling Options

1. **Vertical Scaling** (Increase instance size)
   - Basic → Professional instances
   - More CPU and memory per instance

2. **Horizontal Scaling** (Add more instances)
   - Increase `instance_count` in app.yaml
   - Load balancing handled automatically

3. **Database Scaling**
   - Upgrade from Dev Database to Managed Database
   - Configure connection pooling
   - Add read replicas for scaling reads

### Performance Optimization

1. **Enable CDN** for static assets
2. **Configure caching** headers
3. **Optimize Docker image** size
4. **Use build caching** for faster deployments

## 📊 Monitoring and Maintenance

### Monitoring Setup

1. **Enable Alerts**
   - CPU usage alerts
   - Memory usage alerts
   - Failed deployment alerts
   - Domain failure alerts

2. **Log Management**
   - Configure log retention
   - Set up log aggregation (optional)
   - Monitor error rates

3. **Health Checks**
   - Configure health check endpoints
   - Set appropriate timeout values
   - Monitor health check failures

### Maintenance Tasks

- **Regular Updates**
  - Keep dependencies updated
  - Apply security patches
  - Update Node.js version as needed

- **Database Maintenance**
  - Regular backups (automated with managed DB)
  - Monitor database size
  - Optimize queries as needed

- **Cost Optimization**
  - Monitor resource usage
  - Right-size instances
  - Clean up unused resources

## 🔒 Security Best Practices

1. **Secrets Management**
   - Never commit secrets to repository
   - Use DigitalOcean's encrypted environment variables
   - Rotate secrets regularly

2. **Network Security**
   - Use HTTPS only (provided by App Platform)
   - Configure CORS properly
   - Implement rate limiting

3. **Application Security**
   - Keep dependencies updated
   - Use security headers
   - Implement proper authentication
   - Validate all user inputs

## 📞 Support Resources

- **DigitalOcean Documentation**: https://docs.digitalocean.com/products/app-platform/
- **DigitalOcean Support**: https://www.digitalocean.com/support/
- **Community Forum**: https://www.digitalocean.com/community/
- **Status Page**: https://status.digitalocean.com/

## 🔄 Rollback Procedures

If deployment issues occur:

1. **Immediate Rollback**
   ```bash
   # List deployments
   doctl apps list-deployments <app-id>
   
   # Rollback to previous deployment
   doctl apps create-deployment <app-id> --rollback
   ```

2. **Manual Rollback**
   - Go to App Platform dashboard
   - Click on your app
   - Go to **Activity** tab
   - Find previous successful deployment
   - Click **Rollback**

## 📝 Notes for Future Deployments

- **JWT Secret**: Already generated: `8818e87ab164bb1bcb3feb1d21466e01023c56cc247d48ec3975f84c8f94e15c`
- **Database**: Using PostgreSQL 15 with Dev Database (free tier)
- **Region**: NYC3 (adjust based on your user base)
- **Health Check**: Endpoint at `/api/health` must return 200 OK

---

**Important**: This guide is part of the HealthProtocol project documentation. Keep it updated as deployment configurations change.