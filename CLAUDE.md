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
  - Use Serena MCP for semantic code search in this large codebase
  - Implement PRP framework for new feature development
  - Leverage sub-agents for specialized tasks (UI, backend, testing)
  - Use parallel development with git worktrees for A/B testing features
  - Apply token optimization strategies to reduce costs
  - **Multi-agent approach**: Deploy specialized agents for complex health protocol workflows

## Claude Code Router Configuration

### Overview
Claude Code Router is configured to use native Claude models by default, with the ability to switch to alternative models (Qwen) when credits are exhausted.

### Running Claude Code

#### Option 1: Use Native Claude Models (Default)
```powershell
cd C:\Users\drmwe\claude-workspace\HealthProtocol
claude code
```
This uses your Anthropic account directly until credits are exhausted.

#### Option 2: Use with Router Proxy
```powershell
cd C:\Users\drmwe\claude-workspace\HealthProtocol
claude code --api-proxy http://127.0.0.1:8080
```
This routes through the proxy but still uses native Claude by default.

### Switching to Alternative Models

#### When Claude Credits Run Out
Switch to Qwen models using the `/model` command within Claude Code:

**Available Qwen Models:**
- `/model openrouter-qwen,qwen/qwen-2.5-72b-instruct` - General purpose (recommended)
- `/model openrouter-qwen,qwen/qwen-2.5-coder-32b-instruct` - Optimized for coding
- `/model openrouter-qwen,qwen/qwq-32b-preview` - Best for reasoning tasks
- `/model openrouter-qwen,qwen/qwen-2-vl-72b-instruct` - Vision-language model

**Other Available Models via OpenRouter:**
- `/model openrouter,google/gemini-2.5-pro-preview` - Gemini Pro
- `/model openrouter,anthropic/claude-3.5-sonnet` - Claude via OpenRouter
- `/model openrouter,deepseek/deepseek-chat` - DeepSeek

### Quick Alias for PowerShell
Add to your PowerShell profile for quick access:
```powershell
function claude-qwen {
    claude code --api-proxy http://127.0.0.1:8080 --model openrouter-qwen,qwen/qwen-2.5-72b-instruct
}
```

### Router Service Management

#### Check Router Status
```powershell
Get-Process | Where-Object {$_.CommandLine -like "*claude-code-router*"}
```

#### Restart Router Service
```powershell
# Stop existing service
Get-Process | Where-Object {$_.CommandLine -like "*claude-code-router*"} | Stop-Process -Force

# Start service
Start-Process node -ArgumentList "C:\Users\drmwe\AppData\Roaming\npm\node_modules\@musistudio\claude-code-router\dist\cli.js", "start" -NoNewWindow
```

### Configuration Location
- Router config: `~/.claude-code-router/config.json`
- Logs: `~/.claude-code-router/claude-code-router.log`

### Best Practices
1. Use native Claude models for complex tasks requiring latest capabilities
2. Switch to Qwen models for routine coding tasks or when credits are low
3. Use `qwen/qwen-2.5-coder-32b-instruct` for coding-specific tasks
4. Use `qwen/qwq-32b-preview` for complex reasoning tasks
5. Monitor usage to optimize between cost and performance

### Quick Model Change Commands

**IMPORTANT**: First ensure Claude Code is running with the router:
```powershell
cd C:\Users\drmwe\claude-workspace\HealthProtocol
claude code --api-proxy http://127.0.0.1:8080
```

Then use these commands within Claude Code:

#### When you say "change to qwen3":
```
/model openrouter,qwen/qwen3-coder:free
```

#### Other Quick Commands:
- **"change to qwen coder"**: `/model openrouter-qwen,qwen/qwen-2.5-coder-32b-instruct`
- **"change to qwen general"**: `/model openrouter-qwen,qwen/qwen-2.5-72b-instruct`
- **"change to qwen reasoning"**: `/model openrouter-qwen,qwen/qwq-32b-preview`
- **"change to local qwen"**: `/model ollama,qwen2.5-coder:latest`
- **"change to gemini"**: `/model openrouter,google/gemini-2.5-pro-preview`
- **"change to deepseek"**: `/model openrouter,deepseek/deepseek-chat`

### Project-Specific Workflow Rules
1. "Always read README.md and API_DOCUMENTATION.md at start of health protocol sessions"
2. "Check test/README.md before implementing health protocol features"
3. "Add any new health protocol tasks to project tracking"
4. "Test health protocol generation with multiple ailment combinations"
5. "Verify PDF export works for all protocol types"
6. "Ensure proper role-based access for health protocol features"
7. "Document all health protocol API endpoints and business logic"

## 📋 PROJECT DOCUMENTATION FRAMEWORK

### Document Hierarchy and Purpose
The project follows a comprehensive documentation structure for maximum clarity:

#### Core Documents
- **PRD.md**: Complete Product Requirements Document with vision, goals, features, and success metrics
- **planning.md**: Technical architecture, roadmap, quality strategy, and deployment plans
- **tasks.md**: Actionable development tasks with priorities, estimates, and dependencies
- **CLAUDE.md**: Development guidelines and session management (this file)
- **README.md**: Quick start guide and project overview

#### Documentation Workflow
1. **PRD drives planning**: Feature requirements inform technical architecture
2. **Planning drives tasks**: Architecture and roadmap create actionable tasks
3. **Tasks drive development**: Clear priorities guide daily work
4. **CLAUDE.md tracks progress**: Session updates and workflow guidance

### Multi-Agent Documentation Coordination
- **Product Manager Agent**: Maintains and updates PRD.md
- **Technical Architect Agent**: Manages planning.md and architecture decisions
- **Project Manager Agent**: Coordinates tasks.md and sprint planning
- **CTO Agent**: Oversees CLAUDE.md and strategic direction

## 🤖 MULTI-AGENT ORCHESTRATION FRAMEWORK

### Agent Team Structure
The project utilizes specialized autonomous agents for comprehensive development:

#### Core Development Agents
- **CTO Project Manager**: Strategic oversight, planning, and team coordination
- **Full Stack Developer**: Frontend and backend development
- **DevOps Engineer**: Infrastructure, deployment, and CI/CD
- **Security Scanner**: Security audits and compliance validation
- **QA Testing Agent**: Quality assurance and test automation

#### Agent Coordination Protocol
1. **Shared State Management**: All agents reference common documentation
2. **Task Delegation**: CTO agent assigns work based on agent specialization
3. **Status Updates**: Regular updates to tasks.md and session summaries
4. **Conflict Resolution**: CTO agent mediates technical decisions
5. **Quality Gates**: Security and QA agents validate all deliverables

### Agent Communication Channels
- **Primary**: Shared markdown files (PRD, planning, tasks)
- **Secondary**: Git commits and pull requests
- **Coordination**: CLAUDE.md session summaries
- **Status**: Real-time task status updates

## 🚀 ENHANCED DEVELOPMENT WORKFLOW

### Multi-Agent Development Cycle
1. **Planning Phase**: CTO and Technical Architect agents define roadmap
2. **Development Phase**: Full Stack and specialized agents implement features
3. **Quality Phase**: QA and Security agents validate deliverables
4. **Deployment Phase**: DevOps agent manages production releases
5. **Monitoring Phase**: All agents monitor and optimize performance

### Advanced Git Workflow with Agents
```bash
# Agent-coordinated feature development
git checkout main
git pull origin main

# CTO agent creates feature branches for agent teams
git checkout -b feature/health-protocols-enhancement
git checkout -b feature/security-hardening
git checkout -b feature/performance-optimization

# Agents work in parallel with coordination
# DevOps agent manages CI/CD for all branches
# Security agent validates all PRs
# QA agent ensures test coverage
```

### Automated Quality Gates
- **Pre-commit**: Automated linting, type checking, security scanning
- **Pre-push**: Unit test execution, dependency auditing
- **PR Creation**: Automated code review, test coverage validation
- **Pre-deployment**: Security audit, performance benchmarking, backup verification

## 📊 PROJECT METRICS AND SUCCESS TRACKING

### Development Metrics (Updated by agents)
- **Code Quality**: Test coverage, linting score, security rating
- **Performance**: API response times, database query optimization, bundle size
- **User Experience**: Page load times, accessibility scores, mobile responsiveness
- **Security**: Vulnerability count, compliance score, audit results

### Business Metrics (Tracked in PRD.md)
- **User Engagement**: Active users, feature adoption, session duration
- **Protocol Effectiveness**: Health outcome improvements, user satisfaction
- **System Reliability**: Uptime, error rates, performance stability
- **Growth Metrics**: New user acquisition, retention rates, revenue growth

### Agent Performance Metrics
- **Task Completion Rate**: Percentage of tasks completed on time
- **Quality Score**: Code review scores, bug rates, test coverage
- **Coordination Efficiency**: Time to resolution, communication effectiveness
- **Innovation Index**: New feature development, optimization improvements

## 🔄 CONTINUOUS IMPROVEMENT PROCESS

### Weekly Agent Reviews
1. **Monday**: Sprint planning with CTO and Project Manager agents
2. **Wednesday**: Mid-sprint check-in and blocker resolution
3. **Friday**: Sprint review and retrospective with all agents
4. **Daily**: Stand-up coordination through task status updates

### Monthly Strategic Reviews
- **Technical Debt Assessment**: Code quality improvements needed
- **Performance Optimization**: System performance enhancement opportunities  
- **Security Posture Review**: Security improvements and compliance updates
- **Agent Effectiveness Analysis**: Team coordination and productivity improvements

### Documentation Maintenance Schedule
- **Weekly**: Update tasks.md with completed and new tasks
- **Bi-weekly**: Review and update planning.md with technical changes
- **Monthly**: Update PRD.md with feature changes and market feedback
- **Per-session**: Update CLAUDE.md with progress and insights

## 🎯 IMMEDIATE NEXT STEPS (Agent Coordination)

### Current Sprint Priorities (coordinated by agents)
1. **Critical**: Test framework stabilization (QA Agent lead)
2. **High**: Production deployment validation (DevOps Agent lead)  
3. **High**: Email domain verification (Full Stack Developer lead)
4. **Medium**: Mobile UI enhancements (Frontend Developer lead)
5. **Medium**: API performance optimization (Backend Developer lead)

### Agent Assignment Matrix
| Priority | Task | Lead Agent | Support Agents | Timeline |
|----------|------|------------|----------------|-----------|
| Critical | Test Stabilization | QA Agent | Full Stack Dev | 3 days |
| High | Deployment Validation | DevOps Agent | Security Scanner | 5 days |
| High | Email Verification | Full Stack Dev | DevOps Agent | 2 days |
| Medium | Mobile UI | Frontend Agent | QA Agent | 1 week |
| Medium | API Optimization | Backend Agent | DevOps Agent | 1 week |

## 🚀 BMAD METHOD™ INTEGRATION

### What is BMAD METHOD™?

BMAD (Breakthrough Method of Agile AI-Driven Development) is a revolutionary framework that transforms how AI agents collaborate on software development projects. Installed at `C:\Users\drmwe\claude-workspace\HealthProtocol\BMAD`, it provides:

#### Core Innovation: Two-Phase Development

**Phase 1: Agentic Planning** 🎯
- **Dedicated Planning Agents**: Analyst, Product Manager, and Architect agents collaborate to create comprehensive documentation
- **Human-in-the-Loop**: You guide and refine the planning process, ensuring alignment with business goals
- **Output**: Detailed PRD (Product Requirements Document) and Architecture documents that serve as the single source of truth

**Phase 2: Context-Engineered Development** 💻
- **Scrum Master Agent**: Transforms plans into hyper-detailed story files with full implementation context
- **Developer Agent**: Receives complete context in each story - no more "what should I build?" confusion
- **QA Agent**: Validates implementation against original requirements with full context awareness

### Why BMAD Matters for HealthProtocol

#### Traditional AI Development Problems ❌
1. **Context Loss**: AI forgets what it's building between sessions
2. **Inconsistent Planning**: Each session interprets requirements differently
3. **Shallow Implementation**: AI generates generic code without understanding the bigger picture
4. **Quality Issues**: No systematic validation against requirements

#### BMAD Solutions ✅
1. **Persistent Context**: All agents reference the same PRD and Architecture documents
2. **Consistent Vision**: Planning phase creates authoritative documentation
3. **Deep Implementation**: Story files contain complete context, architectural decisions, and implementation details
4. **Built-in Quality**: QA agent validates against original requirements, not assumptions

### BMAD Workflow for HealthProtocol

#### Step 1: Planning Phase (Web UI or IDE)
```
1. Start with Analyst Agent:
   /analyst
   "I need to enhance the health protocol system with AI-powered recommendations"

2. Analyst creates a Project Brief → PM Agent refines into PRD
3. Architect Agent designs technical architecture
4. Human reviews and refines all documents
```

#### Step 2: Development Phase (IDE)
```
1. Scrum Master shards documents into manageable pieces:
   /sm
   "Shard the health protocol PRD and architecture"

2. Scrum Master creates detailed story files:
   /create-next-story
   Creates story with full context, acceptance criteria, technical details

3. Developer implements the story:
   /dev
   "Implement the current story"

4. QA validates implementation:
   /qa
   "Validate the implementation against requirements"
```

### BMAD Agents Available in HealthProtocol

#### Core Agile Team
- `/analyst` - Requirements gathering and analysis
- `/pm` - Product management and PRD creation
- `/architect` - System design and technical architecture
- `/sm` - Scrum master for story creation and sprint management
- `/dev` - Development implementation
- `/qa` - Quality assurance and testing
- `/po` - Product owner for business decisions

#### Specialized Agents
- `/ux-expert` - User experience design
- `/bmad-orchestrator` - Coordinates between all agents
- `/bmad-master` - Advanced BMAD methodology guidance

#### Health Domain Expansion Packs
BMAD can be extended with domain-specific agents:
- **Healthcare Pack**: Medical protocol validation, HIPAA compliance
- **Fitness Pack**: Exercise science, nutrition planning
- **Wellness Pack**: Holistic health approaches, lifestyle coaching

### Practical BMAD Commands for HealthProtocol

#### Starting a New Feature
```bash
# 1. Create comprehensive documentation
/analyst
"Analyze requirements for automated health assessment feature"

# 2. After PRD is created, shard for implementation
/sm
/shard-doc --file=health-assessment-prd.md

# 3. Create first implementation story
/create-next-story
```

#### Daily Development Flow
```bash
# Morning: Check current story
/sm
"What's the current story status?"

# Development: Implement with full context
/dev
"Implement the current story following all requirements"

# Testing: Validate against requirements
/qa
"Run comprehensive tests for the implemented feature"

# Completion: Mark story done and get next
/sm
"Mark current story complete and create next story"
```

### BMAD Best Practices for HealthProtocol

1. **Always Start with Planning**: Don't skip to development - let planning agents create comprehensive docs first
2. **Trust the Process**: Let each agent do their specialized job - don't try to make one agent do everything
3. **Maintain Context**: Keep PRD and Architecture as living documents that all agents reference
4. **Use Story Files**: They're not just task lists - they contain complete implementation context
5. **Iterate with QA**: QA agent catches requirement mismatches early

### Integration with Existing HealthProtocol Workflow

BMAD complements your existing development process:
- **PRD.md**: Now maintained by BMAD PM agent with consistent structure
- **planning.md**: Architecture agent keeps technical decisions documented
- **tasks.md**: Generated from BMAD story files with full context
- **Git Workflow**: BMAD agents understand and follow your branching strategy
- **Docker Environment**: Agents test in your containerized setup
- **Testing Suite**: QA agent leverages your existing test infrastructure

### ROI and Benefits for HealthProtocol

#### Immediate Benefits
- **Reduced Context Switching**: Developers get complete context in story files
- **Fewer Misunderstandings**: Clear requirements from planning phase
- **Faster Development**: No time wasted figuring out "what to build"
- **Higher Quality**: QA validation against original requirements

#### Long-term Benefits
- **Scalable Process**: Add more agents as team grows
- **Knowledge Preservation**: All decisions documented in PRD/Architecture
- **Consistent Velocity**: Predictable story completion with full context
- **Reduced Technical Debt**: Architectural decisions made upfront

### Getting Started with BMAD in HealthProtocol

1. **Explore Existing Agents**:
   ```
   Type / in Claude to see all available BMAD commands
   ```

2. **Try a Simple Planning Session**:
   ```
   /analyst
   "Help me plan the next health protocol feature"
   ```

3. **Review Generated Documents**:
   - Check `.bmad-core/` for agent templates and documentation
   - Explore `.claude/commands/` for available agent commands

4. **Start Your First BMAD Sprint**:
   ```
   /sm
   "Initialize a new sprint for health protocol enhancements"
   ```

### BMAD Installation Details

**Location**: `C:\Users\drmwe\claude-workspace\HealthProtocol\BMAD`

**Installed Components**:
- ✅ Core BMAD framework with all agents
- ✅ Infrastructure DevOps expansion pack
- ✅ Creative Writing expansion pack (can inspire health content)
- ✅ Game Development packs (demonstrates BMAD versatility)
- ✅ Claude Code integration with shortcuts

**Key Directories**:
- `.bmad-core/` - Core agents and workflows
- `.claude/commands/` - Claude Code command shortcuts
- `web-bundles/` - Standalone versions for web AI platforms
- `docs/` - BMAD documentation and guides
- `stories/` - BMAD story files for development workflow

### Current BMAD Development Status

**Active Story**: STORY-001 - Test Framework Stabilization
- Location: `stories/current/STORY-001-test-framework-stabilization.md`
- Status: Ready for implementation
- Developer Action: Use `/dev` to start implementation

**Story Tracking**: `stories/STORY_TRACKING.md`
- Sprint progress and velocity metrics
- Story workflow documentation
- Quick command reference

**Workflow Integration**:
1. ✅ PRD.md - Product vision and requirements
2. ✅ planning.md - Technical architecture (BMAD enhanced)
3. ✅ Tasks.md - Source for story creation
4. ✅ stories/ - BMAD story-driven development

### Quick Start Commands for Today

```bash
# Check current story
/dev
"What's my current story?"

# Get implementation help
/dev
"Help me implement the test framework consolidation"

# When ready for QA
/qa
"Validate the test framework implementation"

# Check sprint status
/sm
"Show current sprint progress"
```

---

_Keep this file updated as the health protocol project evolves. Claude Code will re-read it on every session start to stay aligned with project needs._
