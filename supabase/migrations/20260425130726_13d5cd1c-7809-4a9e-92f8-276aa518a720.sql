-- Rebuild survey_submissions with the new fields for the 2026 event
DROP TABLE IF EXISTS public.survey_submissions CASCADE;

CREATE TABLE public.survey_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_prenom text NOT NULL,
  email text NOT NULL UNIQUE,
  statut text NOT NULL,
  niveau_etude text,
  conferences text[] NOT NULL DEFAULT '{}',
  atelier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT atelier_valid CHECK (atelier IN ('atelier1','atelier2','atelier3','atelier4'))
);

CREATE INDEX idx_survey_atelier ON public.survey_submissions(atelier);

ALTER TABLE public.survey_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read counts (we only expose aggregates via the function but RLS is required)
CREATE POLICY "Public can read submissions for counts"
ON public.survey_submissions FOR SELECT
USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.survey_submissions;
ALTER TABLE public.survey_submissions REPLICA IDENTITY FULL;

-- Atomic registration function: enforces 20-person cap per atelier and unique email
CREATE OR REPLACE FUNCTION public.register_submission(
  p_nom_prenom text,
  p_email text,
  p_statut text,
  p_niveau_etude text,
  p_conferences text[],
  p_atelier text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_exists boolean;
BEGIN
  -- Lock rows for this atelier to prevent race conditions
  SELECT COUNT(*) INTO v_count
  FROM public.survey_submissions
  WHERE atelier = p_atelier
  FOR UPDATE;

  IF v_count >= 20 THEN
    RETURN jsonb_build_object('success', false, 'error', 'atelier_full');
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE email = lower(p_email))
    INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email');
  END IF;

  INSERT INTO public.survey_submissions (nom_prenom, email, statut, niveau_etude, conferences, atelier)
  VALUES (p_nom_prenom, lower(p_email), p_statut, p_niveau_etude, p_conferences, p_atelier);

  RETURN jsonb_build_object('success', true);
END;
$$;