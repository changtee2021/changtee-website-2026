-- Salesperson who claimed a lead from the LINE group card.
-- Text name (not auth.users) because sales staff tap from LINE without an admin account.

ALTER TABLE changtee_web.leads
  ADD COLUMN IF NOT EXISTS line_claimed_by text,
  ADD COLUMN IF NOT EXISTS line_claimed_at timestamptz,
  ADD COLUMN IF NOT EXISTS line_claimed_user_id text;

COMMENT ON COLUMN changtee_web.leads.line_claimed_by IS
  'Sales nickname tapped on the LINE lead card. First tap wins; set once by /api/line/webhook.';
COMMENT ON COLUMN changtee_web.leads.line_claimed_at IS
  'When the lead was claimed from LINE.';
COMMENT ON COLUMN changtee_web.leads.line_claimed_user_id IS
  'LINE userId of the person who tapped, kept to audit who claimed on whose behalf.';

NOTIFY pgrst, 'reload schema';
