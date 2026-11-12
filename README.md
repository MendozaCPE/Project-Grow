# Project GROW

Learning Action Cell (LAC) Form 4 Management System for DepEd Teachers

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Row Level Security)
- **Deployment**: Vercel

## Design System

- **Page Background**: `#FBF6E4` (soft warm yellow)
- **Card Background**: `#FFFDF5` (lighter warm white)
- **Primary Button**: `#E3B23C` with hover `#C9962A`
- **Selected State**: `#F3DC94`
- **Text Color**: `#2E2815` (dark brown)
- **Mobile-first**: Minimum 48px tap targets

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the `.env.local` file and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
REGISTRATION_CODE=your-secret-registration-code
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Project Settings > API
3. Run the database schema:
   - Navigate to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Click **Run** to execute
4. Create your first admin user (see `supabase/README.md`)
5. See comprehensive documentation:
   - `DATABASE.md` - Complete database documentation
   - `supabase/README.md` - Setup guide and common operations
   - `supabase/common-queries.sql` - SQL query reference

### 4. Replace Logo Images

Replace the placeholder logo files with your actual school logos:
- `/public/logo-1.png`
- `/public/logo-2.png`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
project-grow/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with Header
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles and theme
├── components/            # React components
│   └── Header.tsx         # App header with logos
├── lib/                   # Utility functions
│   └── supabase/         # Supabase client utilities
│       ├── client.ts     # Browser client
│       ├── server.ts     # Server client
│       └── middleware.ts # Auth middleware
├── public/               # Static assets
│   ├── logo-1.png       # School logo 1
│   └── logo-2.png       # School logo 2
└── middleware.ts         # Next.js middleware for auth

```

## Features

### Authentication
- Teachers register with a secret registration code
- All new accounts are teachers by default
- Admin role is set manually in the database
- Session management via Supabase Auth

### Authorization
- Teachers can only view and edit their own forms (enforced by RLS)
- Admins can view all teachers' forms
- Row Level Security policies protect data access

## Development

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Next Steps

- [ ] Create database schema for LAC Form 4
- [ ] Implement authentication pages (sign in, register)
- [ ] Build form creation and editing interface
- [ ] Set up Row Level Security policies
- [ ] Add admin dashboard
- [ ] Implement form submission and review workflow
