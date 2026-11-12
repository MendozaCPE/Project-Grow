-- Create a function to handle hard delete that bypasses RLS issues
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
