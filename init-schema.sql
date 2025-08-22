-- Initialize EvoFitHealthProtocol Schema

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'trainer', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    google_id VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- Customer invitations
CREATE TABLE IF NOT EXISTS customer_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trainer Health Protocols
CREATE TABLE IF NOT EXISTS trainer_health_protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL,
    intensity VARCHAR(20) NOT NULL,
    config JSONB NOT NULL,
    is_template BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Protocol Assignments
CREATE TABLE IF NOT EXISTS protocol_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID REFERENCES trainer_health_protocols(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP DEFAULT NOW(),
    end_date TIMESTAMP,
    completed_date TIMESTAMP,
    notes TEXT,
    progress_data JSONB DEFAULT '{}',
    assigned_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Progress Measurements
CREATE TABLE IF NOT EXISTS progress_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    measurement_date TIMESTAMP NOT NULL,
    weight_kg DECIMAL(5, 2),
    weight_lbs DECIMAL(6, 2),
    neck_cm DECIMAL(4, 1),
    shoulders_cm DECIMAL(5, 1),
    chest_cm DECIMAL(5, 1),
    waist_cm DECIMAL(5, 1),
    hips_cm DECIMAL(5, 1),
    bicep_cm DECIMAL(4, 1),
    forearm_cm DECIMAL(4, 1),
    thigh_cm DECIMAL(5, 1),
    calf_cm DECIMAL(4, 1),
    body_fat_percentage DECIMAL(4, 2),
    muscle_mass_kg DECIMAL(5, 2),
    bmi DECIMAL(4, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Goals
CREATE TABLE IF NOT EXISTS customer_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_value DECIMAL(10, 2),
    current_value DECIMAL(10, 2),
    unit VARCHAR(20),
    target_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    category VARCHAR(50),
    priority VARCHAR(10) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Progress Photos
CREATE TABLE IF NOT EXISTS progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    photo_date TIMESTAMP NOT NULL,
    photo_url TEXT NOT NULL,
    photo_type VARCHAR(20) NOT NULL,
    angle VARCHAR(20),
    notes TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

CREATE INDEX IF NOT EXISTS trainer_health_protocols_trainer_id_idx ON trainer_health_protocols(trainer_id);
CREATE INDEX IF NOT EXISTS trainer_health_protocols_type_idx ON trainer_health_protocols(type);

CREATE INDEX IF NOT EXISTS protocol_assignments_protocol_id_idx ON protocol_assignments(protocol_id);
CREATE INDEX IF NOT EXISTS protocol_assignments_customer_id_idx ON protocol_assignments(customer_id);
CREATE INDEX IF NOT EXISTS protocol_assignments_trainer_id_idx ON protocol_assignments(trainer_id);
CREATE INDEX IF NOT EXISTS protocol_assignments_status_idx ON protocol_assignments(status);

CREATE INDEX IF NOT EXISTS progress_measurements_customer_id_idx ON progress_measurements(customer_id);
CREATE INDEX IF NOT EXISTS progress_measurements_date_idx ON progress_measurements(measurement_date);

CREATE INDEX IF NOT EXISTS customer_goals_customer_id_idx ON customer_goals(customer_id);
CREATE INDEX IF NOT EXISTS customer_goals_status_idx ON customer_goals(status);

-- Insert default admin user
INSERT INTO users (email, password, role, name) 
VALUES ('admin@evofithealthprotocol.com', '$2b$10$QfqL3.YDJzj3Z9a8kLnFJ.sEvI8J0kF4kNXI6sFcz6QwGjZGZ.OlS', 'admin', 'Administrator')
ON CONFLICT (email) DO NOTHING;

-- Create a default trainer for testing
INSERT INTO users (email, password, role, name)
VALUES ('trainer@test.com', '$2b$10$QfqL3.YDJzj3Z9a8kLnFJ.sEvI8J0kF4kNXI6sFcz6QwGjZGZ.OlS', 'trainer', 'Test Trainer')
ON CONFLICT (email) DO NOTHING;

-- Create a default customer for testing
INSERT INTO users (email, password, role, name)
VALUES ('customer@test.com', '$2b$10$QfqL3.YDJzj3Z9a8kLnFJ.sEvI8J0kF4kNXI6sFcz6QwGjZGZ.OlS', 'customer', 'Test Customer')
ON CONFLICT (email) DO NOTHING;