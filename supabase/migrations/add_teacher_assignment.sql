-- Add teacher assignment fields to lac_sessions table
ALTER TABLE lac_sessions 
ADD COLUMN IF NOT EXISTS assigned_teachers UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS send_to_all BOOLEAN NOT NULL DEFAULT true;

-- Update existing sessions to send to all teachers
UPDATE lac_sessions 
SET send_to_all = true 
WHERE send_to_all IS NULL;

-- Add comment
COMMENT ON COLUMN lac_sessions.assigned_teachers IS 'Array of teacher IDs who can access this session (when send_to_all is false)';
COMMENT ON COLUMN lac_sessions.send_to_all IS 'If true, all active teachers can see the session. If false, only assigned_teachers can see it';
