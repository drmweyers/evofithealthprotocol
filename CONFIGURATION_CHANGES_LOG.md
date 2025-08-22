# Configuration Changes Log: HealthProtocol → EvoFitHealthProtocol

## Overview
This document tracks all changes made to rename the application from "HealthProtocol" to "EvoFitHealthProtocol" and change the development port from 4000/4001 to 3500.

## Change Summary

### Application Renaming
- **Old Name**: health-protocol-app / HealthProtocol
- **New Name**: evofithealthprotocol / EvoFitHealthProtocol
- **Scope**: Package names, container names, documentation, and branding

### Port Configuration
- **Old Development Port**: 4000 (frontend) / 4001 (combined)
- **New Development Port**: 3500
- **Database Port**: 5434 (unchanged)
- **HMR WebSocket**: 24679 (updated from 24678)

## Files Modified

### 1. Package Configuration
- [x] `package.json` - Root package rename and script updates
- [x] `client/package.json` - Client package rename and dev port change
- [x] `docker-compose.yml` - Port mappings and container names
- [x] `Dockerfile` - Container configuration updated

### 2. Documentation
- [x] `README.md` - Port references and branding updates
- [x] `client/index.html` - Page title update
- [x] API documentation files - Port reference updates

### 3. Configuration Files
- [x] Environment files - Port and app name updates
- [x] Development scripts - Container name references
- [x] Test configuration - Port and URL updates
- [x] `vite.config.ts` - Development server port and proxy
- [x] `playwright.config.ts` - Test base URL configuration

### 4. Source Code
- [x] Hardcoded port references in source files
- [x] API endpoint URLs (server/index.ts, authRoutes.ts, invitationRoutes.ts)
- [x] Development server configurations
- [x] Test scripts (run-business-logic-tests.sh/bat)
- [x] Integration test files

## Detailed Changes

### Docker Configuration Changes
```yaml
# OLD docker-compose.yml
services:
  app-dev:
    container_name: healthprotocol-dev
    ports:
      - "4001:4001"
      - "24678:24678"
    environment:
      PORT: 4001

# NEW docker-compose.yml
services:
  app-dev:
    container_name: evofithealthprotocol-dev
    ports:
      - "3500:3500"
      - "24679:24678"
    environment:
      PORT: 3500
```

### Package.json Changes
```json
// OLD package.json
{
  "name": "health-protocol-app",
  "scripts": {
    "logs": "docker logs healthprotocol-dev -f"
  }
}

// NEW package.json
{
  "name": "evofithealthprotocol",
  "scripts": {
    "logs": "docker logs evofithealthprotocol-dev -f"
  }
}
```

### README.md Changes
```markdown
<!-- OLD README.md -->
# Frontend: http://localhost:4000
# Backend API: http://localhost:4000/api

<!-- NEW README.md -->
# Frontend: http://localhost:3500
# Backend API: http://localhost:3500/api
```

## Verification Checklist
- [x] Application starts successfully on port 3500
- [x] Docker containers use new names
- [x] All documentation reflects new port
- [x] Main references to old container names updated
- [x] Database connections work with new configuration
- [x] Critical scripts reference correct container names

## Known Remaining References
Note: Some documentation files in `/archived_docs/` and `/test/gui/reports/` still contain old container name references. These are archived/report files and don't affect the application functionality.

## Rollback Instructions
If rollback is needed:
1. Revert all files to original state
2. Change ports back to 4000/4001
3. Restore original container names
4. Update documentation back to original values

## Post-Configuration Notes
- Development server accessible at: http://localhost:3500
- Container name: evofithealthprotocol-dev
- Database remains on port 5434 (PostgreSQL internal port 5432)
- All environment variables updated accordingly

---
*Configuration completed on: 2025-08-21*
*Modified by: Configuration Agent*

## Summary of Changes Made

### Key Configuration Updates:
1. **Application renamed** from `health-protocol-app` to `evofithealthprotocol`
2. **Development port changed** from 4000/4001 to 3500
3. **Container names updated**:
   - `healthprotocol-dev` → `evofithealthprotocol-dev`
   - `healthprotocol-prod` → `evofithealthprotocol-prod`
   - `healthprotocol-postgres` → `evofithealthprotocol-postgres`
4. **Database name changed** from `healthprotocol_db` to `evofithealthprotocol_db`
5. **All configuration files updated** to use port 3500
6. **Critical test scripts updated** to reference new container names

### Files Successfully Modified:
- ✅ Main package.json (name and logs script)
- ✅ Client package.json (name and dev port)
- ✅ docker-compose.yml (ports, container names, database)
- ✅ README.md (all port references and branding)
- ✅ client/index.html (page title)
- ✅ vite.config.ts (server port and proxy)
- ✅ playwright.config.ts (base URL)
- ✅ server/index.ts (default port and CORS)
- ✅ server/authRoutes.ts (OAuth redirect URL)
- ✅ server/invitationRoutes.ts (base URL)
- ✅ env.example (database URL)
- ✅ Dockerfile (exposed ports)
- ✅ Test scripts (container name references)

**The application is now ready to run as EvoFitHealthProtocol on port 3500!**