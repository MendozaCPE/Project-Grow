# Authentication Testing Guide

Complete guide to test all authentication features in Project GROW.

## Prerequisites

Before testing, ensure:

1. ✅ Supabase project is set up
2. ✅ Database schema is applied (`supabase/schema.sql`)
3. ✅ Environment variables are configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REGISTRATION_CODE` (e.g., "GROW2026")
4. ✅ Development server is running: `npm run dev`
5. ✅ App is accessible at http://localhost:3000

## Test Plan

### 1. Registration Flow (/register)

#### Test 1.1: Successful Registration

**Steps:**
1. Go to http://localhost:3000/register
2. Fill in the form:
   - Full Name: `Test Teacher`
   - School: `Test Elementary School`
   - Email: `teacher1@test.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Registration Code: (use the code from your `.env.local`)
3. Click "Create Account"

**Expected Result:**
- ✅ Redirected to `/login?registered=true`
- ✅ See success message: "Account created successfully! Please sign in."
- ✅ In Supabase dashboard → Authentication → Users: new user appears
- ✅ In Supabase dashboard → Table Editor → profiles: new profile with role='teacher'

#### Test 1.2: Wrong Registration Code

**Steps:**
1. Go to http://localhost:3000/register
2. Fill in all fields correctly
3. Registration Code: `WRONG_CODE`
4. Click "Create Account"

**Expected Result:**
- ❌ Error message: "Invalid registration code. Please contact your administrator."
- ❌ No account created
- ❌ User remains on registration page

#### Test 1.3: Password Mismatch

**Steps:**
1. Go to http://localhost:3000/register
2. Password: `password123`
3. Confirm Password: `password456`
4. Fill other fields correctly
5. Click "Create Account"

**Expected Result:**
- ❌ Error message: "Passwords do not match"
- ❌ No account created

#### Test 1.4: Weak Password

**Steps:**
1. Go to http://localhost:3000/register
2. Password: `1234567` (only 7 characters)
3. Fill other fields correctly
4. Click "Create Account"

**Expected Result:**
- ❌ Browser validation error (minLength=8)
- ❌ Or error message: "Password must be at least 8 characters long"

#### Test 1.5: Duplicate Email

**Steps:**
1. Register a user with `teacher1@test.com`
2. Try to register again with the same email

**Expected Result:**
- ❌ Error message: "This email is already registered. Please sign in instead."

#### Test 1.6: Profile Created by Trigger

**Steps:**
1. Register successfully
2. Go to Supabase → Table Editor → profiles
3. Find the newly created profile

**Expected Result:**
- ✅ Profile exists with correct `id` (matching auth.users)
- ✅ `full_name` matches what was entered
- ✅ `school` matches what was entered
- ✅ `role` = 'teacher' (NOT admin, always teacher)
- ✅ `active` = true

### 2. Login Flow (/login)

#### Test 2.1: Successful Teacher Login

**Steps:**
1. Register a teacher account (or use existing: `teacher1@test.com`)
2. Go to http://localhost:3000/login
3. Email: `teacher1@test.com`
4. Password: `password123`
5. Click "Sign In"

**Expected Result:**
- ✅ Redirected to `/teacher`
- ✅ See "Teacher Dashboard"
- ✅ See welcome message with full name
- ✅ Header shows user name and "Logout" button
- ✅ User info shows "Teacher" role

#### Test 2.2: Successful Admin Login

**Steps:**
1. Create an admin account:
   - Register as a teacher first
   - In Supabase SQL Editor, run:
     ```sql
     UPDATE profiles 
     SET role = 'admin' 
     WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');
     ```
2. Go to http://localhost:3000/login
3. Sign in with admin credentials

**Expected Result:**
- ✅ Redirected to `/admin`
- ✅ See "Admin Dashboard"
- ✅ See statistics (teachers, sessions, submissions)
- ✅ Header shows user name and "Logout" button
- ✅ User info shows "Admin" role

#### Test 2.3: Wrong Password

**Steps:**
1. Go to http://localhost:3000/login
2. Email: `teacher1@test.com`
3. Password: `wrongpassword`
4. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Invalid email or password. Please try again."
- ❌ User remains on login page

#### Test 2.4: Non-existent Email

**Steps:**
1. Go to http://localhost:3000/login
2. Email: `nonexistent@test.com`
3. Password: `anything`
4. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Invalid email or password. Please try again."

#### Test 2.5: Deactivated Account

**Steps:**
1. Deactivate a user account:
   ```sql
   UPDATE profiles 
   SET active = false 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'teacher1@test.com');
   ```
2. Try to log in with that account

**Expected Result:**
- ❌ Redirected to `/login?deactivated=true`
- ❌ Error message: "Your account is deactivated. Please contact the administrator."
- ❌ User is signed out

### 3. Role-Based Routing

#### Test 3.1: Teacher Cannot Access Admin

**Steps:**
1. Sign in as a teacher
2. Try to manually go to http://localhost:3000/admin

**Expected Result:**
- ✅ Middleware redirects to `/teacher`
- ✅ Teacher never sees admin dashboard

#### Test 3.2: Admin Can Access Admin

**Steps:**
1. Sign in as an admin
2. Go to http://localhost:3000/admin

**Expected Result:**
- ✅ Admin dashboard loads successfully
- ✅ See admin statistics

#### Test 3.3: Logged-In User Cannot Access Auth Pages

**Steps:**
1. Sign in as any user (teacher or admin)
2. Try to go to http://localhost:3000/login

**Expected Result:**
- ✅ Redirected to appropriate dashboard (`/teacher` or `/admin`)
- ✅ Cannot access login page while logged in

#### Test 3.4: Logged-Out User Cannot Access Protected Pages

**Steps:**
1. Sign out (or use incognito window)
2. Try to go to http://localhost:3000/teacher

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ Must log in to access

### 4. Forgot Password Flow (/forgot-password)

#### Test 4.1: Request Password Reset

**Steps:**
1. Go to http://localhost:3000/forgot-password
2. Email: `teacher1@test.com`
3. Click "Send Reset Link"

**Expected Result:**
- ✅ Success message: "If an account exists with that email, we've sent you a password reset link."
- ✅ Check email inbox for reset link
- ✅ Note: In Supabase dev, emails might not send. Check Supabase logs or configure SMTP.

#### Test 4.2: Click Reset Link

**Steps:**
1. Click the reset link from email
2. Should redirect to `/reset-password`

**Expected Result:**
- ✅ Redirected to reset password page
- ✅ See "Reset Password" form

### 5. Reset Password Flow (/reset-password)

#### Test 5.1: Successful Password Reset

**Steps:**
1. Access reset password page (via email link or manually after clicking reset link)
2. New Password: `newpassword123`
3. Confirm New Password: `newpassword123`
4. Click "Reset Password"

**Expected Result:**
- ✅ Redirected to `/login?reset=true`
- ✅ Success message: "Password reset successfully!"
- ✅ Can now log in with new password

#### Test 5.2: Password Mismatch on Reset

**Steps:**
1. Access reset password page
2. New Password: `newpassword123`
3. Confirm New Password: `different123`
4. Click "Reset Password"

**Expected Result:**
- ❌ Error message: "Passwords do not match"

### 6. Logout Functionality

#### Test 6.1: Teacher Logout

**Steps:**
1. Sign in as a teacher
2. Click "Logout" button in header

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ User is signed out
- ✅ Cannot access `/teacher` without logging in again

#### Test 6.2: Admin Logout

**Steps:**
1. Sign in as an admin
2. Click "Logout" button in header

**Expected Result:**
- ✅ Redirected to `/login`
- ✅ User is signed out
- ✅ Cannot access `/admin` without logging in again

### 7. UI/UX Testing

#### Test 7.1: Mobile Responsiveness

**Steps:**
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Expected Result:**
- ✅ All forms are readable and usable
- ✅ Buttons are at least 48px tall (easy to tap)
- ✅ Text is readable
- ✅ No horizontal scrolling
- ✅ Logo images display correctly

#### Test 7.2: Color Theme

**Check all pages:**
- ✅ Page background: `#FBF6E4` (soft warm yellow)
- ✅ Cards: `#FFFDF5` (lighter warm)
- ✅ Buttons: `#E3B23C` with hover `#C9962A`
- ✅ Text: `#2E2815` (dark brown)
- ✅ Colors are soft and easy on the eyes

#### Test 7.3: Input Fields

**Check all forms:**
- ✅ Inputs are at least 48px tall
- ✅ Clear focus states (yellow border)
- ✅ Placeholder text is visible
- ✅ Disabled state is clear (opacity 50%)

#### Test 7.4: Loading States

**Steps:**
1. Click any submit button
2. Observe the button while processing

**Expected Result:**
- ✅ Button shows loading text ("Signing in...", "Creating account...")
- ✅ Button is disabled during loading
- ✅ Cursor shows not-allowed on hover

#### Test 7.5: Error Messages

**Trigger various errors:**
- ✅ Errors appear in red boxes
- ✅ Text is clear and helpful
- ✅ Errors don't have technical jargon
- ✅ Errors guide user to fix the issue

## Database Verification

### Check Profile Creation

```sql
-- View all profiles
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.school,
  p.role,
  p.active,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;
```

**Expected:**
- ✅ Every registered user has a profile
- ✅ All new profiles have `role = 'teacher'`
- ✅ `full_name` and `school` match registration data

### Check Trigger Functionality

```sql
-- This should fail (teacher trying to change their own role)
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'teacher1@test.com');
```

**Expected:**
- ❌ Error: "Teachers cannot change their own role"

### Check RLS Policies

**As a teacher:**
```sql
-- Teachers should only see their own profile
SELECT * FROM profiles;
```

**Expected:**
- ✅ Only see own profile (when executed in teacher context)

## Common Issues & Solutions

### Issue: Registration code not working
**Solution:** Check `.env.local` has `REGISTRATION_CODE` set correctly

### Issue: Emails not sending
**Solution:** 
- Supabase free tier may have email restrictions
- Configure SMTP in Supabase → Project Settings → Auth → SMTP Settings
- Or use Supabase dashboard to verify users manually

### Issue: Middleware redirect loop
**Solution:** Check Supabase URL and keys are correct in `.env.local`

### Issue: Profile not created
**Solution:** 
- Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Re-run `supabase/schema.sql` if trigger is missing

### Issue: Cannot access admin dashboard
**Solution:**
- Verify user has `role = 'admin'` in profiles table
- Check middleware is not blocking the route

## Test Checklist

Copy this checklist for your test session:

- [ ] Register new teacher account
- [ ] Test wrong registration code
- [ ] Test password mismatch
- [ ] Test duplicate email
- [ ] Verify profile created with role='teacher'
- [ ] Login as teacher → redirects to /teacher
- [ ] Create admin user in database
- [ ] Login as admin → redirects to /admin
- [ ] Test wrong password
- [ ] Test deactivated account
- [ ] Teacher cannot access /admin
- [ ] Logout from teacher dashboard
- [ ] Logout from admin dashboard
- [ ] Test forgot password flow
- [ ] Test reset password flow
- [ ] Test mobile responsiveness (375px, 768px, 1920px)
- [ ] Verify all colors match theme
- [ ] Verify all inputs are 48px+ tall
- [ ] Test loading states on all forms
- [ ] Verify friendly error messages

## Success Criteria

All tests pass when:

✅ Registration creates teacher accounts only
✅ Registration code is validated on the server
✅ Teachers go to /teacher, admins go to /admin
✅ Deactivated users cannot log in
✅ Teachers cannot access /admin
✅ Logout works correctly
✅ Password reset works
✅ All forms are mobile-friendly (48px+ buttons)
✅ Color theme is consistent
✅ Error messages are friendly
✅ Profiles are created automatically by trigger
✅ Teachers cannot change their own role

---

**Testing Completed:** ___/___/___  
**Tester:** _______________  
**Issues Found:** _________  
**All Tests Passed:** ☐ Yes ☐ No
