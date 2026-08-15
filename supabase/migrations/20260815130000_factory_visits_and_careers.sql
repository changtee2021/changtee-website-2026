-- changtee_web: factory visit bookings (นัดเยี่ยมชมโรงงาน) + careers (job applications)
-- App: changtee-website | Project: pfwygxzwlteqjnnwiwmb (wp-enterprise)
-- Job postings themselves live in changtee_web.site_settings (CMS collection "careers"),
-- mirroring blog/portfolio/hero-slides — see src/lib/cms/cms-collections.ts.

CREATE TYPE changtee_web.visit_session AS ENUM ('morning', 'evening');
CREATE TYPE changtee_web.visit_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE changtee_web.application_status AS ENUM (
  'new',
  'reviewing',
  'interview_scheduled',
  'hired',
  'rejected',
  'talent_pool'
);

CREATE TABLE changtee_web.factory_visit_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  line_id TEXT,
  business_name TEXT,
  visit_date DATE NOT NULL,
  session changtee_web.visit_session NOT NULL,
  visitor_count INT NOT NULL DEFAULT 1,
  purpose TEXT,
  product_interest TEXT,
  note TEXT,
  status changtee_web.visit_status NOT NULL DEFAULT 'pending',
  pdpa_accepted BOOLEAN NOT NULL DEFAULT false,
  form_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- job_posting_id references the CMS "careers" item id (not a hard FK — postings
  -- live in site_settings JSON). job_title is a denormalized snapshot at apply time.
  job_posting_id TEXT,
  job_title TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  line_id TEXT,
  address TEXT,
  education TEXT,
  experience_note TEXT,
  cover_note TEXT,
  expected_salary TEXT,
  available_from DATE,
  resume_file_name TEXT,
  resume_file_path TEXT,
  status changtee_web.application_status NOT NULL DEFAULT 'new',
  pdpa_accepted BOOLEAN NOT NULL DEFAULT false,
  form_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX visit_bookings_date_idx ON changtee_web.factory_visit_bookings (visit_date, session);
CREATE INDEX visit_bookings_status_idx ON changtee_web.factory_visit_bookings (status, created_at DESC);
CREATE INDEX job_applications_status_idx ON changtee_web.job_applications (status, created_at DESC);
CREATE INDEX job_applications_posting_idx ON changtee_web.job_applications (job_posting_id);

ALTER TABLE changtee_web.factory_visit_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_all_visit_bookings ON changtee_web.factory_visit_bookings
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_job_applications ON changtee_web.job_applications
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON changtee_web.factory_visit_bookings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON changtee_web.job_applications TO authenticated;
GRANT ALL ON changtee_web.factory_visit_bookings TO service_role;
GRANT ALL ON changtee_web.job_applications TO service_role;
