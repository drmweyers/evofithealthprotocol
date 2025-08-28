-- Setup Test Role Relationships
-- Creates relationships between test accounts to demonstrate role hierarchy

-- First, ensure we have the test users
DO $$
DECLARE
  admin_id UUID;
  trainer_id UUID;
  customer_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO admin_id FROM users WHERE email = 'admin@fitmeal.pro';
  SELECT id INTO trainer_id FROM users WHERE email = 'trainer.test@evofitmeals.com';
  SELECT id INTO customer_id FROM users WHERE email = 'customer.test@evofitmeals.com';
  
  -- Create trainer-customer relationship
  INSERT INTO trainer_customer_relationships (
    trainer_id,
    customer_id,
    status,
    relationship_type,
    can_view_protocols,
    can_message_trainer,
    can_book_sessions,
    notes
  ) VALUES (
    trainer_id,
    customer_id,
    'active',
    'primary',
    true,
    true,
    true,
    'Test relationship for demonstrating role hierarchy'
  ) ON CONFLICT (trainer_customer_relationships.trainer_id, trainer_customer_relationships.customer_id) 
  DO UPDATE SET 
    status = 'active',
    assigned_date = NOW(),
    notes = 'Updated: Test relationship for demonstrating role hierarchy';
  
  RAISE NOTICE 'Created relationship: Trainer (%) -> Customer (%)', trainer_id, customer_id;
  
  -- Create some test protocol assignments to show data sharing
  INSERT INTO protocol_assignments (
    trainer_id,
    customer_id,
    protocol_id,
    assigned_date
  ) VALUES (
    trainer_id,
    customer_id,
    gen_random_uuid(), -- Mock protocol ID
    NOW()
  ) ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Test relationships established successfully';
END $$;

-- Verify the relationships
SELECT 
  'Active Relationships:' as info;
  
SELECT 
  t.email as trainer_email,
  c.email as customer_email,
  tcr.status,
  tcr.relationship_type,
  tcr.assigned_date
FROM trainer_customer_relationships tcr
JOIN users t ON tcr.trainer_id = t.id
JOIN users c ON tcr.customer_id = c.id
WHERE tcr.status = 'active';

-- Show role hierarchy
SELECT 
  'Role Hierarchy:' as info;
  
SELECT 
  role,
  COUNT(*) as user_count,
  CASE role
    WHEN 'admin' THEN 'Level 3 - Full System Access'
    WHEN 'trainer' THEN 'Level 2 - Manage Assigned Customers'
    WHEN 'customer' THEN 'Level 1 - View Own Data + Trainer Shared'
  END as access_level
FROM users
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'trainer' THEN 2
    WHEN 'customer' THEN 3
  END;