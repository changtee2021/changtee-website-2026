-- Public read for CMS JSON in site_settings + public upload bucket

DO $$ BEGIN
  CREATE POLICY settings_public_read_cms
    ON changtee_web.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (key LIKE 'cms.%');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'changtee-uploads',
  'changtee-uploads',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS changtee_uploads_public_read ON storage.objects;
CREATE POLICY changtee_uploads_public_read
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'changtee-uploads');

DROP POLICY IF EXISTS changtee_uploads_service_write ON storage.objects;
CREATE POLICY changtee_uploads_service_write
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'changtee-uploads')
  WITH CHECK (bucket_id = 'changtee-uploads');
