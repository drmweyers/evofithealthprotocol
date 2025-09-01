-- PERMANENT TEST ACCOUNT PASSWORDS
-- Reference: TEST_CREDENTIALS.md
-- 
-- This script sets the test account passwords to the standardized values

-- Note: These are bcrypt hashes of the standard passwords
-- AdminPass123 -> $2b$10$...
-- TestTrainer123! -> $2b$10$...
-- TestCustomer123! -> $2b$10$...

-- Update admin@fitmeal.pro password to AdminPass123
UPDATE users 
SET password = '$2b$10$KqWxPpVH5GKNxNvrJgFa8uEbC.mhZyQ7Q4vN8GxPQvXJ0qB0v6WQy'
WHERE email = 'admin@fitmeal.pro';

-- Update trainer.test@evofitmeals.com password to TestTrainer123!
UPDATE users 
SET password = '$2b$10$Ry8CcJb9wPyYFpE4ZN0nqeQ88KGxqI0cO9JH4MqYf3lFLwJHKdQwW'
WHERE email = 'trainer.test@evofitmeals.com';

-- Update customer.test@evofitmeals.com password to TestCustomer123!
UPDATE users 
SET password = '$2b$10$tHNhFX37HtYqXvdEXgXQG.xnxIBrP1LrYCN8qT7UmGZxJGc/1qzsO'
WHERE email = 'customer.test@evofitmeals.com';

-- Show updated accounts
SELECT email, role, name FROM users 
WHERE email IN ('admin@fitmeal.pro', 'trainer.test@evofitmeals.com', 'customer.test@evofitmeals.com');