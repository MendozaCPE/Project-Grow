# ✅ Pre-Deployment Check

Run through this checklist before deploying to make sure everything is ready.

---

## 1. Environment Setup ✅

### Check if .env.local exists and has correct values:

Open `.env.local` and verify you have:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxx...
```

**✅ If you have both, you're good!**  
**❌ If missing, copy from Supabase dashboard → API settings**

---

## 2. Test Locally ✅

Run these commands:

```powershell
# Install dependencies (if not done)
npm install

# Build the project
npm run build

# If build succeeds, you're ready!
```

**✅ Build succeeded → Ready to deploy!**  
**❌ Build failed → Fix errors first before deploying**

---

## 3. Supabase Database ✅

### Check if all SQL files are executed:

1. Go to Supabase dashboard → SQL Editor
2. Check if these tables exist (Table Editor):
   - ✅ `profiles`
   - ✅ `lac_sessions`
   - ✅ `submissions`

3. Check if these functions exist (Database → Functions):
   - ✅ `handle_new_user`
   - ✅ `soft_delete_submission`

**If any are missing, run the SQL files in order:**
1. `supabase/schema.sql`
2. `supabase/create-delete-function.sql`
3. `supabase/create-save-functions.sql`

---

## 4. Test Authentication ✅

Run your app locally:
```powershell
npm run dev
```

Open: http://localhost:3000

**Test these:**
- ✅ Can access login page
- ✅ Can register new account
- ✅ Can login as admin
- ✅ Can login as teacher
- ✅ Password reset works (check Supabase email templates)

---

## 5. Test Core Features ✅

**As Admin:**
- ✅ Create a LAC session
- ✅ Lock/unlock a session
- ✅ View submissions

**As Teacher:**
- ✅ See LAC sessions
- ✅ Create a draft form
- ✅ Submit a form
- ✅ Unsubmit a form
- ✅ Delete a form
- ✅ Download Word/PDF

**If all work locally, they'll work online!**

---

## 6. Git Ready ✅

Check if git is initialized:

```powershell
# In project folder
cd "C:\Users\mchri\OneDrive\Desktop\Freelance\project-grow"
git status
```

**✅ If you see git status, git is ready**  
**❌ If you see "not a git repository", run:**
```powershell
git init
```

---

## 7. GitHub Account ✅

**Do you have a GitHub account?**
- ✅ Yes → You're ready!
- ❌ No → Create one at https://github.com/join

---

## 8. Vercel Account ✅

**Do you have a Vercel account?**
- ✅ Yes → You're ready!
- ❌ No → You'll create one during deployment (uses GitHub login)

---

## 🎯 Ready to Deploy?

**If all items above are ✅, you're ready to deploy!**

Follow these guides:
1. **Quick Deploy (10 min)**: `QUICK_START_DEPLOYMENT.md`
2. **Detailed Guide**: `DEPLOYMENT_GUIDE.md`
3. **Step-by-step Checklist**: `DEPLOYMENT_CHECKLIST.md`

---

## ⚠️ Not Ready Yet?

### Common Issues:

**Build fails locally:**
```powershell
# Delete and reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

**Environment variables missing:**
- Copy from Supabase dashboard → Project Settings → API
- Create `.env.local` file in project root
- Add the two required variables

**Database tables missing:**
- Go to Supabase SQL Editor
- Run `schema.sql` file
- Then run other SQL files in order

**Can't login:**
- Check Supabase Auth is enabled
- Verify RLS policies are set up
- Check email templates are configured

---

## Quick Commands

```powershell
# Check if everything works
npm run build

# Start local dev server
npm run dev

# Check git status
git status

# Install dependencies
npm install
```

---

## Need Help?

1. Check error messages carefully
2. Verify `.env.local` has correct values
3. Make sure Supabase database is set up
4. Test locally before deploying

Once everything is ✅, proceed to deployment! 🚀
