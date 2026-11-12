# LAC Form 4 - Quick Test Guide

## Test Now!

The LAC Form 4 is fully implemented and ready to test.

## Quick Test Steps

### 1. Start the Server (if not running)
```bash
cd project-grow
npm run dev
```

Access at: **http://localhost:3000**

### 2. Login as Teacher
- Go to `/login`
- Login with your teacher account
- Registration code: `GROW2026` (if creating new account)

### 3. Access a Form
From teacher dashboard (`/teacher`):
- Click on any LAC Session card
- OR directly visit: `/teacher/form/{sessionId}`

### 4. Fill Out the Form

**Header Section:**
- Name is pre-filled (editable)
- Other fields are read-only

**Part A - Rate all 7 statements:**
For each statement, click one of: **SD | D | N | A | SA**

1. ✅ I learned a lot from my colleagues
2. ✅ The LAC session deepened my understanding
3. ✅ My perspective changed
4. ✅ I participated actively
5. ✅ I interacted with different people
6. ✅ I feel motivated to apply what I learned
7. ✅ I intend to apply what I learned

**Comments** (optional):
- Each statement has a comment field
- Pre-filled suggestions in placeholder
- You can edit or leave blank

**Part B - Reflections:**
1. Clarification needed (optional)
2. Problems encountered (optional)
3. **Insights and application (REQUIRED)**

### 5. Test Auto-Save
- Type in any field
- Wait 3 seconds
- Watch top-right corner for "Saving..." → "✓ Saved"

OR

- Click in a text area
- Type something
- Click outside
- Saves immediately

### 6. Test Manual Save
- Click "Save Draft" button (yellow)
- Form saves
- Status: "Draft"

### 7. Test Submit
- Fill all required fields:
  - Name ✓
  - All 7 ratings ✓
  - Part B Question 3 ✓
- Click "Submit" button (green)
- Redirects to dashboard
- Status changes to "Submitted"

### 8. Test Validation
Try submitting WITHOUT:
- Name → See error
- All ratings → See error
- Part B Q3 → See error

Should see red error box at top listing what's missing.

### 9. Test View Mode
From dashboard:
- Click "View" button on a submission
- All fields are read-only
- Can see your answers
- Shows "View Mode" badge

### 10. Test Mobile
- Resize browser to 360px width
- Each statement in its own card
- Rating buttons fit in one row
- All buttons easy to tap (48px tall)
- Buttons stack vertically

## What to Check

### ✅ Visual Design
- [ ] Yellow theme (#E3B23C buttons)
- [ ] Cream cards (#FFFDF5)
- [ ] Selected rating: Yellow highlight (#F3DC94) with border
- [ ] Clean, readable layout
- [ ] Proper spacing

### ✅ Functionality
- [ ] Auto-save works
- [ ] Manual save works
- [ ] Submit with validation
- [ ] Error messages clear
- [ ] Navigation works (Back button)
- [ ] Pre-filled name
- [ ] Read-only fields are disabled

### ✅ Responsive
- [ ] Works at 360px (mobile)
- [ ] Works at 768px (tablet)
- [ ] Works at 1440px (desktop)
- [ ] No horizontal scroll
- [ ] Touch targets adequate (48px+)

### ✅ Data Persistence
- [ ] Fill form partially
- [ ] Navigate away
- [ ] Come back
- [ ] Data still there

### ✅ Status Badges
- [ ] "Draft" badge (blue) when saved
- [ ] "Submitted" badge (green) when submitted
- [ ] "View Mode" badge in view mode
- [ ] "Locked" badge when session locked

## Common Issues

### Form won't save
- Check browser console for errors
- Verify database connection
- Check RLS policies

### Can't see auto-save indicator
- Wait full 3 seconds after typing
- Or click outside text field
- Check top-right corner

### Submit button doesn't work
- Check all required fields filled
- Look for red error box at top
- Console shows validation errors

### Fields are disabled
- Check if session is locked
- Check if in view mode (?view=true in URL)
- Check badge at top

## Testing Locked Sessions

To test locked behavior:

1. **Via Supabase Dashboard:**
   - Go to Supabase → Table Editor
   - Open `lac_sessions` table
   - Find your session
   - Set `locked = true`
   - Save

2. **Try to edit:**
   - Access the form
   - See "Locked" badge
   - All fields disabled
   - Cannot save or submit

3. **Unlock:**
   - Set `locked = false` in database
   - Refresh form
   - Can edit again

## Sample Data

If you need to create LAC sessions for testing:

```sql
-- Run in Supabase SQL Editor
INSERT INTO lac_sessions (session_date, session_no, title, locked)
VALUES
  ('2026-11-15', 1, 'Introduction to Self-Learning Modules', false),
  ('2026-11-22', 2, 'Effective Teaching Strategies', false),
  ('2026-11-29', 3, 'Assessment and Feedback Methods', false),
  ('2026-12-06', 4, 'Collaborative Learning Approaches', false);
```

## Next Steps After Testing

Once the form works well:

1. **Implement Word Download**
   - Install docx library
   - Generate proper .docx file
   - Map all fields

2. **Admin Features**
   - Create/edit LAC sessions
   - Lock/unlock sessions
   - View all teacher submissions
   - Download reports

3. **Enhancements**
   - Character counters on text areas
   - Draft timestamp display
   - Offline support (PWA)
   - Email notifications

## Need Help?

Check these files:
- `LAC_FORM_4_IMPLEMENTATION.md` - Full technical docs
- `TEACHER_DASHBOARD.md` - Dashboard features
- `DATABASE.md` - Database schema
- `RESPONSIVE_COMPLETE.md` - Mobile design guide

## Quick Commands

```bash
# Start dev server
npm run dev

# Check for errors
npm run build

# View your IP for mobile testing
ipconfig

# Access from mobile
http://{YOUR_IP}:3000
```

---

**Happy Testing!** 🎉

If you find any bugs or have suggestions, test thoroughly on different devices and browsers.
