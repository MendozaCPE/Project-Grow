-- =====================================================
-- Recreate Admin Account (Nuclear Option)
-- =====================================================
-- This will DELETE and recreate the admin account
-- Use this ONLY if the fix script doesn't work
-- =====================================================

-- Step 1: Delete existing admin account (if any)
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@email.com';
  
  IF admin_id IS NOT NULL THEN
    -- Delete from profiles first
    DELETE FROM profiles WHERE id = admin_id;
    
    -- Delete identities
    DELETE FROM auth.identities WHERE user_id = admin_id;
    
    -- Delete sessions
    DELETE FROM auth.sessions WHERE user_id = admin_id;
    
    -- Delete refresh tokens
    DELETE FROM auth.refresh_tokens WHERE user_id = admin_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = admin_id;
    
    RAISE NOTICE 'Deleted existing admin account';
  END IF;
END $$;

-- Step 2: Create fresh admin account
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
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
    'admin@email.com',
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
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    id
  )
  VALUES (
    admin_user_id::text,
    admin_user_id,
    jsonb_build_object(
      'sub', admin_user_id::text, 
      'email', 'admin@email.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    NOW(),
    NOW(),
    NOW(),
    gen_random_uuid()
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
  
  RAISE NOTICE '✅ Admin account created successfully with ID: %', admin_user_id;
  RAISE NOTICE '📧 Email: admin@email.com';
  RAISE NOTICE '🔑 Password: admin123';
END $$;

-- Step 3: Verify the admin account
SELECT 
  '✅ VERIFICATION' as status,
  u.id,
  u.email,
  CASE WHEN u.email_confirmed_at IS NOT NULL THEN '✅ Confirmed' ELSE '❌ Not Confirmed' END as email_status,
  CASE WHEN u.encrypted_password IS NOT NULL THEN '✅ Has Password' ELSE '❌ No Password' END as password_status,
  p.full_name,
  p.school,
  p.role,
  CASE WHEN p.active THEN '✅ Active' ELSE '❌ Inactive' END as account_status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@email.com';

-- Step 4: Verify identity
SELECT 
  '✅ IDENTITY CHECK' as status,
  provider,
  CASE WHEN identity_data->>'email_verified' = 'true' THEN '✅ Verified' ELSE '❌ Not Verified' END as identity_status
FROM auth.identities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@email.com');
