# HealthProtocol App Deployment & Verification Guide

## 🚨 CRITICAL: The app runs on port 3501, NOT 3500!

Access URL: **http://localhost:3501**

## Quick Start Commands

### 1. Start the Application
```bash
# Always use this command to start the app
docker-compose --profile dev up -d

# Or use the npm shortcut
npm run dev
```

### 2. Verify App is Working
```powershell
# Run the verification script (Windows PowerShell)
./scripts/verify-app.ps1

# Or for bash/WSL
bash ./scripts/verify-app.sh
```

### 3. Stop the Application
```bash
docker-compose --profile dev down
# Or
npm run stop
```

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| **Frontend + Backend** | 3501 | http://localhost:3501 |
| **API Endpoints** | 3501 | http://localhost:3501/api |
| **PostgreSQL Database** | 5434 | postgresql://localhost:5434/evofithealthprotocol_db |
| **HMR WebSocket** | 24679 | ws://localhost:24679 |

## Workflow After Making Code Changes

### Step 1: Check Container Status
```bash
docker ps | grep healthprotocol
```

### Step 2: Restart Containers if Needed
```bash
# If containers are running but app not responding
docker-compose --profile dev restart

# If containers are stopped
docker-compose --profile dev up -d

# If you need a clean rebuild (after dependency changes)
docker-compose --profile dev up -d --build
```

### Step 3: Verify App is Working
```powershell
# Quick check
curl http://localhost:3501

# Full verification
./scripts/verify-app.ps1
```

### Step 4: Check Logs if Issues
```bash
# View application logs
docker logs evofithealthprotocol-dev -f

# View last 50 lines
docker logs evofithealthprotocol-dev --tail 50

# Or use npm shortcut
npm run logs
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin.test@evofitmeals.com | TestAdmin123! |
| Trainer | trainer.test@evofitmeals.com | TestTrainer123! |
| Customer | customer.test@evofitmeals.com | TestCustomer123! |

## Common Issues & Solutions

### Issue: App not responding on localhost:3501
```bash
# Solution 1: Restart containers
docker-compose --profile dev restart

# Solution 2: Rebuild if code changes aren't reflected
docker-compose --profile dev down
docker-compose --profile dev up -d --build

# Solution 3: Check if port is already in use
netstat -an | findstr :3501
```

### Issue: Database connection errors
```bash
# Check database is healthy
docker inspect evofithealthprotocol-postgres --format='{{.State.Health.Status}}'

# Restart database
docker restart evofithealthprotocol-postgres
```

### Issue: Authentication errors in logs
```bash
# This usually means frontend is making requests without proper tokens
# Clear browser cache and cookies, then try logging in again
```

## NPM Scripts for Development

```json
{
  "dev": "docker-compose --profile dev up -d",
  "stop": "docker-compose --profile dev down",
  "restart": "docker-compose --profile dev restart",
  "rebuild": "docker-compose --profile dev up -d --build",
  "logs": "docker logs evofithealthprotocol-dev -f",
  "verify": "powershell -File scripts/verify-app.ps1"
}
```

## Docker Commands Reference

### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start specific container
docker start evofithealthprotocol-dev

# Stop specific container
docker stop evofithealthprotocol-dev

# Remove container
docker rm evofithealthprotocol-dev

# Remove all stopped containers
docker container prune
```

### Troubleshooting
```bash
# View container details
docker inspect evofithealthprotocol-dev

# Check container resource usage
docker stats evofithealthprotocol-dev

# Execute command in container
docker exec -it evofithealthprotocol-dev sh

# Check network
docker network ls
docker network inspect healthprotocol_default
```

## Automated Verification Scripts

Two verification scripts are provided:

1. **PowerShell** (`scripts/verify-app.ps1`) - For Windows
2. **Bash** (`scripts/verify-app.sh`) - For Linux/Mac/WSL

These scripts automatically:
- Check Docker status
- Verify containers are running
- Test HTTP connectivity
- Display access URLs and credentials
- Show recent activity logs

## Best Practices

1. **Always verify after changes**: Run `./scripts/verify-app.ps1` after making code changes
2. **Check logs for errors**: Use `npm run logs` to monitor for issues
3. **Use the correct port**: Remember the app is on **3501**, not 3500
4. **Restart when in doubt**: `docker-compose --profile dev restart` fixes most issues
5. **Clean rebuild for major changes**: Use `--build` flag after dependency updates

## Integration with Development Workflow

### Before Making Changes
1. Ensure Docker is running
2. Start the dev environment: `npm run dev`
3. Verify app is working: `./scripts/verify-app.ps1`

### After Making Changes
1. If frontend changes only: Changes hot-reload automatically
2. If backend changes: `docker-compose --profile dev restart`
3. If dependency changes: `docker-compose --profile dev up -d --build`
4. Always verify: `./scripts/verify-app.ps1`

### Before Committing Code
1. Ensure app runs without errors
2. Run tests: `npm test`
3. Check types: `npm run type-check`
4. Lint code: `npm run lint`

## Environment Variables

The app uses `.env.development` for local development. Key variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/evofithealthprotocol_db

# JWT Secret
JWT_SECRET=your-jwt-secret-here

# Server Port (internal to container)
PORT=3501

# Client URL
VITE_API_URL=http://localhost:3501
```

## Summary

✅ **App URL**: http://localhost:3501 (NOT 3500!)
✅ **Start Command**: `docker-compose --profile dev up -d`
✅ **Verify Command**: `./scripts/verify-app.ps1`
✅ **Logs Command**: `docker logs evofithealthprotocol-dev -f`
✅ **Stop Command**: `docker-compose --profile dev down`

This guide ensures consistent app deployment and verification across all development sessions.