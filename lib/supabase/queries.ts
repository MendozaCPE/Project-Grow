import { createClient } from "./server";
import type { Database } from "../database.types";

type Tables = Database['public']['Tables'];
type Profile = Tables['profiles']['Row'];
type LacSession = Tables['lac_sessions']['Row'];
type Submission = Tables['submissions']['Row'];

// =====================================================
// PROFILE QUERIES
// =====================================================

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === 'admin';
}

export async function getAllTeachers(): Promise<Profile[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'teacher')
    .eq('active', true)
    .order('full_name');

  if (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }

  return data || [];
}

export async function updateProfile(
  userId: string,
  updates: Tables['profiles']['Update']
): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

// =====================================================
// LAC SESSION QUERIES
// =====================================================

export async function getAllSessions(): Promise<LacSession[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lac_sessions')
    .select('*')
    .order('session_no');

  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }

  return data || [];
}

export async function getSessionById(sessionId: string): Promise<LacSession | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lac_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }

  return data;
}

export async function createSession(
  session: Tables['lac_sessions']['Insert']
): Promise<LacSession | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lac_sessions')
    .insert(session)
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }

  return data;
}

export async function updateSession(
  sessionId: string,
  updates: Tables['lac_sessions']['Update']
): Promise<LacSession | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('lac_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    return null;
  }

  return data;
}

export async function toggleSessionLock(
  sessionId: string
): Promise<LacSession | null> {
  const supabase = await createClient();
  
  // First get the current state
  const session = await getSessionById(sessionId);
  if (!session) return null;

  // Toggle the locked state
  return updateSession(sessionId, { locked: !session.locked });
}

// =====================================================
// SUBMISSION QUERIES
// =====================================================

export async function getMySubmissions(): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      lac_sessions (
        session_no,
        title,
        session_date,
        locked
      )
    `)
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }

  return data || [];
}

export async function getSubmissionBySession(
  sessionId: string
): Promise<Submission | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('teacher_id', user.id)
    .eq('session_id', sessionId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error fetching submission:', error);
    return null;
  }

  return data;
}

export async function createSubmission(
  submission: Tables['submissions']['Insert']
): Promise<Submission | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .insert(submission)
    .select()
    .single();

  if (error) {
    console.error('Error creating submission:', error);
    return null;
  }

  return data;
}

export async function updateSubmission(
  submissionId: string,
  updates: Tables['submissions']['Update']
): Promise<Submission | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .update(updates)
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating submission:', error);
    return null;
  }

  return data;
}

export async function submitDraft(submissionId: string): Promise<Submission | null> {
  return updateSubmission(submissionId, { status: 'submitted' });
}

export async function softDeleteSubmission(
  submissionId: string
): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', submissionId);

  if (error) {
    console.error('Error deleting submission:', error);
    return false;
  }

  return true;
}

// =====================================================
// ADMIN QUERIES
// =====================================================

export async function getAllSubmissions(): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (
        full_name,
        school
      ),
      lac_sessions (
        session_no,
        title,
        session_date
      )
    `)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all submissions:', error);
    return [];
  }

  return data || [];
}

export async function getSubmissionsBySession(
  sessionId: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      profiles (
        full_name,
        school
      )
    `)
    .eq('session_id', sessionId)
    .eq('status', 'submitted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching session submissions:', error);
    return [];
  }

  return data || [];
}

export async function getSubmissionsByTeacher(
  teacherId: string
): Promise<Submission[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      *,
      lac_sessions (
        session_no,
        title,
        session_date,
        locked
      )
    `)
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching teacher submissions:', error);
    return [];
  }

  return data || [];
}
