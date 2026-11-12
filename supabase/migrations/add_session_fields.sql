-- Add new fields to lac_sessions table
ALTER TABLE lac_sessions 
ADD COLUMN IF NOT EXISTS session_id TEXT,
ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'Region IV - CALABARZON',
ADD COLUMN IF NOT EXISTS division TEXT NOT NULL DEFAULT 'Batangas';

-- Add unique constraint on session_id
ALTER TABLE lac_sessions 
ADD CONSTRAINT lac_sessions_session_id_unique UNIQUE (session_id);

-- Update existing rows to have a session_id based on session_no
UPDATE lac_sessions 
SET session_id = 'LAC-' || session_no::TEXT 
WHERE session_id IS NULL;

-- Make session_id NOT NULL after updating existing rows
ALTER TABLE lac_sessions 
ALTER COLUMN session_id SET NOT NULL;
