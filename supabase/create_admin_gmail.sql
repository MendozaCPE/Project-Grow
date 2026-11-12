-- =====================================================
-- Create NEW Admin Account with admin@gmail.com
-- =====================================================
-- Email: admin@gmail.com
-- Password: admin123
-- 
-- IMPORTANT: Run this in your Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@gmail.com';
  
  IF admin_user_id IS NULL THEN
    -- Generate a new UUID for the admin user
    admin_user_id := gen_random_uuid();
    
    RAISE NOTICE '🔄 Creating new admin account...';
    
    -- Create the admin user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
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
      'admin@gmail.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Create identity record
    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      admin_user_id::text,
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text, 
        'email', 'admin@gmail.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Create profile
    INSERT INTO profiles (id, full_name, school, role, active, created_at, updated_at)
    VALUES (
      admin_user_id,
      'Admin User',
      'System',
      'admin',
      true,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE '✅ Admin user created with ID: %', admin_user_id;
    RAISE NOTICE '📧 Email: admin@gmail.com';
    RAISE NOTICE '🔑 Password: admin123';
  ELSE
    RAISE NOTICE '⚠️ User already exists with ID: %', admin_user_id;
    RAISE NOTICE '🔄 Updating existing account...';
    
    -- Update existing user
    UPDATE auth.users
    SET
      encrypted_password = crypt('admin123', gen_salt('bf')),
      email_confirmed_at = NOW(),
      confirmation_token = '',
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    -- Update profile to admin
    UPDATE profiles
    SET
      role = 'admin',
      active = true,
      full_name = COALESCE(full_name, 'Admin User'),
      school = COALESCE(school, 'System'),
      updated_at = NOW()
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ Account updated';
  END IF;
END $$;

-- Verify the admin account
SELECT 
  '✅ VERIFICATION' as status,
  u.id,
  u.email,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmed' ELSE '❌ Not Confirmed' END as email_status,
  p.full_name,
  p.school,
  p.role,
  CASE WHEN p.active THEN '✅ Active' ELSE '❌ Inactive' END as account_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

-- Verify identity exists
SELECT 
  '✅ IDENTITY' as status,
  provider,
  identity_data->>'email' as email
FROM auth.identities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
