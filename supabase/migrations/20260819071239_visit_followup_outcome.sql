-- Follow-up after contacting the customer: reschedule, cancel reason, visit outcome scores.
-- App: changtee-website | schema: changtee_web

ALTER TYPE changtee_web.visit_status ADD VALUE IF NOT EXISTS 'rescheduled';

ALTER TABLE changtee_web.factory_visit_bookings
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT,
  ADD COLUMN IF NOT EXISTS reschedule_reason TEXT,
  ADD COLUMN IF NOT EXISTS previous_visit_date DATE,
  ADD COLUMN IF NOT EXISTS previous_session changtee_web.visit_session,
  ADD COLUMN IF NOT EXISTS outcome_scores JSONB,
  ADD COLUMN IF NOT EXISTS outcome_note TEXT,
  ADD COLUMN IF NOT EXISTS outcome_next_step TEXT;

COMMENT ON COLUMN changtee_web.factory_visit_bookings.cancel_reason IS
  'Why the booking was cancelled — required when status = cancelled.';
COMMENT ON COLUMN changtee_web.factory_visit_bookings.reschedule_reason IS
  'Why the date/session was moved — required when status = rescheduled.';
COMMENT ON COLUMN changtee_web.factory_visit_bookings.outcome_scores IS
  'Five 1-5 scores after the visit/presentation (welcome, process, samples, needs, deal).';
COMMENT ON COLUMN changtee_web.factory_visit_bookings.outcome_next_step IS
  'Post-visit next step: deal | waiting | follow_up | no_deal.';
