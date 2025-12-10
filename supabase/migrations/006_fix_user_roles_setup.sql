-- Quick Fix: Setup user_roles for existing users
-- This script should be run after 005_invite_codes.sql

-- Step 1: Get your user ID (replace with your actual email)
-- Run this first to find your user_id:
-- SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL@example.com';

-- Step 2: Insert yourself as super_admin
-- Replace 'YOUR_USER_ID_HERE' with the actual UUID from step 1
-- Example:
-- INSERT INTO user_roles (user_id, role, permissions)
-- VALUES ('12345678-1234-1234-1234-123456789abc', 'super_admin', '["all"]'::jsonb)
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin', permissions = '["all"]'::jsonb;

-- Alternative: Set FIRST user as super_admin automatically
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  -- Get first user from auth.users
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role, permissions)
    VALUES (first_user_id, 'super_admin', '["all"]'::jsonb)
    ON CONFLICT (user_id) DO UPDATE 
    SET role = 'super_admin', permissions = '["all"]'::jsonb;
    
    RAISE NOTICE 'Super Admin role assigned to user: %', first_user_id;
  END IF;
END $$;

-- Verify the setup
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.permissions
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at;

