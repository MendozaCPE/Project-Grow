-- =====================================================
-- Change Admin Email from admin@email.com to admin@gmail.com
-- =====================================================

-- Update the email in auth.users
UPDATE auth.users
SET 
  email = 'admin@gmail.com',
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{email}',
    '"admin@gmail.com"'::jsonb
  ),
  updated_at = NOW()
WHERE email = 'admin@email.com';

-- Update the identity data
UPDATE auth.identities
SET 
  identity_data = jsonb_set(
    identity_data,
    '{email}',
    '"admin@gmail.com"'::jsonb
  ),
  updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');

-- Verify the change
SELECT 
  '✅ EMAIL CHANGED' as status,
  u.id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  p.role,
  p.active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'admin@gmail.com';

-- Verify identity
SELECT 
  '✅ IDENTITY UPDATED' as status,
  provider,
  identity_data->>'email' as identity_email
FROM auth.identities
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@gmail.com');
