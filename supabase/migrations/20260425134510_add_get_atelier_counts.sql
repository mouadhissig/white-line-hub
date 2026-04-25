-- Aggregate function: returns per-atelier registration counts without exposing personal data.
-- SECURITY DEFINER ensures this is callable by anon even if they lack SELECT on the table.
CREATE OR REPLACE FUNCTION public.get_atelier_counts()
RETURNS TABLE(atelier text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT atelier, COUNT(*)::bigint
  FROM public.survey_submissions
  GROUP BY atelier;
$$;

-- Allow anon and authenticated roles to call the function
GRANT EXECUTE ON FUNCTION public.get_atelier_counts() TO anon, authenticated;
