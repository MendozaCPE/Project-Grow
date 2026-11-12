-- =====================================================
-- RESET DATABASE - DELETE SESSIONS AND SUBMISSIONS
-- Keep all users (profiles) intact
-- =====================================================

-- WARNING: This will permanently delete all submissions and sessions!
-- Make sure you have a backup if needed.

-- Step 1: Delete all submissions (will be cascade deleted anyway, but explicit for clarity)
DELETE FROM submissions;

-- Step 2: Delete all LAC sessions (this will cascade delete any remaining submissions)
DELETE FROM lac_sessions;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that users are still intact
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
  COUNT(CASE WHEN active = true THEN 1 END) as active_users
FROM profiles;

-- Verify sessions are deleted
SELECT COUNT(*) as remaining_sessions FROM lac_sessions;

-- Verify submissions are deleted
SELECT COUNT(*) as remaining_submissions FROM submissions;

-- =====================================================
-- OPTIONAL: Reset auto-increment for session numbers
-- (Uncomment if you want to start session_no from 1 again)
-- =====================================================

-- Note: Since session_no is just an integer field (not a sequence),
-- no reset is needed. The next session you create can use any session_no you want.

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- If the counts show:
-- - Users: > 0 (your existing users)
-- - Sessions: 0
-- - Submissions: 0
-- Then the reset was successful!
