# STORY-010: Protocol Plan Database and Backend Implementation

## Story Context
This story implements the database schema and backend API for the Protocol Plan Saving feature, enabling trainers to save and manage reusable protocol configurations.

## Related Documents
- **PRD**: `docs/BMAD/PRD-protocol-plan-saving.md`
- **Architecture**: `docs/BMAD/ARCHITECTURE-protocol-plan-saving.md`
- **Current Wizard**: `client/src/components/ProtocolCreationWizard.tsx`

## Story Points: 5

## Acceptance Criteria
1. ✅ Database tables `protocol_plans` and `protocol_plan_assignments` are created
2. ✅ API endpoints for CRUD operations on protocol plans are functional
3. ✅ Validation service properly validates wizard configurations
4. ✅ Assignment endpoint creates protocols from saved plans
5. ✅ All endpoints have proper authentication and authorization
6. ✅ Unit tests cover all new backend functionality

## Technical Implementation Details

### 1. Database Schema Updates

#### File: `shared/schema.ts`
Add the following tables to the existing schema:

```typescript
export const protocolPlans = pgTable('protocol_plans', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  planDescription: text('plan_description'),
  wizardConfiguration: jsonb('wizard_configuration').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  usageCount: integer('usage_count').default(0),
}, (table) => ({
  uniqueTrainerPlanName: unique().on(table.trainerId, table.planName),
  trainerIdIdx: index('idx_protocol_plans_trainer_id').on(table.trainerId),
  createdAtIdx: index('idx_protocol_plans_created_at').on(table.createdAt),
}));

export const protocolPlanAssignments = pgTable('protocol_plan_assignments', {
  id: serial('id').primaryKey(),
  protocolPlanId: integer('protocol_plan_id')
    .notNull()
    .references(() => protocolPlans.id, { onDelete: 'cascade' }),
  protocolId: integer('protocol_id')
    .notNull()
    .references(() => healthProtocols.id, { onDelete: 'cascade' }),
  customerId: integer('customer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assignedBy: integer('assigned_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow(),
}, (table) => ({
  planIdIdx: index('idx_protocol_plan_assignments_plan_id').on(table.protocolPlanId),
  customerIdIdx: index('idx_protocol_plan_assignments_customer_id').on(table.customerId),
}));
```

### 2. Create Migration File

#### File: `migrations/add_protocol_plans.sql`
```sql
-- Create protocol_plans table
CREATE TABLE IF NOT EXISTS protocol_plans (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  plan_description TEXT,
  wizard_configuration JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0,
  CONSTRAINT unique_trainer_plan_name UNIQUE(trainer_id, plan_name)
);

CREATE INDEX idx_protocol_plans_trainer_id ON protocol_plans(trainer_id);
CREATE INDEX idx_protocol_plans_created_at ON protocol_plans(created_at);

-- Create protocol_plan_assignments table
CREATE TABLE IF NOT EXISTS protocol_plan_assignments (
  id SERIAL PRIMARY KEY,
  protocol_plan_id INTEGER NOT NULL REFERENCES protocol_plans(id) ON DELETE CASCADE,
  protocol_id INTEGER NOT NULL REFERENCES health_protocols(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_protocol_plan_assignments_plan_id ON protocol_plan_assignments(protocol_plan_id);
CREATE INDEX idx_protocol_plan_assignments_customer_id ON protocol_plan_assignments(customer_id);
```

### 3. Create Protocol Plans Controller

#### File: `server/controllers/protocolPlansController.ts`
```typescript
import { Request, Response } from 'express';
import { db } from '../db';
import { protocolPlans, protocolPlanAssignments, healthProtocols, users } from '../../shared/schema';
import { eq, and, desc, asc, ilike, sql } from 'drizzle-orm';
import { generateProtocolFromPlan } from '../services/protocolGeneratorService';

export const protocolPlansController = {
  // List all protocol plans for the trainer
  async list(req: Request, res: Response) {
    try {
      const trainerId = req.user.id;
      const { search, sortBy = 'createdAt', order = 'desc' } = req.query;
      
      let query = db.select().from(protocolPlans).where(eq(protocolPlans.trainerId, trainerId));
      
      if (search) {
        query = query.where(
          or(
            ilike(protocolPlans.planName, `%${search}%`),
            ilike(protocolPlans.planDescription, `%${search}%`)
          )
        );
      }
      
      const sortColumn = protocolPlans[sortBy as keyof typeof protocolPlans];
      query = query.orderBy(order === 'desc' ? desc(sortColumn) : asc(sortColumn));
      
      const plans = await query.execute();
      
      return res.json({ success: true, data: plans });
    } catch (error) {
      console.error('Error listing protocol plans:', error);
      return res.status(500).json({ success: false, error: 'Failed to list protocol plans' });
    }
  },

  // Create a new protocol plan
  async create(req: Request, res: Response) {
    try {
      const trainerId = req.user.id;
      const { planName, planDescription, wizardConfiguration } = req.body;
      
      // Validate required fields
      if (!planName || !wizardConfiguration) {
        return res.status(400).json({ 
          success: false, 
          error: 'Plan name and wizard configuration are required' 
        });
      }
      
      // Check for duplicate name
      const existing = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.trainerId, trainerId),
          eq(protocolPlans.planName, planName)
        ))
        .execute();
      
      if (existing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'A plan with this name already exists' 
        });
      }
      
      // Create the plan
      const [plan] = await db.insert(protocolPlans)
        .values({
          trainerId,
          planName,
          planDescription,
          wizardConfiguration,
        })
        .returning()
        .execute();
      
      return res.json({ success: true, data: plan });
    } catch (error) {
      console.error('Error creating protocol plan:', error);
      return res.status(500).json({ success: false, error: 'Failed to create protocol plan' });
    }
  },

  // Get a specific protocol plan
  async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user.id;
      
      const [plan] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!plan) {
        return res.status(404).json({ success: false, error: 'Protocol plan not found' });
      }
      
      // Get assignment history
      const assignments = await db.select({
        id: protocolPlanAssignments.id,
        protocolId: protocolPlanAssignments.protocolId,
        customerId: protocolPlanAssignments.customerId,
        customerName: users.name,
        assignedAt: protocolPlanAssignments.assignedAt,
      })
        .from(protocolPlanAssignments)
        .leftJoin(users, eq(protocolPlanAssignments.customerId, users.id))
        .where(eq(protocolPlanAssignments.protocolPlanId, parseInt(id)))
        .orderBy(desc(protocolPlanAssignments.assignedAt))
        .execute();
      
      return res.json({ 
        success: true, 
        data: { ...plan, assignments } 
      });
    } catch (error) {
      console.error('Error getting protocol plan:', error);
      return res.status(500).json({ success: false, error: 'Failed to get protocol plan' });
    }
  },

  // Update a protocol plan
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user.id;
      const { planName, planDescription, wizardConfiguration } = req.body;
      
      // Check ownership
      const [existing] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Protocol plan not found' });
      }
      
      // Check for duplicate name if name is being changed
      if (planName && planName !== existing.planName) {
        const duplicate = await db.select()
          .from(protocolPlans)
          .where(and(
            eq(protocolPlans.trainerId, trainerId),
            eq(protocolPlans.planName, planName)
          ))
          .execute();
        
        if (duplicate.length > 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'A plan with this name already exists' 
          });
        }
      }
      
      // Update the plan
      const [updated] = await db.update(protocolPlans)
        .set({
          ...(planName && { planName }),
          ...(planDescription !== undefined && { planDescription }),
          ...(wizardConfiguration && { wizardConfiguration }),
          updatedAt: new Date(),
        })
        .where(eq(protocolPlans.id, parseInt(id)))
        .returning()
        .execute();
      
      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error('Error updating protocol plan:', error);
      return res.status(500).json({ success: false, error: 'Failed to update protocol plan' });
    }
  },

  // Delete a protocol plan
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const trainerId = req.user.id;
      
      // Check ownership
      const [existing] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Protocol plan not found' });
      }
      
      // Check for active assignments
      const assignments = await db.select()
        .from(protocolPlanAssignments)
        .where(eq(protocolPlanAssignments.protocolPlanId, parseInt(id)))
        .execute();
      
      if (assignments.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete plan with ${assignments.length} active assignments`,
          assignmentCount: assignments.length,
        });
      }
      
      // Delete the plan
      await db.delete(protocolPlans)
        .where(eq(protocolPlans.id, parseInt(id)))
        .execute();
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting protocol plan:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete protocol plan' });
    }
  },

  // Assign a protocol plan to a customer
  async assign(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { customerId } = req.body;
      const trainerId = req.user.id;
      
      if (!customerId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Customer ID is required' 
        });
      }
      
      // Get the plan
      const [plan] = await db.select()
        .from(protocolPlans)
        .where(and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        ))
        .execute();
      
      if (!plan) {
        return res.status(404).json({ success: false, error: 'Protocol plan not found' });
      }
      
      // Generate protocol from plan
      const protocol = await generateProtocolFromPlan(
        plan.wizardConfiguration,
        customerId,
        trainerId
      );
      
      // Record assignment
      await db.insert(protocolPlanAssignments)
        .values({
          protocolPlanId: plan.id,
          protocolId: protocol.id,
          customerId,
          assignedBy: trainerId,
        })
        .execute();
      
      // Update usage stats
      await db.update(protocolPlans)
        .set({
          usageCount: sql`${protocolPlans.usageCount} + 1`,
          lastUsedAt: new Date(),
        })
        .where(eq(protocolPlans.id, plan.id))
        .execute();
      
      return res.json({ 
        success: true, 
        data: { 
          protocol, 
          assignment: { 
            planId: plan.id,
            planName: plan.planName 
          } 
        } 
      });
    } catch (error) {
      console.error('Error assigning protocol plan:', error);
      return res.status(500).json({ success: false, error: 'Failed to assign protocol plan' });
    }
  },
};
```

### 4. Create Protocol Plan Service

#### File: `server/services/protocolGeneratorService.ts`
Add this function to the existing service or create new if doesn't exist:

```typescript
export async function generateProtocolFromPlan(
  wizardConfiguration: any,
  customerId: number,
  trainerId: number
): Promise<any> {
  try {
    // Extract configuration from wizard data
    const {
      protocolType,
      name,
      description,
      duration,
      intensity,
      category,
      targetAudience,
      healthFocus,
      personalizations,
      safetyValidation,
      advancedOptions
    } = wizardConfiguration;

    // Create the health protocol
    const [protocol] = await db.insert(healthProtocols)
      .values({
        trainerId,
        customerId,
        name,
        description,
        protocolType,
        duration,
        intensity,
        category,
        targetAudience: JSON.stringify(targetAudience),
        healthFocus: JSON.stringify(healthFocus),
        personalizations: JSON.stringify(personalizations),
        safetySettings: JSON.stringify(safetyValidation),
        advancedSettings: JSON.stringify(advancedOptions),
        status: 'active',
        startDate: new Date(),
        createdFromPlan: true,
      })
      .returning()
      .execute();

    // Generate protocol content based on type
    if (protocolType === 'longevity' || protocolType === 'parasite_cleanse') {
      // Generate specialized protocol content
      await generateSpecializedProtocolContent(protocol.id, protocolType, wizardConfiguration);
    }

    // Generate ailments-based customizations if applicable
    if (protocolType === 'ailments_based' && personalizations.healthConditions) {
      await generateAilmentBasedCustomizations(protocol.id, personalizations.healthConditions);
    }

    return protocol;
  } catch (error) {
    console.error('Error generating protocol from plan:', error);
    throw new Error('Failed to generate protocol from plan');
  }
}

async function generateSpecializedProtocolContent(
  protocolId: number, 
  protocolType: string, 
  config: any
): Promise<void> {
  // Implementation for specialized protocol content generation
  // This would integrate with your existing specialized protocol logic
}

async function generateAilmentBasedCustomizations(
  protocolId: number,
  healthConditions: string[]
): Promise<void> {
  // Implementation for ailment-based customizations
  // This would integrate with your existing ailments logic
}
```

### 5. Add Routes

#### File: `server/routes/protocolPlansRoutes.ts`
```typescript
import { Router } from 'express';
import { protocolPlansController } from '../controllers/protocolPlansController';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';

const router = Router();

// All routes require authentication and trainer role
router.use(authenticateToken);
router.use(requireRole(['trainer', 'admin']));

// CRUD operations
router.get('/', protocolPlansController.list);
router.post('/', protocolPlansController.create);
router.get('/:id', protocolPlansController.get);
router.put('/:id', protocolPlansController.update);
router.delete('/:id', protocolPlansController.delete);

// Assignment
router.post('/:id/assign', protocolPlansController.assign);

export default router;
```

### 6. Update Main Router

#### File: `server/index.ts` or `server/app.ts`
Add the new routes to your main application:

```typescript
import protocolPlansRoutes from './routes/protocolPlansRoutes';

// Add to your existing routes
app.use('/api/protocol-plans', protocolPlansRoutes);
```

## Testing Requirements

### Unit Tests
Create test file: `test/unit/protocolPlansController.test.ts`

```typescript
describe('Protocol Plans Controller', () => {
  describe('POST /api/protocol-plans', () => {
    it('should create a new protocol plan', async () => {
      // Test plan creation
    });
    
    it('should reject duplicate plan names', async () => {
      // Test duplicate validation
    });
    
    it('should validate wizard configuration', async () => {
      // Test configuration validation
    });
  });
  
  describe('GET /api/protocol-plans', () => {
    it('should list trainer protocol plans', async () => {
      // Test listing
    });
    
    it('should filter by search term', async () => {
      // Test search functionality
    });
  });
  
  describe('POST /api/protocol-plans/:id/assign', () => {
    it('should create protocol from plan', async () => {
      // Test assignment
    });
    
    it('should track assignment history', async () => {
      // Test assignment tracking
    });
    
    it('should update usage statistics', async () => {
      // Test usage count update
    });
  });
});
```

## Definition of Done
- [ ] Database tables created and migrated
- [ ] All API endpoints implemented and functional
- [ ] Authentication and authorization working correctly
- [ ] Validation service properly validates configurations
- [ ] Unit tests written and passing
- [ ] Integration tests with database operations
- [ ] Manual testing of all endpoints via Postman/curl
- [ ] Code reviewed and approved
- [ ] Documentation updated

## Implementation Notes
1. Run migration after creating schema updates
2. Test each endpoint individually before integration
3. Ensure proper error handling for all edge cases
4. Validate JSONB structure for wizard configuration
5. Consider adding rate limiting for plan creation

## Next Story
After completing this backend implementation, proceed to STORY-011 for the frontend implementation of the Protocol Plans Library and wizard enhancements.