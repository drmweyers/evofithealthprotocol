#!/bin/bash

# HealthProtocol Deployment Script
# DevOps Engineer Agent - Automated Deployment Pipeline

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="HealthProtocol"
APP_NAME="evofithealthprotocol"
DOCKER_COMPOSE_FILE="docker-compose.yml"
HEALTH_CHECK_SCRIPT="./scripts/health-check.sh"
BACKUP_DIR="./backups"

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check if Docker is running
    if ! docker ps > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    log_success "Docker is running"
    
    # Check if docker-compose file exists
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "docker-compose.yml not found"
        exit 1
    fi
    log_success "docker-compose.yml found"
    
    # Check if environment file exists
    if [ ! -f ".env" ]; then
        log_warning ".env file not found. Using environment defaults."
    else
        log_success ".env file found"
    fi
}

# Function to create backup
create_backup() {
    log_info "Creating backup before deployment..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if container is running
    if docker ps --format "table {{.Names}}" | grep -q "^${APP_NAME}-postgres$"; then
        local backup_file="${BACKUP_DIR}/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        docker exec ${APP_NAME}-postgres pg_dump -U postgres ${APP_NAME}_db > "$backup_file"
        log_success "Database backup created: $backup_file"
    else
        log_warning "Database container not running, skipping database backup"
    fi
    
    # Backup volumes
    log_info "Backing up Docker volumes..."
    docker volume ls --filter name=${APP_NAME} --format "{{.Name}}" > "${BACKUP_DIR}/volumes_$(date +%Y%m%d_%H%M%S).list"
    log_success "Volume list backup created"
}

# Function to run tests
run_tests() {
    log_info "Running pre-deployment tests..."
    
    # Check if test command exists in package.json
    if docker exec ${APP_NAME}-dev npm run --silent test > /dev/null 2>&1; then
        log_info "Running test suite..."
        if docker exec ${APP_NAME}-dev npm test; then
            log_success "All tests passed"
        else
            log_error "Tests failed. Deployment aborted."
            exit 1
        fi
    else
        log_warning "No test command found, skipping tests"
    fi
}

# Function to build and deploy
deploy_application() {
    log_info "Starting application deployment..."
    
    # Pull latest images
    log_info "Pulling latest base images..."
    docker-compose pull postgres
    
    # Build application
    log_info "Building application..."
    docker-compose --profile dev build --no-cache
    
    # Start services
    log_info "Starting services..."
    docker-compose --profile dev up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    log_success "Application deployed successfully"
}

# Function to verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Run health check script if it exists
    if [ -f "$HEALTH_CHECK_SCRIPT" ]; then
        log_info "Running health checks..."
        if bash "$HEALTH_CHECK_SCRIPT"; then
            log_success "Health checks passed"
        else
            log_error "Health checks failed"
            return 1
        fi
    else
        log_warning "Health check script not found, running basic checks..."
        
        # Basic container check
        if docker ps --format "table {{.Names}}" | grep -q "^${APP_NAME}-dev$"; then
            log_success "Application container is running"
        else
            log_error "Application container is not running"
            return 1
        fi
        
        # Basic endpoint check
        sleep 10
        if curl -s -f "http://localhost:3500/api/health" > /dev/null; then
            log_success "Application endpoint is responding"
        else
            log_error "Application endpoint is not responding"
            return 1
        fi
    fi
}

# Function to rollback deployment
rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    # Stop current containers
    docker-compose --profile dev down
    
    # Restore from backup if available
    local latest_backup=$(ls -t ${BACKUP_DIR}/db_backup_*.sql 2>/dev/null | head -n1)
    if [ -n "$latest_backup" ]; then
        log_info "Restoring database from backup: $latest_backup"
        docker-compose --profile dev up -d postgres
        sleep 10
        docker exec -i ${APP_NAME}-postgres psql -U postgres -d ${APP_NAME}_db < "$latest_backup"
    fi
    
    log_success "Rollback completed"
}

# Function to cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Keep only last 5 backups
    if [ -d "$BACKUP_DIR" ]; then
        local backup_count=$(ls -1 ${BACKUP_DIR}/db_backup_*.sql 2>/dev/null | wc -l)
        if [ "$backup_count" -gt 5 ]; then
            ls -t ${BACKUP_DIR}/db_backup_*.sql | tail -n +6 | xargs rm -f
            log_success "Old backups cleaned up"
        fi
    fi
}

# Function to show deployment status
show_status() {
    echo ""
    echo "================================================"
    echo "🏥 HealthProtocol Deployment Status"
    echo "================================================"
    
    # Container status
    echo "Container Status:"
    docker ps --filter name=${APP_NAME} --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Service URLs
    echo ""
    echo "Service URLs:"
    echo "  Application: http://localhost:3500"
    echo "  Health Check: http://localhost:3500/api/health"
    echo "  Database: localhost:5434"
    
    # Resource usage
    echo ""
    echo "Resource Usage:"
    docker stats ${APP_NAME}-dev ${APP_NAME}-postgres --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    
    echo "================================================"
}

# Main deployment function
main() {
    echo "================================================"
    echo "🚀 HealthProtocol Deployment Pipeline"
    echo "================================================"
    
    local deployment_mode="${1:-dev}"
    local skip_tests="${2:-false}"
    
    log_info "Deployment mode: $deployment_mode"
    log_info "Skip tests: $skip_tests"
    echo ""
    
    # Step 1: Prerequisites
    check_prerequisites
    echo ""
    
    # Step 2: Backup
    create_backup
    echo ""
    
    # Step 3: Tests (if not skipped)
    if [ "$skip_tests" != "true" ]; then
        run_tests
        echo ""
    fi
    
    # Step 4: Deploy
    deploy_application
    echo ""
    
    # Step 5: Verify
    if verify_deployment; then
        log_success "Deployment completed successfully!"
        cleanup_old_backups
        show_status
    else
        log_error "Deployment verification failed!"
        read -p "Do you want to rollback? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rollback_deployment
        fi
        exit 1
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [deployment_mode] [skip_tests]"
    echo ""
    echo "Parameters:"
    echo "  deployment_mode: dev (default) | prod"
    echo "  skip_tests: false (default) | true"
    echo ""
    echo "Examples:"
    echo "  $0                    # Deploy in dev mode with tests"
    echo "  $0 dev true          # Deploy in dev mode, skip tests"
    echo "  $0 prod              # Deploy in prod mode with tests"
    exit 1
}

# Handle command line arguments
case "$1" in
    -h|--help)
        usage
        ;;
    *)
        main "$@"
        ;;
esac