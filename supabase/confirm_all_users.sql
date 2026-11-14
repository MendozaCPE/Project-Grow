-- =====================================================
-- Manually Confirm All Pending Users
-- =====================================================
-- This will confirm all users who haven't confirmed their email
-- =====================================================

-- Confirm all unconfirmed users
UPDATE auth.users
SET 
  email_confirmed_at = NOW(),
  confirmation_token = '',
  confirmation_sent_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verify the changes
SELECT 
  'CONFIRMED USERS' as status,
  COUNT(*) as total_confirmed
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

SELECT 
  'PENDING USERS' as status,
  COUNT(*) as total_pending
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- Show all users with confirmation status
SELECT 
  email,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmed'
    ELSE '❌ Pending'
  END as status,
  created_at
FROM auth.users
ORDER BY created_at DESC;
