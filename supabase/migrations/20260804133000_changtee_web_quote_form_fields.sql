-- Extend leads for full quotation form + status set used by admin UI
-- Safe to run after 20260804120000_changtee_web_bootstrap.sql

ALTER TABLE changtee_web.leads
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS contact_type TEXT,
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS install_address TEXT,
  ADD COLUMN IF NOT EXISTS billing_address TEXT,
  ADD COLUMN IF NOT EXISTS tax_id TEXT,
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS requested_size TEXT,
  ADD COLUMN IF NOT EXISTS site_image_url TEXT,
  ADD COLUMN IF NOT EXISTS callback_date DATE,
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS form_payload JSONB;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'changtee_web'
      AND t.typname = 'lead_status'
      AND e.enumlabel = 'cancelled'
  ) THEN
    ALTER TYPE changtee_web.lead_status ADD VALUE 'cancelled';
  END IF;
END $$;
