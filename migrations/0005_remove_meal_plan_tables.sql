-- Migration: Remove Meal Plan Tables
-- Date: 2025-01-21
-- Purpose: Remove all meal plan related tables to focus on Health Protocol features only
-- 
-- SAFETY NOTES:
-- 1. This migration will permanently delete meal plan data
-- 2. Ensure you have a backup before running this migration
-- 3. Health protocol and user data will be preserved
-- 4. This migration supports rollback (see rollback section at end)

-- Step 1: Drop foreign key constraints first (order matters)
-- This prevents constraint violations when dropping tables

-- Drop meal_plan_assignments constraints
ALTER TABLE "meal_plan_assignments" DROP CONSTRAINT IF EXISTS "meal_plan_assignments_meal_plan_id_trainer_meal_plans_id_fk";
ALTER TABLE "meal_plan_assignments" DROP CONSTRAINT IF EXISTS "meal_plan_assignments_customer_id_users_id_fk";
ALTER TABLE "meal_plan_assignments" DROP CONSTRAINT IF EXISTS "meal_plan_assignments_assigned_by_users_id_fk";

-- Drop personalized_meal_plans constraints
ALTER TABLE "personalized_meal_plans" DROP CONSTRAINT IF EXISTS "personalized_meal_plans_customer_id_users_id_fk";
ALTER TABLE "personalized_meal_plans" DROP CONSTRAINT IF EXISTS "personalized_meal_plans_trainer_id_users_id_fk";

-- Drop personalized_recipes constraints
ALTER TABLE "personalized_recipes" DROP CONSTRAINT IF EXISTS "personalized_recipes_customer_id_users_id_fk";
ALTER TABLE "personalized_recipes" DROP CONSTRAINT IF EXISTS "personalized_recipes_trainer_id_users_id_fk";
ALTER TABLE "personalized_recipes" DROP CONSTRAINT IF EXISTS "personalized_recipes_recipe_id_recipes_id_fk";

-- Drop trainer_meal_plans constraints
ALTER TABLE "trainer_meal_plans" DROP CONSTRAINT IF EXISTS "trainer_meal_plans_trainer_id_users_id_fk";

-- Step 2: Drop indexes related to meal plan tables
DROP INDEX IF EXISTS "meal_plan_assignments_meal_plan_id_idx";
DROP INDEX IF EXISTS "meal_plan_assignments_customer_id_idx";
DROP INDEX IF EXISTS "trainer_meal_plans_trainer_id_idx";

-- Recipe-related indexes (if they exist)
DROP INDEX IF EXISTS "idx_recipes_meal_types";
DROP INDEX IF EXISTS "idx_recipes_dietary_tags";
DROP INDEX IF EXISTS "idx_recipes_approved";
DROP INDEX IF EXISTS "idx_recipes_calories";

-- Step 3: Drop meal plan related tables (order matters due to dependencies)
-- Drop dependent tables first, then parent tables

-- Drop assignment tables first
DROP TABLE IF EXISTS "meal_plan_assignments" CASCADE;
DROP TABLE IF EXISTS "personalized_meal_plans" CASCADE;
DROP TABLE IF EXISTS "personalized_recipes" CASCADE;

-- Drop parent tables
DROP TABLE IF EXISTS "trainer_meal_plans" CASCADE;
DROP TABLE IF EXISTS "recipes" CASCADE;

-- Step 4: Create health protocol tables if they don't exist
-- These tables support the core health protocol functionality

CREATE TABLE IF NOT EXISTS "trainer_health_protocols" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "trainer_id" uuid NOT NULL,
    "name" varchar(255) NOT NULL,
    "description" text,
    "type" varchar(50) NOT NULL, -- 'longevity' or 'parasite_cleanse'
    "duration" integer NOT NULL, -- Duration in days
    "intensity" varchar(20) NOT NULL, -- 'gentle', 'moderate', 'intensive'
    "config" jsonb NOT NULL, -- Protocol configuration (LongevityModeConfig or ParasiteCleanseConfig)
    "is_template" boolean DEFAULT false, -- Can be used as template
    "tags" jsonb DEFAULT '[]'::jsonb, -- For categorization
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "protocol_assignments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "protocol_id" uuid NOT NULL,
    "customer_id" uuid NOT NULL,
    "trainer_id" uuid NOT NULL,
    "status" varchar(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
    "start_date" timestamp DEFAULT now(),
    "end_date" timestamp, -- Calculated based on protocol duration
    "completed_date" timestamp,
    "notes" text, -- Assignment-specific notes
    "progress_data" jsonb DEFAULT '{}'::jsonb, -- Track progress metrics
    "assigned_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);

-- Step 5: Add foreign key constraints for health protocol tables
ALTER TABLE "trainer_health_protocols" ADD CONSTRAINT "trainer_health_protocols_trainer_id_users_id_fk" 
    FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "protocol_assignments" ADD CONSTRAINT "protocol_assignments_protocol_id_trainer_health_protocols_id_fk" 
    FOREIGN KEY ("protocol_id") REFERENCES "public"."trainer_health_protocols"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "protocol_assignments" ADD CONSTRAINT "protocol_assignments_customer_id_users_id_fk" 
    FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "protocol_assignments" ADD CONSTRAINT "protocol_assignments_trainer_id_users_id_fk" 
    FOREIGN KEY ("trainer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Step 6: Create indexes for health protocol tables
CREATE INDEX IF NOT EXISTS "trainer_health_protocols_trainer_id_idx" ON "trainer_health_protocols" USING btree ("trainer_id");
CREATE INDEX IF NOT EXISTS "trainer_health_protocols_type_idx" ON "trainer_health_protocols" USING btree ("type");
CREATE INDEX IF NOT EXISTS "protocol_assignments_protocol_id_idx" ON "protocol_assignments" USING btree ("protocol_id");
CREATE INDEX IF NOT EXISTS "protocol_assignments_customer_id_idx" ON "protocol_assignments" USING btree ("customer_id");
CREATE INDEX IF NOT EXISTS "protocol_assignments_trainer_id_idx" ON "protocol_assignments" USING btree ("trainer_id");
CREATE INDEX IF NOT EXISTS "protocol_assignments_status_idx" ON "protocol_assignments" USING btree ("status");

-- Migration completed successfully
-- Health protocol tables are now available
-- Meal plan functionality has been completely removed

/*
ROLLBACK INSTRUCTIONS:
If you need to rollback this migration, you would need to:

1. Restore from backup (recommended approach)
2. Or manually recreate the meal plan tables by running previous migrations

WARNING: Rolling back will lose any health protocol data created after this migration.

To rollback, run the following migrations in reverse order:
- 0003_create_personalized_meal_plans.sql
- 0002_create_personalized_recipes.sql  
- 0001_tricky_king_cobra.sql (meal plan portions)
- 0000_left_crusher_hogan.sql (recipes table)

However, backup restoration is the safest approach.
*/