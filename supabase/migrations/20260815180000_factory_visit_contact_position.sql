-- Add contact person job title on factory visit bookings
ALTER TABLE changtee_web.factory_visit_bookings
  ADD COLUMN IF NOT EXISTS contact_position TEXT;
