-- CMS publish on Vercel must not depend on PostgREST exposing changtee_web.
-- public RPCs let the service role read/write site_settings even when the
-- custom schema is missing from the API "Exposed schemas" list.

CREATE OR REPLACE FUNCTION public.changtee_read_site_setting(p_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = changtee_web, public
AS $$
BEGIN
  IF p_key IS NULL OR length(p_key) = 0 THEN
    RETURN NULL;
  END IF;
  IF p_key LIKE '%.draft' OR p_key LIKE '%.history' THEN
    RETURN NULL;
  END IF;
  IF p_key NOT LIKE 'cms.%' AND p_key NOT IN ('brand', 'contact', 'seo.defaults') THEN
    RETURN NULL;
  END IF;
  RETURN (SELECT value FROM changtee_web.site_settings WHERE key = p_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.changtee_upsert_site_setting(p_key text, p_value jsonb)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = changtee_web, public
AS $$
DECLARE
  ts timestamptz := now();
BEGIN
  IF p_key IS NULL OR length(p_key) = 0 THEN
    RAISE EXCEPTION 'missing site_settings key';
  END IF;
  INSERT INTO changtee_web.site_settings (key, value, updated_at)
  VALUES (p_key, COALESCE(p_value, '{}'::jsonb), ts)
  ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value,
        updated_at = EXCLUDED.updated_at;
  RETURN ts;
END;
$$;

COMMENT ON FUNCTION public.changtee_read_site_setting(text) IS
  'Read public CMS / brand settings. Draft and history keys are hidden.';
COMMENT ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) IS
  'Service-role CMS write that does not require changtee_web on PostgREST.';

REVOKE ALL ON FUNCTION public.changtee_read_site_setting(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.changtee_read_site_setting(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) TO service_role;

DROP POLICY IF EXISTS service_role_all_settings ON changtee_web.site_settings;
CREATE POLICY service_role_all_settings ON changtee_web.site_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
