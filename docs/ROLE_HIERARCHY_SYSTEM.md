# Role Hierarchy System Documentation

## Overview

The HealthProtocol application implements a comprehensive hierarchical role system that enables proper access control and data sharing between three primary roles: **Admin**, **Trainer**, and **Customer**. This system ensures secure, appropriate access to health protocol data while maintaining clear boundaries and relationships between users.

---

## Role Hierarchy Structure

```
┌─────────────────────────────────────┐
│            ADMIN (Level 3)          │
│     Full System Access & Control    │
│  • View/Modify all data             │
│  • Manage all relationships         │
│  • System configuration             │
└──────────────┬──────────────────────┘
               │ Can act as ↓
┌──────────────┴──────────────────────┐
│          TRAINER (Level 2)          │
│    Manage Assigned Customers        │
│  • Create health protocols          │
│  • View customer health data        │
│  • Assign protocols to customers    │
└──────────────┬──────────────────────┘
               │ Manages ↓
┌──────────────┴──────────────────────┐
│         CUSTOMER (Level 1)          │
│      View Own & Shared Data         │
│  • Access own health data           │
│  • View trainer-shared protocols    │
│  • Track personal progress          │
└─────────────────────────────────────┘
```

---

## Role Capabilities

### 👑 Admin Role

**Access Level:** FULL SYSTEM ACCESS

**Capabilities:**
- View and modify all user data
- Access all health protocols and assignments
- Manage trainer-customer relationships
- View system analytics and reports
- Impersonate other roles for testing
- Configure system settings
- Access all API endpoints

**Special Features:**
- Can act on behalf of any user
- Override access restrictions
- View complete audit logs

### 👨‍🏫 Trainer Role

**Access Level:** ASSIGNED CUSTOMER ACCESS

**Capabilities:**
- Create and manage health protocols
- View assigned customers' health data
- Assign protocols to customers
- Track customer progress
- Communicate with assigned customers
- Access own profile and settings
- Limited system analytics (own customers only)

**Restrictions:**
- Cannot access other trainers' data
- Cannot view unassigned customers
- Cannot modify system settings

### 👤 Customer Role

**Access Level:** OWN DATA + TRAINER SHARED

**Capabilities:**
- View own health data and protocols
- Access trainer-assigned protocols
- Track personal progress
- View assigned trainer information
- Update own profile
- Access shared resources

**Restrictions:**
- Cannot access other customers' data
- Cannot create protocols
- Cannot modify trainer assignments
- Limited to read-only access for most data

---

## Trainer-Customer Relationships

### Relationship Structure

```sql
trainer_customer_relationships
├── trainer_id (references users)
├── customer_id (references users)
├── status ('active', 'inactive', 'pending')
├── relationship_type ('primary', 'secondary', 'consultant')
├── permissions
│   ├── can_view_protocols
│   ├── can_message_trainer
│   └── can_book_sessions
└── metadata
    ├── assigned_date
    ├── last_interaction
    └── notes
```

### Relationship Types

1. **Primary:** Main trainer responsible for customer's health protocols
2. **Secondary:** Supporting trainer with limited access
3. **Consultant:** Specialist trainer for specific protocols

---

## API Implementation

### Authentication Endpoints

```javascript
// Login (all roles)
POST /api/auth/login
Body: { email, password }
Response: { accessToken, user: { id, email, role } }

// Get current role context
GET /api/roles/current-role
Headers: { Authorization: 'Bearer <token>' }
Response: { user, roleContext, permissions }
```

### Role-Specific Endpoints

#### Admin Endpoints
```javascript
// System overview (Admin only)
GET /api/roles/admin/system-overview
Response: { userCounts, activeRelationships, recentUsers }

// Assign customer to trainer
POST /api/roles/admin/assign-customer
Body: { trainerId, customerId }

// Impersonate role (testing)
GET /api/roles/admin/impersonate/:role
```

#### Trainer Endpoints
```javascript
// View assigned customers
GET /api/roles/trainer/my-customers
Response: { customers[], accessLevel, totalCount }

// Access customer data (assigned only)
GET /api/roles/shared-resource/:customerId
```

#### Customer Endpoints
```javascript
// View assigned trainer
GET /api/roles/customer/my-trainer
Response: { trainer, sharedProtocols, accessLevel }

// Access own data
GET /api/roles/shared-resource/:customerId
```

---

## Security Implementation

### Middleware Stack

```typescript
// 1. Basic authentication
requireAuth()

// 2. Hierarchical authentication with context
requireAuthWithHierarchy()

// 3. Role-specific access
requireRoleWithHierarchy('admin' | 'trainer' | 'customer')

// 4. Data-specific access
canAccessCustomerData(customerId)
canAccessTrainerData(trainerId)

// 5. Data filtering by role
filterDataByRole()
```

### Access Control Matrix

| Action | Admin | Trainer | Customer |
|--------|-------|---------|----------|
| View all users | ✅ | ❌ | ❌ |
| View all protocols | ✅ | ❌ | ❌ |
| View trainer's customers | ✅ | ✅ (own) | ❌ |
| View customer data | ✅ | ✅ (assigned) | ✅ (own) |
| Create protocols | ✅ | ✅ | ❌ |
| Assign protocols | ✅ | ✅ (to assigned) | ❌ |
| Modify relationships | ✅ | ❌ | ❌ |
| View system analytics | ✅ | ✅ (limited) | ❌ |

---

## Testing the Role System

### Test Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@fitmeal.pro | Password123! | Full System |
| Trainer | trainer.test@evofitmeals.com | Password123! | Assigned Customers |
| Customer | customer.test@evofitmeals.com | Password123! | Own Data |

### Test Scenarios

1. **Admin Access Test**
   - Login as admin
   - Access system overview
   - View all users
   - Modify any relationship

2. **Trainer Management Test**
   - Login as trainer
   - View assigned customers only
   - Create and assign protocols
   - Cannot access other trainers' data

3. **Customer Access Test**
   - Login as customer
   - View own data
   - See assigned trainer
   - Access shared protocols only

4. **Cross-Role Access Test**
   - Test data visibility across roles
   - Verify access restrictions
   - Confirm hierarchical permissions

### Running Tests

```bash
# Run role hierarchy tests
node test/api/test-role-hierarchy.js

# Test via curl
# Admin system overview
curl -X GET http://localhost:3501/api/roles/admin/system-overview \
  -H "Authorization: Bearer <admin-token>"

# Trainer view customers
curl -X GET http://localhost:3501/api/roles/trainer/my-customers \
  -H "Authorization: Bearer <trainer-token>"

# Customer view trainer
curl -X GET http://localhost:3501/api/roles/customer/my-trainer \
  -H "Authorization: Bearer <customer-token>"
```

---

## Frontend Integration

### Context Provider

```typescript
// AuthContext with role awareness
const AuthContext = {
  user: {
    id: string,
    email: string,
    role: 'admin' | 'trainer' | 'customer',
    roleDisplayName: string
  },
  roleContext: {
    canAccessRole: (role) => boolean,
    assignedCustomers?: string[],
    assignedTrainer?: string
  },
  permissions: {
    canViewAllUsers: boolean,
    canManageProtocols: boolean,
    hierarchyLevel: number
  }
};
```

### Role-Based UI Components

```jsx
// Admin Dashboard
{user.role === 'admin' && (
  <AdminDashboard>
    <SystemOverview />
    <UserManagement />
    <RelationshipManager />
  </AdminDashboard>
)}

// Trainer Dashboard
{user.role === 'trainer' && (
  <TrainerDashboard>
    <CustomerList customers={assignedCustomers} />
    <ProtocolManager />
    <ProgressTracker />
  </TrainerDashboard>
)}

// Customer Dashboard
{user.role === 'customer' && (
  <CustomerDashboard>
    <MyProtocols />
    <TrainerInfo trainer={assignedTrainer} />
    <ProgressChart />
  </CustomerDashboard>
)}
```

### Navigation by Role

```jsx
// Dynamic navigation based on role
const getNavigationItems = (role) => {
  const baseItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' }
  ];
  
  if (role === 'admin') {
    return [
      ...baseItems,
      { path: '/users', label: 'User Management' },
      { path: '/analytics', label: 'System Analytics' },
      { path: '/settings', label: 'Settings' }
    ];
  }
  
  if (role === 'trainer') {
    return [
      ...baseItems,
      { path: '/customers', label: 'My Customers' },
      { path: '/protocols', label: 'Health Protocols' },
      { path: '/assignments', label: 'Assignments' }
    ];
  }
  
  if (role === 'customer') {
    return [
      ...baseItems,
      { path: '/my-protocols', label: 'My Protocols' },
      { path: '/progress', label: 'Progress' },
      { path: '/trainer', label: 'My Trainer' }
    ];
  }
};
```

---

## Database Schema

### Core Tables

```sql
-- Users table with roles
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password TEXT,
  role VARCHAR(20), -- 'admin', 'trainer', 'customer'
  role_display_name VARCHAR(100),
  ...
)

-- Trainer-Customer relationships
trainer_customer_relationships (
  trainer_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES users(id),
  status VARCHAR(20),
  relationship_type VARCHAR(50),
  ...
  UNIQUE(trainer_id, customer_id)
)

-- Protocol assignments
protocol_assignments (
  id UUID PRIMARY KEY,
  trainer_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES users(id),
  protocol_id UUID,
  ...
)

-- Access logs for auditing
role_access_logs (
  user_id UUID,
  actual_role VARCHAR(20),
  effective_role VARCHAR(20),
  action VARCHAR(100),
  ...
)
```

### Helper Functions

```sql
-- Check if user can access another user's data
can_access_user_data(requesting_user_id, target_user_id)
  RETURNS BOOLEAN

-- Get active relationships
active_trainer_customers VIEW

-- Get trainer statistics
trainers_with_stats VIEW
```

---

## Best Practices

### Security

1. **Always validate role permissions** at both API and database levels
2. **Log all cross-role access** for auditing
3. **Use parameterized queries** to prevent SQL injection
4. **Implement rate limiting** on sensitive endpoints
5. **Encrypt sensitive health data** at rest

### Performance

1. **Cache role relationships** to reduce database queries
2. **Use database indexes** on relationship tables
3. **Implement pagination** for customer lists
4. **Optimize queries** with appropriate JOINs

### User Experience

1. **Clear role indicators** in the UI
2. **Appropriate error messages** for access denials
3. **Smooth transitions** between role contexts
4. **Consistent navigation** based on role

---

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Verify user role in database
   - Check trainer-customer relationship exists
   - Confirm token is valid and not expired

2. **Missing relationship data**
   - Run relationship setup script
   - Verify foreign key constraints
   - Check for soft-deleted records

3. **Role context not loading**
   - Ensure middleware is properly configured
   - Check for circular dependencies
   - Verify database connections

### Debug Queries

```sql
-- Check user roles
SELECT email, role, role_display_name 
FROM users 
WHERE role IS NOT NULL;

-- View active relationships
SELECT t.email as trainer, c.email as customer, tcr.status
FROM trainer_customer_relationships tcr
JOIN users t ON tcr.trainer_id = t.id
JOIN users c ON tcr.customer_id = c.id
WHERE tcr.status = 'active';

-- Check access permissions
SELECT can_access_user_data(
  'trainer-uuid'::uuid, 
  'customer-uuid'::uuid
);
```

---

## Future Enhancements

1. **Multi-trainer support** - Customers with multiple trainers
2. **Temporary access grants** - Time-limited permissions
3. **Delegation system** - Trainers delegating to assistants
4. **Group management** - Batch customer operations
5. **Advanced analytics** - Role-based performance metrics
6. **Audit trail UI** - Visual access history
7. **Mobile app integration** - Role-aware mobile experience

---

_Last Updated: 2025-08-28_
_Version: 1.0.0_