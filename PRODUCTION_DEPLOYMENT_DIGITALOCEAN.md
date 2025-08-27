# Production Deployment Guide: DigitalOcean App Platform

## 🚀 EvoFit Health Protocol System - Production Deployment

This guide provides step-by-step instructions for deploying the EvoFit Health Protocol System to DigitalOcean App Platform in production.

## 📋 Prerequisites

### Required Accounts & Access
- ✅ DigitalOcean account with billing enabled
- ✅ GitHub repository access (`drmweyers/evofithealthprotocol`)
- ✅ DigitalOcean API token (for CLI operations)
- ✅ Domain name (optional, for custom domain)

### Required Environment Variables
Prepare these production values before deployment:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# JWT Authentication Secrets
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-production-refresh-secret-minimum-32-characters

# OpenAI Integration (for health protocol generation)
OPENAI_API_KEY=your-openai-production-api-key

# AWS S3 Configuration (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET_NAME=your-production-s3-bucket

# Email Configuration (for customer invitations)
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password

# Security Configuration
BCRYPT_SALT_ROUNDS=12
NODE_ENV=production
PDF_EXPORT_ENABLED=true
```

## 🎯 Deployment Methods

### Method 1: GitHub Integration (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure main branch is production-ready
git checkout main
git pull origin main

# Verify production build works locally
npm run build

# Check for any security issues
npm audit
```

#### Step 2: Create App on DigitalOcean
1. **Navigate to DigitalOcean Control Panel**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Configure Source**
   - Service Provider: **GitHub**
   - Repository: `drmweyers/evofithealthprotocol`
   - Branch: `main`
   - Autodeploy: ✅ **Enabled**
   - Click **Next**

3. **Configure App Components**
   - App Platform will auto-detect:
     - **Web Service** (Node.js/Express backend + React frontend)
     - **Database** requirement (will prompt to add)

#### Step 3: Add Production Database
1. **Click "Add Database"**
   - Engine: **PostgreSQL**
   - Version: **16** (latest)
   - Plan: **Production** (for HIPAA compliance)
   - Name: `health-protocol-db`

2. **Database Configuration**
   - Cluster Size: Basic (1 node) or Professional (3 nodes for HA)
   - Region: Same as app for low latency
   - **Important**: Production database includes automated backups

#### Step 4: Configure Environment Variables

**App-Level Environment Variables** (accessible to all components):
```
NODE_ENV = production
JWT_SECRET = [your-production-jwt-secret] (mark as SECRET)
JWT_REFRESH_SECRET = [your-refresh-secret] (mark as SECRET)  
OPENAI_API_KEY = [your-openai-key] (mark as SECRET)
AWS_ACCESS_KEY_ID = [your-aws-key] (mark as SECRET)
AWS_SECRET_ACCESS_KEY = [your-aws-secret] (mark as SECRET)
AWS_REGION = us-east-1
AWS_S3_BUCKET_NAME = evofitprotocol-production
EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = [your-email] (mark as SECRET)
EMAIL_PASS = [your-app-password] (mark as SECRET)
BCRYPT_SALT_ROUNDS = 12
PDF_EXPORT_ENABLED = true
```

**Database Binding Variables** (automatically created):
```
DATABASE_URL = ${health-protocol-db.DATABASE_URL}
```

#### Step 5: Configure App Settings
1. **App Name**: `evofit-health-protocol-production`
2. **Region**: Choose closest to your primary user base
3. **Instance Size**: 
   - **Development**: Basic ($12/month)
   - **Production**: Professional ($24/month) for better performance

#### Step 6: Review and Launch
1. **Review Configuration**
   - Verify all environment variables
   - Confirm database settings
   - Check resource allocation

2. **Launch App**
   - Click "Launch App"
   - Monitor deployment in "Deployments" tab
   - Check build logs for any issues

### Method 2: Docker Container Deployment

#### Step 1: Prepare Production Dockerfile
Ensure your `Dockerfile.production` is optimized:

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3500
CMD ["node", "server/index.js"]
```

#### Step 2: Build and Push Container
```bash
# Build production image
docker build -f Dockerfile.production -t evofit-health-protocol:production .

# Tag for DigitalOcean Container Registry
docker tag evofit-health-protocol:production registry.digitalocean.com/your-registry/evofit-health-protocol:latest

# Push to registry
docker push registry.digitalocean.com/your-registry/evofit-health-protocol:latest
```

#### Step 3: Deploy from Container Registry
1. **Create App** → **Container Image**
2. **Registry**: DigitalOcean Container Registry
3. **Repository**: `your-registry/evofit-health-protocol`
4. **Tag**: `latest`
5. **Autodeploy**: ✅ Enabled

## 🔒 Production Security Configuration

### SSL/TLS Setup
- DigitalOcean App Platform provides automatic SSL certificates
- Custom domain SSL is managed automatically
- Force HTTPS redirects are enabled by default

### Security Headers
The app includes comprehensive security headers:
```javascript
// Already configured in server/middleware/security.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Database Security
- Production PostgreSQL includes:
  - Automatic SSL encryption
  - IP whitelisting capabilities
  - Regular automated backups
  - Point-in-time recovery

## 🌐 Custom Domain Configuration

### Step 1: Add Domain to App
1. **App Settings** → **Domains**
2. **Add Domain**: `app.yourdomain.com`
3. **Type**: Primary
4. **Manage DNS**: DigitalOcean (recommended)

### Step 2: Configure DNS
If using external DNS:
```
Type: CNAME
Name: app
Value: [your-app-name].ondigitalocean.app
TTL: 3600
```

### Step 3: SSL Certificate
- Automatic Let's Encrypt certificate
- Renewal handled by DigitalOcean
- Force HTTPS enabled by default

## 📊 Monitoring & Health Checks

### Built-in Monitoring
App Platform provides:
- **Uptime monitoring**
- **Performance metrics**
- **Error rate tracking**
- **Resource utilization**

### Health Check Configuration
```yaml
# In app spec (optional)
services:
  - name: web
    health_check:
      http_path: /api/health
      initial_delay_seconds: 60
      period_seconds: 10
      timeout_seconds: 5
      success_threshold: 1
      failure_threshold: 3
```

### Alerts Setup
Configure alerts for:
- High CPU usage (>80%)
- High memory usage (>85%)
- Error rate spikes
- Database connection failures

## 🔄 CI/CD with GitHub Actions

Create `.github/workflows/production-deploy.yml`:

```yaml
name: Production Deployment

on:
  push:
    branches: [main]
    paths-ignore:
      - 'docs/**'
      - '*.md'

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to DigitalOcean App Platform
      uses: digitalocean/app_action@v2
      with:
        app_name: evofit-health-protocol-production
        token: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
```

## 🗄️ Database Migration Strategy

### Production Database Setup
```sql
-- Ensure proper user permissions
CREATE USER healthprotocol_prod WITH PASSWORD 'secure-production-password';
GRANT ALL PRIVILEGES ON DATABASE evofithealthprotocol_db TO healthprotocol_prod;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Migration Process
```bash
# Run migrations in production
DATABASE_URL=$PRODUCTION_DATABASE_URL npm run db:migrate

# Verify schema
DATABASE_URL=$PRODUCTION_DATABASE_URL npm run db:status
```

## 📈 Scaling Configuration

### Horizontal Scaling
```yaml
# App spec configuration
services:
  - name: web
    instance_count: 3  # Minimum for high availability
    instance_size_slug: professional-xs  # 1 vCPU, 512MB RAM
```

### Auto-scaling (Professional Plan)
- Minimum instances: 2
- Maximum instances: 10
- CPU target: 70%
- Memory target: 80%

## 🛡️ Backup & Recovery

### Database Backups
- **Automatic daily backups** (production database)
- **Point-in-time recovery** available
- **Backup retention**: 7 days (adjustable)

### Application State
- No persistent local storage (stateless design)
- File uploads stored in AWS S3
- Database contains all application state

### Disaster Recovery Plan
1. **Database**: Restore from automated backup
2. **Application**: Redeploy from Git (stateless)
3. **Files**: S3 provides 99.999999999% durability
4. **DNS**: Update if needed (typically automatic)

## 🔍 Production Validation Checklist

### Pre-Deployment
- [ ] All tests passing (`npm test`)
- [ ] Production build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Custom domain setup (if applicable)

### Post-Deployment
- [ ] Application responds at production URL
- [ ] Database connections working
- [ ] Authentication system functional
- [ ] Health protocol generation working
- [ ] PDF export functionality operational
- [ ] File uploads to S3 working
- [ ] Email notifications functional
- [ ] All user roles accessible (Admin, Trainer, Customer)

### Performance Verification
- [ ] Page load times < 2 seconds
- [ ] API response times < 500ms
- [ ] Database query performance acceptable
- [ ] SSL/TLS certificates valid
- [ ] No console errors in browser

## 🚨 Troubleshooting Common Issues

### Build Failures

**Issue**: `Module not found` errors during build
```bash
# Solution: Ensure devDependencies are available
# Set environment variable:
NPM_CONFIG_PRODUCTION = false
```

**Issue**: TypeScript compilation errors
```bash
# Solution: Check tsconfig.json and fix type issues
npm run type-check
```

### Runtime Issues

**Issue**: Database connection failures
```bash
# Verify database URL format:
echo $DATABASE_URL

# Should match:
postgresql://username:password@host:port/database?sslmode=require
```

**Issue**: Environment variables not accessible
- Component-level variables override app-level variables
- Check both levels in App Platform settings

### Performance Issues

**Issue**: Slow response times
- Upgrade instance size
- Enable horizontal scaling
- Optimize database queries
- Check resource utilization metrics

## 📞 Production Support

### Monitoring Tools
- **DigitalOcean Monitoring**: Built-in metrics and alerts
- **External APM**: Consider Datadog or New Relic integration
- **Log Management**: Configure log forwarding to preferred service

### Maintenance Windows
- **Database maintenance**: Automated, typically 2-4 AM UTC
- **App updates**: Zero-downtime deployments
- **SSL renewals**: Automatic, no maintenance window needed

### Support Contacts
- **DigitalOcean Support**: Available via control panel
- **Emergency Issues**: Use support tickets for critical issues
- **Performance Optimization**: Professional support available

## 🔄 Rollback Procedures

### Quick Rollback
1. **Via Control Panel**:
   - Go to Deployments tab
   - Select previous successful deployment
   - Click "Rollback"

2. **Via Git**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   
   # Or reset to specific commit
   git reset --hard <previous-commit-hash>
   git push --force-with-lease origin main
   ```

### Emergency Procedures
1. **Database Issues**: Restore from backup
2. **Critical Bugs**: Immediate rollback + hotfix branch
3. **Security Issues**: Take app offline → patch → redeploy

## 💰 Cost Optimization

### App Platform Costs
- **Basic Plan**: $12/month (dev/staging)
- **Professional Plan**: $24/month (production)
- **Scaling costs**: Additional instances as needed

### Database Costs
- **Development DB**: $7/month (1GB storage)
- **Production DB**: $30/month (10GB storage, backups)
- **Professional DB**: $200/month (HA, advanced features)

### Optimization Strategies
- Use development databases for staging
- Implement efficient caching strategies
- Monitor resource usage regularly
- Scale instances based on actual usage

## ✅ Production Deployment Checklist

### Before Going Live
- [ ] All environment variables configured and tested
- [ ] Production database created and migrated
- [ ] SSL certificates configured
- [ ] Custom domain pointed to app (if applicable)
- [ ] Monitoring and alerts configured
- [ ] Backup strategy verified
- [ ] Performance testing completed
- [ ] Security audit passed

### Launch Day
- [ ] Deploy application
- [ ] Verify all functionality works
- [ ] Test user registration and login
- [ ] Test health protocol generation
- [ ] Test PDF exports
- [ ] Test email notifications
- [ ] Monitor for 24 hours

### Post-Launch
- [ ] Set up regular health checks
- [ ] Configure automated backups
- [ ] Implement log monitoring
- [ ] Document any production-specific configurations
- [ ] Train support team on production environment

## 🚀 Quick Deploy Commands

### Using DigitalOcean CLI (doctl)
```bash
# Install doctl
curl -OL https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-windows-amd64.zip

# Authenticate
doctl auth init

# Create app from spec (if using app.yaml)
doctl apps create --spec .do/app.yaml

# Update existing app
doctl apps update $APP_ID --spec .do/app.yaml
```

### Using GitHub Actions
Push to main branch - automatic deployment will trigger:
```bash
git add .
git commit -m "feat(production): deploy health protocol system v1.0"
git push origin main
```

## 📱 Mobile Optimization

### PWA Configuration
The app includes Progressive Web App features:
- Service worker for offline functionality
- App manifest for mobile installation
- Responsive design for all screen sizes

### Mobile-Specific Considerations
- Touch-friendly interface
- Optimized for mobile networks
- Compressed assets for faster loading

---

## 🎯 Next Steps After Deployment

1. **Monitor Performance**: Watch metrics for first 48 hours
2. **User Testing**: Conduct production user acceptance testing
3. **Documentation**: Update any production-specific documentation
4. **Backups**: Verify automated backup system is working
5. **Monitoring**: Set up comprehensive monitoring and alerting

**Production URL**: Your app will be available at `https://your-app-name.ondigitalocean.app` or your custom domain.

For additional help, consult the [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md) for complete feature documentation or contact support@evofithealthprotocol.com.

---

*Last updated: December 2024*
*Deployment platform: DigitalOcean App Platform*