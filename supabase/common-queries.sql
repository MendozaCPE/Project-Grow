-- =====================================================
-- COMMON SQL QUERIES FOR PROJECT GROW
-- Quick reference for database operations
-- =====================================================

-- =====================================================
-- USER MANAGEMENT
-- =====================================================

-- Create an admin user (run after user signs up)
UPDATE profiles
SET role = 'admin'
WHERE id = '<user-uuid>';

-- List all users with their roles
SELECT 
  id,
  full_name,
  school,
  role,
  active,
  created_at
FROM profiles
ORDER BY role DESC, full_name;

-- Find a user by email (requires joining with auth.users)
SELECT 
  p.*
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'teacher@example.com';

-- Deactivate a user
UPDATE profiles
SET active = false
WHERE id = '<user-uuid>';

-- Count users by role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
WHERE active = true
GROUP BY role;

-- =====================================================
-- SESSION MANAGEMENT
-- =====================================================

-- Create a new LAC session
INSERT INTO lac_sessions (session_no, session_date, title)
VALUES (1, '2026-11-15', 'Introduction to Learning Action Cell');

-- List all sessions with submission counts
SELECT 
  ls.*,
  COUNT(s.id) as submission_count,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count,
  COUNT(CASE WHEN s.status = 'draft' THEN 1 END) as draft_count
FROM lac_sessions ls
LEFT JOIN submissions s ON ls.id = s.session_id AND s.deleted_at IS NULL
GROUP BY ls.id
ORDER BY ls.session_no;

-- Lock a session (prevent further edits)
UPDATE lac_sessions
SET locked = true
WHERE session_no = 1;

-- Unlock a session
UPDATE lac_sessions
SET locked = false
WHERE session_no = 1;

-- Find sessions with no submissions
SELECT ls.*
FROM lac_sessions ls
LEFT JOIN submissions s ON ls.id = s.session_id AND s.deleted_at IS NULL
WHERE s.id IS NULL
ORDER BY ls.session_no;

-- Delete a session (will cascade to submissions)
DELETE FROM lac_sessions
WHERE id = '<session-uuid>';

-- =====================================================
-- SUBMISSION MANAGEMENT
-- =====================================================

-- Get all submissions for a specific session
SELECT 
  s.*,
  p.full_name,
  p.school,
  p.role
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
WHERE s.session_id = '<session-uuid>'
  AND s.deleted_at IS NULL
ORDER BY s.status DESC, s.updated_at DESC;

-- Get all submissions by a specific teacher
SELECT 
  s.*,
  ls.session_no,
  ls.title,
  ls.session_date,
  ls.locked
FROM submissions s
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.teacher_id = '<teacher-uuid>'
  AND s.deleted_at IS NULL
ORDER BY ls.session_no DESC;

-- Find drafts older than 30 days
SELECT 
  p.full_name,
  p.school,
  ls.title as session_title,
  ls.session_no,
  s.created_at,
  s.updated_at,
  EXTRACT(DAY FROM NOW() - s.created_at) as days_old
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.status = 'draft'
  AND s.deleted_at IS NULL
  AND s.created_at < NOW() - INTERVAL '30 days'
ORDER BY s.created_at;

-- Count submissions by status
SELECT 
  status,
  COUNT(*) as count
FROM submissions
WHERE deleted_at IS NULL
GROUP BY status;

-- Get submission completion rate per teacher
SELECT 
  p.full_name,
  p.school,
  COUNT(s.id) as total_submissions,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted,
  COUNT(CASE WHEN s.status = 'draft' THEN 1 END) as drafts,
  ROUND(
    100.0 * COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) / 
    NULLIF(COUNT(s.id), 0),
    1
  ) as completion_percentage
FROM profiles p
LEFT JOIN submissions s ON p.id = s.teacher_id AND s.deleted_at IS NULL
WHERE p.role = 'teacher' AND p.active = true
GROUP BY p.id, p.full_name, p.school
ORDER BY completion_percentage DESC, p.full_name;

-- Soft delete a submission
UPDATE submissions
SET deleted_at = NOW()
WHERE id = '<submission-uuid>';

-- Restore a soft-deleted submission (admin only)
UPDATE submissions
SET deleted_at = NULL
WHERE id = '<submission-uuid>';

-- Permanently delete old soft-deleted submissions (90+ days)
DELETE FROM submissions
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '90 days';

-- =====================================================
-- REPORTING QUERIES
-- =====================================================

-- Overall statistics
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'teacher' AND active = true) as active_teachers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admins,
  (SELECT COUNT(*) FROM lac_sessions) as total_sessions,
  (SELECT COUNT(*) FROM lac_sessions WHERE locked = true) as locked_sessions,
  (SELECT COUNT(*) FROM submissions WHERE deleted_at IS NULL) as total_submissions,
  (SELECT COUNT(*) FROM submissions WHERE status = 'submitted' AND deleted_at IS NULL) as submitted,
  (SELECT COUNT(*) FROM submissions WHERE status = 'draft' AND deleted_at IS NULL) as drafts;

-- Submission matrix (teachers vs sessions)
SELECT 
  p.full_name,
  p.school,
  STRING_AGG(
    CASE 
      WHEN s.status = 'submitted' THEN '✓ ' || ls.session_no::TEXT
      WHEN s.status = 'draft' THEN '○ ' || ls.session_no::TEXT
      ELSE NULL
    END,
    ', ' ORDER BY ls.session_no
  ) as sessions
FROM profiles p
LEFT JOIN submissions s ON p.id = s.teacher_id AND s.deleted_at IS NULL
LEFT JOIN lac_sessions ls ON s.session_id = ls.id
WHERE p.role = 'teacher' AND p.active = true
GROUP BY p.id, p.full_name, p.school
ORDER BY p.full_name;

-- Teachers who haven't submitted anything
SELECT 
  p.full_name,
  p.school,
  p.created_at as joined_date
FROM profiles p
LEFT JOIN submissions s ON p.id = s.teacher_id AND s.deleted_at IS NULL
WHERE p.role = 'teacher' 
  AND p.active = true
  AND s.id IS NULL
ORDER BY p.created_at DESC;

-- Most active teachers (by submission count)
SELECT 
  p.full_name,
  p.school,
  COUNT(s.id) as submission_count,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count,
  MAX(s.updated_at) as last_activity
FROM profiles p
JOIN submissions s ON p.id = s.teacher_id
WHERE s.deleted_at IS NULL
GROUP BY p.id, p.full_name, p.school
ORDER BY submission_count DESC
LIMIT 10;

-- Session completion rates
SELECT 
  ls.session_no,
  ls.title,
  ls.locked,
  COUNT(DISTINCT p.id) as total_teachers,
  COUNT(DISTINCT s.teacher_id) as teachers_with_submissions,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count,
  COUNT(CASE WHEN s.status = 'draft' THEN 1 END) as draft_count,
  ROUND(
    100.0 * COUNT(DISTINCT s.teacher_id) / 
    NULLIF(COUNT(DISTINCT p.id), 0),
    1
  ) as participation_rate
FROM lac_sessions ls
CROSS JOIN profiles p
LEFT JOIN submissions s ON ls.id = s.session_id 
  AND p.id = s.teacher_id 
  AND s.deleted_at IS NULL
WHERE p.role = 'teacher' AND p.active = true
GROUP BY ls.id, ls.session_no, ls.title, ls.locked
ORDER BY ls.session_no;

-- =====================================================
-- JSONB ANSWER QUERIES
-- =====================================================

-- Search within JSONB answers
SELECT 
  p.full_name,
  ls.title,
  s.answers
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.answers::text ILIKE '%keyword%'
  AND s.deleted_at IS NULL;

-- Get specific field from JSONB
SELECT 
  p.full_name,
  ls.title,
  s.answers->>'question1' as answer_to_q1
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.deleted_at IS NULL
  AND s.answers ? 'question1';

-- Count submissions with specific answer
SELECT 
  COUNT(*) as count
FROM submissions
WHERE answers->>'status' = 'completed'
  AND deleted_at IS NULL;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Find duplicate submissions (should not exist due to unique constraint)
SELECT 
  teacher_id,
  session_id,
  COUNT(*) as count
FROM submissions
WHERE deleted_at IS NULL
GROUP BY teacher_id, session_id
HAVING COUNT(*) > 1;

-- Recent activity log
SELECT 
  'submission' as type,
  p.full_name as user,
  ls.title as item,
  s.status,
  s.updated_at
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.deleted_at IS NULL
ORDER BY s.updated_at DESC
LIMIT 20;

-- =====================================================
-- TESTING RLS POLICIES
-- =====================================================

-- Test as a specific user (in SQL Editor)
-- First, get a user ID
SELECT id, email FROM auth.users LIMIT 5;

-- Then test queries as that user
-- Note: This is for testing in SQL Editor only
-- SET request.jwt.claim.sub = '<user-uuid>';

-- Test teacher access (should only see their own)
-- SELECT * FROM submissions;

-- Test admin access (should see all)
-- SELECT * FROM submissions;

-- Reset to default
-- RESET request.jwt.claim.sub;
