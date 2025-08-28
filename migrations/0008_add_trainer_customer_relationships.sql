-- Migration: Enhanced Trainer-Customer Relationships
-- Date: 2025-08-28
-- Description: Adds comprehensive trainer-customer relationship tracking

-- Trainer-Customer Relationships Table
CREATE TABLE IF NOT EXISTS trainer_customer_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'pending'
  relationship_type VARCHAR(50) DEFAULT 'primary', -- 'primary', 'secondary', 'consultant'
  
  -- Permissions granted by trainer to customer
  can_view_protocols BOOLEAN DEFAULT true,
  can_message_trainer BOOLEAN DEFAULT true,
  can_book_sessions BOOLEAN DEFAULT true,
  
  -- Relationship metadata
  assigned_date TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  
  -- Ensure unique relationship
  UNIQUE(trainer_id, customer_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_trainer_customers ON trainer_customer_relationships(trainer_id, status);
CREATE INDEX IF NOT EXISTS idx_customer_trainer ON trainer_customer_relationships(customer_id, status);

-- Role Access Logs Table (for auditing)
CREATE TABLE IF NOT EXISTS role_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  actual_role VARCHAR(20) NOT NULL,
  effective_role VARCHAR(20),
  accessed_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_logs_user ON role_access_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_accessed ON role_access_logs(accessed_user_id, created_at DESC);

-- Admin Override Permissions Table
CREATE TABLE IF NOT EXISTS admin_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  override_type VARCHAR(50) NOT NULL, -- 'view_as', 'act_as', 'modify_data'
  reason TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_overrides ON admin_overrides(admin_id, expires_at);

-- Populate initial relationships from existing protocol assignments
INSERT INTO trainer_customer_relationships (trainer_id, customer_id, status, relationship_type)
SELECT DISTINCT 
  trainer_id, 
  customer_id,
  'active',
  'primary'
FROM protocol_assignments
WHERE trainer_id IS NOT NULL AND customer_id IS NOT NULL
ON CONFLICT (trainer_id, customer_id) DO NOTHING;

-- Create views for easy access

-- View: Active trainer-customer pairs
CREATE OR REPLACE VIEW active_trainer_customers AS
SELECT 
  tcr.*,
  t.name as trainer_name,
  t.email as trainer_email,
  c.name as customer_name,
  c.email as customer_email
FROM trainer_customer_relationships tcr
JOIN users t ON tcr.trainer_id = t.id
JOIN users c ON tcr.customer_id = c.id
WHERE tcr.status = 'active';

-- View: Customer with trainer info
CREATE OR REPLACE VIEW customers_with_trainers AS
SELECT 
  c.id as customer_id,
  c.name as customer_name,
  c.email as customer_email,
  t.id as trainer_id,
  t.name as trainer_name,
  t.email as trainer_email,
  tcr.assigned_date,
  tcr.relationship_type
FROM users c
LEFT JOIN trainer_customer_relationships tcr ON c.id = tcr.customer_id AND tcr.status = 'active'
LEFT JOIN users t ON tcr.trainer_id = t.id
WHERE c.role = 'customer';

-- View: Trainer with customer count
CREATE OR REPLACE VIEW trainers_with_stats AS
SELECT 
  t.id as trainer_id,
  t.name as trainer_name,
  t.email as trainer_email,
  COUNT(DISTINCT tcr.customer_id) as active_customers,
  COUNT(DISTINCT pa.id) as active_protocols
FROM users t
LEFT JOIN trainer_customer_relationships tcr ON t.id = tcr.trainer_id AND tcr.status = 'active'
LEFT JOIN protocol_assignments pa ON t.id = pa.trainer_id
WHERE t.role = 'trainer'
GROUP BY t.id, t.name, t.email;

-- Function to check if user can access another user's data
CREATE OR REPLACE FUNCTION can_access_user_data(
  requesting_user_id UUID,
  target_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  requesting_role VARCHAR(20);
  target_role VARCHAR(20);
  has_relationship BOOLEAN;
BEGIN
  -- Get roles
  SELECT role INTO requesting_role FROM users WHERE id = requesting_user_id;
  SELECT role INTO target_role FROM users WHERE id = target_user_id;
  
  -- Admin can access anyone
  IF requesting_role = 'admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Users can access their own data
  IF requesting_user_id = target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Trainer can access their customers
  IF requesting_role = 'trainer' AND target_role = 'customer' THEN
    SELECT EXISTS(
      SELECT 1 FROM trainer_customer_relationships 
      WHERE trainer_id = requesting_user_id 
      AND customer_id = target_user_id 
      AND status = 'active'
    ) INTO has_relationship;
    RETURN has_relationship;
  END IF;
  
  -- Customer can view limited trainer info
  IF requesting_role = 'customer' AND target_role = 'trainer' THEN
    SELECT EXISTS(
      SELECT 1 FROM trainer_customer_relationships 
      WHERE customer_id = requesting_user_id 
      AND trainer_id = target_user_id 
      AND status = 'active'
    ) INTO has_relationship;
    RETURN has_relationship;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add role display names to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_display_name VARCHAR(100);
UPDATE users SET role_display_name = 
  CASE role 
    WHEN 'admin' THEN 'System Administrator'
    WHEN 'trainer' THEN 'Health Protocol Trainer'
    WHEN 'customer' THEN 'Client'
    ELSE role
  END
WHERE role_display_name IS NULL;