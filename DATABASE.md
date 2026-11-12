# Database Documentation

## Overview

Project GROW uses Supabase (PostgreSQL) with Row Level Security (RLS) for data access control. The database enforces role-based permissions at the database level, ensuring teachers can only access their own data while admins have full access.

## Schema Summary

### Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profiles extending auth.users | Auto-created on signup, role protection |
| `lac_sessions` | LAC Form 4 sessions | Admin-only management, lockable |
| `submissions` | Teacher form submissions | Soft deletes, JSONB answers, unique per teacher+session |

## Table Details

### `profiles`

Stores user profile information and roles.

**Columns:**
- `id` (UUID, PK) - References auth.users(id)
- `full_name` (TEXT) - User's full name
- `school` (TEXT) - School affiliation
- `role` (TEXT) - Either 'admin' or 'teacher', default 'teacher'
- `active` (BOOLEAN) - Account active status, default true
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:**
- Role can only be 'admin' or 'teacher'
- Teachers **cannot** change their own role (enforced by trigger)

**RLS Policies:**
- Users can view and update their own profile
- Admins can view and update all profiles
- Only admins can create or delete profiles

### `lac_sessions`

Stores Learning Action Cell session information.

**Columns:**
- `id` (UUID, PK)
- `session_date` (DATE) - When the session takes place
- `session_no` (INTEGER, UNIQUE) - Sequential session number
- `title` (TEXT) - Session title/description
- `locked` (BOOLEAN) - When true, prevents teacher edits, default false
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:**
- `session_no` must be unique

**RLS Policies:**
- All authenticated users can read sessions
- Only admins can create, update, or delete sessions

**Locking Behavior:**
When `locked = true`:
- Teachers cannot create new submissions for this session
- Teachers cannot update existing submissions for this session
- Admins can still modify everything

### `submissions`

Stores teacher submissions for LAC sessions.

**Columns:**
- `id` (UUID, PK)
- `teacher_id` (UUID, FK) - References profiles(id)
- `session_id` (UUID, FK) - References lac_sessions(id)
- `answers` (JSONB) - Form answers in flexible JSON format
- `status` (TEXT) - Either 'draft' or 'submitted', default 'draft'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP, nullable) - Soft delete timestamp

**Constraints:**
- Unique constraint on `(teacher_id, session_id)` - one submission per teacher per session
- Status can only be 'draft' or 'submitted'

**RLS Policies:**
- Teachers can read their own non-deleted submissions
- Teachers can create submissions (only if session not locked)
- Teachers can update their own submissions (only if not deleted and session not locked)
- Admins can do everything

**Soft Delete:**
Instead of hard deletes, submissions are marked with `deleted_at`. Deleted submissions:
- Are not visible to teachers
- Are still visible to admins
- Cannot be modified by teachers

## Triggers

### `on_auth_user_created`

**When:** After a new user signs up in auth.users
**Action:** Automatically creates a profile row with:
- `id` from new user
- `full_name` from user metadata
- `school` from user metadata
- `role` = 'teacher' (always)

**Usage:** Include full_name and school in signup metadata:

```typescript
await supabase.auth.signUp({
  email: email,
  password: password,
  options: {
    data: {
      full_name: 'Juan Dela Cruz',
      school: 'Sampaguita Elementary School'
    }
  }
})
```

### `prevent_teacher_role_change`

**When:** Before updating a profile
**Action:** Prevents non-admins from changing their own role
**Result:** Teachers attempting to set `role = 'admin'` will receive an error

### `update_*_updated_at`

**When:** Before updating profiles, lac_sessions, or submissions
**Action:** Automatically sets `updated_at = NOW()`

## Functions

### `is_admin()`

Returns `true` if the current user has role = 'admin', otherwise `false`.

**Usage in SQL:**
```sql
SELECT * FROM submissions WHERE is_admin() OR teacher_id = auth.uid();
```

**Usage in TypeScript:**
```typescript
const { data } = await supabase.rpc('is_admin')
```

## Common Workflows

### Teacher Workflow

1. **Sign Up**
   - User signs up with email/password + registration code
   - Profile automatically created with role = 'teacher'

2. **View Sessions**
   - Teacher can see all LAC sessions
   - Can identify which sessions are locked

3. **Create Submission**
   - Choose a non-locked session
   - Create submission with status = 'draft'
   - Answers stored as JSONB (flexible structure)

4. **Edit Draft**
   - Update answers while status = 'draft'
   - Can save multiple times

5. **Submit**
   - Change status to 'submitted'
   - Can still edit if session not locked

6. **Delete Submission**
   - Soft delete by setting deleted_at
   - Cannot delete if session is locked

### Admin Workflow

1. **Promote to Admin**
   - Manually update profile: `UPDATE profiles SET role = 'admin' WHERE id = '...'`
   - Or use service role key from backend

2. **Manage Sessions**
   - Create new LAC sessions
   - Edit session details
   - Lock sessions to prevent further teacher edits
   - Delete sessions (cascades to submissions)

3. **View All Submissions**
   - See submissions from all teachers
   - View soft-deleted submissions
   - Export data for reports

4. **Manage Users**
   - View all profiles
   - Deactivate users
   - Change roles (promote/demote)

## Security

### Row Level Security (RLS)

All tables have RLS enabled. Policies are enforced at the database level, so even if your application code has a bug, unauthorized access is prevented.

**Key Security Features:**

1. **Teachers cannot escalate privileges**
   - Trigger prevents role changes
   - Cannot access other teachers' data

2. **Session locking prevents tampering**
   - Once locked, teachers cannot modify
   - Admins can still access

3. **Soft deletes preserve data**
   - Teachers cannot hard delete
   - Data retained for auditing

4. **JSONB answers are flexible but type-safe**
   - Store any structure
   - Validate on application layer

### Service Role vs Anon Key

**Anon Key** (NEXT_PUBLIC_SUPABASE_ANON_KEY):
- Used in client-side code
- RLS policies enforced
- Safe to expose publicly

**Service Role Key** (SUPABASE_SERVICE_ROLE_KEY):
- Bypasses RLS
- Used for admin operations
- **Never expose to client**
- Only use in server-side code

## Indexes

Performance indexes are created on:
- `profiles.role`
- `profiles.active`
- `submissions.teacher_id`
- `submissions.session_id`
- `submissions.status`
- `submissions.deleted_at`
- `lac_sessions.session_date`
- `lac_sessions.locked`

## JSONB Answers Structure

The `answers` column uses JSONB for flexibility. Example structure:

```json
{
  "question1": "My answer to question 1",
  "question2": "My answer to question 2",
  "reflection": "Overall reflection",
  "attachments": [
    {
      "filename": "document.pdf",
      "url": "https://..."
    }
  ]
}
```

You can query JSONB fields:

```sql
-- Find submissions mentioning "pedagogy"
SELECT * FROM submissions 
WHERE answers::text ILIKE '%pedagogy%';

-- Get a specific answer field
SELECT answers->'question1' as answer 
FROM submissions 
WHERE id = '...';
```

## Backup and Maintenance

### Regular Backups

Supabase automatically backs up your database. For additional safety:

```bash
# Export schema and data
supabase db dump -f backup.sql

# Export data only
supabase db dump --data-only -f data-backup.sql
```

### Cleaning Soft Deletes

Periodically clean old soft-deleted records:

```sql
-- Delete submissions soft-deleted more than 90 days ago
DELETE FROM submissions
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '90 days';
```

### Monitoring

Watch for:
- Locked sessions (might need unlocking)
- Inactive users (consider archiving)
- Draft submissions (teachers might need reminders)

```sql
-- Find old drafts (> 30 days)
SELECT 
  p.full_name,
  ls.title,
  s.created_at
FROM submissions s
JOIN profiles p ON s.teacher_id = p.id
JOIN lac_sessions ls ON s.session_id = ls.id
WHERE s.status = 'draft'
  AND s.deleted_at IS NULL
  AND s.created_at < NOW() - INTERVAL '30 days'
ORDER BY s.created_at;
```

## Migration Guide

### Initial Setup

1. Run `supabase/schema.sql` in SQL Editor
2. Verify tables created: `\dt` in SQL Editor
3. Test RLS: Try queries as different users
4. Create first admin user manually

### Future Changes

When modifying schema:

1. Create a new migration file
2. Test in development first
3. Document changes in comments
4. Update TypeScript types
5. Run migration in production

Example migration:

```sql
-- migrations/002_add_session_description.sql
ALTER TABLE lac_sessions
ADD COLUMN description TEXT;

-- Update existing records
UPDATE lac_sessions
SET description = 'No description provided'
WHERE description IS NULL;
```

## Troubleshooting

### "Permission denied for table"

**Cause:** RLS policy blocking access
**Solution:** Check if user has correct role, session is not locked, submission not deleted

### "Duplicate key violation"

**Cause:** Trying to create second submission for same teacher+session
**Solution:** Update existing submission instead of creating new one

### "Cannot change role"

**Cause:** Teacher trying to promote themselves to admin
**Solution:** This is intentional. Use service role key from backend or SQL Editor

### "Session is locked"

**Cause:** Trying to modify submission for a locked session
**Solution:** Admin must unlock the session first

## Performance Tips

1. **Use select() wisely:** Only fetch columns you need
2. **Batch operations:** Group multiple updates when possible
3. **Index usage:** Queries on indexed columns are faster
4. **JSONB queries:** Keep JSONB structures reasonably sized
5. **Pagination:** Use `range()` for large result sets

```typescript
// Good: Specific columns
const { data } = await supabase
  .from('submissions')
  .select('id, status, created_at')
  .limit(20)

// Better: With pagination
const { data } = await supabase
  .from('submissions')
  .select('id, status, created_at')
  .range(0, 19) // First 20 records
```
