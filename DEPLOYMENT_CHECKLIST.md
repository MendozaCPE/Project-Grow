# 🚀 Quick Deployment Checklist

## Before You Deploy

### ✅ Local Testing
- [ ] App runs locally without errors (`npm run dev`)
- [ ] Admin can login and create sessions
- [ ] Teachers can login and submit forms
- [ ] Forms can be downloaded (Word & PDF)
- [ ] Supabase connection works

### ✅ Environment Variables Ready
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - copied from Supabase
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - copied from Supabase
- [ ] `.env.local` file exists locally (DO NOT commit this!)

### ✅ Database Setup
- [ ] Supabase project created
- [ ] All SQL files executed in this order:
  1. `supabase/schema.sql`
  2. `supabase/create-delete-function.sql`
  3. `supabase/create-save-functions.sql`
  4. `supabase/update-delete-to-hard-delete.sql`
- [ ] RLS policies enabled
- [ ] Test data created (1 admin, 1 teacher, 1 session)

---

## Deployment Steps

### 1. Push to GitHub
- [ ] Git initialized: `git init`
- [ ] Files staged: `git add .`
- [ ] First commit: `git commit -m "Initial commit"`
- [ ] GitHub repo created (private recommended)
- [ ] Pushed to GitHub: `git push -u origin main`

### 2. Deploy to Vercel
- [ ] Signed up at vercel.com
- [ ] Connected GitHub account
- [ ] Imported project from GitHub
- [ ] Added environment variables
- [ ] Clicked "Deploy"
- [ ] Deployment successful (check for green checkmark)

### 3. Configure Supabase
- [ ] Added Vercel URL to Supabase "Site URL"
- [ ] Added redirect URL: `https://your-app.vercel.app/auth/callback`
- [ ] Tested login on production

---

## Post-Deployment Testing

### Test as Admin
- [ ] Can access `/admin`
- [ ] Can create LAC session
- [ ] Can lock/unlock session
- [ ] Can view submissions
- [ ] Can download Word/PDF
- [ ] Can manage teachers

### Test as Teacher
- [ ] Can register new account
- [ ] Can login
- [ ] Can see LAC sessions
- [ ] Can create draft
- [ ] Can save draft (auto-save works)
- [ ] Can submit form
- [ ] Can unsubmit form
- [ ] Can delete form
- [ ] Can download Word/PDF
- [ ] Locked sessions show correctly

### Test Edge Cases
- [ ] Password reset works
- [ ] Email verification works (if enabled)
- [ ] Locked session prevents editing
- [ ] Deleted form disappears from admin
- [ ] Unsubmitted form goes back to draft
- [ ] "Not Submitted (Locked)" shows for missed deadlines

---

## Final Steps

### Share with Users
- [ ] Deployment URL shared with teachers
- [ ] Admin credentials created
- [ ] Teacher accounts created (or registration enabled)
- [ ] Instructions sent to all users

### Documentation
- [ ] README updated with live URL
- [ ] Admin guide created
- [ ] Teacher guide created (optional)

### Monitoring
- [ ] Vercel dashboard bookmarked
- [ ] Supabase dashboard bookmarked
- [ ] Email notifications set up (optional)

---

## Rollback Plan (If Something Goes Wrong)

1. **Check Vercel Deployment Logs**
   - Go to Vercel dashboard → Your project → Deployments
   - Click failed deployment → View logs

2. **Revert to Previous Deployment**
   - Vercel dashboard → Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

3. **Check Environment Variables**
   - Vercel → Settings → Environment Variables
   - Verify they match your local `.env.local`

4. **Test Locally Again**
   ```bash
   npm run build
   npm run start
   ```
   - If it works locally, issue is in Vercel config
   - If it fails locally, fix code first

---

## Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Build failed | Delete `node_modules`, run `npm install`, push again |
| Database error | Check Supabase URL and keys are correct |
| Login doesn't work | Verify redirect URLs in Supabase |
| Forms won't submit | Check RLS policies are enabled |
| Can't download PDF/Word | Check file generation works locally first |

---

## Success Metrics

After 1 week:
- [ ] All teachers can login
- [ ] At least 1 form submitted
- [ ] No major bugs reported
- [ ] Admin can manage sessions

After 1 month:
- [ ] Multiple sessions created
- [ ] Teachers actively submitting
- [ ] Download feature working
- [ ] No performance issues

---

## 🎉 You're Live!

**Production URL**: https://[your-project].vercel.app

**Admin Dashboard**: https://[your-project].vercel.app/admin

**Login Page**: https://[your-project].vercel.app/login

---

## Quick Commands Reference

```bash
# View deployment logs
vercel logs

# Redeploy
git push

# Check environment variables locally
cat .env.local

# Test build locally
npm run build
npm run start

# Push updates
git add .
git commit -m "Update description"
git push
```

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions!
