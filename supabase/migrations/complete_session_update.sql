-- =====================================================
-- Complete Session Update Migration
-- This migration adds all new features for session management
-- =====================================================

-- Step 1: Add session_id, region, and division fields
ALTER TABLE lac_sessions 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Region IV - CALABARZON',
ADD COLUMN IF NOT EXISTS division TEXT DEFAULT 'Batangas';

-- Step 2: Update existing rows to have default values
UPDATE lac_sessions 
SET session_id = 'LAC-' || session_no::TEXT 
WHERE session_id IS NULL;

UPDATE lac_sessions 
SET region = 'Region IV - CALABARZON'
WHERE region IS NULL;

UPDATE lac_sessions 
SET division = 'Batangas'
WHERE division IS NULL;

-- Step 3: Make columns NOT NULL after setting defaults
ALTER TABLE lac_sessions 
ALTER COLUMN session_id SET NOT NULL,
ALTER COLUMN region SET NOT NULL,
ALTER COLUMN division SET NOT NULL;

-- Step 4: Add unique constraint on session_id
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

-- Step 5: Add teacher assignment fields
ALTER TABLE lac_sessions 
ADD COLUMN IF NOT EXISTS assigned_teachers UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS send_to_all BOOLEAN DEFAULT true;

-- Step 6: Update existing sessions to send to all teachers
UPDATE lac_sessions 
SET send_to_all = true,
    assigned_teachers = '{}'
WHERE send_to_all IS NULL;

-- Step 7: Make send_to_all NOT NULL
ALTER TABLE lac_sessions 
ALTER COLUMN send_to_all SET NOT NULL,
ALTER COLUMN send_to_all SET DEFAULT true;

-- Step 8: Add helpful comments
COMMENT ON COLUMN lac_sessions.session_id IS 'Unique custom identifier for the session (e.g., LAC-2024-001)';
COMMENT ON COLUMN lac_sessions.region IS 'Region where the session is conducted';
COMMENT ON COLUMN lac_sessions.division IS 'Division/district where the session is conducted';
COMMENT ON COLUMN lac_sessions.assigned_teachers IS 'Array of teacher IDs who can access this session (used when send_to_all is false)';
COMMENT ON COLUMN lac_sessions.send_to_all IS 'If true, all active teachers can see the session. If false, only assigned_teachers can see it';

-- Step 9: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_lac_sessions_send_to_all ON lac_sessions(send_to_all);
CREATE INDEX IF NOT EXISTS idx_lac_sessions_assigned_teachers ON lac_sessions USING GIN(assigned_teachers);

-- =====================================================
-- Verification Queries (run these to check results)
-- =====================================================

-- Check the structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'lac_sessions'
-- ORDER BY ordinal_position;

-- Check existing data
-- SELECT id, session_id, session_no, title, region, division, send_to_all, 
--        array_length(assigned_teachers, 1) as num_assigned_teachers
-- FROM lac_sessions;
