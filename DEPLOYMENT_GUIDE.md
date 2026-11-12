# Project GROW - Deployment Guide

## Overview
This guide will help you deploy Project GROW online using Vercel (recommended) or other platforms.

---

## Option 1: Deploy to Vercel (Recommended - FREE)

Vercel is the easiest and fastest way to deploy Next.js apps. It's free for hobby projects.

### Prerequisites
- GitHub account
- Supabase project (already set up)
- Git installed on your computer

---

### Step 1: Push to GitHub

1. **Initialize Git** (if not already done):
```bash
cd "C:\Users\mchri\OneDrive\Desktop\Freelance\project-grow"
git init
git add .
git commit -m "Initial commit - Project GROW"
```

2. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Repository name: `project-grow` (or any name you prefer)
   - Make it Private (recommended)
   - Don't initialize with README (we already have code)
   - Click "Create repository"

3. **Push your code to GitHub**:
```bash
git remote add origin https://github.com/YOUR-USERNAME/project-grow.git
git branch -M main
git push -u origin main
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with your GitHub account
3. **Click "Add New"** → "Project"
4. **Import your GitHub repository** (`project-grow`)
5. **Configure the project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

6. **Add Environment Variables** - Click "Environment Variables" and add these:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Where to find these values?**
- Go to your Supabase project dashboard
- Click "Project Settings" (gear icon)
- Go to "API" section
- Copy:
  - `Project URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

7. **Click "Deploy"**

⏱️ Wait 2-3 minutes for the build to complete.

✅ Your app is now live at: `https://project-grow-xxx.vercel.app`

---

### Step 3: Configure Supabase for Production

1. **Go to Supabase Dashboard** → Your Project
2. **Go to Authentication** → "URL Configuration"
3. **Add your Vercel URL** to "Site URL": `https://your-app.vercel.app`
4. **Add to "Redirect URLs"**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/`

5. **Run the SQL migrations** (if not done yet):
   - Go to SQL Editor in Supabase
   - Run the following files in order:
     1. `supabase/schema.sql`
     2. `supabase/create-delete-function.sql`
     3. `supabase/create-save-functions.sql`
     4. `supabase/update-delete-to-hard-delete.sql`

---

### Step 4: Custom Domain (Optional)

Want to use your own domain like `projectgrow.com`?

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Settings" → "Domains"
   - Add your domain

2. **Follow Vercel's instructions** to update your DNS settings

---

## Option 2: Deploy to Netlify (Alternative)

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify

1. Go to https://netlify.com
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: (leave empty)

6. **Add Environment Variables**:
   - Go to "Site settings" → "Environment variables"
   - Add the same two variables as Vercel

7. Click "Deploy site"

---

## Option 3: Deploy to Railway (Alternative)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as above)
6. Deploy

---

## Testing Your Deployment

After deployment, test these features:

### 1. Admin Login
- Go to your deployed URL
- Try logging in as admin
- Check if you can:
  - ✅ Create LAC sessions
  - ✅ Lock/unlock sessions
  - ✅ View teacher submissions
  - ✅ Download forms (Word/PDF)

### 2. Teacher Login
- Create a teacher account
- Try logging in as teacher
- Check if you can:
  - ✅ See LAC sessions
  - ✅ Create drafts
  - ✅ Submit forms
  - ✅ Unsubmit forms
  - ✅ Delete forms
  - ✅ Download forms

### 3. Email Verification
- Test password reset
- Test email confirmation (if enabled)

---

## Troubleshooting

### Build Failed
**Error**: "Module not found" or dependency issues
**Fix**: 
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working
**Fix**:
- Check spelling of variable names
- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding variables

### Database Connection Failed
**Fix**:
- Verify Supabase URL and keys are correct
- Check Supabase project is not paused (free tier pauses after inactivity)
- Run SQL migrations in Supabase

### Authentication Issues
**Fix**:
- Check Redirect URLs in Supabase settings
- Make sure Site URL matches your deployed URL
- Check email templates are enabled in Supabase

---

## Updating Your App

When you make changes:

```bash
# Make your changes, then:
git add .
git commit -m "Describe your changes"
git push
```

Vercel/Netlify will automatically rebuild and deploy! 🚀

---

## Cost Breakdown

### Free Tier (Perfect for small schools):
- **Vercel**: Unlimited deployments, 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB file storage, 50,000 monthly active users
- **Total**: $0/month 💰

### If You Grow:
- **Vercel Pro**: $20/month (more bandwidth, better support)
- **Supabase Pro**: $25/month (8GB database, 100GB storage)
- **Total**: $45/month

---

## Monitoring Your App

### Vercel Dashboard:
- View deployments
- Check build logs
- Monitor performance
- View analytics

### Supabase Dashboard:
- Database usage
- API requests
- User count
- Storage usage

---

## Backup Strategy

### Automated Backups (Supabase):
- Free tier: Daily automated backups (7 days retention)
- Pro tier: Daily automated backups (14 days retention)

### Manual Backup:
```sql
-- In Supabase SQL Editor, export data:
-- 1. Go to Table Editor
-- 2. Select table → "..." menu → Export as CSV
-- 3. Save locally
```

---

## Security Checklist

✅ Environment variables are set correctly  
✅ `.env.local` is in `.gitignore` (never commit secrets!)  
✅ Supabase RLS policies are enabled  
✅ Only authorized URLs in Supabase redirect list  
✅ Use HTTPS (automatic with Vercel/Netlify)  
✅ Regular password updates for admin accounts  

---

## Next Steps

1. **Create your first admin user** in Supabase
2. **Test the entire workflow** (create session, submit forms, etc.)
3. **Share the URL** with your teachers
4. **Set up email notifications** (optional, in Supabase)
5. **Consider a custom domain** for professionalism

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

## Success! 🎉

Your Project GROW is now live and accessible to teachers anywhere, anytime!

**Your deployment URL**: `https://[your-project].vercel.app`

Share this URL with your teachers and start collecting LAC Form 4 submissions online!
