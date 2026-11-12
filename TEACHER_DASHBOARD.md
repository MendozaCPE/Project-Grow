# Teacher Dashboard - Implementation Guide

## Overview
The teacher dashboard provides teachers with access to LAC sessions and management of their form submissions. Built with mobile-first design principles and full responsiveness.

## Features Implemented

### 1. Dashboard Components
- **Welcome Section**: Displays teacher's full name and school
- **LAC Sessions List**: Shows all available LAC sessions with status indicators
- **My Forms Section**: Lists teacher's submitted/draft forms with action buttons

### 2. LAC Sessions List (`SessionsList.tsx`)
Each session card displays:
- Session number badge
- Session title
- Session date
- Status badge (Not Started / Draft / Submitted / Locked)
- Click to open form for that session

**Status Logic:**
- **Locked**: Session is locked by admin (gray)
- **Not Started**: No submission exists yet (beige)
- **Draft**: Submission exists with status="draft" (blue)
- **Submitted**: Submission exists with status="submitted" (green)

### 3. My Submissions (`MySubmissions.tsx`)
Each submission card displays:
- Session number and title
- Last updated date
- Status badge
- Action buttons

**Action Buttons:**
1. **View**: Opens form in read-only mode (`?view=true`)
2. **Edit**: Opens form in edit mode (disabled if locked)
3. **Download Word**: Downloads submission as Word document (coming soon)
4. **Delete**: Soft deletes the submission (requires confirmation)

**Delete Confirmation Flow:**
1. Click "Delete" button
2. Button changes to "Confirm" and "Cancel"
3. Click "Confirm" to proceed with deletion
4. Submission is soft deleted (deleted_at timestamp set)
5. Page auto-refreshes to show updated list

### 4. Form Page (`/teacher/form/[sessionId]/page.tsx`)
Currently a placeholder showing:
- Session information (number, title, date)
- Status badges (View Mode, Locked, Draft/Submitted)
- Mode indicators (editable, locked, view-only)
- Back to dashboard button

**Access Modes:**
- **Edit Mode**: Default when accessing form directly (if not locked)
- **View Mode**: When accessed with `?view=true` parameter
- **Locked**: When session is locked by admin

### 5. Server Actions (`actions.ts`)
**deleteSubmission(submissionId)**
- Soft deletes a submission by setting `deleted_at` timestamp
- Verifies user authentication
- Ensures user owns the submission
- Revalidates `/teacher` path to refresh UI

## File Structure
```
app/teacher/
├── page.tsx              # Main dashboard page (server component)
├── SessionsList.tsx      # LAC sessions list component (client)
├── MySubmissions.tsx     # Submissions management (client)
├── actions.ts            # Server actions for mutations
└── form/
    └── [sessionId]/
        ├── page.tsx      # Form view/edit page (placeholder)
        └── download/
            └── route.ts  # Word document download API (placeholder)
```

## Responsive Design

### Mobile (360px - 639px)
- Stacked layout
- Full-width cards
- Buttons stack vertically
- 48px minimum touch targets
- 16px font size on inputs (prevents iOS zoom)

### Tablet (640px - 1023px)
- Slightly larger spacing
- Buttons remain stacked or flow wrap
- Larger typography

### Desktop (1024px+)
- Buttons display in horizontal row
- More whitespace
- Larger text and icons

## Database Queries

### Dashboard Data Fetching
1. **User Profile**: Full name, school info
2. **LAC Sessions**: All sessions ordered by date (newest first)
3. **Teacher Submissions**: All non-deleted submissions with joined session data

### RLS (Row Level Security)
- Teachers can only see their own submissions
- Teachers can only delete their own submissions
- Teachers can only edit submissions when session is not locked
- Admins can see all submissions (for admin dashboard)

## Next Steps

### Immediate Priorities
1. **LAC Form 4 Implementation**
   - Design form fields based on LAC-FORM-4.docx
   - Create form component with validation
   - Implement save as draft functionality
   - Implement submit functionality
   - Store answers in `submissions.answers` jsonb field

2. **Word Document Generation**
   - Research docx generation libraries (docx, officegen)
   - Map form fields to Word template
   - Implement download route

3. **Additional Features**
   - Form auto-save (every 30 seconds)
   - Offline support (PWA with service worker)
   - Form field validation
   - Character/word counters on text areas
   - Upload attachments (if needed)

### Testing Checklist
- [ ] Login as teacher
- [ ] View dashboard with multiple sessions
- [ ] Click on session to open form
- [ ] Create a draft submission
- [ ] Return to dashboard - verify draft badge shows
- [ ] Edit draft submission
- [ ] Submit form
- [ ] View submitted form (read-only)
- [ ] Download Word document (once implemented)
- [ ] Delete submission with confirmation
- [ ] Verify deleted submission doesn't appear
- [ ] Try to edit locked session (should show locked)
- [ ] Test on mobile (360px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)

## Known Limitations
1. Form content is placeholder - needs actual LAC Form 4 fields
2. Word download returns 501 Not Implemented
3. No form validation yet
4. No auto-save functionality
5. No offline support yet
6. No attachment upload capability

## Design System Reference

### Colors
- Page Background: `#FBF6E4`
- Card Background: `#FFFDF5`
- Primary Button: `#E3B23C`
- Primary Button Hover: `#C9962A`
- Selected/Highlight: `#F3DC94`
- Text Primary: `#2E2815`

### Touch Targets
- Minimum height: 48px
- Minimum width: 48px (for icon buttons)
- Full-width on mobile for better tap accuracy

### Typography
- Heading 1: `text-xl sm:text-2xl md:text-3xl`
- Heading 2: `text-lg sm:text-xl`
- Body: `text-sm sm:text-base`
- Small: `text-xs sm:text-sm`
- Input font size: `text-base` (16px - prevents iOS zoom)

## API Routes

### GET `/teacher/form/[sessionId]/download`
Downloads submission as Word document.

**Response**: Currently returns 501 Not Implemented with JSON:
```json
{
  "message": "Word document generation coming soon",
  "session": "Session Title",
  "submission": "uuid"
}
```

**Future**: Will return Word document file with proper headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="LAC-Form-4-Session-1.docx"
```

## Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://vqddgtzmgcntifclwwnu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
REGISTRATION_CODE=GROW2026
```
