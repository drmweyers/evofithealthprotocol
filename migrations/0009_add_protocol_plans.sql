-- Migration: Add Protocol Plans Feature
-- Description: Adds tables for saving and reusing protocol configurations
-- Created: 2024-12-28

-- Create protocol_plans table
CREATE TABLE IF NOT EXISTS protocol_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(255) NOT NULL,
  plan_description TEXT,
  wizard_configuration JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  usage_count INTEGER DEFAULT 0
);

-- Add indexes for protocol_plans
CREATE INDEX IF NOT EXISTS protocol_plans_trainer_id_idx ON protocol_plans(trainer_id);
CREATE INDEX IF NOT EXISTS protocol_plans_created_at_idx ON protocol_plans(created_at);
CREATE INDEX IF NOT EXISTS protocol_plans_plan_name_idx ON protocol_plans(plan_name);

-- Add unique constraint for trainer_id + plan_name
ALTER TABLE protocol_plans 
  ADD CONSTRAINT unique_trainer_plan_name UNIQUE(trainer_id, plan_name);

-- Create protocol_plan_assignments table
CREATE TABLE IF NOT EXISTS protocol_plan_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_plan_id UUID NOT NULL REFERENCES protocol_plans(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES trainer_health_protocols(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for protocol_plan_assignments
CREATE INDEX IF NOT EXISTS protocol_plan_assignments_plan_id_idx ON protocol_plan_assignments(protocol_plan_id);
CREATE INDEX IF NOT EXISTS protocol_plan_assignments_customer_id_idx ON protocol_plan_assignments(customer_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_protocol_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_protocol_plans_updated_at_trigger 
  BEFORE UPDATE ON protocol_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_protocol_plans_updated_at();

-- Add column to trainer_health_protocols to track if created from a plan
ALTER TABLE trainer_health_protocols 
  ADD COLUMN IF NOT EXISTS created_from_plan BOOLEAN DEFAULT FALSE;

-- Add comment documentation
COMMENT ON TABLE protocol_plans IS 'Stores reusable protocol configurations that trainers can use to create multiple protocols';
COMMENT ON TABLE protocol_plan_assignments IS 'Tracks when protocol plans are used to create actual protocols';
COMMENT ON COLUMN protocol_plans.wizard_configuration IS 'Complete wizard configuration as JSONB including all steps data';
COMMENT ON COLUMN protocol_plans.usage_count IS 'Number of times this plan has been used to create protocols';
COMMENT ON COLUMN protocol_plans.last_used_at IS 'Timestamp of when this plan was last used to create a protocol';