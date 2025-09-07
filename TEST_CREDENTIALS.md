# Test Credentials - EvoFit Health Protocol

## ⚠️ IMPORTANT: These are the ONLY test credentials for Dev and Production

These credentials should NEVER be changed. They are standardized across all environments.

## Admin Account
```
Email: admin@fitmeal.pro
Password: AdminPass123
```

## Trainer Account
```
Email: trainer.test@evofitmeals.com
Password: TestTrainer123!
```

## Customer Account
```
Email: customer.test@evofitmeals.com
Password: TestCustomer123!
```

## Usage Notes

### Development Environment
- URL: http://localhost:3500
- These accounts are pre-seeded in the database
- Use for all testing and development

### Production Environment
- These same accounts should exist in production
- Use for testing and verification

### Quick Login via Console

```javascript
// Admin Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123'
  }),
  credentials: 'include'
}).then(r => r.json()).then(d => {
  localStorage.setItem('token', d.token);
  location.reload();
});

// Trainer Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!'
  }),
  credentials: 'include'
}).then(r => r.json()).then(d => {
  localStorage.setItem('token', d.token);
  location.reload();
});

// Customer Login
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!'
  }),
  credentials: 'include'
}).then(r => r.json()).then(d => {
  localStorage.setItem('token', d.token);
  location.reload();
});
```

## API Testing

### Get Auth Token (for API testing tools like Postman)

```bash
# Admin token
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitmeal.pro","password":"AdminPass123"}'

# Trainer token
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer.test@evofitmeals.com","password":"TestTrainer123!"}'

# Customer token
curl -X POST http://localhost:3500/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer.test@evofitmeals.com","password":"TestCustomer123!"}'
```

## Roles and Permissions

### Admin
- Full system access
- Can manage all users
- Can create/edit/delete all protocols
- Can view all customer data
- Can access admin dashboard

### Trainer
- Can create and manage health protocols
- Can assign protocols to their customers
- Can view their assigned customers
- Can track customer progress
- Cannot access admin features

### Customer
- Can view assigned protocols
- Can track their own progress
- Can upload progress photos
- Can view their measurements
- Cannot create or edit protocols

## Important Notes

1. **DO NOT CHANGE** these credentials in any environment
2. **DO NOT DELETE** these accounts from the database
3. **DO NOT MODIFY** the roles or permissions
4. These accounts are used for:
   - Automated testing
   - Manual QA testing
   - Development testing
   - Production verification
5. If these accounts are missing, run the seed script to recreate them

## Troubleshooting

If login fails:
1. Check if the dev server is running: `npm run dev`
2. Check Docker is running: `docker ps`
3. Check database connection: `docker logs evofithealthprotocol-postgres`
4. Re-seed the database if needed: `npm run seed`

Last Updated: 2025-09-07