# Authentication Setup Checklist

Use this checklist to verify your authentication system is properly configured.

## ☐ 1. Environment Configuration

```bash
# Check .env.local exists and has all required variables
cat .env.local
```

Required variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- [ ] `REGISTRATION_CODE` - Your chosen registration code (e.g., "GROW2026")

## ☐ 2. Database Setup

- [ ] Database schema applied (`supabase/schema.sql`)
- [ ] Profiles table exists
- [ ] LAC sessions table exists
- [ ] Submissions table exists
- [ ] Triggers created (check with SQL below)
- [ ] RLS policies enabled

**Verify triggers:**
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'prevent_teacher_role_change');
```

Should show both triggers as enabled.

## ☐ 3. Development Server

- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] App loads at http://localhost:3000
- [ ] No console errors in browser

## ☐ 4. Pages Accessible

Visit each page and verify it loads:

- [ ] http://localhost:3000/ (home)
- [ ] http://localhost:3000/register
- [ ] http://localhost:3000/login
- [ ] http://localhost:3000/forgot-password
- [ ] http://localhost:3000/reset-password (may need auth token)

## ☐ 5. Basic Registration Test

1. Go to `/register`
2. Fill in test data:
   - Full Name: Test Teacher
   - School: Test School
   - Email: test@example.com
   - Password: password123
   - Confirm: password123
   - Code: (your REGISTRATION_CODE)
3. Click "Create Account"

- [ ] No JavaScript errors
- [ ] Form submits successfully
- [ ] Redirected to login page
- [ ] Success message shown

## ☐ 6. Database Verification

After registration, check Supabase:

**In Authentication > Users:**
- [ ] New user appears
- [ ] Email matches

**In Table Editor > profiles:**
- [ ] New profile row exists
- [ ] `full_name` matches
- [ ] `school` matches
- [ ] `role` = 'teacher' (NOT admin!)
- [ ] `active` = true

## ☐ 7. Login Test

1. Go to `/login`
2. Enter credentials from registration
3. Click "Sign In"

- [ ] No errors
- [ ] Redirected to `/teacher`
- [ ] Dashboard shows user name
- [ ] Header shows "Logout" button

## ☐ 8. Create Admin Account

```sql
-- In Supabase SQL Editor
-- First register a new account (e.g., admin@example.com)
-- Then promote it:
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

- [ ] SQL runs successfully
- [ ] Check profiles table: role = 'admin'

## ☐ 9. Admin Login Test

1. Logout from teacher account
2. Login with admin account
3. Should redirect to `/admin`

- [ ] Redirected to admin dashboard
- [ ] See statistics (teachers, sessions, submissions)
- [ ] Header shows "Admin" role

## ☐ 10. Middleware Protection Test

While logged in as **teacher**:
1. Try to access http://localhost:3000/admin

- [ ] Automatically redirected to `/teacher`
- [ ] Never see admin dashboard

While logged in as **admin**:
1. Access http://localhost:3000/admin

- [ ] Admin dashboard loads successfully
- [ ] No redirect

## ☐ 11. Wrong Registration Code Test

1. Go to `/register`
2. Fill in valid data
3. Use wrong code: "WRONG_CODE"
4. Submit

- [ ] Error shown: "Invalid registration code..."
- [ ] No account created in Supabase

## ☐ 12. Logout Test

1. Click "Logout" button in header

- [ ] Redirected to `/login`
- [ ] Cannot access `/teacher` or `/admin` without logging in

## ☐ 13. Deactivated Account Test

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET active = false 
WHERE id = (SELECT id FROM auth.users WHERE email = 'test@example.com');
```

Try to login with deactivated account:

- [ ] Login fails
- [ ] Redirected to `/login?deactivated=true`
- [ ] Error message shown

## ☐ 14. Mobile Responsiveness

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select "iPhone SE" (375px width)
4. Check register and login pages

- [ ] All inputs visible and usable
- [ ] Buttons are large enough (48px+)
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Colors look good

## ☐ 15. Color Theme Verification

Check all pages have correct colors:

- [ ] Page background: `#FBF6E4` (soft yellow)
- [ ] Cards: `#FFFDF5` (lighter warm)
- [ ] Primary buttons: `#E3B23C`
- [ ] Button hover: `#C9962A`
- [ ] Text: `#2E2815` (dark brown)
- [ ] Colors are soft and warm (not bright)

## ☐ 16. Error Handling

Test various error scenarios:

- [ ] Wrong password → Friendly error
- [ ] Wrong email → Friendly error
- [ ] Duplicate email → Friendly error
- [ ] Weak password → Friendly error
- [ ] Password mismatch → Friendly error
- [ ] Empty fields → Validation error

## ☐ 17. Loading States

On each form:

- [ ] Button shows loading text when clicked
- [ ] Button is disabled during loading
- [ ] Form fields are disabled during loading

## ☐ 18. Header Display

When logged in:

- [ ] User's full name shows in header
- [ ] Role shows (Admin/Teacher)
- [ ] Logout button is visible
- [ ] Both logos display correctly

When logged out:

- [ ] Only logos and title show
- [ ] No user info or logout button

## ☐ 19. Navigation

Test navigation flow:

- [ ] Logged out user accessing `/teacher` → redirected to `/login`
- [ ] Logged out user accessing `/admin` → redirected to `/login`
- [ ] Logged in user accessing `/login` → redirected to dashboard
- [ ] Logged in user accessing `/register` → redirected to dashboard
- [ ] Home page with logged in user → redirected to appropriate dashboard

## ☐ 20. Password Reset (Optional - requires email config)

If SMTP is configured in Supabase:

1. Go to `/forgot-password`
2. Enter email
3. Check inbox for reset link
4. Click link
5. Reset password

- [ ] Email received
- [ ] Link works
- [ ] Redirected to `/reset-password`
- [ ] Can set new password
- [ ] Can login with new password

---

## ✅ All Checks Passed?

If all items above are checked, your authentication system is **ready for production**!

## 🚨 Issues Found?

See troubleshooting in `TESTING_AUTH.md` or:

1. Check environment variables
2. Re-run database schema
3. Clear browser cache/cookies
4. Check Supabase logs
5. Verify middleware.ts is in project root

## Next: Start Building Features

Now you can build:
- LAC session management
- Form submission interface
- Admin user management
- Reporting and analytics

---

**Setup Completed:** ___/___/___  
**Verified By:** _______________  
**Ready for Development:** ☐ Yes ☐ No
