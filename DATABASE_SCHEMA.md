# Health Protocol Database Schema Documentation

This document provides comprehensive documentation of the EvoFit Health Protocol database schema, designed to help developers understand the data structure and relationships for health protocol and progress tracking functionality.

## Overview

The database is built using PostgreSQL with Drizzle ORM for type-safe database operations. The schema supports a multi-role health application focused on:

- **Health Protocol Management**: Longevity and parasite cleanse protocols
- **User Management**: Role-based access control (Admin, Trainer, Customer)
- **Progress Tracking**: Body measurements, photos, and fitness goals
- **Trainer-Customer Relationships**: Protocol assignments and monitoring

## Database Tables

### 1. Users Table (`users`)

**Purpose**: Stores user account information with role-based access control.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT, -- Optional for OAuth users
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'trainer', 'customer')),
  google_id VARCHAR(255) UNIQUE, -- For Google OAuth
  name VARCHAR(255),
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields Explained**:
- `id`: Unique identifier for each user (UUID format)
- `role`: Determines user permissions (`admin`, `trainer`, `customer`)
- `google_id`: For Google OAuth authentication
- `password`: Optional to support OAuth-only accounts

**Relationships**:
- One trainer can have many customers
- One user can have many progress measurements/goals/photos
- One trainer can create many health protocols
- One customer can be assigned many protocols

### 2. Authentication Tables

#### Password Reset Tokens (`password_reset_tokens`)

**Purpose**: Manages password reset functionality.

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

#### Refresh Tokens (`refresh_tokens`)

**Purpose**: Manages JWT refresh tokens for persistent sessions.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL
);
```

#### Customer Invitations (`customer_invitations`)

**Purpose**: Manages trainer-to-customer invitation system.

```sql
CREATE TABLE customer_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_email VARCHAR(255) NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Health Protocol Tables

### 3. Trainer Health Protocols Table (`trainer_health_protocols`)

**Purpose**: Stores specialized health protocols created by trainers.

```sql
CREATE TABLE trainer_health_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'longevity' or 'parasite_cleanse'
  duration INTEGER NOT NULL, -- Duration in days
  intensity VARCHAR(20) NOT NULL, -- 'gentle', 'moderate', 'intensive'
  config JSONB NOT NULL, -- Protocol configuration
  is_template BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields Explained**:
- `type`: Currently supports 'longevity' and 'parasite_cleanse' protocols
- `duration`: Protocol length in days (1-365)
- `intensity`: Protocol intensity level affects recommendations
- `config`: JSON configuration specific to protocol type
- `is_template`: Allows protocols to be used as templates for new protocols

**Protocol Configuration Examples**:

**Longevity Protocol Config**:
```json
{
  "supplements": ["NAD+", "Resveratrol", "Metformin"],
  "fasting_schedule": "16:8",
  "exercise_recommendations": ["cardio", "strength"],
  "sleep_target_hours": 8,
  "stress_management": ["meditation", "yoga"]
}
```

**Parasite Cleanse Protocol Config**:
```json
{
  "phases": [
    {
      "name": "Preparation",
      "duration_days": 7,
      "supplements": ["Probiotics", "Digestive Enzymes"]
    },
    {
      "name": "Cleanse",
      "duration_days": 14,
      "supplements": ["Wormwood", "Black Walnut", "Cloves"]
    },
    {
      "name": "Recovery",
      "duration_days": 7,
      "supplements": ["Probiotics", "L-Glutamine"]
    }
  ],
  "dietary_restrictions": ["sugar", "processed_foods"],
  "monitoring_symptoms": ["energy_levels", "digestive_health"]
}
```

### 4. Protocol Assignments Table (`protocol_assignments`)

**Purpose**: Tracks which health protocols have been assigned to which customers.

```sql
CREATE TABLE protocol_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID NOT NULL REFERENCES trainer_health_protocols(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP, -- Calculated based on protocol duration
  completed_date TIMESTAMP,
  notes TEXT,
  progress_data JSONB DEFAULT '{}'::jsonb,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Progress Data Structure**:
```json
{
  "weekly_checkins": [
    {
      "week": 1,
      "energy_level": 7,
      "sleep_quality": 8,
      "symptoms": ["improved_digestion"],
      "notes": "Feeling more energetic"
    }
  ],
  "supplement_adherence": 85,
  "overall_satisfaction": 9
}
```

## Progress Tracking Tables

### 5. Progress Measurements Table (`progress_measurements`)

**Purpose**: Stores customer body measurements for progress tracking.

```sql
CREATE TABLE progress_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measurement_date TIMESTAMP NOT NULL,
  
  -- Weight measurements
  weight_kg DECIMAL(5,2),
  weight_lbs DECIMAL(6,2),
  
  -- Body measurements (in cm)
  neck_cm DECIMAL(4,1),
  shoulders_cm DECIMAL(5,1),
  chest_cm DECIMAL(5,1),
  waist_cm DECIMAL(5,1),
  hips_cm DECIMAL(5,1),
  bicep_left_cm DECIMAL(4,1),
  bicep_right_cm DECIMAL(4,1),
  thigh_left_cm DECIMAL(4,1),
  thigh_right_cm DECIMAL(4,1),
  calf_left_cm DECIMAL(4,1),
  calf_right_cm DECIMAL(4,1),
  
  -- Body composition
  body_fat_percentage DECIMAL(4,1),
  muscle_mass_kg DECIMAL(5,2),
  
  -- Notes and metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Usage Notes**:
- Supports both metric (kg/cm) and imperial (lbs) measurements
- Detailed body measurements for comprehensive tracking
- Indexed for efficient querying by customer and date

### 6. Customer Goals Table (`customer_goals`)

**Purpose**: Stores customer fitness and health goals with progress tracking.

```sql
CREATE TABLE customer_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal definition
  goal_type VARCHAR(50) NOT NULL, -- e.g., 'weight_loss', 'energy_improvement'
  goal_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Target values
  target_value DECIMAL(10,2),
  target_unit VARCHAR(20), -- lbs, kg, %, hours, etc.
  current_value DECIMAL(10,2),
  starting_value DECIMAL(10,2),
  
  -- Timeline
  start_date TIMESTAMP NOT NULL,
  target_date TIMESTAMP,
  achieved_date TIMESTAMP,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'achieved', 'paused', 'abandoned'
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Health Protocol Specific Goal Types**:
- `energy_improvement`: Track energy level improvements
- `sleep_quality`: Monitor sleep quality scores
- `digestive_health`: Track digestive symptoms
- `weight_management`: Weight goals related to health protocols
- `symptom_reduction`: Track reduction in specific symptoms
- `biomarker_improvement`: Track lab values (with trainer guidance)

### 7. Goal Milestones Table (`goal_milestones`)

**Purpose**: Tracks intermediate milestones for customer goals.

```sql
CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES customer_goals(id) ON DELETE CASCADE,
  milestone_name VARCHAR(255) NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  achieved_value DECIMAL(10,2),
  achieved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. Progress Photos Table (`progress_photos`)

**Purpose**: Stores customer progress photos with metadata.

```sql
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_date TIMESTAMP NOT NULL,
  photo_url TEXT NOT NULL, -- S3 URL for full image
  thumbnail_url TEXT, -- S3 URL for thumbnail
  photo_type VARCHAR(50) NOT NULL, -- 'front', 'side', 'back', 'other'
  caption TEXT,
  is_private BOOLEAN DEFAULT true, -- Customer privacy control
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Indexing Strategy

### Performance Indexes

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_role ON users(role);

-- Health protocol queries
CREATE INDEX trainer_health_protocols_trainer_id_idx ON trainer_health_protocols(trainer_id);
CREATE INDEX trainer_health_protocols_type_idx ON trainer_health_protocols(type);

-- Protocol assignments
CREATE INDEX protocol_assignments_protocol_id_idx ON protocol_assignments(protocol_id);
CREATE INDEX protocol_assignments_customer_id_idx ON protocol_assignments(customer_id);
CREATE INDEX protocol_assignments_trainer_id_idx ON protocol_assignments(trainer_id);
CREATE INDEX protocol_assignments_status_idx ON protocol_assignments(status);

-- Progress tracking
CREATE INDEX progress_measurements_customer_id_idx ON progress_measurements(customer_id);
CREATE INDEX progress_measurements_date_idx ON progress_measurements(measurement_date);
CREATE INDEX customer_goals_customer_id_idx ON customer_goals(customer_id);
CREATE INDEX customer_goals_status_idx ON customer_goals(status);
CREATE INDEX progress_photos_customer_id_idx ON progress_photos(customer_id);
CREATE INDEX progress_photos_date_idx ON progress_photos(photo_date);
```

## Data Relationships Diagram

```
users (1) -----> (many) trainer_health_protocols
  |                         |
  | (1)                     | (1)
  |                         |
  v (many)                  v (many)
progress_measurements    protocol_assignments
progress_photos             |
customer_goals              | (many)
  |                         |
  | (1)                     v (1)
  |                    users (customers)
  v (many)
goal_milestones
```

## Common Query Patterns

### 1. Get Customer's Active Protocol Assignments

```sql
SELECT 
  thp.name as protocol_name,
  thp.type,
  thp.duration,
  pa.status,
  pa.start_date,
  pa.end_date,
  pa.progress_data
FROM trainer_health_protocols thp
JOIN protocol_assignments pa ON thp.id = pa.protocol_id
WHERE pa.customer_id = $1 AND pa.status = 'active'
ORDER BY pa.assigned_at DESC;
```

### 2. Get Customer's Progress Over Time

```sql
SELECT 
  measurement_date, 
  weight_lbs, 
  body_fat_percentage,
  notes
FROM progress_measurements
WHERE customer_id = $1
ORDER BY measurement_date DESC
LIMIT 12; -- Last 12 measurements
```

### 3. Get Trainer's Protocol Library

```sql
SELECT 
  id,
  name,
  type,
  duration,
  intensity,
  tags,
  is_template,
  created_at
FROM trainer_health_protocols
WHERE trainer_id = $1
ORDER BY 
  is_template DESC, -- Templates first
  created_at DESC;
```

### 4. Calculate Protocol Completion Progress

```sql
SELECT 
  thp.name,
  pa.start_date,
  pa.end_date,
  CASE 
    WHEN pa.end_date IS NULL THEN 0
    WHEN pa.completed_date IS NOT NULL THEN 100
    ELSE ROUND(
      (EXTRACT(EPOCH FROM NOW()) - EXTRACT(EPOCH FROM pa.start_date)) / 
      (EXTRACT(EPOCH FROM pa.end_date) - EXTRACT(EPOCH FROM pa.start_date)) * 100
    )
  END as completion_percentage
FROM trainer_health_protocols thp
JOIN protocol_assignments pa ON thp.id = pa.protocol_id
WHERE pa.customer_id = $1 AND pa.status = 'active';
```

## Migration Strategy

The database uses Drizzle ORM's migration system:

1. **Schema Changes**: Defined in `shared/schema.ts`
2. **Migration Files**: Generated in `migrations/` directory
3. **Version Control**: Each migration has metadata in `migrations/meta/`
4. **Rollback Support**: Migrations can be rolled back if needed

### Running Migrations

```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# View migration status
npm run db:studio
```

## Data Validation

### Zod Schemas

All data validation uses Zod schemas defined in `shared/schema.ts`:

```typescript
// Health Protocol validation
export const createHealthProtocolSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['longevity', 'parasite_cleanse']),
  duration: z.number().min(1).max(365),
  intensity: z.enum(['gentle', 'moderate', 'intensive']),
  config: z.record(z.any()),
  tags: z.array(z.string()).optional(),
});

// Progress measurement validation
export const createMeasurementSchema = z.object({
  measurementDate: z.string().datetime(),
  weightKg: z.number().optional(),
  weightLbs: z.number().optional(),
  bodyFatPercentage: z.number().min(1).max(50).optional(),
  // ... other fields
});
```

### Database Constraints

- Foreign key constraints ensure referential integrity
- Check constraints validate enum values and ranges
- Unique constraints prevent duplicate data
- NOT NULL constraints ensure required fields

## Security Considerations

### Data Protection
- User passwords are hashed using bcrypt
- Sensitive health data is encrypted at rest
- Progress photos are stored in private S3 buckets
- Database connections use SSL/TLS

### Access Control
- Row-level security ensures users only see their data
- API endpoints validate user permissions
- JWT tokens expire and must be refreshed
- Database credentials are environment-specific

### HIPAA Considerations
- Health protocol data may be considered PHI (Protected Health Information)
- Audit trails track all data access and modifications
- Encryption in transit and at rest
- Access logging for compliance

### Audit Trail
- All tables include `created_at` and `updated_at` timestamps
- User actions are logged for compliance
- Data deletion is soft-delete where possible
- Backup and recovery procedures are in place

## Protocol-Specific Features

### Longevity Protocols
- Track biomarkers and health metrics
- Monitor supplement adherence
- Lifestyle factor tracking (sleep, exercise, stress)
- Long-term progress visualization

### Parasite Cleanse Protocols
- Phase-based protocol structure
- Symptom tracking and monitoring
- Dietary restriction compliance
- Recovery phase management

This schema documentation provides a foundation for understanding the EvoFit Health Protocol database structure. The focus is entirely on health protocols, progress tracking, and user management, with meal planning functionality completely removed.