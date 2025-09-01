#!/bin/bash

# App Verification Script for HealthProtocol
# This script ensures the app is running correctly after changes

echo "==================================="
echo "HealthProtocol App Verification"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_PORT=3501
DB_PORT=5434
APP_URL="http://localhost:${APP_PORT}"
CONTAINER_NAME="evofithealthprotocol-dev"
DB_CONTAINER="evofithealthprotocol-postgres"

# Step 1: Check if Docker is running
echo "1. Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "   Please start Docker Desktop first."
    exit 1
else
    echo -e "${GREEN}✅ Docker is running${NC}"
fi

# Step 2: Check container status
echo ""
echo "2. Checking container status..."
APP_RUNNING=$(docker ps --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" | grep -c "${CONTAINER_NAME}")
DB_RUNNING=$(docker ps --filter "name=${DB_CONTAINER}" --format "{{.Names}}" | grep -c "${DB_CONTAINER}")

if [ "$APP_RUNNING" -eq 0 ] || [ "$DB_RUNNING" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Containers not running. Starting them...${NC}"
    docker-compose --profile dev up -d
    echo "   Waiting for containers to be ready..."
    sleep 10
else
    echo -e "${GREEN}✅ Containers are running${NC}"
fi

# Step 3: Check database health
echo ""
echo "3. Checking database health..."
DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' ${DB_CONTAINER} 2>/dev/null)
if [ "$DB_HEALTH" = "healthy" ]; then
    echo -e "${GREEN}✅ Database is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Database health: ${DB_HEALTH}${NC}"
    echo "   Waiting for database to be ready..."
    sleep 5
fi

# Step 4: Check app HTTP response
echo ""
echo "4. Checking app HTTP response..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${APP_URL})
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ App is responding (HTTP ${HTTP_STATUS})${NC}"
else
    echo -e "${RED}❌ App not responding properly (HTTP ${HTTP_STATUS})${NC}"
    echo "   Checking logs..."
    docker logs ${CONTAINER_NAME} --tail 20
fi

# Step 5: Check API health endpoint
echo ""
echo "5. Checking API health endpoint..."
API_HEALTH=$(curl -s ${APP_URL}/api/health 2>/dev/null)
if echo "$API_HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed${NC}"
fi

# Step 6: Display access information
echo ""
echo "==================================="
echo "Access Information:"
echo "==================================="
echo -e "${GREEN}🌐 Frontend:${NC} ${APP_URL}"
echo -e "${GREEN}🔌 Backend API:${NC} ${APP_URL}/api"
echo -e "${GREEN}🗄️  Database:${NC} postgresql://localhost:${DB_PORT}/evofithealthprotocol_db"
echo ""
echo "Test Credentials:"
echo "  Admin: admin.test@evofitmeals.com / TestAdmin123!"
echo "  Trainer: trainer.test@evofitmeals.com / TestTrainer123!"
echo "  Customer: customer.test@evofitmeals.com / TestCustomer123!"
echo ""

# Step 7: Recent logs check
echo "==================================="
echo "Recent Activity (last 5 requests):"
echo "==================================="
docker logs ${CONTAINER_NAME} --tail 5 2>&1 | grep -E "GET|POST|PUT|DELETE" || echo "No recent requests"

echo ""
echo "==================================="
if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ App verification complete - WORKING${NC}"
    echo -e "   Access the app at: ${GREEN}${APP_URL}${NC}"
else
    echo -e "${RED}❌ App verification failed - ISSUES DETECTED${NC}"
    echo "   Run 'docker-compose --profile dev restart' to restart"
fi
echo "==================================="