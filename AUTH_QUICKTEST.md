# Quick Test Guide - 5 Minutes

Fast authentication test to verify everything works.

## Prerequisites

```bash
# 1. Start dev server
npm run dev

# 2. Verify environment
# Check .env.local has:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - REGISTRATION_CODE (e.g., "GROW2026")
```

## Quick Test (5 minutes)

### 1. Register a Teacher (1 min)

1. Go to: http://localhost:3000/register
2. Fill in:
   - Full Name: `Test Teacher`
   - School: `Test School`
   - Email: `teacher@test.com`
   - Password: `password123`
   - Confirm: `password123`
   - Code: (your REGISTRATION_CODE)
3. Click "Create Account"

**✅ Expected:** Redirected to login with success message

### 2. Login as Teacher (1 min)

1. Login with: `teacher@test.com` / `password123`

**✅ Expected:** 
- Redirected to `/teacher`
- See "Teacher Dashboard"
- Header shows name + "Logout" button

### 3. Create Admin (1 min)

In Supabase SQL Editor:

```sql
-- Register another account first (admin@test.com)
-- Then run this:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');
```

### 4. Login as Admin (1 min)

1. Logout
2. Login with: `admin@test.com` / `password123`

**✅ Expected:**
- Redirected to `/admin`
- See "Admin Dashboard" with statistics
- Header shows "Admin" role

### 5. Test Protection (1 min)

While logged in as teacher:

1. Try to access: http://localhost:3000/admin

**✅ Expected:** Redirected to `/teacher` (blocked!)

## Test Wrong Registration Code

1. Go to: http://localhost:3000/register
2. Use wrong code: `WRONG`

**✅ Expected:** Error: "Invalid registration code..."

## Test Deactivated Account

In Supabase SQL Editor:

```sql
UPDATE profiles 
SET active = false 
WHERE id = (SELECT id FROM auth.users WHERE email = 'teacher@test.com');
```

Try to login with `teacher@test.com`:

**✅ Expected:** Error: "Your account is deactivated..."

## Verify Database

In Supabase SQL Editor:

```sql
-- Should show all registered users
SELECT 
  u.email,
  p.full_name,
  p.school,
  p.role,
  p.active
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
```

**✅ Expected:**
- All registered users have profiles
- New users have `role = 'teacher'`
- Admins were manually promoted

## Quick Mobile Test

1. Press F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Select "iPhone SE"
3. Test login page

**✅ Expected:**
- Buttons are easy to tap (48px+)
- No horizontal scroll
- Colors: soft yellow background

## All Tests Pass? ✅

If all tests above pass, your authentication system is working correctly!

## Common Issues

**"Invalid registration code"**
→ Check `REGISTRATION_CODE` in `.env.local`

**"Account not found"**
→ Re-run `supabase/schema.sql` to create trigger

**Redirect loops**
→ Clear cookies, check Supabase keys in `.env.local`

**Profile not created**
→ Check trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

## Need More Details?

See `TESTING_AUTH.md` for comprehensive test scenarios.
