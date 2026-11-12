-- =====================================================
-- Project GROW Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  school TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LAC Sessions table
CREATE TABLE lac_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL UNIQUE,
  session_date DATE NOT NULL,
  session_no INTEGER NOT NULL,
  title TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'Region IV - CALABARZON',
  division TEXT NOT NULL DEFAULT 'Batangas',
  locked BOOLEAN NOT NULL DEFAULT false,
  assigned_teachers UUID[] DEFAULT '{}', -- Array of teacher IDs who can access this session
  send_to_all BOOLEAN NOT NULL DEFAULT true, -- If true, all active teachers can see it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_no)
);

-- Submissions table
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES lac_sessions(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(teacher_id, session_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(active);
CREATE INDEX idx_submissions_teacher_id ON submissions(teacher_id);
CREATE INDEX idx_submissions_session_id ON submissions(session_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_deleted_at ON submissions(deleted_at);
CREATE INDEX idx_lac_sessions_date ON lac_sessions(session_date);
CREATE INDEX idx_lac_sessions_locked ON lac_sessions(locked);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, school, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'school', ''),
    'teacher'  -- Always create as teacher
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to prevent teachers from changing their own role
CREATE OR REPLACE FUNCTION prevent_role_self_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow if user is admin
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  -- If user is trying to modify their own profile
  IF NEW.id = auth.uid() THEN
    -- Prevent role change
    IF OLD.role != NEW.role THEN
      RAISE EXCEPTION 'Teachers cannot change their own role';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Triggers to update updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lac_sessions_updated_at
  BEFORE UPDATE ON lac_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to prevent teachers from changing their own role
CREATE TRIGGER prevent_teacher_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_modification();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lac_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (is_admin());

-- Users can update their own profile (but role change is prevented by trigger)
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (is_admin());

-- Admins can insert profiles
CREATE POLICY "Admins can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- RLS POLICIES: lac_sessions
-- =====================================================

-- All authenticated users can read sessions
CREATE POLICY "Authenticated users can read sessions"
  ON lac_sessions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can insert sessions
CREATE POLICY "Only admins can insert sessions"
  ON lac_sessions
  FOR INSERT
  WITH CHECK (is_admin());

-- Only admins can update sessions
CREATE POLICY "Only admins can update sessions"
  ON lac_sessions
  FOR UPDATE
  USING (is_admin());

-- Only admins can delete sessions
CREATE POLICY "Only admins can delete sessions"
  ON lac_sessions
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- RLS POLICIES: submissions
-- =====================================================

-- Teachers can read their own non-deleted submissions
CREATE POLICY "Teachers can read own submissions"
  ON submissions
  FOR SELECT
  USING (
    auth.uid() = teacher_id
    AND deleted_at IS NULL
  );

-- Admins can read all submissions (including deleted)
CREATE POLICY "Admins can read all submissions"
  ON submissions
  FOR SELECT
  USING (is_admin());

-- Teachers can insert their own submissions (only if session is not locked)
CREATE POLICY "Teachers can insert own submissions"
  ON submissions
  FOR INSERT
  WITH CHECK (
    auth.uid() = teacher_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM lac_sessions
      WHERE id = session_id
      AND locked = false
    )
  );

-- Teachers can update their own submissions
-- (only if not deleted and session is not locked)
CREATE POLICY "Teachers can update own submissions"
  ON submissions
  FOR UPDATE
  USING (
    auth.uid() = teacher_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM lac_sessions
      WHERE id = session_id
      AND locked = false
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM lac_sessions
      WHERE id = session_id
      AND locked = false
    )
  );

-- Teachers can soft delete their own submissions (by setting deleted_at)
-- (only if session is not locked)
CREATE POLICY "Teachers can soft delete own submissions"
  ON submissions
  FOR UPDATE
  USING (
    auth.uid() = teacher_id
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM lac_sessions
      WHERE id = session_id
      AND locked = false
    )
  );

-- Admins can do everything with submissions
CREATE POLICY "Admins can insert any submission"
  ON submissions
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update any submission"
  ON submissions
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete any submission"
  ON submissions
  FOR DELETE
  USING (is_admin());

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert a sample LAC session
-- INSERT INTO lac_sessions (session_no, session_date, title)
-- VALUES (1, '2026-11-15', 'Introduction to Learning Action Cell');

-- Note: To create an admin user, manually update a profile after signup:
-- UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
