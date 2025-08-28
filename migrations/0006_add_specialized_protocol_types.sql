-- Migration: Add Specialized Protocol Types
-- Date: 2025-08-25
-- Purpose: Update health protocol types to support ailments-based and therapeutic protocols
-- 
-- This migration adds support for new protocol types:
-- - 'therapeutic': General therapeutic nutrition protocols
-- - 'ailments_based': Protocols targeting specific health conditions

-- Step 1: Update the type column to support new protocol types
-- Currently supports: 'longevity', 'parasite_cleanse'
-- Adding: 'therapeutic', 'ailments_based'

-- For PostgreSQL, we need to add the new values to the existing varchar constraint
-- Since this is a varchar field, we just need to ensure our application code supports the new types

-- Step 2: Update any existing protocols if needed (optional data migration)
-- This is commented out as it's not needed for new installations
-- UPDATE "trainer_health_protocols" SET type = 'therapeutic' WHERE type = 'custom' AND description LIKE '%therapeutic%';

-- Step 3: Add index for better performance on type queries (if not exists)
CREATE INDEX IF NOT EXISTS "trainer_health_protocols_type_idx" ON "trainer_health_protocols" USING btree ("type");

-- Step 4: Add specialized protocol configuration fields (optional - using JSONB config field)
-- The config field already supports any JSON structure, so no schema changes needed
-- New protocol types will store their specific configuration in the existing config JSONB field

-- Migration completed successfully
-- Specialized protocol types are now supported:
-- - longevity: Anti-aging and longevity protocols
-- - parasite_cleanse: Parasite cleanse and detox protocols  
-- - therapeutic: General therapeutic nutrition protocols
-- - ailments_based: Protocols targeting specific health conditions

/*
ROLLBACK INSTRUCTIONS:
This migration is backwards compatible and doesn't require rollback.
The new protocol types are additions and don't break existing functionality.

If rollback is needed:
1. Ensure no protocols exist with the new types
2. Remove any new protocols: DELETE FROM "trainer_health_protocols" WHERE type IN ('therapeutic', 'ailments_based');
3. Application code changes would need to be reverted
*/