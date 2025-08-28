-- Migration: Add Protocol Optimization Features
-- Date: 2025-01-26
-- Description: Adds protocol templates, versioning, safety validation, and effectiveness tracking

-- Protocol Templates Table
-- Stores reusable protocol templates for common health goals
CREATE TABLE IF NOT EXISTS protocol_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'weight_loss', 'muscle_gain', 'detox', 'energy', 'longevity', 'therapeutic'
  template_type VARCHAR(50) NOT NULL, -- 'longevity', 'parasite_cleanse', 'ailments_based', 'general'
  default_duration INTEGER NOT NULL, -- Duration in days
  default_intensity VARCHAR(20) NOT NULL, -- 'gentle', 'moderate', 'intensive'
  base_config JSONB NOT NULL, -- Base protocol configuration
  target_audience JSONB DEFAULT '[]'::jsonb, -- ['beginners', 'intermediate', 'advanced']
  health_focus JSONB DEFAULT '[]'::jsonb, -- Focus areas like 'cardiovascular', 'digestive', 'immune'
  tags JSONB DEFAULT '[]'::jsonb, -- For categorization and search
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0, -- Track popularity
  created_by UUID REFERENCES users(id), -- Admin or trainer who created template
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Protocol Versions Table  
-- Tracks version history of protocols for change management
CREATE TABLE IF NOT EXISTS protocol_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES trainer_health_protocols(id) ON DELETE CASCADE NOT NULL,
  version_number VARCHAR(20) NOT NULL, -- e.g., "1.0", "1.1", "2.0"
  version_name VARCHAR(255), -- Optional human-readable name
  changelog TEXT NOT NULL, -- Description of changes
  config JSONB NOT NULL, -- Full protocol configuration at this version
  is_active BOOLEAN DEFAULT false, -- Only one active version per protocol
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Medical Safety Validations Table
-- Stores safety validation results for protocols against medications and conditions
CREATE TABLE IF NOT EXISTS medical_safety_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES trainer_health_protocols(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  medications JSONB DEFAULT '[]'::jsonb, -- Current medications
  health_conditions JSONB DEFAULT '[]'::jsonb, -- Health conditions
  allergies JSONB DEFAULT '[]'::jsonb, -- Known allergies
  safety_rating VARCHAR(20) NOT NULL, -- 'safe', 'caution', 'warning', 'contraindicated'
  interactions JSONB NOT NULL, -- Detailed interaction analysis
  recommendations JSONB DEFAULT '[]'::jsonb, -- Safety recommendations
  validated_at TIMESTAMP DEFAULT NOW(),
  validated_by VARCHAR(50) DEFAULT 'system', -- 'system' or 'healthcare_provider'
  expires_at TIMESTAMP, -- When validation expires (for medication changes)
  is_active BOOLEAN DEFAULT true
);

-- Protocol Effectiveness Tracking Table
-- Tracks protocol effectiveness through client progress correlation
CREATE TABLE IF NOT EXISTS protocol_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES trainer_health_protocols(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES protocol_assignments(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  
  -- Baseline metrics (at protocol start)
  baseline_metrics JSONB DEFAULT '{}'::jsonb, -- Weight, measurements, energy levels, etc.
  
  -- Progress tracking
  weekly_progress JSONB DEFAULT '[]'::jsonb, -- Array of weekly progress records
  
  -- Final outcomes
  final_metrics JSONB DEFAULT '{}'::jsonb, -- End-of-protocol measurements
  overall_effectiveness DECIMAL(4,2), -- 0-100%
  client_satisfaction INTEGER, -- 1-5 rating
  would_recommend BOOLEAN,
  
  -- Success indicators
  goals_achieved INTEGER DEFAULT 0, -- Number of goals achieved
  total_goals INTEGER DEFAULT 0, -- Total goals set
  completion_rate DECIMAL(4,2), -- 0-100%
  
  -- Analysis
  success_factors JSONB DEFAULT '[]'::jsonb, -- What contributed to success
  challenges JSONB DEFAULT '[]'::jsonb, -- What hindered progress
  
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Protocol Performance Analytics Table
-- Aggregate analytics for protocol performance optimization
CREATE TABLE IF NOT EXISTS protocol_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id UUID REFERENCES trainer_health_protocols(id) ON DELETE CASCADE NOT NULL,
  
  -- Usage statistics
  total_assignments INTEGER DEFAULT 0,
  active_assignments INTEGER DEFAULT 0,
  completed_assignments INTEGER DEFAULT 0,
  
  -- Effectiveness metrics
  average_effectiveness DECIMAL(4,2),
  average_satisfaction DECIMAL(3,2),
  average_completion_rate DECIMAL(4,2),
  recommendation_rate DECIMAL(4,2),
  
  -- Demographics that work best
  effective_demographics JSONB DEFAULT '{}'::jsonb,
  common_success_factors JSONB DEFAULT '[]'::jsonb,
  common_challenges JSONB DEFAULT '[]'::jsonb,
  
  -- Optimization suggestions
  optimization_suggestions JSONB DEFAULT '[]'::jsonb,
  
  last_calculated TIMESTAMP DEFAULT NOW(),
  data_points INTEGER DEFAULT 0 -- Number of completed assignments used for analytics
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS protocol_templates_category_idx ON protocol_templates(category);
CREATE INDEX IF NOT EXISTS protocol_templates_type_idx ON protocol_templates(template_type);
CREATE INDEX IF NOT EXISTS protocol_templates_active_idx ON protocol_templates(is_active);

CREATE INDEX IF NOT EXISTS protocol_versions_protocol_id_idx ON protocol_versions(protocol_id);
CREATE INDEX IF NOT EXISTS protocol_versions_active_idx ON protocol_versions(is_active, protocol_id);

CREATE INDEX IF NOT EXISTS safety_validations_protocol_customer_idx ON medical_safety_validations(protocol_id, customer_id);
CREATE INDEX IF NOT EXISTS safety_validations_rating_idx ON medical_safety_validations(safety_rating);
CREATE INDEX IF NOT EXISTS safety_validations_active_idx ON medical_safety_validations(is_active);

CREATE INDEX IF NOT EXISTS protocol_effectiveness_protocol_idx ON protocol_effectiveness(protocol_id);
CREATE INDEX IF NOT EXISTS protocol_effectiveness_customer_idx ON protocol_effectiveness(customer_id);
CREATE INDEX IF NOT EXISTS protocol_effectiveness_assignment_idx ON protocol_effectiveness(assignment_id);
CREATE INDEX IF NOT EXISTS protocol_effectiveness_completed_idx ON protocol_effectiveness(is_completed);

CREATE INDEX IF NOT EXISTS protocol_analytics_protocol_idx ON protocol_analytics(protocol_id);
CREATE INDEX IF NOT EXISTS protocol_analytics_calculated_idx ON protocol_analytics(last_calculated);

-- Insert default protocol templates for common health goals
INSERT INTO protocol_templates (
  name, description, category, template_type, default_duration, default_intensity,
  base_config, target_audience, health_focus, tags
) VALUES 
-- Longevity Templates
(
  '30-Day Longevity Kickstart',
  'A beginner-friendly longevity protocol focusing on anti-aging nutrition and intermittent fasting',
  'longevity',
  'longevity', 
  30,
  'gentle',
  '{"fastingProtocol": "16:8", "primaryGoals": ["cellular_repair", "energy_boost"], "calorieTarget": 2000}'::jsonb,
  '["beginner"]'::jsonb,
  '["anti-aging", "cellular_health", "metabolic_health"]'::jsonb,
  '["longevity", "fasting", "beginner", "30-day"]'::jsonb
),
(
  'Advanced Longevity Protocol',
  'Intensive 90-day longevity protocol with advanced fasting and caloric restriction',
  'longevity',
  'longevity',
  90,
  'intensive',
  '{"fastingProtocol": "18:6", "primaryGoals": ["maximum_lifespan", "cellular_regeneration"], "calorieTarget": 1800}'::jsonb,
  '["advanced"]'::jsonb,
  '["anti-aging", "autophagy", "hormetic_stress"]'::jsonb,
  '["longevity", "advanced", "caloric_restriction", "90-day"]'::jsonb
),

-- Parasite Cleanse Templates
(
  'Gentle Parasite Cleanse',
  'A mild 14-day parasite cleanse protocol suitable for first-time users',
  'detox',
  'parasite_cleanse',
  14,
  'gentle',
  '{"intensity": "gentle", "supplements": ["garlic", "pumpkin_seeds"], "avoidFoods": ["sugar", "processed"]}'::jsonb,
  '["beginner", "first_time"]'::jsonb,
  '["digestive_health", "gut_cleansing"]'::jsonb,
  '["parasite_cleanse", "gentle", "digestive", "14-day"]'::jsonb
),
(
  'Intensive Parasite Cleanse',
  'A comprehensive 30-day intensive parasite cleanse with herbal supplements',
  'detox', 
  'parasite_cleanse',
  30,
  'intensive',
  '{"intensity": "intensive", "supplements": ["wormwood", "cloves", "black_walnut"], "healthcareConsent": true}'::jsonb,
  '["experienced", "advanced"]'::jsonb,
  '["parasite_elimination", "deep_cleansing", "gut_restoration"]'::jsonb,
  '["parasite_cleanse", "intensive", "herbal", "30-day"]'::jsonb
),

-- Ailments-Based Templates
(
  'Diabetes Support Protocol',
  'A therapeutic nutrition protocol designed to support blood sugar management',
  'therapeutic',
  'ailments_based',
  60,
  'moderate',
  '{"selectedAilments": ["diabetes"], "nutritionalFocus": "low_glycemic", "calorieTarget": 1800}'::jsonb,
  '["beginner", "intermediate"]'::jsonb,
  '["blood_sugar", "metabolic_health", "diabetes_management"]'::jsonb,
  '["diabetes", "therapeutic", "blood_sugar", "nutrition"]'::jsonb
),
(
  'Heart Health Protocol',
  'A comprehensive protocol for cardiovascular health support',
  'therapeutic',
  'ailments_based',
  90,
  'moderate',
  '{"selectedAilments": ["heart_disease", "hypertension"], "nutritionalFocus": "heart_healthy", "calorieTarget": 2000}'::jsonb,
  '["beginner", "intermediate"]'::jsonb,
  '["cardiovascular", "heart_health", "blood_pressure"]'::jsonb,
  '["heart_health", "cardiovascular", "therapeutic", "DASH"]'::jsonb
),

-- General Wellness Templates
(
  'Energy & Vitality Boost',
  'A 21-day protocol designed to increase energy levels and overall vitality',
  'energy',
  'general',
  21,
  'moderate',
  '{"primaryGoals": ["energy_boost", "vitality"], "nutritionalFocus": "nutrient_dense", "calorieTarget": 2200}'::jsonb,
  '["beginner", "intermediate"]'::jsonb,
  '["energy", "vitality", "nutrient_density"]'::jsonb,
  '["energy", "vitality", "wellness", "21-day"]'::jsonb
),
(
  'Weight Loss Support',
  'A balanced 45-day weight management protocol with sustainable nutrition principles',
  'weight_loss',
  'general', 
  45,
  'moderate',
  '{"primaryGoals": ["weight_loss", "metabolic_health"], "nutritionalFocus": "calorie_deficit", "calorieTarget": 1600}'::jsonb,
  '["beginner", "intermediate"]'::jsonb,
  '["weight_management", "metabolic_health", "sustainable_loss"]'::jsonb,
  '["weight_loss", "metabolism", "sustainable", "45-day"]'::jsonb
);

-- Add trigger to update protocol_templates.updated_at
CREATE OR REPLACE FUNCTION update_protocol_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_protocol_templates_updated_at
    BEFORE UPDATE ON protocol_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_protocol_templates_updated_at();

-- Add trigger to update protocol_effectiveness.updated_at
CREATE OR REPLACE FUNCTION update_protocol_effectiveness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_protocol_effectiveness_updated_at
    BEFORE UPDATE ON protocol_effectiveness
    FOR EACH ROW
    EXECUTE FUNCTION update_protocol_effectiveness_updated_at();