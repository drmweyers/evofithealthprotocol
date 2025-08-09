# Health Protocol Management System

A standalone application for managing health protocols including Longevity, Parasite Cleanse, and Ailment-based protocols with PDF export capabilities.

## Features

- 🧬 **Longevity Protocol Generation** - Comprehensive longevity optimization plans
- 🦠 **Parasite Cleanse Protocols** - Detailed cleansing protocols
- 🏥 **Ailment-based Protocols** - Targeted protocols for specific health conditions
- 📄 **PDF Export** - Professional PDF reports for all protocols
- 👥 **Multi-role Support** - Admin and Trainer roles
- 🔐 **Secure Authentication** - JWT-based auth system
- 📊 **Protocol Management** - Create, edit, save, and assign protocols

## Quick Start

### Prerequisites

- Docker Desktop installed and running
- Node.js 18+ (for local development)
- Git

### Installation

1. **Navigate to the HealthProtocol folder:**
   ```bash
   cd HealthProtocol
   ```

2. **Run the setup script:**
   ```bash
   # Windows
   SETUP_HEALTHPROTOCOL.bat
   
   # Or manually:
   docker-compose --profile dev up -d
   ```

3. **Access the application:**
   - URL: http://localhost:4001
   - Default credentials:
     - Email: `trainer.test@evofitmeals.com`
     - Password: `TestTrainer123!`

## Project Structure

```
HealthProtocol/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── TrainerHealthProtocols.tsx
│   │   │   ├── SpecializedProtocolsPanel.tsx
│   │   │   └── HealthProtocolDashboard.tsx
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   └── utils/        # Utilities (including PDF export)
├── server/               # Express backend
│   ├── routes/          # API routes
│   │   ├── authRoutes.ts
│   │   ├── trainerRoutes.ts
│   │   └── pdfRoutes.ts
│   ├── db/              # Database schema
│   └── index.ts         # Server entry point
├── docker-compose.yml   # Docker configuration
└── package.json         # Dependencies

```

## Development

### Commands

```bash
# Start development environment
docker-compose --profile dev up -d

# Stop development environment
docker-compose --profile dev down

# View logs
docker logs healthprotocol-dev -f

# Database migrations
npm run db:push
npm run db:migrate

# Build for production
npm run build
```

### Environment Variables

Create `.env.development` for local development:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/healthprotocol_db
PORT=4001
NODE_ENV=development
VITE_API_URL=http://localhost:4001/api
JWT_SECRET=your-secret-key
PDF_EXPORT_ENABLED=true
```

### Ports

- **Application**: 4001
- **PostgreSQL**: 5434
- **Vite HMR**: 24679

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Health Protocols
- `GET /api/trainer/health-protocols` - Get all protocols
- `POST /api/trainer/health-protocols` - Create new protocol
- `PUT /api/trainer/health-protocols/:id` - Update protocol
- `DELETE /api/trainer/health-protocols/:id` - Delete protocol
- `POST /api/trainer/generate-longevity-protocol` - Generate longevity protocol
- `POST /api/trainer/generate-parasite-protocol` - Generate parasite cleanse
- `POST /api/trainer/generate-ailment-protocol` - Generate ailment-based protocol

### PDF Export
- `POST /api/pdf/export-protocol/:id` - Export protocol as PDF
- `GET /api/pdf/download/:filename` - Download PDF file

## Database Schema

### Core Tables
- `users` - User accounts and authentication
- `trainerHealthProtocols` - Protocol configurations
- `protocolAssignments` - Protocol-to-customer assignments
- `sessions` - Active user sessions
- `activityLogs` - System activity tracking

## Docker Configuration

The app uses Docker Compose with two profiles:
- `dev` - Development environment with hot reload
- `prod` - Production build

### Container Names
- `healthprotocol-dev` - Development app container
- `healthprotocol-postgres` - PostgreSQL database
- `healthprotocol-prod` - Production app container

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 4001 and 5434 are available
2. **Docker not running**: Start Docker Desktop first
3. **Database connection errors**: Check PostgreSQL container is healthy
4. **Build errors**: Clear node_modules and reinstall

### Reset Everything

```bash
# Stop containers
docker-compose down -v

# Remove volumes
docker volume rm healthprotocol_postgres-data

# Rebuild
docker-compose --profile dev up -d --build
```

## Production Deployment

1. Update `.env.production` with real values
2. Build production image:
   ```bash
   docker build --target prod -t healthprotocol:prod .
   ```
3. Deploy using your preferred platform (DigitalOcean, AWS, etc.)

## Security Notes

- Change default JWT secret in production
- Use environment variables for sensitive data
- Enable HTTPS in production
- Regularly update dependencies
- Implement rate limiting for API endpoints

## License

Private - EvoFit Health Solutions

## Support

For issues or questions, contact the development team.