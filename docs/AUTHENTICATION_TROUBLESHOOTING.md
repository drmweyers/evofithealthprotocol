# Authentication Troubleshooting Guide

## ✅ Issue Resolution Summary

**Problem**: Registration and login were not working on localhost:3500  
**Root Causes**: JSON validation middleware too strict + missing database table  
**Status**: **FIXED** ✅

## 🎯 Working Demo Accounts

The following test accounts are now fully functional:

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Customer** | `customer@demo.com` | `Password123@` | Customer dashboard, meal plans |
| **Trainer** | `trainer@demo.com` | `Password123@` | Health protocols, customer management |
| **Customer** | `newuser@demo.com` | `SecurePass123@` | Basic customer access |

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter  
- At least 1 number
- At least 1 special character (`@#$%^&*`)

## 🔧 Issues Fixed

### 1. JSON Validation Middleware Issue
**Problem**: Over-strict JSON parsing middleware rejecting valid requests
```javascript
// ❌ BROKEN - Too strict
app.use(express.json({ 
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON format');
    }
  }
}));

// ✅ FIXED - Standard validation
app.use(express.json({ 
  limit: '500kb'
}));
```

### 2. Missing Database Table
**Problem**: `refresh_tokens` table was missing from database
```sql
-- ✅ FIXED - Added missing table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

### 3. Password Hashing Issues
**Problem**: Existing user passwords not properly bcrypt hashed
```javascript
// ✅ FIXED - Proper bcrypt hashing (12 rounds)
const hashedPassword = await bcrypt.hash(password, 12);
```

## 🧪 Testing Results

### API Endpoints ✅
- **Registration**: `POST /api/auth/register` ✅ Working
- **Login**: `POST /api/auth/login` ✅ Working  
- **Token Refresh**: `POST /api/auth/refresh_token` ✅ Working
- **Logout**: `POST /api/auth/logout` ✅ Working
- **Profile**: `GET /api/auth/me` ✅ Working

### Frontend Integration ✅
- **Login Form**: Properly validates and submits ✅
- **Role-based Routing**: Redirects based on user role ✅
- **Token Management**: JWT tokens stored and managed ✅
- **Authentication Context**: React context working ✅

## 🔍 Troubleshooting Commands

### Test Authentication API
```bash
# Register new user
curl -X POST http://localhost:3500/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123@","role":"customer"}'

# Login with existing user
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"Password123@"}'

# Check authenticated endpoint
curl -X GET http://localhost:3500/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check Database
```bash
# View users table
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT email, role, created_at FROM users;"

# Check refresh tokens table exists
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "\dt refresh_tokens"

# View password formats (first 20 chars)
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT email, substring(password, 1, 20) as password_start FROM users;"
```

### Check Server Status
```bash
# Check if app is running
curl -I http://localhost:3500/api/health

# Check Docker containers
docker ps | grep evofithealthprotocol

# View server logs
docker logs evofithealthprotocol-dev --tail 20
```

## 🚨 Common Issues & Solutions

### Issue: "Invalid credentials" error
**Causes:**
1. User doesn't exist in database
2. Password incorrectly hashed
3. Typing error in email/password

**Solutions:**
```bash
# Check if user exists
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "SELECT email FROM users WHERE email = 'your@email.com';"

# Use demo accounts with known passwords
# customer@demo.com / Password123@
```

### Issue: "Internal server error" during registration
**Causes:**
1. Missing `refresh_tokens` table
2. JWT_SECRET not configured
3. Database connection issues

**Solutions:**
```bash
# Check JWT_SECRET exists
docker exec evofithealthprotocol-dev printenv | grep JWT

# Create missing table
docker exec evofithealthprotocol-postgres psql -U postgres -d evofithealthprotocol_db -c "CREATE TABLE IF NOT EXISTS refresh_tokens (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, token TEXT NOT NULL, expires_at TIMESTAMP NOT NULL);"

# Check database connection
docker exec evofithealthprotocol-dev node -e "console.log('DB test')"
```

### Issue: JSON parsing errors
**Causes:**
1. Special characters in password (like `!`)
2. Malformed JSON request
3. Strict JSON validation middleware

**Solutions:**
```bash
# Use simpler special characters
# ✅ Good: Password123@ 
# ❌ Avoid: Password123! (shell escape issues)

# Test with curl properly escaped
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Password123@\"}"
```

### Issue: Frontend login not working
**Causes:**
1. API endpoints not accessible
2. CORS configuration issues
3. Token storage problems

**Solutions:**
```bash
# Check CORS headers
curl -I -H "Origin: http://localhost:3500" http://localhost:3500/api/health

# Check localStorage in browser DevTools
# Application > Local Storage > http://localhost:3500

# Check network tab for API call errors
```

## 📋 Environment Requirements

### Required Environment Variables
```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-that-is-definitely-long-enough-for-production-use-32chars
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-that-is-definitely-long-enough-for-production

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db

# Server Configuration  
NODE_ENV=development
PORT=3500
```

### Required Database Tables
- `users` ✅
- `refresh_tokens` ✅
- `password_reset_tokens` ✅

## 🔐 Security Configuration

### Rate Limiting
- **Development**: 100,000 requests per 15 minutes (localhost exempt)
- **Authentication**: 100 login attempts per 15 minutes (dev mode)

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Validation**: Strong password requirements enforced
- **Storage**: Never stored in plain text

### Token Security
- **JWT**: HS256 algorithm with long secrets
- **Access Token**: 15-minute expiry
- **Refresh Token**: 30-day expiry, HTTP-only cookies

## 📊 Performance Notes

### Database Queries
- User lookup by email: Indexed for fast retrieval
- Token operations: Automatic cleanup of expired tokens

### Authentication Flow
1. User submits credentials
2. Server validates against bcrypt hash
3. JWT access token generated (15min)
4. Refresh token stored in HTTP-only cookie (30 days)
5. Frontend receives token for API requests

## 🎉 Success Verification

To verify authentication is fully working:

1. **Navigate to**: http://localhost:3500
2. **Login with**: `customer@demo.com` / `Password123@`
3. **Should redirect** based on role (customer → meal plans)
4. **Check browser storage** for JWT token
5. **Test logout** functionality
6. **Try registration** with new email

---

## 📞 Support

If authentication issues persist:

1. Check Docker containers are running: `docker ps`
2. Verify database connectivity: Use demo accounts first
3. Check server logs: `docker logs evofithealthprotocol-dev`
4. Test API endpoints directly with curl
5. Verify environment variables are set correctly

**Last Updated**: December 2024  
**Status**: Authentication fully functional ✅