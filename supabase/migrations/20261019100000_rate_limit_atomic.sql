-- Why: public form routes run on many serverless isolates. A read-then-update
-- counter drops concurrent hits, so the limit must be one atomic statement.

CREATE OR REPLACE FUNCTION changtee_web.rate_limit_hit(
  _key text,
  _window_seconds integer,
  _max integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = changtee_web, public
AS $$
DECLARE
  _count integer;
BEGIN
  IF _key IS NULL OR length(_key) = 0 OR length(_key) > 200 THEN
    RETURN true;
  END IF;
  IF _window_seconds IS NULL OR _window_seconds < 1 OR _max IS NULL OR _max < 1 THEN
    RETURN true;
  END IF;

  INSERT INTO changtee_web.rate_limits AS rl (key, window_started_at, hit_count, updated_at)
  VALUES (_key, now(), 1, now())
  ON CONFLICT (key) DO UPDATE
  SET
    hit_count = CASE
      WHEN rl.window_started_at < now() - make_interval(secs => _window_seconds)
        THEN 1
      ELSE rl.hit_count + 1
    END,
    window_started_at = CASE
      WHEN rl.window_started_at < now() - make_interval(secs => _window_seconds)
        THEN now()
      ELSE rl.window_started_at
    END,
    updated_at = now()
  RETURNING hit_count INTO _count;

  RETURN _count > _max;
END;
$$;

REVOKE ALL ON FUNCTION changtee_web.rate_limit_hit(text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION changtee_web.rate_limit_hit(text, integer, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION changtee_web.rate_limit_hit(text, integer, integer) TO service_role;
