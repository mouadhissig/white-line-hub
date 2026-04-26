CREATE OR REPLACE FUNCTION public.register_submission(p_nom_prenom text, p_email text, p_statut text, p_niveau_etude text, p_conferences text[], p_atelier text, p_device_id text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count int;
  v_exists boolean;
  v_device_exists boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('atelier:' || p_atelier));

  SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE email = lower(p_email))
    INTO v_exists;
  IF v_exists THEN
    RETURN jsonb_build_object('success', false, 'error', 'duplicate_email');
  END IF;

  IF p_device_id IS NOT NULL AND length(p_device_id) > 0 THEN
    SELECT EXISTS(SELECT 1 FROM public.survey_submissions WHERE device_id = p_device_id)
      INTO v_device_exists;
    IF v_device_exists THEN
      RETURN jsonb_build_object('success', false, 'error', 'duplicate_device');
    END IF;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.survey_submissions WHERE atelier = p_atelier;
  IF v_count >= 25 THEN
    RETURN jsonb_build_object('success', false, 'error', 'atelier_full');
  END IF;

  INSERT INTO public.survey_submissions (nom_prenom, email, statut, niveau_etude, conferences, atelier, device_id)
  VALUES (p_nom_prenom, lower(p_email), p_statut, p_niveau_etude, p_conferences, p_atelier, p_device_id);

  RETURN jsonb_build_object('success', true);
END;
$function$;