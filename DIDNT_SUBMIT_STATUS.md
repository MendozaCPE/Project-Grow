# "Didn't Submit" Status for Locked Sessions

## Summary
Added a "Didn't Submit" status badge (red) for sessions that were locked before the teacher submitted their form.

## Status Logic

### Session Status Badges:

| Condition | Status Badge | Color |
|-----------|-------------|-------|
| 🔴 Locked + No submission | **Didn't Submit** | Red |
| 🔴 Locked + Draft only | **Didn't Submit** | Red |
| ⚫ Locked + Submitted | **Submitted (Locked)** | Gray |
| ⚪ Open + No submission | **Not Started** | Light gray |
| 🔵 Open + Draft | **Draft** | Blue |
| 🟢 Open + Submitted | **Submitted** | Green |

## Visual Examples

### Teacher missed the deadline:
```
┌─────────────────────────────────────┐
│ 🟡 LAC Session #3                   │
│ 📅 Nov 1, 2024  🔴 Didn't Submit   │
└─────────────────────────────────────┘
```

### Teacher submitted on time but session is now locked:
```
┌─────────────────────────────────────┐
│ 🟡 LAC Session #2                   │
│ 📅 Oct 25, 2024  ⚫ Submitted (Locked)│
└─────────────────────────────────────┘
```

### Teacher has draft but hasn't submitted yet (open):
```
┌─────────────────────────────────────┐
│ 🟡 LAC Session #5                   │
│ 📅 Nov 15, 2024  🔵 Draft          │
└─────────────────────────────────────┘
```

### Teacher submitted and session still open:
```
┌─────────────────────────────────────┐
│ 🟡 LAC Session #4                   │
│ 📅 Nov 10, 2024  🟢 Submitted      │
└─────────────────────────────────────┘
```

## Decision Tree

```
Is session locked?
│
├─ YES → Has submission?
│        │
│        ├─ NO → 🔴 Didn't Submit
│        │
│        └─ YES → Is it submitted status?
│                 │
│                 ├─ YES → ⚫ Submitted (Locked)
│                 │
│                 └─ NO (draft) → 🔴 Didn't Submit
│
└─ NO → Has submission?
        │
        ├─ NO → ⚪ Not Started
        │
        └─ YES → What status?
                 │
                 ├─ Draft → 🔵 Draft
                 │
                 └─ Submitted → 🟢 Submitted
```

## Why This Matters

### For Teachers:
1. **Clear Feedback**: Instantly see which deadlines were missed
2. **Accountability**: Red badge shows incomplete work
3. **Historical Record**: Know which sessions were not completed

### For Administrators:
- Can quickly identify teachers who missed submissions
- Historical tracking of participation
- Better compliance monitoring

## Scenarios

### Scenario 1: Teacher forgot to submit
1. Teacher starts LAC Session #3 (creates draft)
2. Teacher gets distracted and doesn't submit
3. Admin locks the session
4. **Result**: Teacher sees "Didn't Submit" in red

### Scenario 2: Teacher submitted on time
1. Teacher completes LAC Session #2
2. Teacher submits the form
3. Admin locks the session later
4. **Result**: Teacher sees "Submitted (Locked)" in gray

### Scenario 3: Teacher working on current session
1. LAC Session #5 is open
2. Teacher creates and saves a draft
3. Session remains open
4. **Result**: Teacher sees "Draft" in blue
5. Teacher can still submit before deadline

### Scenario 4: Teacher hasn't started yet
1. LAC Session #6 is open
2. Teacher hasn't opened it yet
3. **Result**: Teacher sees "Not Started" in light gray
4. Teacher can click to start

## Color Coding Purpose

- 🔴 **Red** (Didn't Submit): Negative/missed deadline - requires attention
- ⚫ **Gray** (Submitted/Locked): Neutral - completed but archived
- 🔵 **Blue** (Draft): In progress - action needed
- 🟢 **Green** (Submitted): Success - completed on time
- ⚪ **Light Gray** (Not Started): Neutral - available to start

## Technical Implementation

The logic checks in this order:
1. First, check if session is locked
2. If locked, check submission status
3. If not locked, show current progress status

This ensures that "Didn't Submit" only appears when:
- The deadline has passed (session locked) AND
- The teacher either didn't submit or only has a draft
