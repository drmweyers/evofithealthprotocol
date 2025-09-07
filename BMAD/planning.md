# BMAD Planning Document - HealthProtocol System

## Project Overview
**Name**: EvoFitHealthProtocol  
**Description**: Comprehensive health protocol management system with AI-powered protocol generation, specialized health programs, and multi-role support  
**Status**: Active Development  
**Last Updated**: 2025-09-06

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based
- **File Storage**: AWS S3 for images
- **AI Integration**: OpenAI GPT-4

### Infrastructure
- **Development**: Docker Compose
- **Database**: PostgreSQL 16 (Alpine)
- **Port Configuration**: 
  - App: 3501
  - Database: 5434
  - HMR WebSocket: 24679

## Development Methodology

### BMAD Integration
We use the BMAD (Breakthrough Method of Agile AI-Driven Development) framework for:
- Multi-agent development workflows
- Story-driven development
- Automated testing and validation
- Context-aware code generation

### Agent Roles
1. **QA Agent**: Test analysis, validation, bug identification
2. **Developer Agent**: Feature implementation, bug fixes
3. **Architect Agent**: System design, technical decisions
4. **Scrum Master Agent**: Story management, sprint planning

## Current Sprint (September 2025)

### Completed Stories
- ✅ STORY-012: BMAD multi-agent workflow implementation
- ✅ STORY-013: Protocol wizard navigation fix
- ✅ STORY-014: Wizard blank page fix
- ✅ STORY-015: Protocol wizard comprehensive debug (100% test success)

### Active Development
- 🔄 Health Protocol System enhancements
- 🔄 Specialized protocols (Longevity, Parasite Cleanse)
- 🔄 AI-powered protocol generation

### Technical Debt
- ⚠️ Next button enablement in Protocol Wizard
- ⚠️ Test flakiness with parallel execution
- ⚠️ Missing data-testid attributes for reliable testing

## System Components

### Core Features
1. **Authentication System**
   - Multi-role support (Admin, Trainer, Customer)
   - JWT-based authentication
   - Role-based access control

2. **Health Protocol Management**
   - Protocol creation wizard
   - AI-powered generation
   - Template system
   - Safety validation

3. **Specialized Protocols**
   - Longevity Mode protocols
   - Parasite Cleanse protocols
   - Ailment-based customization

4. **Client Management**
   - Customer profiles
   - Progress tracking
   - Protocol assignments
   - Measurement tracking

5. **Recipe & Meal Planning**
   - AI-generated recipes
   - Nutritional analysis
   - Meal plan creation
   - PDF export

## Testing Strategy

### Test Coverage
- **Unit Tests**: Component-level testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user flow testing with Playwright
- **Current Coverage**: ~90%

### Test Infrastructure
- **Framework**: Playwright for E2E, Jest for unit tests
- **CI/CD**: GitHub Actions (planned)
- **Test Data**: Standardized test accounts
- **Environments**: Docker-based isolation

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fitmeal.pro | AdminPass123 |
| Trainer | trainer.test@evofitmeals.com | TestTrainer123! |
| Customer | customer.test@evofitmeals.com | TestCustomer123! |

## API Architecture

### Core Endpoints
- `/api/auth/*` - Authentication endpoints
- `/api/admin/*` - Admin-specific operations
- `/api/trainer/*` - Trainer-specific operations
- `/api/customer/*` - Customer-specific operations
- `/api/health-protocols/*` - Protocol management
- `/api/recipes/*` - Recipe generation and management
- `/api/meal-plans/*` - Meal planning

### Data Models
- Users (multi-role)
- Health Protocols
- Protocol Templates
- Protocol Assignments
- Recipes
- Meal Plans
- Customer Progress
- Measurements

## Deployment Strategy

### Development Environment
- **Tool**: Docker Compose
- **Command**: `docker-compose --profile dev up -d`
- **Access**: http://localhost:3501

### Production Environment (Planned)
- **Platform**: TBD (DigitalOcean/AWS/Vercel)
- **Database**: Managed PostgreSQL
- **CDN**: CloudFront or similar
- **Monitoring**: Sentry, DataDog

## Security Considerations

### Implemented
- JWT authentication
- Role-based access control
- Input sanitization
- SQL injection prevention
- XSS protection

### Planned
- Rate limiting
- API key management
- Audit logging
- HIPAA compliance review
- Penetration testing

## Performance Optimization

### Current Optimizations
- React Query caching
- Lazy loading for routes
- Image optimization
- Database indexing

### Planned Optimizations
- Redis caching
- CDN integration
- Bundle splitting
- Service worker implementation

## Documentation

### Available Documentation
- `README.md` - Project setup and overview
- `API_DOCUMENTATION.md` - API endpoints and usage
- `CLAUDE.md` - Development guidelines
- `TEST_CREDENTIALS.md` - Test account information
- `BMAD/` - BMAD methodology and stories

### Documentation Needs
- User guides
- Admin documentation
- API integration guides
- Deployment guides

## Quality Metrics

### Code Quality
- **Linting**: ESLint configured
- **Formatting**: Prettier configured
- **Type Safety**: TypeScript strict mode
- **Code Review**: PR-based workflow

### Performance Metrics
- **Page Load**: Target < 2s
- **API Response**: Target < 200ms
- **Database Queries**: Optimized with indexes
- **Bundle Size**: Monitored with webpack-bundle-analyzer

## Risk Management

### Technical Risks
1. **Scalability**: Database performance at scale
2. **Security**: Health data protection
3. **Compliance**: HIPAA requirements
4. **Integration**: Third-party API reliability

### Mitigation Strategies
- Regular security audits
- Performance testing
- Backup and disaster recovery
- API fallback mechanisms

## Future Roadmap

### Q1 2025
- Mobile application development
- Advanced analytics dashboard
- Wearable device integration
- Multi-language support

### Q2 2025
- AI model fine-tuning
- Telemedicine integration
- Insurance portal
- B2B enterprise features

### Q3 2025
- Marketplace for protocols
- Community features
- Certification system
- API monetization

## Team Structure

### Development Team
- **Tech Lead**: BMAD CTO Agent
- **Backend**: BMAD Developer Agents
- **Frontend**: BMAD UI Agents
- **QA**: BMAD Testing Agents
- **DevOps**: BMAD Infrastructure Agents

### Stakeholders
- Product Owner
- Medical Advisors
- Fitness Professionals
- End Users (Trainers & Customers)

## Communication Channels

### Development
- GitHub Issues for bug tracking
- Pull Requests for code review
- BMAD stories for feature development
- Claude.md for session continuity

### Documentation
- Markdown files in repository
- API documentation (Swagger planned)
- User guides (in development)

## Success Metrics

### Technical KPIs
- Test coverage > 90%
- API response time < 200ms
- Zero critical security vulnerabilities
- 99.9% uptime

### Business KPIs
- User adoption rate
- Protocol completion rate
- Customer satisfaction score
- Trainer productivity metrics

## Continuous Improvement

### Weekly Reviews
- Sprint retrospectives
- Performance analysis
- Security scanning
- Dependency updates

### Monthly Reviews
- Architecture review
- Technical debt assessment
- Feature prioritization
- Stakeholder feedback

## Conclusion

The HealthProtocol system is a robust, scalable platform for health protocol management. Using BMAD methodology and multi-agent development, we maintain high code quality, comprehensive testing, and rapid feature delivery. The system is ready for production deployment with minor enhancements needed for optimal user experience.

---

**Document Maintained By**: BMAD Team  
**Last Technical Review**: 2025-09-06  
**Next Review Scheduled**: 2025-01-15