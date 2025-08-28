# Production Deployment Guide

**EvoFitHealthProtocol v1.0 - Production Deployment**

---

## 📋 Overview

This guide provides complete instructions for deploying the HealthProtocol application to production environments. The deployment is optimized for containerized platforms like DigitalOcean App Platform, AWS ECS, or any Docker-compatible hosting service.

---

## 🛠️ Pre-Deployment Requirements

### Environment Setup
1. **Production Environment Variables**
   - Copy `.env.production.template` to `.env.production`
   - Update all variables with production values
   - **CRITICAL**: Change all default secrets and passwords

2. **Database Setup**
   - Provision managed PostgreSQL instance (recommended)
   - Enable SSL connections
   - Configure connection pooling
   - Set up automated backups

3. **External Services**
   - AWS S3 bucket for file storage
   - OpenAI API account with sufficient credits
   - Email service (SMTP or Resend API)
   - Domain and SSL certificate

### Security Checklist
- [ ] All secrets are unique and secure (64+ characters)
- [ ] Database connections use SSL
- [ ] HTTPS is enforced
- [ ] CORS origins are restricted to production domain
- [ ] Rate limiting is configured appropriately
- [ ] Security headers are enabled

---

## 🚀 Deployment Options

### Option 1: DigitalOcean App Platform (Recommended)

#### Step 1: Prepare Repository
```bash
# Ensure production configurations are in place
git add .env.production.template
git add Dockerfile.production
git add docs/PRODUCTION_DEPLOYMENT.md
git commit -m "feat(deploy): add production configuration"
git push origin main
```

#### Step 2: Create App on DigitalOcean
1. **Create New App**: Connect to GitHub repository
2. **Configure Build**:
   - **Dockerfile**: `Dockerfile.production`
   - **Build command**: Docker build (automatic)
   - **Run command**: `./start.sh`

3. **Environment Variables**: Add all variables from `.env.production.template`
4. **Resources**: 
   - **CPU**: 1 vCPU minimum
   - **Memory**: 1GB minimum
   - **Instance Count**: 1 (can scale later)

#### Step 3: Database Configuration
1. **Create Managed Database**: PostgreSQL 16
2. **Configure Connection**: Update `DATABASE_URL` in app environment
3. **Enable SSL**: Ensure `sslmode=require` in connection string

#### Step 4: Domain and HTTPS
1. **Add Domain**: Configure custom domain
2. **HTTPS**: DigitalOcean provides automatic SSL
3. **Update Environment**: Set `FRONTEND_URL` to your domain

### Option 2: AWS ECS/Fargate

#### Step 1: Build and Push Image
```bash
# Build production image
docker build -f Dockerfile.production -t healthprotocol:latest .

# Tag for ECR
docker tag healthprotocol:latest <account-id>.dkr.ecr.<region>.amazonaws.com/healthprotocol:latest

# Push to ECR
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/healthprotocol:latest
```

#### Step 2: Create ECS Service
1. **Create Task Definition**: Use Fargate with 1 vCPU, 2GB memory
2. **Configure Environment**: Add all environment variables
3. **Health Checks**: Use `/health` endpoint
4. **Service**: Create service with 1 desired task

#### Step 3: Load Balancer Setup
1. **Create ALB**: Application Load Balancer
2. **Target Group**: Point to ECS service on port 8080
3. **Health Checks**: Configure `/ready` endpoint
4. **HTTPS**: Add SSL certificate

### Option 3: Docker-Compatible Hosting

For any Docker-compatible platform:

```bash
# Build production image
docker build -f Dockerfile.production -t healthprotocol:prod .

# Run with environment file
docker run -d \
  --name healthprotocol-prod \
  --env-file .env.production \
  -p 8080:8080 \
  healthprotocol:prod
```

---

## 🔍 Health Checks and Monitoring

### Available Endpoints

1. **Basic Health Check**
   ```
   GET /health
   ```
   - Returns: Application status and uptime
   - Use for: Load balancer health checks

2. **Readiness Check**
   ```
   GET /ready
   ```
   - Returns: Application + database status
   - Use for: Kubernetes readiness probes

3. **Liveness Check**
   ```
   GET /live
   ```
   - Returns: Basic application responsiveness
   - Use for: Kubernetes liveness probes

4. **Detailed Health Check**
   ```
   GET /health/detailed
   ```
   - Returns: Comprehensive system status
   - Use for: Monitoring dashboards

5. **Metrics Endpoint**
   ```
   GET /metrics
   ```
   - Returns: Prometheus-compatible metrics
   - Use for: Performance monitoring

### Monitoring Setup

#### Basic Monitoring
- **Health Check URL**: `https://yourdomain.com/health`
- **Check Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Failure Threshold**: 3 consecutive failures

#### Advanced Monitoring (Optional)
- **Prometheus**: Scrape `/metrics` endpoint
- **Grafana**: Create dashboards for application metrics
- **Alerts**: Set up alerts for health check failures

---

## 🗄️ Database Management

### Production Migrations

Migrations run automatically on container startup via the startup script. For manual migration:

```bash
# Inside container or with database access
npx drizzle-kit push --config=./drizzle.config.ts
```

### Migration Safety
- Migrations are designed to be backward compatible
- Database backups are handled by managed database service
- Failed migrations don't prevent application startup (configurable)

### Manual Migration (if needed)
```bash
# Connect to production database
psql "$DATABASE_URL"

# Run specific migration file
\i migrations/0001_initial.sql
```

---

## 📊 Performance Optimization

### Production Settings

1. **Node.js Optimization**
   ```
   NODE_ENV=production
   NODE_OPTIONS="--max-old-space-size=1024"
   ```

2. **Database Connection Pooling**
   - Max connections: 20 (adjust based on scale)
   - Connection timeout: 30 seconds
   - Idle timeout: 10 minutes

3. **Rate Limiting**
   - General: 1000 requests per 15 minutes per IP
   - Authentication: 10 attempts per 15 minutes per IP
   - Configurable via `RATE_LIMIT_MAX` environment variable

### Scaling Considerations

- **Horizontal Scaling**: Application is stateless and can run multiple instances
- **Database**: Use read replicas for read-heavy operations
- **File Storage**: S3 scales automatically
- **CDN**: Consider CloudFront or DigitalOcean CDN for static assets

---

## 🔒 Security Configuration

### Security Headers
All security headers are automatically configured:
- **HSTS**: 1 year max-age with subdomain inclusion
- **CSP**: Restrictive Content Security Policy
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff

### SSL/TLS
- **Minimum Version**: TLS 1.2
- **Certificate**: Managed by platform (DigitalOcean/AWS)
- **HSTS Preload**: Enabled

### Rate Limiting
- **General API**: 1000 requests per 15 minutes per IP
- **Authentication**: 10 attempts per 15 minutes per IP
- **Progressive Slowdown**: After 50 requests, add delays

---

## 🧪 Validation and Testing

### Pre-Deployment Validation
```bash
# Run production validation script
node scripts/production-validation.js
```

This validates:
- Health check endpoints
- Performance under load
- Security headers
- Database connectivity

### Post-Deployment Testing

1. **Health Checks**
   ```bash
   curl https://yourdomain.com/health
   curl https://yourdomain.com/ready
   ```

2. **Authentication Flow**
   ```bash
   # Test login endpoint
   curl -X POST https://yourdomain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```

3. **Core Features**
   - User registration and login
   - Health protocol generation
   - PDF export functionality

---

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failures
```
Error: connect ECONNREFUSED
```
**Solution**: Check DATABASE_URL and ensure database is accessible

#### Migration Failures
```
Error: relation "users" already exists
```
**Solution**: Migrations may have run previously. Check migration status.

#### Memory Issues
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```
**Solution**: Increase `NODE_OPTIONS="--max-old-space-size=2048"`

#### SSL Certificate Issues
```
Error: certificate verify failed
```
**Solution**: Ensure `sslmode=require` and valid certificates

### Debug Commands

```bash
# Check application logs
docker logs <container-id>

# Connect to database
psql "$DATABASE_URL"

# Check environment variables
docker exec <container-id> env | grep -E "(NODE_ENV|DATABASE_URL)"

# Test health endpoint
curl -v https://yourdomain.com/health
```

---

## 🔄 Rollback Procedures

### Immediate Rollback
1. **Platform Rollback**: Use platform's rollback feature
2. **Manual Rollback**: 
   ```bash
   # Redeploy previous version
   git checkout <previous-commit>
   # Trigger new deployment
   ```

### Database Rollback
- Managed databases typically have point-in-time recovery
- Manual schema rollbacks should be done cautiously
- Test rollback procedures in staging environment

---

## 📈 Scaling and Maintenance

### Horizontal Scaling
- **Application**: Add more container instances
- **Database**: Use read replicas for read operations
- **Load Balancing**: Configure load balancer health checks

### Regular Maintenance
- **Update Dependencies**: Monthly security updates
- **Database Maintenance**: Automated by managed services
- **SSL Certificates**: Automatically renewed by platform
- **Monitoring**: Review metrics and set up alerting

### Performance Monitoring
- **Response Times**: Monitor /metrics endpoint
- **Error Rates**: Track 4xx/5xx responses
- **Database Performance**: Query performance and connection pool usage

---

## ✅ Production Checklist

### Pre-Launch
- [ ] Environment variables configured and secured
- [ ] Database provisioned with SSL and backups
- [ ] Domain configured with HTTPS
- [ ] Health checks responding correctly
- [ ] Performance validation passed
- [ ] Security headers configured
- [ ] Rate limiting tested
- [ ] Monitoring set up

### Post-Launch
- [ ] All health checks are green
- [ ] User registration/login working
- [ ] Health protocol generation functional
- [ ] PDF export working correctly
- [ ] Email notifications sending
- [ ] Performance metrics within acceptable ranges
- [ ] Error monitoring active

### Ongoing
- [ ] Regular security updates
- [ ] Performance monitoring
- [ ] Backup validation
- [ ] Scaling adjustments as needed

---

**🎉 Congratulations! Your EvoFitHealthProtocol application is production-ready.**

For support or questions, refer to the application logs and health check endpoints for real-time status information.