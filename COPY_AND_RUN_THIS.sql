-- =====================================================
-- 🚀 PROJECT GROW - SESSION MANAGEMENT UPDATE
-- =====================================================
-- Copy this ENTIRE file and run it in Supabase SQL Editor
-- This will add all new features for session management
-- =====================================================

-- Step 1: Add new columns
ALTER TABLE lac_sessions 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Region IV - CALABARZON',
ADD COLUMN IF NOT EXISTS division TEXT DEFAULT 'Batangas',
ADD COLUMN IF NOT EXISTS assigned_teachers UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS send_to_all BOOLEAN DEFAULT true;

-- Step 2: Populate session_id for existing records
UPDATE lac_sessions 
SET session_id = 'LAC-' || session_no::TEXT 
WHERE session_id IS NULL;

-- Step 3: Ensure region and division have values
UPDATE lac_sessions 
SET region = 'Region IV - CALABARZON'
WHERE region IS NULL;

UPDATE lac_sessions 
SET division = 'Batangas'
WHERE division IS NULL;

-- Step 4: Ensure send_to_all is true for existing sessions
UPDATE lac_sessions 
SET send_to_all = true
WHERE send_to_all IS NULL;

-- Step 5: Make columns NOT NULL
ALTER TABLE lac_sessions 
ALTER COLUMN session_id SET NOT NULL,
ALTER COLUMN region SET NOT NULL,
ALTER COLUMN division SET NOT NULL,
ALTER COLUMN send_to_all SET NOT NULL;

-- Step 6: Add unique constraint on session_id (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lac_sessions_session_id_unique'
    ) THEN
        ALTER TABLE lac_sessions 
        ADD CONSTRAINT lac_sessions_session_id_unique UNIQUE (session_id);
    END IF;
END $$;

-- Step 7: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_lac_sessions_send_to_all 
ON lac_sessions(send_to_all);

CREATE INDEX IF NOT EXISTS idx_lac_sessions_assigned_teachers 
ON lac_sessions USING GIN(assigned_teachers);

-- Step 8: Add helpful documentation
COMMENT ON COLUMN lac_sessions.session_id IS 'Unique custom identifier (e.g., LAC-2024-001)';
COMMENT ON COLUMN lac_sessions.region IS 'Region where session is conducted (editable by admin and teachers)';
COMMENT ON COLUMN lac_sessions.division IS 'Division/district (editable by admin and teachers)';
COMMENT ON COLUMN lac_sessions.send_to_all IS 'If true, all teachers can see this session';
COMMENT ON COLUMN lac_sessions.assigned_teachers IS 'Teacher IDs who can access (when send_to_all is false)';

-- =====================================================
-- ✅ MIGRATION COMPLETE
-- =====================================================
-- Run this query to verify success:

SELECT 
  'Migration Successful!' as status,
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE send_to_all = true) as sessions_sent_to_all,
  COUNT(*) FILTER (WHERE session_id IS NOT NULL) as sessions_with_id
FROM lac_sessions;

-- You should see all sessions have session_id and send_to_all = true
-- =====================================================
