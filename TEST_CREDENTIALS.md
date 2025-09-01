# PERMANENT TEST ACCOUNT CREDENTIALS

## ⚠️ IMPORTANT: These are the ONLY test credentials to use
**DO NOT CHANGE THESE CREDENTIALS**

These credentials are standardized across all documentation and testing files.

---

## Test Accounts

### 🔑 Admin Account
- **Email:** `admin@fitmeal.pro`
- **Password:** `AdminPass123`
- **Role:** Admin
- **Access:** Full system access

### 🔑 Trainer Account
- **Email:** `trainer.test@evofitmeals.com`
- **Password:** `TestTrainer123!`
- **Role:** Trainer
- **Access:** Trainer dashboard, customer management, health protocols

### 🔑 Customer Account
- **Email:** `customer.test@evofitmeals.com`
- **Password:** `TestCustomer123!`
- **Role:** Customer
- **Access:** Customer dashboard, view protocols, progress tracking

---

## Quick Copy Commands

### Login via API (curl)
```bash
# Admin login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fitmeal.pro","password":"AdminPass123"}'

# Trainer login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trainer.test@evofitmeals.com","password":"TestTrainer123!"}'

# Customer login
curl -X POST http://localhost:3501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer.test@evofitmeals.com","password":"TestCustomer123!"}'
```

### Access Application
- **Development:** http://localhost:3501
- **Production:** [To be configured]

---

## Database Reset Script

To reset test accounts to these exact credentials, run:
```bash
docker exec evofithealthprotocol-dev node scripts/fix-test-passwords.js
```

This command will:
- Update all test account passwords to the standard values
- Verify the passwords are working correctly
- Clear any rate limiting issues

---

## Notes
- These credentials are for testing purposes only
- Never use these passwords in production
- All test accounts are pre-configured with appropriate role permissions
- The trainer and customer accounts are linked for testing trainer-customer relationships

---

**Last Updated:** December 28, 2024
**Status:** PERMANENT - DO NOT MODIFY