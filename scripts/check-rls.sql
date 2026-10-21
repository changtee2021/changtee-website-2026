-- Read-only. Expect zero rows after every changtee_web migration.
-- Bootstrap granted INSERT, UPDATE, DELETE on all tables in this schema to
-- authenticated, so a table without RLS is writable by staff from every app
-- on the shared project.

SELECT n.nspname AS schema_name, c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'changtee_web'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false
ORDER BY c.relname;
