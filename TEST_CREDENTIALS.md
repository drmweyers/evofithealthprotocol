# 🔐 OFFICIAL TEST CREDENTIALS - DO NOT CHANGE

## ⚠️ CRITICAL: These are the ONLY credentials to use in ALL environments

These credentials are hardcoded in the database seed and MUST be used consistently across:
- Development Environment
- Testing Environment  
- Staging Environment
- Production Demo Accounts
- All Playwright Tests
- All Documentation

---

## Standard Test Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Admin** | `admin@fitmeal.pro` | `AdminPass123` | Full system administration |
| **Trainer** | `trainer.test@evofitmeals.com` | `TestTrainer123!` | Trainer features testing |
| **Customer** | `customer.test@evofitmeals.com` | `TestCustomer123!` | Customer features testing |

---

## ⛔ DO NOT:
- ❌ Change these passwords
- ❌ Delete these accounts
- ❌ Modify the email addresses
- ❌ Use different credentials in different files
- ❌ Create variations of these credentials

## ✅ DO:
- ✅ Use these exact credentials in all test files
- ✅ Reference this file when writing tests
- ✅ Copy-paste to avoid typos
- ✅ Update all test files if credentials ever change (with team approval)

---

## Quick Copy Commands

### For JavaScript/TypeScript Test Files:
```javascript
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!'
  }
};
```

### For API Testing (curl):
```bash
# Admin Login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitmeal.pro","password":"AdminPass123"}'

# Trainer Login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer.test@evofitmeals.com","password":"TestTrainer123!"}'

# Customer Login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer.test@evofitmeals.com","password":"TestCustomer123!"}'
```

### For Manual Testing:
1. Go to http://localhost:3501
2. Copy the exact email and password from the table above
3. Paste without modification

---

## Database Verification

These accounts are created by the database seed script. To verify they exist:

```sql
SELECT email, role FROM users WHERE email IN (
  'admin@fitmeal.pro',
  'trainer.test@evofitmeals.com',
  'customer.test@evofitmeals.com'
);
```

Expected result: 3 rows with correct roles.

---

## Playwright Test Integration

All Playwright tests MUST use these credentials:

```javascript
import { TEST_CREDENTIALS } from './TEST_CREDENTIALS.js';

// Or define inline (copy exactly):
const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@fitmeal.pro',
    password: 'AdminPass123'
  },
  trainer: {
    email: 'trainer.test@evofitmeals.com',
    password: 'TestTrainer123!'
  },
  customer: {
    email: 'customer.test@evofitmeals.com',
    password: 'TestCustomer123!'
  }
};
```

---

## UI Display

When showing test credentials in the login page UI, display EXACTLY:

```html
<div class="test-credentials">
  <h3>Test Accounts</h3>
  <p><strong>Admin:</strong> admin@fitmeal.pro / AdminPass123</p>
  <p><strong>Trainer:</strong> trainer.test@evofitmeals.com / TestTrainer123!</p>
  <p><strong>Customer:</strong> customer.test@evofitmeals.com / TestCustomer123!</p>
</div>
```

---

## Enforcement

- **Code Reviews**: Reject any PR that uses different test credentials
- **CI/CD**: Test pipelines use only these credentials
- **Documentation**: All docs must reference this file for credentials
- **Onboarding**: New developers must be directed to this file

---

## Last Updated
- **Date**: September 5, 2025
- **Version**: 1.0.0 (FINAL)
- **Status**: ✅ PERMANENT - DO NOT MODIFY

---

## Contact
If you believe these credentials need to be changed, you must:
1. Get approval from the tech lead
2. Update ALL occurrences across the entire codebase
3. Update this file
4. Notify the entire team
5. Update all test environments

**Remember: Consistency is critical for testing reliability!**