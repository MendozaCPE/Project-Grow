-- =====================================================
-- Auto-Confirm Email Addresses (Bypass Email Verification)
-- =====================================================
-- This function automatically confirms user emails
-- Use this to bypass the email rate limit issue
-- =====================================================

-- Create a function to auto-confirm emails on signup
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically confirm the email
  NEW.email_confirmed_at = NOW();
  NEW.confirmation_token = '';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;

-- Create trigger to auto-confirm on user creation
CREATE TRIGGER on_auth_user_created_auto_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_user();

-- Verify the trigger was created
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created_auto_confirm';

-- Note: After running this, all new registrations will be auto-confirmed
-- Existing unconfirmed users can be manually confirmed with:
-- UPDATE auth.users SET email_confirmed_at = NOW(), confirmation_token = '' WHERE email_confirmed_at IS NULL;
