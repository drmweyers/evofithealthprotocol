-- Performance Optimization Indexes for HealthProtocol Database
-- Created: 2025-09-02
-- Purpose: Improve query performance for production

-- ============================================
-- User and Authentication Indexes
-- ============================================

-- Optimize user lookups by email (login queries)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Optimize user role filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Optimize active user queries
CREATE INDEX IF NOT EXISTS idx_users_active ON users(created_at, role) WHERE deleted_at IS NULL;

-- ============================================
-- Health Protocol Indexes
-- ============================================

-- Optimize protocol lookups by user and status
CREATE INDEX IF NOT EXISTS idx_protocols_user_status ON health_protocols(user_id, status, created_at DESC);

-- Optimize protocol template queries
CREATE INDEX IF NOT EXISTS idx_protocols_template ON health_protocols(is_template) WHERE is_template = true;

-- Optimize protocol assignments
CREATE INDEX IF NOT EXISTS idx_protocol_assignments_trainer ON protocol_assignments(trainer_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_protocol_assignments_customer ON protocol_assignments(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_protocol_assignments_protocol ON protocol_assignments(protocol_id);

-- Composite index for assignment queries
CREATE INDEX IF NOT EXISTS idx_protocol_assignments_composite 
ON protocol_assignments(trainer_id, customer_id, status, assigned_at DESC);

-- ============================================
-- Customer Management Indexes
-- ============================================

-- Optimize customer-trainer relationships
CREATE INDEX IF NOT EXISTS idx_customer_trainer ON customers(trainer_id, created_at DESC);

-- Optimize customer invitation lookups
CREATE INDEX IF NOT EXISTS idx_customer_invitations ON customers(invitation_token) WHERE invitation_token IS NOT NULL;

-- Optimize customer progress tracking
CREATE INDEX IF NOT EXISTS idx_customer_progress_customer ON customer_progress(customer_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_progress_date_range ON customer_progress(customer_id, recorded_at);

-- ============================================
-- Recipe and Meal Plan Indexes
-- ============================================

-- Optimize recipe queries
CREATE INDEX IF NOT EXISTS idx_recipes_created ON recipes(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category) WHERE deleted_at IS NULL;

-- Optimize meal plan queries
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON meal_plans(is_active) WHERE is_active = true;

-- Optimize meal plan assignments
CREATE INDEX IF NOT EXISTS idx_meal_assignments_user ON meal_plan_assignments(user_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_assignments_plan ON meal_plan_assignments(meal_plan_id);

-- ============================================
-- Specialized Protocols Indexes
-- ============================================

-- Optimize longevity protocol queries
CREATE INDEX IF NOT EXISTS idx_longevity_protocols_user ON longevity_protocols(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_longevity_active ON longevity_protocols(is_active) WHERE is_active = true;

-- Optimize parasite cleanse protocol queries
CREATE INDEX IF NOT EXISTS idx_parasite_protocols_user ON parasite_cleanse_protocols(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parasite_active ON parasite_cleanse_protocols(is_active) WHERE is_active = true;

-- ============================================
-- Session and Activity Indexes
-- ============================================

-- Optimize session queries for security monitoring
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(expires_at) WHERE expires_at > NOW();

-- ============================================
-- Performance Monitoring Indexes
-- ============================================

-- Create a composite index for common join patterns
CREATE INDEX IF NOT EXISTS idx_user_protocol_join 
ON health_protocols(user_id, created_at DESC) 
INCLUDE (title, status, type);

-- Create covering index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_dashboard_stats 
ON users(role, created_at) 
INCLUDE (email, name) 
WHERE deleted_at IS NULL;

-- ============================================
-- Text Search Indexes (PostgreSQL specific)
-- ============================================

-- Full text search on protocol titles and descriptions
CREATE INDEX IF NOT EXISTS idx_protocols_search 
ON health_protocols 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Full text search on recipes
CREATE INDEX IF NOT EXISTS idx_recipes_search 
ON recipes 
USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================
-- Partial Indexes for Common Filters
-- ============================================

-- Index for active protocols only
CREATE INDEX IF NOT EXISTS idx_active_protocols 
ON health_protocols(user_id, created_at DESC) 
WHERE status = 'active' AND deleted_at IS NULL;

-- Index for pending invitations
CREATE INDEX IF NOT EXISTS idx_pending_invitations 
ON customers(invitation_token, created_at) 
WHERE invitation_accepted = false;

-- ============================================
-- Foreign Key Indexes (if not automatically created)
-- ============================================

-- Ensure all foreign keys have indexes
CREATE INDEX IF NOT EXISTS idx_fk_protocols_user ON health_protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_fk_assignments_trainer ON protocol_assignments(trainer_id);
CREATE INDEX IF NOT EXISTS idx_fk_assignments_customer ON protocol_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_fk_progress_customer ON customer_progress(customer_id);

-- ============================================
-- Analyze Tables for Query Planner
-- ============================================

-- Update statistics for query planner optimization
ANALYZE users;
ANALYZE health_protocols;
ANALYZE protocol_assignments;
ANALYZE customers;
ANALYZE customer_progress;
ANALYZE recipes;
ANALYZE meal_plans;
ANALYZE meal_plan_assignments;
ANALYZE longevity_protocols;
ANALYZE parasite_cleanse_protocols;

-- ============================================
-- Query Performance Views
-- ============================================

-- Create a view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time,
    stddev_time
FROM pg_stat_statements
WHERE mean_time > 100 -- queries averaging over 100ms
ORDER BY mean_time DESC
LIMIT 50;

-- Create a view for index usage statistics
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- ============================================
-- Maintenance Commands
-- ============================================

-- Run these periodically for optimal performance:
-- VACUUM ANALYZE; -- Reclaim space and update statistics
-- REINDEX DATABASE evofithealthprotocol_db; -- Rebuild indexes if fragmented
-- CLUSTER health_protocols USING idx_protocols_user_status; -- Physically reorder table