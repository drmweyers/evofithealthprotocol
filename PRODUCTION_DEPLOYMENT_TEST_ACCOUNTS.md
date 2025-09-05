# Production Deployment - Test Accounts Setup

## 🔐 Standardized Test Account Credentials

**IMPORTANT**: These credentials are standardized across all environments. **DO NOT CHANGE THEM.**

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@fitmeal.pro` | `AdminPass123` |
| **Trainer** | `trainer.test@evofitmeals.com` | `TestTrainer123!` |
| **Customer** | `customer.test@evofitmeals.com` | `TestCustomer123!` |

## 🚀 Quick Deployment Commands

### For DigitalOcean App Platform Deployment

1. **After your app is deployed to DigitalOcean**, run this command:
   ```bash
   # Set your production database URL (auto-configured by DigitalOcean)
   # Then run the production deployment script
   node deploy-test-accounts.cjs --prod --url=https://your-app-name.ondigitalocean.app
   ```

2. **For testing only** (if accounts already exist):
   ```bash
   node deploy-test-accounts.cjs --test-only --url=https://your-app-name.ondigitalocean.app
   ```

### For Local Development Testing

```bash
# Ensure Docker is running first
docker ps

# Deploy and test in development
node deploy-test-accounts.cjs --dev
```

## 📋 Deployment Checklist

### Before Deployment
- [ ] Application is successfully deployed to DigitalOcean
- [ ] Database is connected and migrations have run
- [ ] App is accessible at the production URL
- [ ] Environment variables are properly configured

### During Deployment
- [ ] Run `node deploy-test-accounts.cjs --prod --url=<production-url>`
- [ ] Verify all three accounts login successfully
- [ ] Check that roles are correctly assigned
- [ ] Save the deployment report (auto-generated)

### After Deployment
- [ ] Test each account through the web interface
- [ ] Verify trainer-customer relationships work
- [ ] Test health protocol generation with trainer account
- [ ] Confirm customer can view assigned protocols

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check environment variables
echo $DATABASE_URL

# Verify database is accessible
# (Usually auto-configured by DigitalOcean)
```

#### Login Failures
- Check application logs in DigitalOcean dashboard
- Ensure JWT_SECRET is configured in environment
- Verify CORS settings for production domain

#### Account Creation Issues
- Database migrations must be run first
- Check users table exists
- Verify password hashing is working

## 📝 Production Environment Variables

Ensure these are configured in DigitalOcean App Platform:

```env
# Database (auto-configured by DigitalOcean)
DATABASE_URL=<provided-by-digitalocean>

# JWT Authentication
JWT_SECRET=<secure-random-string>

# OpenAI Integration
OPENAI_API_KEY=<your-openai-api-key>

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=<your-aws-region>
AWS_S3_BUCKET=<your-s3-bucket>

# Email Service (for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<your-app-password>
```

## 🔒 Security Notes

- Production accounts use higher password hashing cost (factor 12)
- These are test/demo accounts - not for real user data
- Use environment-specific JWT secrets
- Enable SSL/TLS in production (auto-enabled by DigitalOcean)

## 📊 Verification Commands

### Manual API Testing
```bash
# Test admin login
curl -X POST https://your-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitmeal.pro","password":"AdminPass123"}'

# Test trainer login
curl -X POST https://your-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer.test@evofitmeals.com","password":"TestTrainer123!"}'

# Test customer login
curl -X POST https://your-app.ondigitalocean.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer.test@evofitmeals.com","password":"TestCustomer123!"}'
```

### Expected Response Format
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "uuid-here",
      "email": "admin@fitmeal.pro",
      "role": "admin",
      "profilePicture": null
    }
  }
}
```

## 📚 Related Documentation

- `TEST_CREDENTIALS.md` - Complete test account documentation
- `scripts/setup-test-accounts.cjs` - Development account setup
- `scripts/production-test-accounts.cjs` - Production account setup
- `deploy-test-accounts.cjs` - Comprehensive deployment script

## 🎯 Success Criteria

✅ **Deployment is successful when:**
- All three test accounts can login via API
- All three test accounts can login via web interface
- Roles are correctly assigned and enforced
- JWT tokens are generated properly
- Application functionality works with test accounts

---

**Last Updated**: December 2024  
**Environment**: DigitalOcean App Platform + PostgreSQL  
**Application**: EvoFitHealthProtocol v1.0