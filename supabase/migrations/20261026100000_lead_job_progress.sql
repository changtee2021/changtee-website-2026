-- Field progress of a lead after a salesperson claims it from the LINE card.
-- NULL = claimed only (or not claimed yet); advanced from the LIFF page /line-job.

ALTER TABLE changtee_web.leads
  ADD COLUMN IF NOT EXISTS job_status text,
  ADD COLUMN IF NOT EXISTS job_status_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_job_status_check'
  ) THEN
    ALTER TABLE changtee_web.leads
      ADD CONSTRAINT leads_job_status_check
      CHECK (job_status IS NULL OR job_status IN ('done'));
  END IF;
END $$;

COMMENT ON COLUMN changtee_web.leads.job_status IS
  'Set to done when the owner closes the job via LIFF. NULL until closed. On-site progress lives in the CRM, not here.';
COMMENT ON COLUMN changtee_web.leads.job_status_at IS
  'When job_status last changed. Each change is also logged in lead_events.';

NOTIFY pgrst, 'reload schema';
