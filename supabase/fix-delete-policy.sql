-- Fix RLS policy for soft delete
-- The issue is that the WITH CHECK clause is preventing the deleted_at update

-- Drop the existing update policy
DROP POLICY IF EXISTS "Teachers can update own submissions" ON submissions;

-- Recreate with simpler logic that allows soft delete
CREATE POLICY "Teachers can update own submissions"
  ON submissions
  FOR UPDATE
  USING (
    auth.uid() = teacher_id
  )
  WITH CHECK (
    auth.uid() = teacher_id
  );
