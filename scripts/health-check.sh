#!/bin/bash

# Health Check Script for HealthProtocol Application
# DevOps Engineer Agent - Infrastructure Optimization

set -e

echo "🏥 HealthProtocol Infrastructure Health Check"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_URL="http://localhost:3500"
DB_CONTAINER="evofithealthprotocol-postgres"
APP_CONTAINER="evofithealthprotocol-dev"
HEALTH_ENDPOINT="/api/health"

# Function to check if container is running
check_container() {
    local container_name=$1
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        echo -e "${GREEN}✅ Container ${container_name} is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Container ${container_name} is not running${NC}"
        return 1
    fi
}

# Function to check container health
check_container_health() {
    local container_name=$1
    local health_status=$(docker inspect --format='{{.State.Health.Status}}' ${container_name} 2>/dev/null || echo "no-health-check")
    
    if [ "$health_status" = "healthy" ]; then
        echo -e "${GREEN}✅ ${container_name} health check: HEALTHY${NC}"
        return 0
    elif [ "$health_status" = "no-health-check" ]; then
        echo -e "${YELLOW}⚠️  ${container_name} has no health check configured${NC}"
        return 1
    else
        echo -e "${RED}❌ ${container_name} health check: ${health_status}${NC}"
        return 1
    fi
}

# Function to check application endpoint
check_app_endpoint() {
    local url="${APP_URL}${HEALTH_ENDPOINT}"
    echo "🔍 Checking application endpoint: ${url}"
    
    if curl -s -f "${url}" > /dev/null; then
        local response=$(curl -s "${url}")
        echo -e "${GREEN}✅ Application endpoint is responding${NC}"
        echo "Response: ${response}"
        return 0
    else
        echo -e "${RED}❌ Application endpoint is not responding${NC}"
        return 1
    fi
}

# Function to check database connectivity
check_database() {
    echo "🗄️  Checking database connectivity..."
    
    if docker exec ${DB_CONTAINER} pg_isready -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready and accepting connections${NC}"
        return 0
    else
        echo -e "${RED}❌ Database is not ready${NC}"
        return 1
    fi
}

# Function to check resource usage
check_resource_usage() {
    echo "📊 Checking resource usage..."
    
    # Get container stats
    local app_stats=$(docker stats ${APP_CONTAINER} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")
    local db_stats=$(docker stats ${DB_CONTAINER} --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")
    
    echo "Application Container:"
    echo "${app_stats}"
    echo ""
    echo "Database Container:"
    echo "${db_stats}"
}

# Function to check disk usage
check_disk_usage() {
    echo "💾 Checking Docker volumes..."
    
    local volumes=$(docker volume ls --filter name=healthprotocol --format "table {{.Name}}")
    echo "HealthProtocol volumes:"
    echo "${volumes}"
    
    # Check volume sizes
    echo ""
    echo "Volume sizes:"
    docker system df -v | grep healthprotocol || echo "No HealthProtocol volumes found in df output"
}

# Function to check port availability
check_ports() {
    echo "🔌 Checking port availability..."
    
    local app_port_status=$(netstat -tuln | grep ":3500" || echo "Port 3500 not found")
    local db_port_status=$(netstat -tuln | grep ":5434" || echo "Port 5434 not found")
    
    if echo "${app_port_status}" | grep -q "LISTEN"; then
        echo -e "${GREEN}✅ Application port 3500 is listening${NC}"
    else
        echo -e "${RED}❌ Application port 3500 is not listening${NC}"
    fi
    
    if echo "${db_port_status}" | grep -q "LISTEN"; then
        echo -e "${GREEN}✅ Database port 5434 is listening${NC}"
    else
        echo -e "${RED}❌ Database port 5434 is not listening${NC}"
    fi
}

# Main health check execution
main() {
    echo "Starting comprehensive health check..."
    echo ""
    
    local exit_code=0
    
    # Container checks
    echo "1. Container Status Check"
    echo "------------------------"
    check_container ${APP_CONTAINER} || exit_code=1
    check_container ${DB_CONTAINER} || exit_code=1
    echo ""
    
    # Health check status
    echo "2. Container Health Check"
    echo "------------------------"
    check_container_health ${DB_CONTAINER} || exit_code=1
    echo ""
    
    # Database connectivity
    echo "3. Database Connectivity"
    echo "-----------------------"
    check_database || exit_code=1
    echo ""
    
    # Application endpoint
    echo "4. Application Endpoint Check"
    echo "----------------------------"
    check_app_endpoint || exit_code=1
    echo ""
    
    # Port availability
    echo "5. Port Availability Check"
    echo "-------------------------"
    check_ports || exit_code=1
    echo ""
    
    # Resource usage
    echo "6. Resource Usage"
    echo "----------------"
    check_resource_usage
    echo ""
    
    # Disk usage
    echo "7. Disk Usage"
    echo "------------"
    check_disk_usage
    echo ""
    
    # Summary
    echo "=============================================="
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}🎉 All health checks passed!${NC}"
        echo "HealthProtocol infrastructure is healthy and operational."
    else
        echo -e "${RED}⚠️  Some health checks failed!${NC}"
        echo "Please review the issues above and take corrective action."
    fi
    echo "=============================================="
    
    exit $exit_code
}

# Execute main function
main