-- Marketing email list: separate from sales leads. Insert only after explicit opt-in.

CREATE TABLE changtee_web.marketing_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  email_normalized text NOT NULL,
  full_name text,
  source text NOT NULL
    CHECK (source IN ('quote', 'contact', 'fab', 'visit', 'presentation')),
  status text NOT NULL DEFAULT 'subscribed'
    CHECK (status IN ('subscribed', 'unsubscribed')),
  consent_version text NOT NULL,
  consent_text text NOT NULL,
  consented_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token text NOT NULL,
  lead_id uuid REFERENCES changtee_web.leads(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketing_subscribers_email_normalized_key UNIQUE (email_normalized),
  CONSTRAINT marketing_subscribers_unsubscribe_token_key UNIQUE (unsubscribe_token)
);

CREATE INDEX marketing_subscribers_status_created_idx
  ON changtee_web.marketing_subscribers (status, created_at DESC);

COMMENT ON TABLE changtee_web.marketing_subscribers IS
  'Promotional email list. Rows are created only when a visitor ticks a separate marketing checkbox.';

ALTER TABLE changtee_web.marketing_subscribers ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE changtee_web.marketing_subscribers FROM PUBLIC;
REVOKE ALL ON TABLE changtee_web.marketing_subscribers FROM anon;
GRANT SELECT, UPDATE ON TABLE changtee_web.marketing_subscribers TO authenticated;
GRANT ALL ON TABLE changtee_web.marketing_subscribers TO service_role;

CREATE POLICY staff_read_marketing_subscribers
  ON changtee_web.marketing_subscribers
  FOR SELECT TO authenticated
  USING (changtee_web.is_staff(auth.uid()));

CREATE POLICY staff_update_marketing_subscribers
  ON changtee_web.marketing_subscribers
  FOR UPDATE TO authenticated
  USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
