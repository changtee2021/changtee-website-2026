-- Launch hardening: lock CMS writes, private uploads, shrink anon grants.

REVOKE ALL ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.changtee_upsert_site_setting(text, jsonb) TO service_role;

-- Website anon key lives in the browser on this shared project.
REVOKE ALL ON FUNCTION public.ui_receive_stock(uuid, uuid, numeric) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.ui_receive_stock(uuid, uuid, numeric) FROM anon;

CREATE OR REPLACE FUNCTION changtee_web.has_role(_user_id UUID, _role changtee_web.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = changtee_web, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM changtee_web.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION changtee_web.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = changtee_web, public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM changtee_web.user_roles WHERE user_id = _user_id
  );
$$;

REVOKE SELECT ON changtee_web.leads FROM anon;
REVOKE SELECT ON changtee_web.lead_events FROM anon;
REVOKE SELECT ON changtee_web.factory_visit_bookings FROM anon;
REVOKE SELECT ON changtee_web.job_applications FROM anon;
REVOKE SELECT ON changtee_web.outbound_jobs FROM anon;
REVOKE SELECT ON changtee_web.rate_limits FROM anon;
REVOKE SELECT ON changtee_web.user_roles FROM anon;
REVOKE SELECT ON changtee_web.profiles FROM anon;
REVOKE SELECT ON changtee_web.media_assets FROM anon;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'changtee-private',
  'changtee-private',
  false,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 8388608,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

UPDATE storage.buckets
SET file_size_limit = 8388608
WHERE id = 'changtee-uploads';

DROP POLICY IF EXISTS changtee_private_service_all ON storage.objects;
CREATE POLICY changtee_private_service_all
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'changtee-private')
  WITH CHECK (bucket_id = 'changtee-private');

DROP POLICY IF EXISTS changtee_uploads_public_read ON storage.objects;
CREATE POLICY changtee_uploads_public_read
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'changtee-uploads'
    AND split_part(name, '/', 1) NOT IN ('leads', 'careers', 'factory-visits')
  );
