-- =====================================================
-- Fix Admin Login Issues
-- =====================================================
-- This script will:
-- 1. Confirm the email
-- 2. Reset the password to 'admin123'
-- 3. Ensure the profile is set to 'admin' role
-- 4. Activate the account
-- =====================================================

-- Update the admin user to confirm email and reset password
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmation_token = '',
  encrypted_password = crypt('admin123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@email.com';

-- Update or insert the profile with admin role
INSERT INTO profiles (id, full_name, school, role, active, created_at, updated_at)
SELECT 
  id,
  COALESCE((raw_user_meta_data->>'full_name')::text, 'Admin User') as full_name,
  'System' as school,
  'admin' as role,
  true as active,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users
WHERE email = 'admin@email.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  full_name = COALESCE(profiles.full_name, 'Admin User'),
  school = COALESCE(profiles.school, 'System'),
  active = true,
  updated_at = NOW();

-- Verify the changes
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.encrypted_password IS NOT NULL as has_password,
  p.full_name,
  p.school,
  p.role,
  p.active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@email.com';

-- Also check if there are any identities
SELECT 
  provider,
  provider_id,
  user_id,
  created_at
FROM auth.identities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@email.com');
