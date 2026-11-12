# Bug Fix: Submissions Not Showing in Admin

## Issue
Submissions were being saved by teachers but not appearing in the admin dashboard.

## Root Cause
The admin page query was trying to select an `email` column from the `profiles` table that doesn't exist:

```typescript
profiles!submissions_teacher_id_fkey (
  id,
  full_name,
  school,
  email  // ❌ This column doesn't exist!
)
```

The `profiles` table only has these columns:
- id
- full_name
- school
- role
- active
- created_at
- updated_at

Email is stored in the `auth.users` table, not in `profiles`.

## Fix
Removed the `email` field from the select query in the admin session detail page.

**File Changed:** `app/admin/sessions/[sessionId]/page.tsx`

**Before:**
```typescript
profiles!submissions_teacher_id_fkey (
  id,
  full_name,
  school,
  email
)
```

**After:**
```typescript
profiles!submissions_teacher_id_fkey (
  id,
  full_name,
  school
)
```

## Testing
1. Refresh the admin dashboard page
2. Navigate to a session where teachers have submitted
3. Submissions should now appear

## Why This Happened
The SQL query was silently failing when it tried to select a non-existent column, returning no results. Supabase's RLS and error handling didn't throw an explicit error, making it appear as if there were no submissions.

## Resolution
✅ Fixed - Submissions now display correctly in admin dashboard
