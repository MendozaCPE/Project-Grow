# Supabase Database Setup

This directory contains the SQL schema and migrations for Project GROW.

## Quick Start

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `schema.sql`
5. Click **Run** to execute the SQL

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## Database Schema

### Tables

#### `profiles`
- Extends `auth.users` with application-specific data
- Automatically created when a user signs up (via trigger)
- Fields: `id`, `full_name`, `school`, `role`, `active`
- Default role is always `teacher`

#### `lac_sessions`
- Stores LAC (Learning Action Cell) session information
- Fields: `id`, `session_date`, `session_no`, `title`, `locked`
- When `locked = true`, teachers cannot create/modify submissions

#### `submissions`
- Stores teacher submissions for each LAC session
- Fields: `id`, `teacher_id`, `session_id`, `answers` (JSONB), `status`, `deleted_at`
- Unique constraint on `(teacher_id, session_id)` - one submission per teacher per session
- Soft delete via `deleted_at` timestamp

## Row Level Security (RLS)

### Profiles
- ✅ Users can view and update their own profile
- ✅ Admins can view and update all profiles
- ❌ Teachers **cannot** change their own role (enforced by trigger)

### LAC Sessions
- ✅ All authenticated users can read sessions
- ✅ Only admins can create, update, or delete sessions

### Submissions
- ✅ Teachers can read/create/update their own submissions
- ❌ Teachers **cannot** modify submissions for locked sessions
- ❌ Teachers **cannot** access soft-deleted submissions
- ✅ Admins have full access to all submissions

## Creating an Admin User

Admin users must be promoted manually in the database:

1. Have the user sign up normally through the app
2. Get their user ID from the Supabase dashboard (Authentication > Users)
3. Run this SQL in the SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = '<user-uuid>';
```

Alternatively, use the service role key from your backend:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role bypasses RLS
)

await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', userId)
```

## Triggers

### `on_auth_user_created`
- Fires when a new user signs up
- Automatically creates a profile with `role = 'teacher'`
- Pulls `full_name` and `school` from user metadata

### `prevent_teacher_role_change`
- Prevents teachers from changing their own role to admin
- Only admins can change user roles

### `update_*_updated_at`
- Automatically updates the `updated_at` timestamp on record changes

## Testing RLS Policies

You can test RLS policies in the SQL Editor by setting the current user:

```sql
-- Impersonate a specific user
SELECT auth.uid(); -- Returns current user
SET request.jwt.claim.sub = '<user-uuid>'; -- Set user context

-- Test queries as that user
SELECT * FROM submissions;
```

## Common Queries

### Get all submissions for a teacher
```sql
SELECT 
  s.*,
  ls.title as session_title,
  ls.session_no,
  ls.locked as session_locked
FROM submissions s
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.teacher_id = '<user-uuid>'
  AND s.deleted_at IS NULL
ORDER BY ls.session_no;
```

### Get all teachers and their submission counts
```sql
SELECT 
  p.full_name,
  p.school,
  COUNT(s.id) as total_submissions,
  COUNT(CASE WHEN s.status = 'submitted' THEN 1 END) as submitted_count
FROM profiles p
LEFT JOIN submissions s ON p.id = s.teacher_id AND s.deleted_at IS NULL
WHERE p.role = 'teacher' AND p.active = true
GROUP BY p.id, p.full_name, p.school
ORDER BY p.full_name;
```

### Lock/unlock a session
```sql
-- Lock a session (prevents further edits)
UPDATE lac_sessions
SET locked = true
WHERE session_no = 1;

-- Unlock a session
UPDATE lac_sessions
SET locked = false
WHERE session_no = 1;
```

## Backup and Migration

To export your schema:
```bash
supabase db dump -f backup.sql
```

To restore:
```bash
psql your-database-url < backup.sql
```

## Security Notes

1. **Never expose the service role key** to the client
2. RLS policies are enforced at the database level
3. Teachers cannot escalate privileges due to trigger protection
4. All soft-deleted records remain in the database (consider periodic cleanup)
5. Locked sessions prevent any modifications by teachers
