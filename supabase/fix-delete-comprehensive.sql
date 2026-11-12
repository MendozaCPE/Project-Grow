-- Comprehensive fix for delete issue
-- Drop ALL existing UPDATE policies on submissions table

DROP POLICY IF EXISTS "Teachers can update own submissions" ON submissions;
DROP POLICY IF EXISTS "Teachers can soft delete own submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update any submission" ON submissions;

-- Recreate policies with proper permissions

-- 1. Teachers can update their own submissions (including soft delete)
CREATE POLICY "Teachers can update own submissions"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- 2. Admins can update any submission
CREATE POLICY "Admins can update any submission"
  ON submissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
