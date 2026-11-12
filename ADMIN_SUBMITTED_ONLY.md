# Admin Views - Show Only Submitted Forms

## Summary
Updated admin dashboard and session views to only display **submitted** forms, hiding draft submissions.

## Changes Made

### 1. Query Functions (`lib/supabase/queries.ts`)
- **getAllSubmissions()**: Added `.eq('status', 'submitted')` filter
- **getSubmissionsBySession()**: Added `.eq('status', 'submitted')` filter

These are the admin-specific queries that now only return submitted forms.

### 2. Admin Dashboard (`app/admin/page.tsx`)
- Updated submission count to only count submitted forms: `.eq("status", "submitted")`
- This ensures the "Total Submissions" stat only shows submitted forms

### 3. Admin Session List (`app/admin/SessionsList.tsx`)
- Removed draft count display
- Only shows submitted count in badges
- Updated "View All Submissions" link to show submitted count only

### 4. Admin Session Detail Page (`app/admin/sessions/[sessionId]/page.tsx`)
- Added `.eq("status", "submitted")` filter to only fetch submitted submissions
- Updated comment to clarify "only submitted ones"

### 5. Submissions List Component (`app/admin/sessions/[sessionId]/SubmissionsList.tsx`)
- Simplified status badges - now always shows "Submitted" (since drafts are filtered out)
- Removed conditional logic for draft vs submitted status

## Behavior

### Admin Can See:
✅ All submitted forms across all sessions  
✅ Submitted forms for each specific session  
✅ Accurate counts showing only submitted forms  
✅ Download options for submitted forms  

### Admin Cannot See:
❌ Draft forms (work in progress)  
❌ Draft counts in session statistics  

### Teachers Still Can See:
✅ Their own drafts in "My Forms" section  
✅ Their own submitted forms  
✅ Can edit drafts before submitting  
✅ Can delete their own submissions (both draft and submitted)  

## Why This Change?

1. **Privacy**: Drafts are work-in-progress and shouldn't be visible to admins
2. **Clarity**: Admins only need to see completed, submitted forms
3. **Data Quality**: Only finalized data is shown for administrative review
4. **Professional**: Prevents confusion about incomplete submissions

## Testing

1. **As Teacher**:
   - Create a draft form (don't submit)
   - Verify it appears in your "My Forms" section
   - Submit a form
   - Verify the submitted one appears in "My Forms"

2. **As Admin**:
   - Check admin dashboard - should only see submitted forms count
   - View a session's submissions - should only see submitted forms
   - Verify draft forms created by teachers don't appear anywhere
   - Verify submitted forms are visible and downloadable

3. **Status Flow**:
   - Draft → only teacher sees it
   - Submitted → both teacher and admin see it
   - Deleted → completely removed, nobody sees it
