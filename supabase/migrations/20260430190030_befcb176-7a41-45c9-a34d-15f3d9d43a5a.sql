
-- Allow atelier to be null
ALTER TABLE public.survey_submissions ALTER COLUMN atelier DROP NOT NULL;

-- Drop old version of register_submission
DROP FUNCTION IF EXISTS public.register_submission(text, text, text, text, text[], text);

-- Update register_submission to support null atelier
CREATE OR REPLACE FUNCTION public.register_submission(
  p_nom_prenom text,
  p_email text,
  p_statut text,
  p_niveau_etude text,
  p_conferences text[],
  p_atelier text,
  p_device_id text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_count int;
  v_cap int;
  v_exists boolean;
  v_device_exists boolean;
BEGIN
  IF p_atelier IS NOT NULL AND p_atelier <> '' THEN
    PERFORM pg_advisory_xact_lock(hashtext('atelier:' || p_atelier));
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE email = lower(p_email))
    INTO v_exists;
  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email');
  END IF;

  IF p_device_id IS NOT NULL AND p_device_id <> '' THEN
    SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE device_id = p_device_id)
      INTO v_device_exists;
    IF v_device_exists THEN
      RETURN jsonb_build_object('success', false, 'error', 'duplicate_device');
    END IF;
  END IF;

  IF p_atelier IS NOT NULL AND p_atelier <> '' THEN
    SELECT value INTO v_cap FROM public.survey_settings WHERE key = 'atelier_cap';
    IF v_cap IS NULL THEN v_cap := 25; END IF;

    SELECT COUNT(*) INTO v_count
    FROM public.survey_submissions
    WHERE atelier = p_atelier;

    IF v_count >= v_cap THEN
      RETURN jsonb_build_object('success', false, 'error', 'atelier_full');
    END IF;
  END IF;

  INSERT INTO public.survey_submissions (nom_prenom, email, statut, niveau_etude, conferences, atelier, device_id)
  VALUES (p_nom_prenom, lower(p_email), p_statut, p_niveau_etude, p_conferences, NULLIF(p_atelier, ''), p_device_id);

  RETURN jsonb_build_object('success', true);
END;
$function$;
