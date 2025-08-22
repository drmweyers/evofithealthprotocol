# HealthProtocol Development Guidelines

## Project Overview
**Name:** EvoFitHealthProtocol  
**Description:** A comprehensive health protocol management application for fitness professionals and their clients, featuring specialized health protocols, recipe management, meal plan generation, PDF exports, customer progress tracking, and multi-role support.  
**Tech Stack:** React 18, TypeScript, Node.js, Express, PostgreSQL, Drizzle ORM, Vite, Docker, shadcn/ui, OpenAI GPT-4

## 🌟 CRITICAL: BRANCH STRUCTURE & WORKFLOW
**Current branch status (December 2024):**

### Branch Hierarchy:
1. **main** - 🥇 PRODUCTION BRANCH (primary development branch)
   - Status: Active development branch for health protocol features
   - Contains: Core health protocol functionality, specialized protocols system
   - Production deployment: TBD based on deployment strategy
   - Development URL: http://localhost:3500

2. **feature/** - 🥈 Feature branches for specific development
   - Use case: Individual feature development (health protocols, ailment systems, etc.)
   - Branch from main for new feature development

## CRITICAL: Development Environment Setup

### ALWAYS Start Development with Docker
1. **Check Docker is running first**: `docker ps`
2. **Start development server**: `docker-compose --profile dev up -d`
3. **Verify startup**: `docker logs evofithealthprotocol-dev --tail 20`
4. **Access points**:
   - Frontend & Backend: http://localhost:3500
   - Backend API: http://localhost:3500/api
   - PostgreSQL: localhost:5434
   - HMR WebSocket: localhost:24679

### Docker Commands Reference
- **Start dev environment**: `docker-compose --profile dev up -d`
- **Stop dev environment**: `docker-compose --profile dev down`
- **View logs**: `docker logs evofithealthprotocol-dev -f`
- **Restart containers**: `docker-compose --profile dev restart`
- **Rebuild after dependencies change**: `docker-compose --profile dev up -d --build`

### NPM Script Shortcuts
- **Start development**: `npm run dev`
- **Stop development**: `npm run stop`
- **View logs**: `npm run logs`
- **Run tests**: `npm test`
- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`

## Repository Layout
```
/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── progress/      # Progress tracking components
│   │   │   ├── HealthProtocolDashboard.tsx
│   │   │   ├── SpecializedProtocolsPanel.tsx
│   │   │   ├── TrainerHealthProtocols.tsx
│   │   │   └── *.tsx          # Feature-specific components
│   │   ├── pages/             # Page components (Admin, Trainer, Customer, etc.)
│   │   ├── contexts/          # React contexts (AuthContext)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── lib/               # Utility functions
│   │   └── utils/             # Client-side utilities
├── server/                     # Express backend application
│   ├── controllers/           # Route controllers
│   ├── routes/                # API routes (admin, trainer, customer, etc.)
│   ├── middleware/            # Express middleware
│   ├── services/              # External service integrations (OpenAI, email, S3)
│   ├── utils/                 # Backend utilities
│   └── views/                 # EJS templates (for PDFs)
├── shared/                     # Shared code between client/server
│   └── schema.ts              # Database schema & validation (Drizzle ORM)
├── migrations/                 # Database migration files
├── test/                      # Comprehensive test suite
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── e2e/                   # End-to-end tests with Playwright
│   └── gui/                   # GUI testing with Puppeteer
├── docs/                      # Documentation files
├── docker-compose.yml         # Docker configuration
├── package.json               # Root package configuration
└── CLAUDE.md                  # This file
```

## Development Workflow

### Before Starting Any Development Task
1. **ALWAYS** ensure you're on main branch: `git checkout main`
2. **ALWAYS** start Docker development environment first: `npm run dev`
3. Check git status: `git status`
4. Pull latest changes: `git pull origin main`
5. Create feature branch: `git checkout -b feature/<description>` (from main)

### Branch Management Commands
```bash
# Always start from main (primary development branch)
git checkout main
git pull origin main

# For feature work
git checkout -b feature/your-feature-name
# ... do work ...
git add .
git commit -m "feat(scope): descriptive message"
git push origin feature/your-feature-name

# Merge back to main when ready
git checkout main
git merge feature/your-feature-name
git push origin main
```

### During Development
1. Use TodoWrite tool to track all tasks
2. Test changes in the Docker environment
3. Run linting before commits: `npm run lint`
4. Ensure TypeScript checks pass: `npm run type-check`
5. Run tests: `npm test`

### After Task Completion
1. Test all changes thoroughly
2. Commit with descriptive messages using conventional commits
3. Update documentation if needed
4. Mark todos as completed

## Current Features Status

### Completed Features (main branch - Development)
- ✅ Multi-role authentication system (Admin, Trainer, Customer)
- ✅ Health protocol generation system with AI integration
- ✅ Specialized protocols panel (Longevity Mode, Parasite Cleanse)
- ✅ Ailments-based protocol customization
- ✅ Recipe management system with AI-generated recipes
- ✅ Meal plan generation and assignment
- ✅ PDF export functionality with EvoFit branding
- ✅ Customer progress tracking (measurements, photos, goals)
- ✅ Customer invitation system
- ✅ Profile image upload system for all user roles
- ✅ Responsive design with shadcn/ui components
- ✅ Comprehensive testing suite (Unit, Integration, E2E)

### Health Protocol Feature System
- **Status**: ✅ **ACTIVE DEVELOPMENT**
- **Core Features**:
  - `HealthProtocolDashboard.tsx`: Main protocol management interface
  - `SpecializedProtocolsPanel.tsx`: Longevity & Parasite cleanse protocols
  - `TrainerHealthProtocols.tsx`: Trainer-specific protocol management
  - `ClientAilmentsSelector.tsx`: Ailment-based protocol customization
- **Database Tables**: `healthProtocols`, `protocolAssignments`, specialized protocol tables
- **API Endpoints**: 
  - GET/POST `/api/health-protocols`
  - GET/POST `/api/specialized-protocols`
  - Protocol generation and assignment endpoints

### Technology Integration Status
- **OpenAI GPT-4**: ✅ Integrated for recipe and protocol generation
- **AWS S3**: ✅ Configured for profile image storage
- **Email Service**: ✅ Nodemailer integration for customer invitations
- **PDF Generation**: ✅ Puppeteer-based with EJS templates
- **Database**: ✅ PostgreSQL with Drizzle ORM migrations

## Testing Guidelines
1. **Always test in Docker environment first**
2. Use comprehensive test suites:
   - Unit tests: `npm test -- test/unit/`
   - Integration tests: `npm test -- test/integration/`
   - E2E tests: `npm test -- test/e2e/`
   - GUI tests: `npm test -- test/gui/`
3. Check browser console for errors
4. Test all user roles (Admin, Trainer, Customer)
5. Verify responsive design on different screen sizes
6. Test health protocol generation workflows

## Common Issues & Solutions
- **Import errors**: Check Vite alias configuration in `vite.config.ts`
- **Database connection**: Ensure PostgreSQL container is running on port 5434
- **API errors**: Check server logs with `npm run logs`
- **Port conflicts**: Default ports are 3500 (app) and 5434 (database)
- **Health protocol generation fails**: Check OpenAI API key and service integration
- **PDF export issues**: Verify Puppeteer dependencies in Docker container

## Security Considerations
- Never commit `.env` files or sensitive configuration
- Use environment variables for sensitive data (JWT_SECRET, OpenAI API key, AWS credentials)
- Validate all user inputs, especially health protocol data
- Implement proper authentication checks for all role-based features
- Sanitize data before PDF generation and database storage
- Protect health-related user data with appropriate access controls

## Environment Configuration

### Required Environment Variables (.env)
```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-key

# OpenAI Integration (for protocol/recipe generation)
OPENAI_API_KEY=your-openai-api-key

# AWS S3 (for profile image storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name

# Email Service (for customer invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Deployment Strategy

### Development Deployment
- **Environment**: Docker-based development setup
- **URL**: http://localhost:3500
- **Database**: PostgreSQL in Docker container
- **File Storage**: Local storage for development

### Production Deployment (Future)
- **Platform**: TBD (DigitalOcean App Platform, AWS, or similar)
- **Database**: Managed PostgreSQL service
- **File Storage**: AWS S3 for production images
- **Domain**: TBD based on deployment strategy

### Pre-Deployment Checklist
1. **Testing**: Run complete test suite (`npm test`)
2. **Build Verification**: Ensure production build works (`npm run build`)
3. **Security Check**: Scan for exposed secrets or sensitive data
4. **Environment Variables**: Verify all production env vars are configured
5. **Database Migrations**: Ensure all migrations are applied

## Health Protocol Specific Features

### Core Health Protocol Components
- **HealthProtocolDashboard**: Main protocol management interface
- **SpecializedProtocolsPanel**: Longevity Mode and Parasite Cleanse protocols
- **ClientAilmentsSelector**: Ailment-based protocol customization
- **TrainerHealthProtocols**: Trainer workflow for protocol management

### AI Integration Features
- **Protocol Generation**: OpenAI-powered health protocol creation
- **Recipe Generation**: AI-generated recipes with nutritional analysis
- **Customization**: Ailment-based protocol personalization

### Testing Health Protocol Features
```bash
# Run health protocol specific tests
npm test -- test/unit/components/TrainerHealthProtocols.test.tsx
npm test -- test/integration/specializedProtocolsIntegrationTest.ts
npm test -- test/e2e/health-protocol-comprehensive-gui.spec.ts

# Manual testing workflow
# 1. Login as Trainer
# 2. Navigate to Health Protocols
# 3. Test protocol generation with different ailments
# 4. Verify PDF export functionality
# 5. Test customer assignment workflow
```

## MCP Integration
- **GitHub MCP**: Code repository management and collaboration
- **Context7 MCP**: Technical documentation access for health protocols
- **OpenAI MCP**: AI service integration for protocol generation

## Session Progress Tracking
- **Current Focus**: Health Protocol System Development
- **Active Features**: Specialized protocols, ailment-based customization, trainer workflows
- **Testing Status**: Comprehensive test suite with 90%+ coverage
- **Next Priorities**: Production deployment preparation, advanced protocol features

### Recent Achievements
- ✅ Health protocol generation system fully implemented
- ✅ Specialized protocols (Longevity, Parasite Cleanse) integrated
- ✅ Ailment-based protocol customization working
- ✅ Comprehensive testing infrastructure established
- ✅ Docker development environment optimized
- ✅ Multi-role authentication and authorization complete

## Best Practices & Advanced Strategies
- **Medina Strategy Reference**: See `Claude_Strategy.md` for comprehensive Claude Code best practices
- **Key Techniques for This Project**:
  - Use Context7 MCP for health protocol research and documentation
  - Implement PRP framework for new health protocol features
  - Leverage sub-agents for specialized tasks (UI, backend, testing, health protocols)
  - Use parallel development with git worktrees for A/B testing protocol features
  - Apply token optimization strategies to reduce costs during AI protocol generation
  - **Health Protocol Focus**: Deploy specialized agents for health protocol research and implementation

### Project-Specific Workflow Rules
1. "Always read README.md and API_DOCUMENTATION.md at start of health protocol sessions"
2. "Check test/README.md before implementing health protocol features"
3. "Add any new health protocol tasks to project tracking"
4. "Test health protocol generation with multiple ailment combinations"
5. "Verify PDF export works for all protocol types"
6. "Ensure proper role-based access for health protocol features"
7. "Document all health protocol API endpoints and business logic"

---

_Keep this file updated as the health protocol project evolves. Claude Code will re-read it on every session start to stay aligned with project needs._