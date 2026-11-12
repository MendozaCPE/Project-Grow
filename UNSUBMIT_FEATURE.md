# Unsubmit Feature - Revert Submitted Forms to Draft

## Summary
Added the ability for teachers to **revert submitted forms back to draft status** if the session is still unlocked (not locked by admin).

## Problem Solved
Previously, once a teacher submitted a form, they couldn't edit it anymore unless an admin unlocked the session. Now teachers can unsubmit their own forms and continue editing as long as the session remains open.

## Changes Made

### 1. New Server Action (`app/teacher/form/[sessionId]/actions.ts`)
Added `unsubmitForm` function:
- Verifies user authentication
- Checks if session is unlocked
- Verifies user owns the submission
- Updates status from "submitted" back to "draft"
- Revalidates paths to refresh UI

### 2. FormComponent Updates (`app/teacher/form/[sessionId]/FormComponent.tsx`)
- Imported `unsubmitForm` action
- Added `isUnsubmitting` state
- Added `handleUnsubmit` function with confirmation dialog
- Added "Revert to Draft" button (orange) that appears when:
  - Form is submitted AND
  - Session is not locked AND
  - Not in view-only mode

### 3. UI Button Placement
The "Revert to Draft" button appears in the action buttons section at the bottom of the form, alongside Back/Save/Submit/Download buttons.

## User Flow

### Scenario: Teacher wants to edit a submitted form

1. **Teacher submits a form** → Status: "Submitted" (visible to admin)
2. **Teacher realizes they need to make changes**
3. **Teacher opens the form** → Views it (read-only)
4. **Teacher clicks "Revert to Draft"** → Confirmation dialog appears
5. **Teacher confirms** → Status changes to "Draft"
6. **Form becomes editable again** → Teacher can make changes
7. **Admin no longer sees the form** → Only submitted forms are visible to admin
8. **Teacher resubmits** → Status: "Submitted" (visible to admin again)

## Behavior Matrix

| Condition | Save Draft | Submit | Revert to Draft | Edit Form |
|-----------|-----------|--------|-----------------|-----------|
| **Draft + Unlocked** | ✅ | ✅ | ❌ | ✅ |
| **Submitted + Unlocked** | ❌ | ❌ | ✅ | ❌ |
| **Draft + Locked** | ❌ | ❌ | ❌ | ❌ |
| **Submitted + Locked** | ❌ | ❌ | ❌ | ❌ |

## Button States

### Draft Form (Unlocked):
- ✅ Back button
- ✅ Save Draft button (yellow)
- ✅ Submit button (green)
- ✅ Download buttons

### Submitted Form (Unlocked):
- ✅ Back button
- ✅ Revert to Draft button (orange)
- ✅ Download buttons

### Any Form (Locked):
- ✅ Back button
- ✅ Download buttons
- ❌ All editing/submission buttons disabled

## Security & Validation

1. **Authentication Required**: Must be logged in
2. **Ownership Verified**: Can only unsubmit own submissions
3. **Session Status Check**: Cannot unsubmit if session is locked
4. **Confirmation Dialog**: Prevents accidental unsubmits
5. **Server-Side Validation**: All checks happen on server, not just client

## Admin Impact

When a teacher unsubmits a form:
- ❌ Admin can no longer see it (only submitted forms visible)
- ✅ Submission count decreases
- ✅ Teacher can edit and resubmit
- ✅ Once resubmitted, admin sees it again

## Benefits

1. **Flexibility**: Teachers can correct mistakes after submission
2. **No Admin Intervention**: Teachers self-manage within open sessions
3. **Quality**: Encourages thorough review before final submission
4. **User-Friendly**: Clear workflow with confirmation
5. **Deadline Enforcement**: Locked sessions still prevent changes

## Testing Steps

1. **As Teacher - Basic Flow**:
   - Create and submit a form
   - Verify form shows as "Submitted"
   - Open the form
   - Click "Revert to Draft"
   - Confirm the dialog
   - Verify form is now in draft status
   - Make changes and resubmit

2. **As Teacher - Locked Session**:
   - Submit a form
   - Have admin lock the session
   - Try to open the form
   - Verify "Revert to Draft" button doesn't appear

3. **As Admin - Visibility**:
   - See a submitted form in the list
   - Have teacher unsubmit it
   - Verify it disappears from admin view
   - Have teacher resubmit
   - Verify it appears again

4. **Error Handling**:
   - Try to unsubmit someone else's form (should fail)
   - Try to unsubmit with locked session (should fail)
   - Test with no authentication (should fail)

## UI/UX Notes

- **Orange button color**: Indicates caution (neither create nor destroy)
- **Confirmation dialog**: Prevents accidents
- **Icon**: Circular arrow (revert/undo)
- **Loading state**: "Reverting..." during action
- **Responsive**: Works on mobile and desktop
- **Touch-friendly**: min-height 48px for buttons
