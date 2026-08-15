-- Durable rate-limit counters (service role only) + hide lead photos from public bucket reads

CREATE TABLE IF NOT EXISTS changtee_web.rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  hit_count integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE changtee_web.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS changtee_uploads_public_read ON storage.objects;
CREATE POLICY changtee_uploads_public_read
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'changtee-uploads'
    AND split_part(name, '/', 1) <> 'leads'
  );
