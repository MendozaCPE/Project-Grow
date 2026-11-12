# LAC Form 4 Template Instructions

## Template File Required

You need to place your Word template file in this directory:

```
project-grow/templates/LAC-FORM-4-template.docx
```

## Template Placeholders

The template should use the following placeholders wrapped in double curly braces:

### Header Fields
- `{{name}}` - Name of Member (teacher's full name)
- `{{session_id}}` - LAC Session ID (e.g., "LAC-1")
- `{{date}}` - Session date (formatted as "Month Day, Year")
- `{{session_no}}` - Session number
- `{{region}}` - Will be filled with "IV-A CALABARZON"
- `{{division}}` - Will be filled with "Batangas"

### Part A - Rating Checkmarks (Questions 1-7)

For each question (1 through 7), use these placeholders for the rating checkboxes:

**Question 1:**
- `{{q1_sd}}` - Strongly Disagree (will be "X" if selected, empty otherwise)
- `{{q1_d}}` - Disagree
- `{{q1_n}}` - Neutral
- `{{q1_a}}` - Agree
- `{{q1_sa}}` - Strongly Agree

**Question 2:**
- `{{q2_sd}}`, `{{q2_d}}`, `{{q2_n}}`, `{{q2_a}}`, `{{q2_sa}}`

**Question 3:**
- `{{q3_sd}}`, `{{q3_d}}`, `{{q3_n}}`, `{{q3_a}}`, `{{q3_sa}}`

**Question 4:**
- `{{q4_sd}}`, `{{q4_d}}`, `{{q4_n}}`, `{{q4_a}}`, `{{q4_sa}}`

**Question 5:**
- `{{q5_sd}}`, `{{q5_d}}`, `{{q5_n}}`, `{{q5_a}}`, `{{q5_sa}}`

**Question 6:**
- `{{q6_sd}}`, `{{q6_d}}`, `{{q6_n}}`, `{{q6_a}}`, `{{q6_sa}}`

**Question 7:**
- `{{q7_sd}}`, `{{q7_d}}`, `{{q7_n}}`, `{{q7_a}}`, `{{q7_sa}}`

### Part A - Comments/Remarks (c1-c7)
- `{{c1}}` - Comments for Question 1
- `{{c2}}` - Comments for Question 2
- `{{c3}}` - Comments for Question 3
- `{{c4}}` - Comments for Question 4
- `{{c5}}` - Comments for Question 5
- `{{c6}}` - Comments for Question 6
- `{{c7}}` - Comments for Question 7

### Part B - Reflection (b1-b3)
- `{{b1}}` - I need further clarification and/or resources on the following topics
- `{{b2}}` - I encountered the following problems or challenges
- `{{b3}}` - What insights did I gain from this activity

## Example Template Structure

```
LAC FORM 4
Learning Action Cell Members' Post-LAC Session Report

Name of Member: {{name}}
LAC Session ID: {{session_id}}
Date: {{date}}
Number: {{session_no}}
Region: {{region}}
Division: {{division}}

PART A

Section: THE LAC SESSION

1. I learned a lot from my colleagues in this LAC session.
   [ {{q1_sd}} ] SD  [ {{q1_d}} ] D  [ {{q1_n}} ] N  [ {{q1_a}} ] A  [ {{q1_sa}} ] SA
   
   Comments/Remarks:
   {{c1}}

2. The LAC session deepened my understanding of the SLM content.
   [ {{q2_sd}} ] SD  [ {{q2_d}} ] D  [ {{q2_n}} ] N  [ {{q2_a}} ] A  [ {{q2_sa}} ] SA
   
   Comments/Remarks:
   {{c2}}

... (continue for all 7 questions)

PART B: Reflection

1. I need further clarification and/or resources on the following topics:
{{b1}}

2. I encountered the following problems or challenges:
{{b2}}

3. What insights did I gain from this activity, and how will I apply them to improve my work performance?
{{b3}}
```

## Tips for Creating the Template

1. **Use Tables for Layout**: Word tables work well for organizing the rating checkboxes
2. **Checkbox Format**: Use square brackets `[ {{placeholder}} ]` for a clean checkbox look
3. **Text Areas**: Leave multiple lines for comment fields (b1, b2, b3, c1-c7)
4. **Styling**: Apply the DepEd formatting guidelines (fonts, colors, headers)
5. **Test**: Create a test submission and download to verify all placeholders are filled correctly

## How the Export Works

1. Teacher or admin clicks "Download Word" button
2. System loads the submission data from database
3. For each rating question:
   - The selected rating gets "X"
   - All other ratings get empty string ""
4. All text fields are filled with actual answers
5. Template is filled using docxtemplater
6. Generated file is downloaded as: `LAC-Form-4_[Teacher Name]_[Date].docx`

## Testing the Template

After creating your template:

1. Place it in `templates/LAC-FORM-4-template.docx`
2. Fill out a test form in the app
3. Click "Download Word"
4. Open the downloaded file
5. Verify all placeholders are replaced
6. Check formatting and layout

## Troubleshooting

### Error: Template not found
- Ensure file is named exactly: `LAC-FORM-4-template.docx`
- Check it's in the `templates/` directory
- Restart the dev server

### Placeholders not replaced
- Check placeholder spelling (case-sensitive)
- Ensure using `{{placeholder}}` format (double curly braces)
- No spaces inside braces: `{{name}}` not `{{ name }}`

### Formatting issues
- Use Word's built-in styles
- Test with simple formatting first
- Avoid complex nested tables

## Converting Your LAC-FORM-4.docx

If you have the original LAC-FORM-4.docx file:

1. Make a copy and rename it to `LAC-FORM-4-template.docx`
2. Replace all filled values with placeholders:
   - Name field → `{{name}}`
   - Each rating checkbox → appropriate placeholder
   - Each text area → appropriate placeholder
3. Test the export
4. Refine formatting as needed

## Security Note

The export API checks authorization:
- Teachers can only export their own submissions
- Admins can export any submission
- Returns 403 Forbidden if unauthorized
