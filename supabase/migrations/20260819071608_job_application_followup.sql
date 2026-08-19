-- Job applications: portfolio files, interview slot, reject reason.
-- App: changtee-website | schema: changtee_web

ALTER TABLE changtee_web.job_applications
  ADD COLUMN IF NOT EXISTS portfolio_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS interview_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reject_reason TEXT;

COMMENT ON COLUMN changtee_web.job_applications.portfolio_files IS
  'Array of {name, path} private uploads shown in admin application detail.';
COMMENT ON COLUMN changtee_web.job_applications.interview_at IS
  'Interview date/time when status = interview_scheduled.';
COMMENT ON COLUMN changtee_web.job_applications.reject_reason IS
  'Required when status = rejected.';
