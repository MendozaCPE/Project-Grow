# Teacher Dashboard - Separate Drafts and Submitted Forms

## Summary
Updated the teacher dashboard to separate forms into two distinct sections: **My Drafts** and **My Submitted Forms**.

## Changes Made

### 1. Teacher Dashboard (`app/teacher/page.tsx`)
- Added logic to filter submissions by status
- Split submissions into `draftForms` and `submittedForms` arrays
- Created two separate sections with counts in headers

### 2. MySubmissions Component (`app/teacher/MySubmissions.tsx`)
- Added `emptyMessage` prop for customizable empty state messages
- Different messages for drafts vs submitted forms

## New Dashboard Structure

```
┌─────────────────────────────────────┐
│ Welcome back, [Teacher Name]!       │
│ [School Name]                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ LAC Sessions                        │
│ [List of available sessions]        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ My Drafts (X)                       │  ← Only shows if there are drafts
│ [Draft forms list]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ My Submitted Forms (X)              │  ← Always visible
│ [Submitted forms list]              │
└─────────────────────────────────────┘
```

## Section Visibility

| Section | When Visible |
|---------|--------------|
| **LAC Sessions** | Always |
| **My Drafts** | Only when teacher has draft forms |
| **My Submitted Forms** | Always |

## Empty State Messages

**My Drafts (empty):**
- Hidden completely (section doesn't appear)

**My Submitted Forms (empty):**
- "You haven't submitted any forms yet. Complete and submit a form to see it here."

## User Benefits

1. **Clear Organization**: Teachers can easily distinguish between work-in-progress and completed forms
2. **Visual Separation**: Counts in headers show how many drafts vs submitted
3. **Better Workflow**: Drafts section encourages completion
4. **Less Clutter**: Drafts only appear when they exist

## Status Flow

```
Create Form → Draft → Submit → Submitted
                ↓                  ↓
         [My Drafts]    [My Submitted Forms]
                ↑                  ↓
                └── Unsubmit ──────┘
```

## Examples

### Teacher with 2 drafts and 5 submitted:
```
LAC Sessions
[sessions list]

My Drafts (2)
[2 draft forms]

My Submitted Forms (5)
[5 submitted forms]
```

### Teacher with 0 drafts and 3 submitted:
```
LAC Sessions
[sessions list]

My Submitted Forms (3)
[3 submitted forms]
```

### New teacher with no forms:
```
LAC Sessions
[sessions list]

My Submitted Forms (0)
[Empty state message]
```

## Combined with Unsubmit Feature

When a teacher unsubmits a form:
1. Form moves from "My Submitted Forms" section
2. Form appears in "My Drafts" section
3. "My Drafts" section appears if it wasn't visible before
4. Both counts update automatically
5. Admin no longer sees the form

This creates a clear visual feedback loop for the submit/unsubmit workflow!
