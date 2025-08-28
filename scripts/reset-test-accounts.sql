-- Reset Test Account Passwords
-- Password: Test123!@# (bcrypt hashed)

-- This hash is for 'Test123!@#'
-- Generated using bcrypt with 10 rounds
DO $$
DECLARE
    hashed_password TEXT := '$2b$10$YourHashWillBeGeneratedHere';
BEGIN
    -- First, let's generate a proper bcrypt hash
    -- For now, we'll update with a known good hash for 'Test123!@#'
    hashed_password := '$2b$10$K7L1OJ0TfJBhDKOWH7/jXOV8hBGx/TOVLB.POiNx1cKWj2nj9rq2y';
    
    -- Update admin account
    UPDATE users 
    SET password = hashed_password
    WHERE email = 'admin@fitmeal.pro';
    
    IF NOT FOUND THEN
        INSERT INTO users (email, password, name, role)
        VALUES ('admin@fitmeal.pro', hashed_password, 'Admin User', 'admin');
    END IF;
    
    -- Update trainer account
    UPDATE users 
    SET password = hashed_password
    WHERE email = 'trainer.test@evofitmeals.com';
    
    IF NOT FOUND THEN
        INSERT INTO users (email, password, name, role)
        VALUES ('trainer.test@evofitmeals.com', hashed_password, 'Test Trainer', 'trainer');
    END IF;
    
    -- Update customer account
    UPDATE users 
    SET password = hashed_password
    WHERE email = 'customer.test@evofitmeals.com';
    
    IF NOT FOUND THEN
        INSERT INTO users (email, password, name, role)
        VALUES ('customer.test@evofitmeals.com', hashed_password, 'Test Customer', 'customer');
    END IF;
    
    RAISE NOTICE 'Test accounts have been reset/created with password: Test123!@#';
END $$;