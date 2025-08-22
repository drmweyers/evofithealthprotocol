#!/bin/bash

# HealthProtocol Monitoring and Alerting Script
# DevOps Engineer Agent - Infrastructure Monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_CONTAINER="evofithealthprotocol-dev"
DB_CONTAINER="evofithealthprotocol-postgres"
APP_URL="http://localhost:3500"
HEALTH_ENDPOINT="/api/health"
LOG_FILE="./logs/monitoring.log"
ALERT_FILE="./logs/alerts.log"
METRICS_FILE="./logs/metrics.log"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000  # milliseconds

# Create log directories
mkdir -p ./logs

# Functions
log_info() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

log_success() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1"
    echo -e "${GREEN}$message${NC}"
    echo "$message" >> "$LOG_FILE"
}

log_warning() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1"
    echo -e "${YELLOW}$message${NC}"
    echo "$message" >> "$LOG_FILE"
    echo "$message" >> "$ALERT_FILE"
}

log_error() {
    local message="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$LOG_FILE"
    echo "$message" >> "$ALERT_FILE"
}

log_metric() {
    local metric="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "$metric" >> "$METRICS_FILE"
}

# Function to check container status
check_container_status() {
    local container_name=$1
    
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        log_success "Container $container_name is running"
        return 0
    else
        log_error "Container $container_name is not running"
        return 1
    fi
}

# Function to monitor CPU usage
monitor_cpu_usage() {
    local container_name=$1
    local cpu_usage=$(docker stats $container_name --no-stream --format "{{.CPUPerc}}" | sed 's/%//')
    
    log_metric "CPU_USAGE:$container_name:$cpu_usage%"
    
    if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then
        log_warning "High CPU usage detected for $container_name: $cpu_usage%"
        return 1
    else
        log_info "CPU usage for $container_name: $cpu_usage%"
        return 0
    fi
}

# Function to monitor memory usage
monitor_memory_usage() {
    local container_name=$1
    local memory_stats=$(docker stats $container_name --no-stream --format "{{.MemUsage}}")
    local memory_usage=$(echo $memory_stats | awk '{print $1}' | sed 's/MiB//')
    local memory_limit=$(echo $memory_stats | awk '{print $3}' | sed 's/GiB//')
    
    # Convert to percentage (approximate)
    local memory_percentage=$(echo "scale=2; ($memory_usage / ($memory_limit * 1024)) * 100" | bc -l)
    
    log_metric "MEMORY_USAGE:$container_name:$memory_usage MiB"
    log_metric "MEMORY_PERCENTAGE:$container_name:$memory_percentage%"
    
    if (( $(echo "$memory_percentage > $MEMORY_THRESHOLD" | bc -l) )); then
        log_warning "High memory usage detected for $container_name: $memory_percentage%"
        return 1
    else
        log_info "Memory usage for $container_name: $memory_usage MiB ($memory_percentage%)"
        return 0
    fi
}

# Function to monitor disk usage
monitor_disk_usage() {
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    log_metric "DISK_USAGE:host:$disk_usage%"
    
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        log_warning "High disk usage detected: $disk_usage%"
        return 1
    else
        log_info "Disk usage: $disk_usage%"
        return 0
    fi
}

# Function to monitor application response time
monitor_response_time() {
    local url="${APP_URL}${HEALTH_ENDPOINT}"
    local start_time=$(date +%s%3N)
    
    if curl -s -f "$url" > /dev/null; then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        log_metric "RESPONSE_TIME:$response_time ms"
        
        if [ "$response_time" -gt "$RESPONSE_TIME_THRESHOLD" ]; then
            log_warning "Slow response time detected: ${response_time}ms"
            return 1
        else
            log_info "Response time: ${response_time}ms"
            return 0
        fi
    else
        log_error "Application endpoint is not responding"
        return 1
    fi
}

# Function to monitor database connectivity
monitor_database_connectivity() {
    if docker exec $DB_CONTAINER pg_isready -U postgres > /dev/null 2>&1; then
        log_success "Database is responding"
        log_metric "DATABASE_STATUS:healthy"
        return 0
    else
        log_error "Database is not responding"
        log_metric "DATABASE_STATUS:unhealthy"
        return 1
    fi
}

# Function to check log files for errors
monitor_application_logs() {
    local error_count=$(docker logs $APP_CONTAINER --since 1m 2>&1 | grep -i "error\|exception\|failed" | wc -l)
    
    log_metric "ERROR_COUNT:$error_count"
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "Found $error_count errors in application logs (last 1 minute)"
        
        # Show recent errors
        docker logs $APP_CONTAINER --since 1m 2>&1 | grep -i "error\|exception\|failed" | tail -5 | while read line; do
            log_error "APP_LOG: $line"
        done
        return 1
    else
        log_info "No errors found in recent application logs"
        return 0
    fi
}

# Function to generate monitoring report
generate_monitoring_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local report_file="./logs/monitoring_report_$(date '+%Y%m%d_%H%M%S').txt"
    
    {
        echo "================================================"
        echo "HealthProtocol Infrastructure Monitoring Report"
        echo "Generated: $timestamp"
        echo "================================================"
        echo ""
        
        echo "Container Status:"
        docker ps --filter name=evofithealthprotocol --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        
        echo "Resource Usage:"
        docker stats $APP_CONTAINER $DB_CONTAINER --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
        echo ""
        
        echo "Recent Metrics (last 10 entries):"
        tail -10 "$METRICS_FILE" 2>/dev/null || echo "No metrics available"
        echo ""
        
        echo "Recent Alerts (last 10 entries):"
        tail -10 "$ALERT_FILE" 2>/dev/null || echo "No alerts"
        echo ""
        
        echo "Disk Usage:"
        df -h /
        echo ""
        
        echo "Network Connections:"
        netstat -tuln | grep -E "(3500|5434)"
        echo ""
        
    } > "$report_file"
    
    log_info "Monitoring report generated: $report_file"
}

# Function to cleanup old logs
cleanup_old_logs() {
    local days_to_keep=7
    
    log_info "Cleaning up logs older than $days_to_keep days..."
    
    # Clean up old log files
    find ./logs -name "*.log" -type f -mtime +$days_to_keep -delete 2>/dev/null || true
    find ./logs -name "monitoring_report_*.txt" -type f -mtime +$days_to_keep -delete 2>/dev/null || true
    
    log_info "Log cleanup completed"
}

# Function to send alerts (placeholder for integration with notification systems)
send_alert() {
    local alert_message="$1"
    local severity="$2"
    
    # Placeholder for email/Slack/Discord notifications
    log_info "ALERT [$severity]: $alert_message"
    
    # Example integrations (uncomment and configure as needed):
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{\"text\":\"🚨 HealthProtocol Alert [$severity]: $alert_message\"}" \
    #   "$SLACK_WEBHOOK_URL"
}

# Function for continuous monitoring
continuous_monitoring() {
    local interval="${1:-60}"  # Default 60 seconds
    
    log_info "Starting continuous monitoring (interval: ${interval}s)"
    
    while true; do
        local issues=0
        
        # Check all monitoring metrics
        check_container_status "$APP_CONTAINER" || issues=$((issues + 1))
        check_container_status "$DB_CONTAINER" || issues=$((issues + 1))
        monitor_cpu_usage "$APP_CONTAINER" || issues=$((issues + 1))
        monitor_cpu_usage "$DB_CONTAINER" || issues=$((issues + 1))
        monitor_memory_usage "$APP_CONTAINER" || issues=$((issues + 1))
        monitor_memory_usage "$DB_CONTAINER" || issues=$((issues + 1))
        monitor_disk_usage || issues=$((issues + 1))
        monitor_response_time || issues=$((issues + 1))
        monitor_database_connectivity || issues=$((issues + 1))
        monitor_application_logs || issues=$((issues + 1))
        
        # Send summary alert if issues detected
        if [ "$issues" -gt 0 ]; then
            send_alert "$issues monitoring issues detected" "WARNING"
        fi
        
        sleep "$interval"
    done
}

# Function for one-time monitoring check
single_monitoring_check() {
    log_info "Running single monitoring check..."
    
    local issues=0
    
    echo "1. Container Status Check"
    echo "------------------------"
    check_container_status "$APP_CONTAINER" || issues=$((issues + 1))
    check_container_status "$DB_CONTAINER" || issues=$((issues + 1))
    echo ""
    
    echo "2. Resource Usage Check"
    echo "----------------------"
    monitor_cpu_usage "$APP_CONTAINER" || issues=$((issues + 1))
    monitor_cpu_usage "$DB_CONTAINER" || issues=$((issues + 1))
    monitor_memory_usage "$APP_CONTAINER" || issues=$((issues + 1))
    monitor_memory_usage "$DB_CONTAINER" || issues=$((issues + 1))
    monitor_disk_usage || issues=$((issues + 1))
    echo ""
    
    echo "3. Application Health Check"
    echo "--------------------------"
    monitor_response_time || issues=$((issues + 1))
    monitor_database_connectivity || issues=$((issues + 1))
    echo ""
    
    echo "4. Log Analysis"
    echo "--------------"
    monitor_application_logs || issues=$((issues + 1))
    echo ""
    
    # Generate report
    generate_monitoring_report
    
    # Summary
    if [ "$issues" -eq 0 ]; then
        log_success "All monitoring checks passed!"
    else
        log_warning "$issues monitoring issues detected"
    fi
    
    return $issues
}

# Main function
main() {
    local mode="${1:-single}"
    local interval="${2:-60}"
    
    echo "================================================"
    echo "🔍 HealthProtocol Infrastructure Monitoring"
    echo "================================================"
    
    case "$mode" in
        "continuous")
            continuous_monitoring "$interval"
            ;;
        "single")
            single_monitoring_check
            ;;
        "report")
            generate_monitoring_report
            ;;
        "cleanup")
            cleanup_old_logs
            ;;
        *)
            echo "Usage: $0 [mode] [interval]"
            echo ""
            echo "Modes:"
            echo "  single      - Run one-time monitoring check (default)"
            echo "  continuous  - Run continuous monitoring"
            echo "  report      - Generate monitoring report"
            echo "  cleanup     - Cleanup old logs"
            echo ""
            echo "Interval (for continuous mode):"
            echo "  Number of seconds between checks (default: 60)"
            echo ""
            echo "Examples:"
            echo "  $0                    # Single check"
            echo "  $0 continuous        # Continuous monitoring (60s interval)"
            echo "  $0 continuous 30     # Continuous monitoring (30s interval)"
            echo "  $0 report           # Generate report only"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"