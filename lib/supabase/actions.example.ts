// Example Server Actions for Project GROW
// These are examples of how to use the database queries in Next.js Server Actions

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  getCurrentProfile,
  isAdmin,
  getMySubmissions,
  createSubmission,
  updateSubmission,
  getSubmissionBySession,
  submitDraft,
  softDeleteSubmission,
} from './queries'

// =====================================================
// AUTHENTICATION ACTIONS
// =====================================================

export async function requireAuth() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect('/login')
  }
  return profile
}

export async function requireAdmin() {
  const profile = await requireAuth()
  if (profile.role !== 'admin') {
    redirect('/')
  }
  return profile
}

// =====================================================
// SUBMISSION ACTIONS
// =====================================================

export async function saveSubmissionDraft(
  sessionId: string,
  answers: Record<string, any>
) {
  try {
    const profile = await requireAuth()

    // Check if submission already exists
    const existing = await getSubmissionBySession(sessionId)

    if (existing) {
      // Update existing draft
      const updated = await updateSubmission(existing.id, {
        answers,
        status: 'draft',
      })

      if (!updated) {
        return { error: 'Failed to save draft' }
      }

      revalidatePath('/submissions')
      return { success: true, submission: updated }
    } else {
      // Create new draft
      const created = await createSubmission({
        teacher_id: profile.id,
        session_id: sessionId,
        answers,
        status: 'draft',
      })

      if (!created) {
        return { error: 'Failed to create draft' }
      }

      revalidatePath('/submissions')
      return { success: true, submission: created }
    }
  } catch (error) {
    console.error('Error saving draft:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function submitSubmission(submissionId: string) {
  try {
    await requireAuth()

    const updated = await submitDraft(submissionId)

    if (!updated) {
      return { error: 'Failed to submit' }
    }

    revalidatePath('/submissions')
    return { success: true, submission: updated }
  } catch (error) {
    console.error('Error submitting:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteSubmission(submissionId: string) {
  try {
    await requireAuth()

    const deleted = await softDeleteSubmission(submissionId)

    if (!deleted) {
      return { error: 'Failed to delete submission' }
    }

    revalidatePath('/submissions')
    return { success: true }
  } catch (error) {
    console.error('Error deleting submission:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// =====================================================
// EXAMPLE: Usage in a Server Component
// =====================================================

/*
// app/submissions/page.tsx

import { getMySubmissions } from '@/lib/supabase/queries'
import { requireAuth } from '@/lib/supabase/actions'

export default async function SubmissionsPage() {
  await requireAuth()
  const submissions = await getMySubmissions()

  return (
    <div>
      <h1>My Submissions</h1>
      {submissions.map(submission => (
        <div key={submission.id}>
          <h2>{submission.lac_sessions?.title}</h2>
          <p>Status: {submission.status}</p>
          <p>Last updated: {new Date(submission.updated_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )
}
*/

// =====================================================
// EXAMPLE: Usage in a Client Component with Form
// =====================================================

/*
// app/submissions/[sessionId]/form.tsx

'use client'

import { useState } from 'react'
import { saveSubmissionDraft, submitSubmission } from '@/lib/supabase/actions'

export function SubmissionForm({ 
  sessionId, 
  initialAnswers = {} 
}: { 
  sessionId: string
  initialAnswers?: Record<string, any>
}) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSaveDraft = async () => {
    setSaving(true)
    const result = await saveSubmissionDraft(sessionId, answers)
    setSaving(false)
    
    if (result.error) {
      alert(result.error)
    } else {
      alert('Draft saved!')
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    // First save as draft
    const draftResult = await saveSubmissionDraft(sessionId, answers)
    
    if (draftResult.error || !draftResult.submission) {
      setSubmitting(false)
      alert('Failed to save')
      return
    }

    // Then submit
    const submitResult = await submitSubmission(draftResult.submission.id)
    setSubmitting(false)

    if (submitResult.error) {
      alert(submitResult.error)
    } else {
      alert('Submitted successfully!')
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <textarea
        value={answers.response || ''}
        onChange={(e) => setAnswers({ ...answers, response: e.target.value })}
        placeholder="Enter your response..."
      />
      
      <div>
        <button 
          type="button" 
          onClick={handleSaveDraft}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        
        <button 
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  )
}
*/
