-- Fix test account passwords
-- Password: Password123!
-- Hash generated with bcrypt 12 rounds

UPDATE users 
SET password = '$2b$12$VyJYe2HLPvMyKt3kunCjveHZXtgTBF40Xy.aDghGlcSEyEFdxRTmm'
WHERE email IN (
  'admin@fitmeal.pro',
  'trainer.test@evofitmeals.com',
  'customer.test@evofitmeals.com'
);