# 🚀 Quick Start - Deploy in 10 Minutes

## What You Need
- GitHub account
- Vercel account (free)
- Your Supabase URL and key

---

## Step 1: Push to GitHub (2 minutes)

Open PowerShell in your project folder:

```powershell
cd "C:\Users\mchri\OneDrive\Desktop\Freelance\project-grow"

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Project GROW"
```

Now create a repository on GitHub:
1. Go to https://github.com/new
2. Name: `project-grow`
3. Make it **Private**
4. Click "Create repository"

Push your code:
```powershell
# Replace YOUR-USERNAME with your GitHub username
git remote add origin https://github.com/YOUR-USERNAME/project-grow.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel (5 minutes)

1. **Go to**: https://vercel.com
2. **Click**: "Sign up" → Use GitHub
3. **Click**: "Add New" → "Project"
4. **Select**: Your `project-grow` repository
5. **Click**: "Deploy"

Wait for it to say "Building..." then "Deploying..."

⏱️ Takes about 2-3 minutes

---

## Step 3: Add Environment Variables (2 minutes)

While it's building, add your Supabase credentials:

1. In Vercel, go to your project settings
2. Click "Environment Variables"
3. Add these two:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [your Supabase URL from .env.local]

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [your Supabase anon key from .env.local]
```

4. Click "Save"
5. Go back to "Deployments"
6. Click "Redeploy" (to use the new variables)

---

## Step 4: Update Supabase (1 minute)

1. Go to your Supabase dashboard
2. Go to "Authentication" → "URL Configuration"
3. Set **Site URL** to your Vercel URL: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`

---

## ✅ Done! Your App is Live!

**Your URL**: Check Vercel dashboard for your deployment URL

**Test it**:
1. Go to `https://your-app.vercel.app/login`
2. Try logging in
3. If it works, you're done! 🎉

---

## If Something Goes Wrong

### Can't login?
- Check environment variables are saved in Vercel
- Check Supabase redirect URLs match your Vercel URL

### Build failed?
- Check the error in Vercel deployment logs
- Make sure `npm run build` works locally first

### Database error?
- Verify your Supabase URL and key are correct
- Make sure SQL files are executed in Supabase

---

## Next Steps

1. Create your admin account in Supabase
2. Share the URL with teachers
3. Start using it!

---

## Update Your App Later

Make changes locally, then:

```powershell
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically rebuild and deploy! 🚀

---

**That's it!** Your Project GROW is now online and accessible worldwide! 🌍
