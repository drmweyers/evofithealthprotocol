# HealthProtocol Technical Planning & Architecture

**Document Type:** Technical Architecture & Planning Document  
**Version:** 1.0  
**Created:** August 25, 2025  
**Document Owner:** Technical Architecture Team  
**BMAD Integration:** Enhanced with BMAD Architecture Agent patterns  

---

## 1. Technical Architecture Overview

### 1.1 System Architecture Vision
The HealthProtocol platform is built as a modern, cloud-native web application using microservices principles within a monolithic deployment model. This approach provides the flexibility of service-oriented architecture while maintaining operational simplicity.

### 1.2 High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React SPA (TypeScript)  │  Mobile PWA  │  PDF Export Service  │
├─────────────────────────────────────────────────────────────────┤
│                      API Gateway (Express)                       │
├─────────────────────────────────────────────────────────────────┤
│                     Business Logic Layer                         │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│   Protocol   │    Recipe    │   Customer   │   Admin/Trainer  │
│   Service    │   Service    │   Service    │    Service       │
├──────────────┴──────────────┴──────────────┴──────────────────┤
│                     Data Access Layer                            │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│  PostgreSQL  │    Redis     │  AWS S3/DO   │   Email Service  │
│  (Drizzle)   │   (Cache)    │   Spaces     │    (Resend)      │
└──────────────┴──────────────┴──────────────┴──────────────────┘
```

### 1.3 Technology Stack Decisions

#### Frontend Stack
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS + shadcn/ui components
- **State Management:** React Context + React Query
- **Build Tool:** Vite for fast development and optimized builds
- **Testing:** Vitest + React Testing Library + Playwright

**Rationale:** Modern, performant stack with excellent developer experience and strong ecosystem support.

#### Backend Stack
- **Runtime:** Node.js (LTS version)
- **Framework:** Express.js with TypeScript
- **ORM:** Drizzle ORM for type-safe database access
- **Authentication:** JWT with refresh tokens
- **API Design:** RESTful with potential GraphQL migration path

**Rationale:** Unified JavaScript/TypeScript stack reduces context switching and enables code sharing.

#### Infrastructure Stack
- **Containerization:** Docker for consistent environments
- **Database:** PostgreSQL for relational data integrity
- **Caching:** Redis for session management and data caching
- **File Storage:** AWS S3 / DigitalOcean Spaces
- **Email Delivery:** Resend for transactional emails
- **Deployment:** DigitalOcean App Platform (initial), AWS (scale)

**Rationale:** Proven, scalable infrastructure with managed services to reduce operational overhead.

---

## 2. System Design Patterns

### 2.1 Architectural Patterns

#### Service-Oriented Monolith
- Organized as logical services within single deployment
- Clear separation of concerns with service boundaries
- Easy refactoring to microservices when needed

#### Repository Pattern
- Abstracts data access logic from business logic
- Enables easy testing with mock repositories
- Supports future database migrations

#### Factory Pattern
- Used for protocol and recipe generation
- Encapsulates complex creation logic
- Supports multiple generation strategies

### 2.2 Security Patterns

#### Defense in Depth
- Multiple security layers (auth, validation, sanitization)
- Rate limiting at API gateway level
- Input validation at every boundary

#### Principle of Least Privilege
- Role-based access control (RBAC)
- Granular permissions per feature
- Audit logging for sensitive operations

### 2.3 Data Patterns

#### Event Sourcing (Future)
- Track all state changes for protocols
- Enable time-travel debugging
- Support compliance requirements

#### CQRS Lite
- Separate read and write models where beneficial
- Optimized queries for reporting
- Maintain consistency with domain events

---

## 3. Development Roadmap

### Phase 1: Foundation (Weeks 1-4) ✅ COMPLETE
- [x] Core authentication and authorization
- [x] Basic CRUD operations for all entities
- [x] Health protocol generation with AI
- [x] Recipe management system
- [x] Customer progress tracking

### Phase 2: Enhancement (Weeks 5-8) 🚧 CURRENT
- [ ] Test framework stabilization
- [ ] Production deployment validation
- [ ] Email system domain verification
- [ ] API performance optimization
- [ ] Mobile responsiveness improvements

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Advanced analytics dashboard
- [ ] Protocol effectiveness tracking
- [ ] Multi-language support
- [ ] API versioning implementation
- [ ] Advanced caching strategies

### Phase 4: Scale & Optimize (Weeks 13-16)
- [ ] Horizontal scaling preparation
- [ ] Advanced monitoring and alerting
- [ ] A/B testing framework
- [ ] Machine learning integration
- [ ] Enterprise features

---

## 4. Technical Debt & Risk Management

### 4.1 Current Technical Debt
1. **Test Framework Conflicts** (HIGH)
   - Multiple test runners causing conflicts
   - Action: Consolidate to single test framework

2. **API Performance** (MEDIUM)
   - No caching layer implemented
   - Action: Implement Redis caching

3. **Error Handling** (MEDIUM)
   - Inconsistent error responses
   - Action: Standardize error handling

### 4.2 Risk Register

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| OpenAI API Dependency | HIGH | MEDIUM | Implement fallback providers, caching |
| Data Privacy Breach | HIGH | LOW | Encryption, access controls, auditing |
| Scaling Bottlenecks | MEDIUM | HIGH | Design for horizontal scaling early |
| Third-party Service Outage | MEDIUM | MEDIUM | Circuit breakers, graceful degradation |

---

## 5. Quality Strategy

### 5.1 Code Quality Standards
- **TypeScript:** Strict mode enabled, no any types
- **Linting:** ESLint with recommended rules
- **Formatting:** Prettier with consistent config
- **Code Reviews:** Required for all PRs
- **Documentation:** JSDoc for public APIs

### 5.2 Testing Strategy
- **Unit Tests:** 80% coverage minimum for business logic
- **Integration Tests:** All API endpoints covered
- **E2E Tests:** Critical user journeys automated
- **Performance Tests:** Load testing for 1000 concurrent users
- **Security Tests:** OWASP Top 10 coverage

### 5.3 Monitoring & Observability
- **APM:** Application performance monitoring
- **Logging:** Structured logging with correlation IDs
- **Metrics:** Business and technical KPIs tracked
- **Alerts:** Proactive alerting for anomalies
- **Dashboards:** Real-time system health visibility

---

## 6. Deployment Strategy

### 6.1 Deployment Pipeline
```
Developer → Feature Branch → PR Review → Main Branch → 
Staging Deploy → Integration Tests → Production Deploy
```

### 6.2 Environment Strategy
- **Development:** Local Docker environment
- **Staging:** Replica of production with test data
- **Production:** Blue-green deployment capable

### 6.3 Release Strategy
- **Versioning:** Semantic versioning (MAJOR.MINOR.PATCH)
- **Frequency:** Weekly releases with hotfix capability
- **Rollback:** Instant rollback to previous version
- **Feature Flags:** Gradual rollout of new features

---

## 7. API Design & Integration

### 7.1 API Design Principles
- **RESTful:** Resource-oriented design
- **Versioning:** URL versioning (/api/v1/)
- **Pagination:** Cursor-based for large datasets
- **Filtering:** Standardized query parameters
- **Response Format:** Consistent JSON structure

### 7.2 External Integrations
1. **OpenAI GPT-4**
   - Purpose: Protocol and recipe generation
   - Integration: Direct API with retry logic
   - Fallback: Cached responses, template system

2. **AWS S3 / DigitalOcean Spaces**
   - Purpose: File storage (images, PDFs)
   - Integration: SDK with presigned URLs
   - Fallback: Local storage for development

3. **Resend Email Service**
   - Purpose: Transactional emails
   - Integration: API with template management
   - Fallback: Email queue for retry

---

## 8. Data Architecture

### 8.1 Database Schema Design
- **Normalization:** 3NF for transactional data
- **Denormalization:** Strategic for read performance
- **Indexes:** Covering indexes for common queries
- **Partitioning:** Date-based for large tables (future)

### 8.2 Data Retention & Archival
- **Active Data:** Last 12 months in primary database
- **Archive Data:** 12-36 months in cold storage
- **Deletion Policy:** GDPR compliant with user requests
- **Backup Strategy:** Daily automated backups, 30-day retention

### 8.3 Data Migration Strategy
- **Schema Migrations:** Version controlled with Drizzle
- **Data Migrations:** Scripted and tested
- **Rollback Plan:** Forward-only with compensating migrations
- **Zero-downtime:** Blue-green deployment for migrations

---

## 9. Performance & Scalability

### 9.1 Performance Targets
- **Page Load:** < 3 seconds on 3G networks
- **API Response:** < 200ms for 95th percentile
- **Concurrent Users:** Support 1000 active users
- **Database Queries:** < 50ms for common operations

### 9.2 Scalability Strategy
- **Horizontal Scaling:** Stateless application servers
- **Database Scaling:** Read replicas, connection pooling
- **Caching Strategy:** Multi-level caching (CDN, Redis, application)
- **Async Processing:** Queue-based for heavy operations

---

## 10. Security Architecture

### 10.1 Security Layers
1. **Network Security:** WAF, DDoS protection
2. **Application Security:** Input validation, output encoding
3. **Authentication:** JWT with secure storage
4. **Authorization:** RBAC with principle of least privilege
5. **Data Security:** Encryption at rest and in transit

### 10.2 Compliance Requirements
- **GDPR:** Data privacy and user rights
- **HIPAA:** Health information protection (future)
- **SOC 2:** Security and availability (future)
- **PCI DSS:** Payment processing (future)

---

## 11. BMAD Integration Points

### 11.1 Story-Driven Development
- All features start with BMAD story files
- Stories contain full technical context
- Architecture decisions documented in stories
- **Status**: ✅ IMPLEMENTED - Story system active at `stories/`

### 11.2 Agent Collaboration
- Architect agent maintains this document
- Dev agents reference architecture in implementations
- QA agents validate against architecture
- **Current Story**: STORY-001 (Test Framework Stabilization)

### 11.3 Continuous Architecture
- Living document updated with each sprint
- Architecture decisions tracked and versioned
- Regular architecture reviews with BMAD agents
- **Tracking**: See `stories/STORY_TRACKING.md` for sprint progress

### 11.4 BMAD Implementation Status
- **Installation**: ✅ Complete at `C:\Users\drmwe\claude-workspace\HealthProtocol\BMAD`
- **Story Workflow**: ✅ Established with directories and tracking
- **Agent Commands**: ✅ Available via `/` prefix in Claude Code
- **Documentation**: ✅ Integrated with existing PRD and planning docs

---

## 12. Current Sprint Status (BMAD Tracked)

### Active Development
- **Story ID**: STORY-001
- **Title**: Test Framework Stabilization
- **Status**: Ready for Implementation
- **Priority**: 🔴 Critical
- **Developer**: Use `/dev` to implement
- **Details**: `stories/current/STORY-001-test-framework-stabilization.md`

### Sprint Backlog (Prioritized)
1. STORY-002: Production Deployment Validation
2. STORY-003: Email System Domain Verification
3. STORY-004: Health Protocol Generation Optimization
4. STORY-005: Mobile-Responsive Dashboard

### Technical Decisions This Sprint
- **Testing Framework**: Standardizing on Vitest + Playwright
- **Deployment Target**: DigitalOcean App Platform validation
- **Email Provider**: Resend with domain verification pending

---

## 11. Recent Technical Improvements (January 2025)

### 11.1 Customer-Trainer Linkage Fix (STORY-009)
**Completed:** January 4, 2025  
**Impact:** Critical bug fix for core platform feature

#### Problem Solved
- Drizzle ORM join operation was failing when fetching trainer information for customer profiles
- Customers couldn't see their assigned trainer's information
- Database query errors were preventing proper data relationships

#### Technical Solution
```typescript
// Fixed Drizzle ORM query with proper join syntax
const result = await db
  .select({
    trainerId: protocolAssignments.trainerId,
    trainerEmail: users.email,
    trainerName: users.name,
    trainerProfilePicture: users.profilePicture,
  })
  .from(protocolAssignments)
  .innerJoin(users, eq(protocolAssignments.trainerId, users.id))
  .where(eq(protocolAssignments.customerId, customerId))
  .orderBy(sql`${protocolAssignments.assignedAt} DESC`)
  .limit(1);
```

#### Key Improvements
- ✅ Proper table joining with explicit column selection
- ✅ Fixed schema validation in trainer routes
- ✅ Added comprehensive error handling
- ✅ Graceful fallback for unassigned customers
- ✅ Enhanced API response structure with trainer details

#### Testing Coverage Added
- API integration tests for profile endpoints
- Playwright E2E tests for profile navigation
- Verification scripts for trainer linkage
- Edge case handling tests

### 11.2 Database Query Patterns
**Best Practices Established:**
- Use explicit column selection in Drizzle joins
- Separate URL params from body validation schemas
- Order by timestamp for most recent relationships
- Implement proper null handling for optional relationships

### 11.3 API Response Standardization
**New Pattern for Profile Responses:**
```json
{
  "profile": {
    "user": {},
    "trainer": {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "specialization": "string",
      "experience": "number"
    },
    "stats": {},
    "relationships": []
  }
}
```

---

_This planning document is maintained by the BMAD Architecture Agent and updated regularly to reflect current technical decisions and future planning._
