# Product Requirements Document: Protocol Plan Saving Feature

## Product Overview
The Protocol Plan Saving feature transforms the existing Protocol Creation Wizard from a single-use protocol generator into a comprehensive protocol planning and management system. This enhancement allows trainers to create reusable protocol templates (plans) that can be saved and assigned to multiple customers over time, significantly improving workflow efficiency and protocol consistency.

## Problem Statement
Currently, trainers must recreate protocols from scratch for each customer even when using similar configurations. This leads to:
- Duplicated effort for common protocol configurations
- Inconsistency in protocol implementations across similar customers
- Inability to prepare protocols in advance for future use
- No way to build a library of proven protocol templates
- Time wasted re-entering the same wizard configurations

## Solution: Protocol Plan Management System

### Core Value Proposition
Enable trainers to create, save, and reuse protocol configurations as "Protocol Plans" that can be assigned to multiple customers, reducing creation time by 70% and ensuring consistency across similar health protocols.

## User Personas

### Primary: Fitness Trainer
- **Role**: Health protocol specialist managing 20-50 customers
- **Goals**: Efficiently create and manage personalized health protocols
- **Pain Points**: Repetitive protocol creation, maintaining consistency
- **Needs**: Reusable templates, quick assignment workflow

### Secondary: Customer Success Manager
- **Role**: Oversees trainer effectiveness and customer satisfaction
- **Goals**: Ensure trainers can scale their services effectively
- **Pain Points**: Trainers spending too much time on admin tasks
- **Needs**: Metrics on plan reuse and efficiency gains

## Feature Requirements

### 1. Protocol Plan Creation
**Description**: Enhance the wizard's final step to offer saving as a reusable plan

**Requirements**:
- Add "Save as Protocol Plan" button alongside existing "Create Protocol" button
- Capture plan metadata (name, description) via modal dialog
- Store complete wizard configuration in database
- Display confirmation upon successful save
- Support both immediate protocol creation and plan saving in single flow

**Success Criteria**:
- 95% of wizard configurations successfully saved as plans
- Plan save completes in under 2 seconds
- All wizard data preserved accurately

### 2. Protocol Plan Library
**Description**: Central hub for managing saved protocol plans

**Requirements**:
- New page at `/trainer/protocol-plans`
- Card or table view of all trainer's saved plans
- Display: plan name, description, creation date, usage count
- Search by name or description
- Filter by creation date, protocol type, usage frequency
- Sort by name, date, usage count

**Actions per plan**:
- Assign to Customer (primary CTA)
- Edit Plan (opens wizard with pre-filled data)
- Preview (shows what would be generated)
- Duplicate (creates copy with new name)
- Delete (with confirmation)

**Success Criteria**:
- Page loads in under 1 second
- Search returns results instantly
- All actions complete within 2 seconds

### 3. Protocol Plan Assignment
**Description**: Quick workflow to create protocols from saved plans

**Requirements**:
- Customer selection interface (searchable dropdown or modal)
- Option to customize plan for specific customer before creation
- Assignment preview showing what will be generated
- Track assignment history (which customers, when)
- Update usage count on successful assignment

**Success Criteria**:
- Assignment completes in under 3 seconds
- 100% of assignments generate valid protocols
- Assignment history accurately tracked

### 4. Plan Editing
**Description**: Modify existing protocol plans

**Requirements**:
- Open wizard with all data pre-populated from saved plan
- Maintain original plan ID for updates
- Option to "Save as New Plan" for variations
- Version tracking for major changes

**Success Criteria**:
- Edits preserve all existing data
- Updates reflect immediately in plan library
- No data loss during edit operations

## Technical Requirements

### Database Schema
```sql
-- Primary table for storing protocol plans
protocol_plans:
  - id (primary key)
  - trainer_id (foreign key to users)
  - plan_name (unique per trainer)
  - plan_description
  - wizard_configuration (JSONB)
  - created_at
  - updated_at
  - usage_count
  - last_used_at

-- Track plan-to-protocol assignments
protocol_plan_assignments:
  - id (primary key)
  - protocol_plan_id
  - protocol_id
  - customer_id
  - assigned_at
```

### API Endpoints
```
POST   /api/protocol-plans                 # Create plan
GET    /api/protocol-plans                 # List plans
GET    /api/protocol-plans/:id             # Get single plan
PUT    /api/protocol-plans/:id             # Update plan
DELETE /api/protocol-plans/:id             # Delete plan
POST   /api/protocol-plans/:id/assign      # Assign to customer
GET    /api/protocol-plans/:id/preview     # Preview generation
```

### Performance Requirements
- Plan save: < 2 seconds
- Plan list load: < 1 second for up to 100 plans
- Assignment: < 3 seconds including protocol generation
- Search: < 200ms for results
- Database queries: Optimized with proper indexing

## User Experience Requirements

### Wizard Enhancement
- Clear visual distinction between "Save as Plan" and "Create Now" options
- Modal for plan naming with helpful placeholder text
- Success message with link to view saved plan
- Option to continue creating protocol after saving plan

### Plan Library Interface
- Intuitive card-based layout for visual scanning
- Quick actions accessible without clicking into details
- Bulk operations for managing multiple plans
- Empty state with helpful onboarding for first-time users

### Assignment Flow
- Maximum 3 clicks from plan library to protocol creation
- Clear customer selection with search capability
- Preview of what will be created before confirmation
- Success feedback with link to created protocol

## Success Metrics

### Primary KPIs
- **Plan Reuse Rate**: Target 60% of plans used more than once
- **Time Savings**: 70% reduction in protocol creation time when using plans
- **Adoption Rate**: 80% of trainers using plan feature within first month

### Secondary Metrics
- Average plans created per trainer
- Most frequently used plan types
- Customer satisfaction with protocol consistency
- Error rates in plan assignment

## Implementation Phases

### Phase 1: Core Functionality (Week 1)
- Database schema and migrations
- Basic CRUD API endpoints
- Wizard enhancement for saving plans

### Phase 2: Management Interface (Week 2)
- Protocol plans library page
- Search and filter functionality
- Basic assignment workflow

### Phase 3: Advanced Features (Week 3)
- Plan editing and duplication
- Assignment history tracking
- Preview functionality

### Phase 4: Polish & Testing (Week 4)
- Performance optimization
- Comprehensive testing
- User feedback integration

## Risk Mitigation

### Data Integrity
- Comprehensive validation of wizard configurations
- Database backups before major operations
- Soft deletes for plan removal

### User Adoption
- In-app tutorials for new feature
- Migration tool for existing protocols to plans
- Gradual rollout to power users first

### Performance
- Pagination for large plan libraries
- Caching frequently used plans
- Database query optimization

## Future Enhancements
- Plan sharing between trainers
- Public plan marketplace
- AI-powered plan recommendations
- Plan analytics dashboard
- Automated plan optimization based on outcomes

## Acceptance Criteria
- [ ] Trainers can save wizard configurations as reusable plans
- [ ] Plans appear in dedicated management interface
- [ ] Plans can be assigned to multiple customers
- [ ] All wizard data is preserved in saved plans
- [ ] Assignment tracking shows plan usage history
- [ ] Edit functionality updates existing plans
- [ ] Delete functionality removes plans with confirmation
- [ ] Search and filter work across all plan attributes
- [ ] Performance meets specified requirements
- [ ] Feature is fully tested with >90% coverage

## Dependencies
- Existing Protocol Creation Wizard
- Customer management system
- Trainer authentication
- Health protocols database

## Sign-off
- Product Manager: [Pending]
- Technical Lead: [Pending]
- UX Designer: [Pending]
- QA Lead: [Pending]