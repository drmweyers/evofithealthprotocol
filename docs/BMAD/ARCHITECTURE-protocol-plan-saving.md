# Technical Architecture: Protocol Plan Saving Feature

## Architecture Overview
This document defines the technical architecture for implementing the Protocol Plan Saving feature, which extends the existing Protocol Creation Wizard to support saving and reusing protocol configurations.

## System Architecture

### Component Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────┐     │
│  │ Protocol Creation │  │  Protocol Plans Library  │     │
│  │      Wizard       │  │      (New Component)     │     │
│  │   (Enhanced)      │  │                          │     │
│  └──────────────────┘  └─────────────────────────┘     │
│                                                          │
│  ┌──────────────────┐  ┌─────────────────────────┐     │
│  │  Plan Assignment  │  │    Plan Editor          │     │
│  │     Modal         │  │    (Reuses Wizard)      │     │
│  └──────────────────┘  └─────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express)                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────┐     │
│  │  Protocol Plans   │  │  Protocol Generator     │     │
│  │    Controller     │  │     (Enhanced)          │     │
│  └──────────────────┘  └─────────────────────────┘     │
│                                                          │
│  ┌──────────────────┐  ┌─────────────────────────┐     │
│  │    Validation     │  │   Assignment Service    │     │
│  │     Service       │  │                          │     │
│  └──────────────────┘  └─────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Drizzle ORM
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Database (PostgreSQL)                    │
├─────────────────────────────────────────────────────────┤
│  • protocol_plans                                        │
│  • protocol_plan_assignments                             │
│  • health_protocols (existing)                          │
│  • users (existing)                                      │
└─────────────────────────────────────────────────────────┘
```

## Database Design

### Schema Definition (Drizzle ORM)

```typescript
// shared/schema.ts - Add to existing schema

export const protocolPlans = pgTable('protocol_plans', {
  id: serial('id').primaryKey(),
  trainerId: integer('trainer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  planName: varchar('plan_name', { length: 255 }).notNull(),
  planDescription: text('plan_description'),
  
  // Wizard configuration stored as JSONB
  wizardConfiguration: jsonb('wizard_configuration').notNull().$type<{
    protocolType: string;
    selectedTemplate?: any;
    useTemplate: boolean;
    name: string;
    description: string;
    duration: number;
    intensity: string;
    category: string;
    targetAudience: string[];
    healthFocus: string[];
    experienceLevel: string;
    personalizations: any;
    safetyValidation: any;
    advancedOptions: any;
  }>(),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastUsedAt: timestamp('last_used_at'),
  usageCount: integer('usage_count').default(0),
}, (table) => ({
  // Composite unique constraint
  uniqueTrainerPlanName: unique().on(table.trainerId, table.planName),
  // Indexes for performance
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
  // Indexes
  planIdIdx: index('idx_protocol_plan_assignments_plan_id').on(table.protocolPlanId),
  customerIdIdx: index('idx_protocol_plan_assignments_customer_id').on(table.customerId),
}));

// Type exports
export type ProtocolPlan = typeof protocolPlans.$inferSelect;
export type NewProtocolPlan = typeof protocolPlans.$inferInsert;
export type ProtocolPlanAssignment = typeof protocolPlanAssignments.$inferSelect;
```

## API Design

### Protocol Plans Controller
```typescript
// server/controllers/protocolPlansController.ts

export class ProtocolPlansController {
  // GET /api/protocol-plans
  async listProtocolPlans(req: Request, res: Response) {
    const trainerId = req.user.id;
    const { search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Query with search and sorting
    const plans = await db
      .select()
      .from(protocolPlans)
      .where(eq(protocolPlans.trainerId, trainerId))
      .orderBy(desc(protocolPlans[sortBy]))
      .execute();
    
    return res.json({ success: true, data: plans });
  }

  // POST /api/protocol-plans
  async createProtocolPlan(req: Request, res: Response) {
    const trainerId = req.user.id;
    const { planName, planDescription, wizardConfiguration } = req.body;
    
    // Validate wizard configuration
    const validation = validateWizardConfiguration(wizardConfiguration);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        error: validation.errors 
      });
    }
    
    // Create plan
    const [plan] = await db
      .insert(protocolPlans)
      .values({
        trainerId,
        planName,
        planDescription,
        wizardConfiguration,
      })
      .returning()
      .execute();
    
    return res.json({ success: true, data: plan });
  }

  // GET /api/protocol-plans/:id
  async getProtocolPlan(req: Request, res: Response) {
    const { id } = req.params;
    const trainerId = req.user.id;
    
    const [plan] = await db
      .select()
      .from(protocolPlans)
      .where(
        and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        )
      )
      .execute();
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Protocol plan not found' 
      });
    }
    
    return res.json({ success: true, data: plan });
  }

  // PUT /api/protocol-plans/:id
  async updateProtocolPlan(req: Request, res: Response) {
    const { id } = req.params;
    const trainerId = req.user.id;
    const updates = req.body;
    
    const [updated] = await db
      .update(protocolPlans)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        )
      )
      .returning()
      .execute();
    
    return res.json({ success: true, data: updated });
  }

  // DELETE /api/protocol-plans/:id
  async deleteProtocolPlan(req: Request, res: Response) {
    const { id } = req.params;
    const trainerId = req.user.id;
    
    // Check for active assignments
    const assignments = await db
      .select()
      .from(protocolPlanAssignments)
      .where(eq(protocolPlanAssignments.protocolPlanId, parseInt(id)))
      .execute();
    
    if (assignments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete plan with active assignments',
        assignmentCount: assignments.length,
      });
    }
    
    await db
      .delete(protocolPlans)
      .where(
        and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        )
      )
      .execute();
    
    return res.json({ success: true });
  }

  // POST /api/protocol-plans/:id/assign
  async assignProtocolPlan(req: Request, res: Response) {
    const { id } = req.params;
    const { customerId } = req.body;
    const trainerId = req.user.id;
    
    // Get the plan
    const [plan] = await db
      .select()
      .from(protocolPlans)
      .where(
        and(
          eq(protocolPlans.id, parseInt(id)),
          eq(protocolPlans.trainerId, trainerId)
        )
      )
      .execute();
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Protocol plan not found' 
      });
    }
    
    // Generate protocol from plan
    const protocol = await generateProtocolFromPlan(
      plan.wizardConfiguration,
      customerId,
      trainerId
    );
    
    // Record assignment
    await db.insert(protocolPlanAssignments).values({
      protocolPlanId: plan.id,
      protocolId: protocol.id,
      customerId,
      assignedBy: trainerId,
    }).execute();
    
    // Update usage stats
    await db
      .update(protocolPlans)
      .set({
        usageCount: sql`${protocolPlans.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(protocolPlans.id, plan.id))
      .execute();
    
    return res.json({ 
      success: true, 
      data: { protocol, assignment: { planId: plan.id } } 
    });
  }
}
```

## Frontend Architecture

### Component Structure

```typescript
// client/src/components/ProtocolPlansLibrary.tsx

interface ProtocolPlansLibraryProps {
  onAssignPlan: (plan: ProtocolPlan) => void;
  onEditPlan: (plan: ProtocolPlan) => void;
}

export function ProtocolPlansLibrary({ 
  onAssignPlan, 
  onEditPlan 
}: ProtocolPlansLibraryProps) {
  const [plans, setPlans] = useState<ProtocolPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'usage'>('date');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProtocolPlan | null>(null);

  // Fetch plans
  const { data, isLoading } = useQuery({
    queryKey: ['protocol-plans', searchTerm, sortBy],
    queryFn: () => fetchProtocolPlans({ search: searchTerm, sortBy }),
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProtocolPlan,
    onSuccess: () => {
      queryClient.invalidateQueries(['protocol-plans']);
      toast({ title: 'Plan deleted successfully' });
    },
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="usage">Sort by Usage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map(plan => (
          <ProtocolPlanCard
            key={plan.id}
            plan={plan}
            onAssign={() => handleAssign(plan)}
            onEdit={() => onEditPlan(plan)}
            onDelete={() => deleteMutation.mutate(plan.id)}
            onPreview={() => handlePreview(plan)}
          />
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedPlan && (
        <AssignPlanModal
          plan={selectedPlan}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignToCustomer}
        />
      )}
    </div>
  );
}
```

### Wizard Enhancement

```typescript
// client/src/components/ProtocolCreationWizard.tsx - Enhanced final step

function PreviewGenerateStep({ wizardData, updateWizardData }: any) {
  const [saveMode, setSaveMode] = useState<'immediate' | 'plan' | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);

  const savePlanMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/protocol-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planName,
          planDescription,
          wizardConfiguration: wizardData,
        }),
      });
      if (!response.ok) throw new Error('Failed to save plan');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Protocol Plan Saved',
        description: `"${planName}" has been saved to your library.`,
      });
      // Option to continue with immediate creation or finish
      if (saveMode === 'plan') {
        onComplete(data.data);
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Configuration Summary */}
      <ProtocolSummary wizardData={wizardData} />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowPlanModal(true)}
          className="min-w-[200px]"
        >
          <Save className="mr-2 h-4 w-4" />
          Save as Protocol Plan
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setSaveMode('immediate');
            onComplete(wizardData);
          }}
          className="min-w-[200px] bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Create & Assign Now
        </Button>
      </div>

      {/* Plan Save Modal */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Protocol Plan</DialogTitle>
            <DialogDescription>
              Give your protocol plan a name and description for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="plan-name">Plan Name *</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., 30-Day Beginner Wellness"
              />
            </div>
            <div>
              <Label htmlFor="plan-description">Description</Label>
              <Textarea
                id="plan-description"
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                placeholder="Describe when to use this protocol plan..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSaveMode('plan');
                savePlanMutation.mutate();
                setShowPlanModal(false);
              }}
              disabled={!planName.trim()}
            >
              Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

## Service Layer

```typescript
// server/services/protocolPlanService.ts

export class ProtocolPlanService {
  // Validate wizard configuration structure
  static validateWizardConfiguration(config: any): ValidationResult {
    const errors: string[] = [];
    
    // Required fields validation
    if (!config.protocolType) errors.push('Protocol type is required');
    if (!config.name) errors.push('Protocol name is required');
    if (!config.duration || config.duration < 7 || config.duration > 365) {
      errors.push('Duration must be between 7 and 365 days');
    }
    if (!config.targetAudience?.length) {
      errors.push('At least one target audience is required');
    }
    if (!config.healthFocus?.length) {
      errors.push('At least one health focus is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Generate protocol from saved plan
  static async generateProtocolFromPlan(
    wizardConfig: any,
    customerId: number,
    trainerId: number
  ): Promise<any> {
    // Use existing protocol generation logic
    const protocolData = {
      ...wizardConfig,
      customerId,
      trainerId,
      createdFromPlan: true,
    };
    
    // Call existing protocol generation service
    return await ProtocolGeneratorService.generate(protocolData);
  }

  // Check for duplicate plan names
  static async checkDuplicateName(
    trainerId: number,
    planName: string,
    excludeId?: number
  ): Promise<boolean> {
    const existing = await db
      .select()
      .from(protocolPlans)
      .where(
        and(
          eq(protocolPlans.trainerId, trainerId),
          eq(protocolPlans.planName, planName),
          excludeId ? ne(protocolPlans.id, excludeId) : undefined
        )
      )
      .execute();
    
    return existing.length > 0;
  }
}
```

## Migration Strategy

### Database Migration
```sql
-- migrations/add_protocol_plans.sql

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

-- Create indexes
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

-- Create indexes
CREATE INDEX idx_protocol_plan_assignments_plan_id ON protocol_plan_assignments(protocol_plan_id);
CREATE INDEX idx_protocol_plan_assignments_customer_id ON protocol_plan_assignments(customer_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_protocol_plans_updated_at 
  BEFORE UPDATE ON protocol_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Performance Considerations

### Caching Strategy
- Cache frequently used plans in Redis
- Implement query result caching for plan listings
- Cache wizard configuration validation results

### Database Optimization
- JSONB indexing for wizard_configuration queries
- Partial indexes for active plans
- Query optimization for large plan libraries

### Frontend Optimization
- Lazy loading for plan library
- Virtual scrolling for large lists
- Debounced search queries
- Optimistic UI updates

## Security Considerations

### Authorization
- Row-level security for trainer-specific plans
- Validate trainer ownership on all operations
- Customer access validation for assignments

### Input Validation
- Sanitize all wizard configuration inputs
- Validate JSONB structure before storage
- Prevent SQL injection in search queries

### Data Privacy
- Encrypt sensitive configuration data
- Audit trail for plan modifications
- GDPR compliance for data retention

## Testing Strategy

### Unit Tests
- Wizard configuration validation
- Plan CRUD operations
- Assignment logic
- Service layer methods

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows
- Error handling

### E2E Tests
- Complete wizard flow with plan saving
- Plan library interactions
- Assignment workflow
- Search and filtering

## Monitoring & Analytics

### Key Metrics
- Plan creation rate
- Assignment success rate
- Most used plan types
- Search query patterns
- Error rates

### Logging
- Structured logging for all operations
- Audit trail for plan modifications
- Performance metrics collection
- Error tracking with context

## Rollout Strategy

### Phase 1: Beta Testing
- Deploy to 10% of trainers
- Monitor performance and errors
- Collect user feedback

### Phase 2: Gradual Rollout
- Increase to 50% of users
- A/B testing for UI variations
- Performance optimization

### Phase 3: Full Release
- 100% availability
- Marketing communications
- Training materials

## Future Enhancements

### Version 2.0
- Plan versioning system
- Plan sharing between trainers
- Public plan marketplace
- AI-powered plan recommendations

### Version 3.0
- Plan analytics dashboard
- Automated plan optimization
- Customer feedback integration
- Multi-language support