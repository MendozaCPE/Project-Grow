# Quick Start Guide

Get Project GROW up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git (optional)

## Step 1: Install Dependencies (2 min)

```bash
cd project-grow
npm install
```

## Step 2: Create Supabase Project (3 min)

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Fill in:
   - Name: `project-grow`
   - Database Password: (generate a strong password)
   - Region: (choose closest to your users)
4. Click **Create new project**
5. Wait for project to initialize (~2 minutes)

## Step 3: Get API Keys (1 min)

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ keep this secret!)

## Step 4: Configure Environment (1 min)

1. Open `.env.local` in your project
2. Replace the placeholders:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REGISTRATION_CODE=GROW2026
```

Choose a secure registration code that teachers will use to sign up.

## Step 5: Set Up Database (2 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

## Step 6: Run Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Project GROW welcome page!

## Step 7: Create Your First Admin (2 min)

### Option A: Via UI (Recommended)

1. Go to your local app at http://localhost:3000
2. Click **Register** (you'll build this later, for now use Supabase)
3. In Supabase dashboard, go to **Authentication** → **Users**
4. Click **Add user** → **Create new user**
   - Email: your-email@example.com
   - Password: (choose a strong password)
   - Confirm password
   - Click **Create user**

### Option B: Via SQL

1. First, sign up a user through the authentication flow
2. Go to Supabase **SQL Editor**
3. Run this query with your user's ID:

```sql
-- Get user ID first
SELECT id, email FROM auth.users;

-- Promote to admin
UPDATE profiles
SET role = 'admin'
WHERE id = '<copy-user-id-here>';
```

## Step 8: Test Admin Access (1 min)

1. Sign in to your app with the admin account
2. You should have access to admin features

## What's Next?

### Create Your First LAC Session

In Supabase SQL Editor:

```sql
INSERT INTO lac_sessions (session_no, session_date, title)
VALUES (1, '2026-11-15', 'Introduction to Learning Action Cell');
```

### Replace Logo Images

Replace these placeholder files with your actual school logos:
- `public/logo-1.png`
- `public/logo-2.png`

### Build Authentication Pages

Create these pages:
- `/app/login/page.tsx` - Sign in page
- `/app/register/page.tsx` - Teacher registration (with code validation)
- `/app/dashboard/page.tsx` - Teacher dashboard
- `/app/admin/page.tsx` - Admin dashboard

### Build Form Interface

Create pages for:
- Viewing available LAC sessions
- Creating/editing submissions
- Submitting forms
- Viewing submission history

## Troubleshooting

### "Failed to fetch" errors

**Problem:** Can't connect to Supabase
**Solution:** Check that your `.env.local` has the correct values and restart dev server

### "Permission denied" errors

**Problem:** RLS policies blocking access
**Solution:** 
1. Make sure you're signed in
2. Check that user has correct role in profiles table
3. Verify RLS policies were created (run schema.sql again if needed)

### "Duplicate key violation"

**Problem:** Trying to create second submission for same teacher+session
**Solution:** Update the existing submission instead of creating a new one

### Build errors

**Problem:** TypeScript or build errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Database not initialized

**Problem:** Tables don't exist
**Solution:** Re-run `supabase/schema.sql` in SQL Editor

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production build
npm run lint         # Run ESLint

# Database
# (Run these in Supabase SQL Editor)
# See supabase/common-queries.sql for more examples
```

## Project Structure

```
project-grow/
├── app/                      # Next.js pages
│   ├── layout.tsx           # Root layout with header
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # React components
│   └── Header.tsx           # App header
├── lib/                     # Utilities
│   ├── database.types.ts    # TypeScript types
│   └── supabase/            # Supabase clients
│       ├── client.ts        # Browser client
│       ├── server.ts        # Server client
│       ├── queries.ts       # Database queries
│       └── middleware.ts    # Auth middleware
├── supabase/                # Database files
│   ├── schema.sql           # Database schema
│   ├── common-queries.sql   # SQL reference
│   └── README.md            # Database docs
├── public/                  # Static files
│   ├── logo-1.png          # School logo 1
│   └── logo-2.png          # School logo 2
├── .env.local              # Environment variables (create this)
└── middleware.ts           # Next.js middleware
```

## Documentation

- **README.md** - Project overview
- **DATABASE.md** - Complete database documentation
- **supabase/README.md** - Database setup guide
- **supabase/common-queries.sql** - SQL query examples
- **lib/supabase/actions.example.ts** - Server Actions examples

## Getting Help

1. Check **DATABASE.md** for database questions
2. Check **supabase/README.md** for setup issues
3. Look at **lib/supabase/queries.ts** for query examples
4. Review **supabase/common-queries.sql** for SQL reference

## Security Reminders

✅ **DO:**
- Keep `.env.local` secret and never commit it
- Use the anon key in client-side code
- Use the service role key only in server-side code
- Test RLS policies thoroughly

❌ **DON'T:**
- Expose service role key to the client
- Commit `.env.local` to version control
- Disable RLS policies
- Trust client-side data without validation

## Next Steps

Now that you're up and running:

1. ✅ Environment is configured
2. ✅ Database is set up
3. ✅ Admin user created
4. ⬜ Build authentication pages
5. ⬜ Create LAC session management
6. ⬜ Build form submission interface
7. ⬜ Add admin dashboard
8. ⬜ Test with real users
9. ⬜ Deploy to Vercel

Good luck building Project GROW! 🌱
