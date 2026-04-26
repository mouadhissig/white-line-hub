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
SET search_path TO 'public'
AS $function$
DECLARE
  v_count int;
  v_exists boolean;
BEGIN
  -- Serialize concurrent registrations for the same atelier
  PERFORM pg_advisory_xact_lock(hashtext('atelier:' || p_atelier));

  SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE email = lower(p_email))
    INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email');
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.survey_submissions
  WHERE atelier = p_atelier;

  IF v_count >= 20 THEN
    RETURN jsonb_build_object('success', false, 'error', 'atelier_full');
  END IF;

  INSERT INTO public.survey_submissions (nom_prenom, email, statut, niveau_etude, conferences, atelier)
  VALUES (p_nom_prenom, lower(p_email), p_statut, p_niveau_etude, p_conferences, p_atelier);

  RETURN jsonb_build_object('success', true);
END;
$function$;

-- Enable realtime broadcasts for live counter updates
ALTER TABLE public.survey_submissions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'survey_submissions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.survey_submissions';
  END IF;
END $$;