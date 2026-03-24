CREATE TABLE public.survey_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;