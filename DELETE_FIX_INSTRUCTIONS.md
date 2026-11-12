# Hard Delete Implementation

## Summary
Changed the submission delete functionality from **soft delete** (marking records with `deleted_at` timestamp) to **hard delete** (completely removing records from the database).

## Problem
When a teacher deleted a submitted form, it was only marked as deleted (soft delete) but remained in the database. This prevented teachers from creating a new submission for the same session due to the `UNIQUE(teacher_id, session_id)` constraint.

## Solution
Changed to hard delete - submissions are now completely removed from the database when deleted.

## Database Changes Required

Run this SQL in your Supabase SQL Editor:

```sql
-- Update the soft_delete_submission function to perform hard delete
CREATE OR REPLACE FUNCTION soft_delete_submission(submission_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  submission_record RECORD;
BEGIN
  -- Check if submission exists and get its details
  SELECT s.*, ls.locked 
  INTO submission_record
  FROM submissions s
  JOIN lac_sessions ls ON s.session_id = ls.id
  WHERE s.id = submission_uuid
  AND s.teacher_id = auth.uid();

  -- If no record found, user doesn't own it
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or you do not have permission to delete it';
  END IF;

  -- Check if session is locked
  IF submission_record.locked THEN
    RAISE EXCEPTION 'Cannot delete - session is locked';
  END IF;

  -- Perform the hard delete (completely remove the record)
  DELETE FROM submissions
  WHERE id = submission_uuid;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION soft_delete_submission(UUID) TO authenticated;
```

## Code Changes Made

### 1. Database Function
- **File**: `supabase/create-delete-function.sql`
- Changed from `UPDATE submissions SET deleted_at = NOW()` to `DELETE FROM submissions`
- Removed `deleted_at IS NULL` check

### 2. Query Functions
- **File**: `lib/supabase/queries.ts`
- Removed `.is('deleted_at', null)` filters from all submission queries
- Changed `softDeleteSubmission` to use hard delete

### 3. Component Updates
- **Files**: 
  - `app/teacher/page.tsx`
  - `app/teacher/form/[sessionId]/page.tsx`
  - `app/teacher/form/[sessionId]/DocumentView.tsx`
  - `app/admin/page.tsx`
  - `app/admin/SessionsList.tsx`
  - `app/admin/sessions/[sessionId]/SubmissionsList.tsx`
- Removed all references to `deleted_at` field
- Removed "Deleted by teacher" badges and indicators
- Removed `isDeleted` props and checks

## Benefits
1. ✅ Teachers can now delete and recreate submissions for the same session
2. ✅ Cleaner database without orphaned "deleted" records
3. ✅ Simpler codebase without soft delete complexity
4. ✅ No confusion about deleted vs active submissions in admin views

## Testing Steps
1. Run the SQL update in Supabase
2. Restart your Next.js development server
3. As a teacher:
   - Submit a form for a session
   - Delete it
   - Try creating a new form for the same session (should work now)
4. As an admin:
   - Verify deleted submissions don't show up anymore
   - Verify submission counts are accurate

## Notes
- Function name `soft_delete_submission` was kept for backward compatibility (to avoid breaking existing code)
- Locked sessions still prevent deletion
- Only submission owners can delete their own submissions
