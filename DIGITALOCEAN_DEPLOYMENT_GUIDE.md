# DigitalOcean Deployment Guide for HealthProtocol

**App Name**: EvoFitHealthProtocol  
**Repository**: https://github.com/drmweyers/evofithealthprotocol  
**Last Updated**: August 25, 2025  

---

## 🚀 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

#### Step 1: Create New App
1. Login to DigitalOcean Console
2. Navigate to **Apps** → **Create App**
3. Choose **GitHub** as source
4. Authorize DigitalOcean to access your GitHub
5. Select repository: `drmweyers/evofithealthprotocol`
6. Select branch: `main`

#### Step 2: Configure App Settings
```yaml
name: evofithealthprotocol
region: tor  # Toronto, or choose your preferred region
services:
  - name: web
    environment_slug: node-js
    github:
      repo: drmweyers/evofithealthprotocol
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm start
    http_port: 3500
    instance_count: 1
    instance_size_slug: professional-xs  # $25/month
    health_check:
      http_path: /api/health
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3500"
```

#### Step 3: Add Managed Database
1. In App settings, click **Add Resource** → **Database**
2. Choose **PostgreSQL**
3. Select version: 15 (or latest stable)
4. Choose plan: Basic ($15/month)
5. Name: `evofithealthprotocol-db`

#### Step 4: Configure Environment Variables
Add these in the App Platform console:

```env
# Database (auto-injected by DigitalOcean)
DATABASE_URL=${evofithealthprotocol-db.DATABASE_URL}

# Required Secrets
JWT_SECRET=<generate-secure-32-character-string>
OPENAI_API_KEY=<your-openai-api-key>

# Email Service (Resend)
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=noreply@yourdomain.com

# File Storage (DigitalOcean Spaces)
AWS_ACCESS_KEY_ID=<your-spaces-access-key>
AWS_SECRET_ACCESS_KEY=<your-spaces-secret-key>
AWS_REGION=tor1
AWS_ENDPOINT=https://tor1.digitaloceanspaces.com
S3_BUCKET_NAME=evofithealthprotocol

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://your-app.ondigitalocean.app

# Features
AUTO_MIGRATE=true
```

#### Step 5: Deploy
1. Click **Next** through the configuration
2. Review settings
3. Click **Create Resources**
4. Wait for deployment (10-15 minutes first time)

---

### Option 2: Container Registry Deployment

#### Prerequisites
```bash
# Install doctl CLI
# macOS: brew install doctl
# Windows: download from GitHub releases
# Linux: snap install doctl

# Authenticate
doctl auth init
```

#### Step 1: Create Container Registry
```bash
# Create registry (one-time)
doctl registry create evofithealthprotocol --region tor1

# Login to registry
doctl registry login
```

#### Step 2: Build and Push Docker Image
```bash
# Build production image
docker build --target prod -t evofithealthprotocol:latest .

# Tag for DigitalOcean
docker tag evofithealthprotocol:latest registry.digitalocean.com/evofithealthprotocol/app:latest

# Push to registry
docker push registry.digitalocean.com/evofithealthprotocol/app:latest
```

#### Step 3: Create App from Container
1. Go to DigitalOcean Apps
2. Create App → Choose **DigitalOcean Container Registry**
3. Select your image
4. Configure environment variables (same as Option 1)
5. Deploy

---

## 📋 Pre-Deployment Checklist

### Code Preparation
- [ ] Ensure `main` branch is production-ready
- [ ] Run all tests locally: `npm test`
- [ ] Build successfully: `npm run build`
- [ ] Update `.env.example` with all required variables
- [ ] Verify Dockerfile works: `docker build .`

### Database Preparation
- [ ] Ensure migrations are up to date
- [ ] Test migration script: `npm run db:migrate`
- [ ] Backup any existing data
- [ ] Verify `drizzle.config.ts` exists

### Security Checklist
- [ ] Generate new JWT_SECRET for production
- [ ] Verify all API keys are production keys
- [ ] Set CORS_ORIGIN to production URL
- [ ] Enable HTTPS only (automatic on DO)

---

## 🔧 Post-Deployment Tasks

### 1. Verify Deployment
```bash
# Check app status
curl https://your-app.ondigitalocean.app/api/health

# Test authentication
curl -X POST https://your-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 2. Create Admin User
```bash
# SSH into app console (via DO dashboard) or use local script
npm run create-admin -- \
  --email admin@yourdomain.com \
  --password <secure-password> \
  --name "Admin User"
```

### 3. Configure Domain (Optional)
1. Add custom domain in App settings
2. Add CNAME record pointing to `.ondigitalocean.app`
3. Wait for SSL certificate provisioning

### 4. Set Up Monitoring
1. Enable app insights in DigitalOcean
2. Configure alerts for:
   - High error rate
   - High response time
   - Low availability

---

## 🚨 Troubleshooting

### Build Failures
```bash
# Check build logs in DO console
# Common issues:

# Missing dependencies
- Ensure all deps are in package.json, not devDependencies

# TypeScript errors
- Run locally: npm run type-check

# Memory issues during build
- Upgrade to larger build instance
```

### Database Connection Issues
```bash
# Verify DATABASE_URL format
postgresql://user:password@host:port/database?sslmode=require

# Check if migrations ran
- Look for "Migrations complete" in deploy logs
- If not, set AUTO_MIGRATE=true
```

### Application Crashes
```bash
# View runtime logs
doctl apps logs <app-id> --type run

# Common issues:
- Missing environment variables
- Port mismatch (must be 3500 or use PORT env)
- Memory limits (upgrade instance size)
```

---

## 📊 Scaling and Optimization

### Horizontal Scaling
```yaml
# In app spec or console:
services:
  - name: web
    instance_count: 3  # Run 3 instances
    instance_size_slug: professional-s  # Upgrade size
```

### Database Scaling
1. Navigate to Databases in DO console
2. Select your database cluster
3. Click "Resize"
4. Choose larger plan

### Add Redis Cache
```yaml
databases:
  - name: redis
    engine: redis
    version: "7"
    size: db-s-1vcpu-1gb
```

### CDN with Spaces
1. Create DigitalOcean Space
2. Enable CDN
3. Update app to use CDN URL for static assets

---

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use DO's encrypted environment variables
   - Rotate keys regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL (default on DO)
   - Restrict trusted sources

3. **Application Security**
   - Keep dependencies updated
   - Enable rate limiting
   - Use security headers

4. **Monitoring**
   - Set up alerts for failed auth attempts
   - Monitor for unusual traffic patterns
   - Regular security audits

---

## 📝 Deployment Commands Reference

```bash
# App Management
doctl apps list
doctl apps get <app-id>
doctl apps create --spec app.yaml
doctl apps update <app-id> --spec app.yaml

# Logs
doctl apps logs <app-id> --type build
doctl apps logs <app-id> --type deploy  
doctl apps logs <app-id> --type run

# Database
doctl databases list
doctl databases connection <db-id>
doctl databases maintenance-window <db-id>

# Container Registry
doctl registry login
doctl registry repository list-tags
doctl registry garbage-collection start
```

---

## 🎯 Next Steps

1. **Production URL**: Note your app URL after deployment
2. **DNS Setup**: Configure custom domain if needed
3. **Backups**: Set up automated database backups
4. **Monitoring**: Configure uptime monitoring
5. **CI/CD**: Set up GitHub Actions for automated deployments

---

**Need Help?**
- DigitalOcean Support: https://www.digitalocean.com/support/
- App Platform Docs: https://docs.digitalocean.com/products/app-platform/
- Community: https://www.digitalocean.com/community/

---

_This guide is specific to the EvoFitHealthProtocol application. For other apps, adjust accordingly._
