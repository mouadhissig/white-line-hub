

# Admin Reset Button on Survey Page

## Overview

Add a hidden admin panel to the survey page that appears when you visit `/survey?admin=true`. It shows a password-protected "Reset" button that clears the `survey_submissions` table so new people can register again.

## Changes

### 1. Create database table (migration)

```sql
CREATE TABLE public.survey_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;
```

### 2. New edge function: `supabase/functions/reset-survey/index.ts`

- Accepts POST with an `adminKey` in the body
- Validates it against a `SURVEY_ADMIN_KEY` secret
- If valid, truncates `survey_submissions` table using service role client
- Returns success/error JSON

### 3. Add `SURVEY_ADMIN_KEY` secret

- Use `add_secret` tool to request admin password from you

### 4. Update `supabase/functions/submit-survey/index.ts`

- After validation, check if email already exists in `survey_submissions`
- If found → return 409 "Vous avez déjà soumis votre inscription"
- If not found → insert email, then proceed to Google Sheets

### 5. Update `src/pages/Survey.tsx`

- Read `?admin=true` from URL search params
- If admin mode: show a small panel at the top with a password input and a "Réinitialiser les inscriptions" button
- On click: call the `reset-survey` edge function with the entered password
- Show success/error toast
- Handle 409 errors from submit to show "already registered" message

### 6. Config

- Add `reset-survey` to `supabase/config.toml` with `verify_jwt = false`

