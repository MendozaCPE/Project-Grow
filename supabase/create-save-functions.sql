-- Create functions to handle form save/submit that bypass RLS issues

-- Function to save draft
CREATE OR REPLACE FUNCTION save_form_draft(
  p_session_id UUID,
  p_answers JSONB,
  p_submission_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_session_locked BOOLEAN;
BEGIN
  -- Check if session exists and is not locked
  SELECT locked INTO v_session_locked
  FROM lac_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_session_locked THEN
    RAISE EXCEPTION 'Session is locked and cannot be edited';
  END IF;

  -- If submission_id provided, update existing
  IF p_submission_id IS NOT NULL THEN
    UPDATE submissions
    SET 
      answers = p_answers,
      updated_at = NOW()
    WHERE id = p_submission_id
      AND teacher_id = auth.uid()
      AND deleted_at IS NULL
    RETURNING id INTO v_submission_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Submission not found or you do not have permission';
    END IF;
  ELSE
    -- Insert new submission or update if exists (upsert)
    INSERT INTO submissions (teacher_id, session_id, answers, status)
    VALUES (auth.uid(), p_session_id, p_answers, 'draft')
    ON CONFLICT (teacher_id, session_id) 
    DO UPDATE SET
      answers = EXCLUDED.answers,
      updated_at = NOW(),
      deleted_at = NULL
    WHERE submissions.deleted_at IS NULL
    RETURNING id INTO v_submission_id;
  END IF;

  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to submit form
CREATE OR REPLACE FUNCTION submit_form(
  p_session_id UUID,
  p_answers JSONB,
  p_submission_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_session_locked BOOLEAN;
BEGIN
  -- Check if session exists and is not locked
  SELECT locked INTO v_session_locked
  FROM lac_sessions
  WHERE id = p_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_session_locked THEN
    RAISE EXCEPTION 'Session is locked and cannot be edited';
  END IF;

  -- If submission_id provided, update existing
  IF p_submission_id IS NOT NULL THEN
    UPDATE submissions
    SET 
      answers = p_answers,
      status = 'submitted',
      updated_at = NOW()
    WHERE id = p_submission_id
      AND teacher_id = auth.uid()
      AND deleted_at IS NULL
    RETURNING id INTO v_submission_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Submission not found or you do not have permission';
    END IF;
  ELSE
    -- Insert new submission or update if exists (upsert)
    INSERT INTO submissions (teacher_id, session_id, answers, status)
    VALUES (auth.uid(), p_session_id, p_answers, 'submitted')
    ON CONFLICT (teacher_id, session_id) 
    DO UPDATE SET
      answers = EXCLUDED.answers,
      status = 'submitted',
      updated_at = NOW(),
      deleted_at = NULL
    WHERE submissions.deleted_at IS NULL
    RETURNING id INTO v_submission_id;
  END IF;

  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION save_form_draft(UUID, JSONB, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_form(UUID, JSONB, UUID) TO authenticated;
