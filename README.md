# EvoFitHealthProtocol

A comprehensive health protocol management application for fitness professionals and their clients, featuring recipe management, meal plan generation, PDF exports, customer progress tracking, and multi-role support.

## 🎯 Features Overview

### For Fitness Professionals (Trainers/Admins)
- **Recipe Management**: Create, edit, and approve recipes with AI assistance
- **Meal Plan Generation**: AI-powered meal plan creation with nutritional analysis
- **Client Management**: Assign meal plans to customers and track their progress
- **PDF Export**: Generate professional meal plan documents with EvoFit branding
- **Progress Monitoring**: View client measurements, goals, and progress photos

### For Customers
- **Personalized Meal Plans**: Access trainer-assigned meal plans tailored to your goals
- **Progress Tracking**: Log body measurements, set fitness goals, and upload progress photos
- **Recipe Access**: Browse and view detailed recipes with nutritional information
- **PDF Downloads**: Export your meal plans as professional PDF documents
- **Goal Management**: Set, track, and achieve fitness goals with progress visualization

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd EvoFitHealthProtocol

# 2. Copy environment variables
cp .env.example .env

# 3. Check your setup
npm run setup:check

# 4. Start the development environment
npm run docker:dev

# 5. Access the application
# Frontend: http://localhost:3500
# API: http://localhost:3500/api
```

## Running the Project with Docker

This project uses Docker for consistent development and production environments. We provide separate profiles for development and production use.

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0 or higher
- Node.js 18+ (for running setup scripts)

### Quick Start - Development Environment

1. **Ensure Docker is running:**
   ```sh
   docker ps
   ```

2. **Start the development environment:**
   ```sh
   docker-compose --profile dev up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3500
   - Backend API: http://localhost:3500/api
   - PostgreSQL: localhost:5434

### Development Environment Details

The development setup includes:
- **PostgreSQL Database**: Automatically configured with the app
- **Hot Module Replacement**: Changes to code are reflected immediately
- **Volume Mounts**: Your local code is mounted into the container
- **Automatic DB Migration**: Database schema is automatically updated on startup

### Service Ports
- **Development:**
  - Combined Frontend/Backend: Port **3500**
  - PostgreSQL Database: Port **5434**
  - HMR WebSocket: Port **24679**
- **Production:**
  - Application: Port **3500**
  - PostgreSQL: Port **5434**

### Common Docker Commands

```sh
# Start development environment
docker-compose --profile dev up -d

# Stop development environment
docker-compose --profile dev down

# View logs
docker logs evofithealthprotocol-dev -f

# Restart containers
docker-compose --profile dev restart

# Rebuild after dependency changes
docker-compose --profile dev up -d --build

# Start production environment
docker-compose --profile prod up -d
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secret-key-here

# Optional: Email configuration for invitations
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Troubleshooting

**Issue: Import errors (@shared alias not found)**
- Solution: The vite.config.ts is already configured with proper aliases. If you encounter this issue, restart the Docker container.

**Issue: Cannot connect to database**
- Solution: Ensure the PostgreSQL container is running and healthy:
  ```sh
  docker ps | grep postgres
  ```

**Issue: Port already in use**
- Solution: Check if another service is using port 3500 or 5434:
  ```sh
  # Windows
  netstat -ano | findstr :3500
  # Linux/Mac
  lsof -i :3500
  ```

**Issue: Changes not reflecting**
- Solution: The development environment uses volume mounts. If changes aren't reflecting, restart the container:
  ```sh
  docker-compose --profile dev restart
  ```

### Development Workflow

1. **Always start Docker first** before beginning development
2. **Check container health** with `docker ps`
3. **Monitor logs** with `docker logs evofithealthprotocol-dev -f`
4. **Access the app** at http://localhost:3500

For production deployment, refer to `DEPLOYMENT_GUIDE.md`.

## 🏗️ Architecture Overview

### Database Schema
- **Users**: Multi-role support (Admin, Trainer, Customer)
- **Recipes**: AI-generated recipes with nutritional data
- **Meal Plans**: Structured meal planning with customer assignments
- **Progress Tracking**: Customer measurements, goals, and photos
- **Migrations**: Version-controlled database schema changes

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL with comprehensive indexing
- **Authentication**: JWT-based with Google OAuth support
- **AI Integration**: OpenAI GPT-4 for recipe generation
- **File Storage**: AWS S3 for progress photos
- **Testing**: Vitest + Puppeteer for comprehensive testing
- **Containerization**: Docker for consistent development environments

## 📁 Project Structure

```
EvoFitHealthProtocol/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── progress/      # Progress tracking components
│   │   │   └── *.tsx          # Feature-specific components
│   │   ├── pages/             # Main application pages
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── types/             # TypeScript type definitions
├── server/                     # Express.js Backend
│   ├── routes/                # API route handlers
│   ├── controllers/           # Business logic controllers
│   ├── middleware/            # Express middleware functions
│   ├── services/              # External service integrations
│   ├── utils/                 # Backend utility functions
│   └── views/                 # EJS templates for PDFs
├── shared/                     # Shared code between client/server
│   └── schema.ts              # Database schema & validation
├── migrations/                 # Database migration files
├── test/                      # Comprehensive test suite
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── gui/                   # GUI/E2E tests
└── docs/                      # Documentation files
```

## 🧪 Testing

The application includes a comprehensive test suite:

### Unit Tests
```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- test/unit/progressTrackingSimple.test.ts

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run GUI integration tests (requires Docker)
npm test -- test/integration/progressTrackingGUI.test.ts
```

### Test Coverage
- ✅ Backend API endpoints with authentication
- ✅ Frontend component logic and user interactions  
- ✅ Database operations and business logic
- ✅ End-to-end user workflows with Puppeteer

## 📚 Documentation

For detailed information, refer to these guides:

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Comprehensive development guide
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md)** - React component documentation
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[CLAUDE.md](./CLAUDE.md)** - CCA-CTO development workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `npm test`
5. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- TypeScript for type safety
- ESLint + Prettier for consistent formatting
- Comprehensive JSDoc comments for functions
- Meaningful variable and function names
- Test-driven development approach

For production deployment, refer to `DEPLOYMENT_GUIDE.md`.
