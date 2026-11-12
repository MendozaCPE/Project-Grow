-- Debug query to check submissions
-- Run this in Supabase SQL Editor to see what's in the database

-- 1. Check if there are ANY submissions at all
SELECT COUNT(*) as total_submissions FROM submissions;

-- 2. Check submissions with teacher details
SELECT 
  s.id,
  s.teacher_id,
  s.session_id,
  s.status,
  s.deleted_at,
  s.created_at,
  s.updated_at,
  p.full_name as teacher_name,
  p.email
FROM submissions s
LEFT JOIN profiles p ON s.teacher_id = p.id
ORDER BY s.created_at DESC;

-- 3. Check if the session exists
SELECT * FROM lac_sessions;

-- 4. Check profiles
SELECT 
  id,
  full_name,
  email,
  role,
  active
FROM profiles
ORDER BY created_at DESC;

-- 5. Check for the specific session (replace with your session ID from URL)
-- SELECT * FROM submissions WHERE session_id = 'your-session-id-here';

-- 6. Check auth.users table
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;
