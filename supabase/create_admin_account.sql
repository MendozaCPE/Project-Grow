-- =====================================================
-- Create Admin Account
-- =====================================================
-- Email: admin@email.com
-- Password: admin123
-- 
-- IMPORTANT: Run this in your Supabase SQL Editor
-- =====================================================

-- Check if admin user already exists
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@email.com';
  
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    -- Create the admin user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@email.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User","school":"System"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create identity record
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id::text,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', 'admin@email.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
  END IF;
  
  -- Update the profile to set role as admin
  -- (The profile is created automatically by the trigger, but as 'teacher')
  UPDATE profiles 
  SET 
    role = 'admin',
    full_name = 'Admin User',
    school = 'System',
    active = true
  WHERE id = admin_user_id;
  
  RAISE NOTICE 'Profile updated to admin role';
END $$;

-- Verify the admin account was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.school,
  p.role,
  p.active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@email.com';
