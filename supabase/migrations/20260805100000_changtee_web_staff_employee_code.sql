-- Prepare staff profile fields for admin-provisioned login (employee code).
-- Auth enforcement comes later; this only extends schema.

ALTER TABLE changtee_web.profiles
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS note TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_employee_code_uidx
  ON changtee_web.profiles (employee_code)
  WHERE employee_code IS NOT NULL;

COMMENT ON COLUMN changtee_web.profiles.employee_code IS
  'Staff login ID (รหัสพนักงาน). Bootstrap admin = 000000.';
