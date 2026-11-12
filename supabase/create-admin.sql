-- CREATE ADMIN ACCOUNT
-- 
-- OPTION 1: Upgrade an existing teacher account to admin
-- Replace 'admin@example.com' with the actual email address
-- 
UPDATE profiles
SET role = 'admin'
WHERE email IN (
  SELECT email 
  FROM auth.users 
  WHERE email = 'admin@example.com'
);

-- OPTION 2: Find a user by name and make them admin
-- Replace 'Admin Name' with the actual full name
-- 
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE full_name = 'Admin Name';

-- OPTION 3: View all users to find the one you want to make admin
-- 
SELECT 
  p.id,
  p.full_name,
  p.school,
  au.email,
  p.role,
  p.active
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC;

-- After running the SELECT query above, copy the ID of the user you want to make admin
-- Then run this query with the actual ID:
-- 
-- UPDATE profiles
-- SET role = 'admin'
-- WHERE id = 'paste-user-id-here';


-- VERIFY: Check who are the admins
SELECT 
  p.full_name,
  au.email,
  p.role,
  p.active
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.role = 'admin';
