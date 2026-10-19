-- Weekly / monthly web summary pushed to the sales LINE group.

ALTER TABLE changtee_web.site_page_views
  ADD COLUMN IF NOT EXISTS referrer_tracked boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN changtee_web.site_page_views.referrer_tracked IS
  'True when referrer_host came from the browser document.referrer. Older rows stored the beacon request Referer (always our own host), so their source is unknown.';

CREATE OR REPLACE FUNCTION changtee_web.line_report_stats(
  p_from timestamptz,
  p_to timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = changtee_web, pg_temp
AS $$
DECLARE
  result jsonb;
BEGIN
  -- WHY: the LINE report needs one compact summary per period; people are
  -- counted once per visitor (or session without consent) so repeated taps
  -- on the same button do not inflate contact numbers.
  IF p_from IS NULL OR p_to IS NULL OR p_to <= p_from THEN
    RAISE EXCEPTION 'invalid report range';
  END IF;

  WITH
  base AS (
    SELECT
      v.occurred_at,
      v.path,
      v.host,
      v.referrer_host,
      v.referrer_tracked,
      v.device,
      v.session_id,
      coalesce(nullif(v.visitor_id, ''), v.session_id) AS who,
      v.kind,
      v.click_name
    FROM changtee_web.site_page_views v
    WHERE v.occurred_at >= p_from
      AND v.occurred_at < p_to
      AND coalesce(v.host, '') NOT IN ('localhost', '127.0.0.1')
  ),
  pages AS (
    SELECT occurred_at, path, host, referrer_host, referrer_tracked, device, session_id, who
    FROM base
    WHERE kind = 'page'
  ),
  entries AS (
    SELECT DISTINCT ON (session_id)
      session_id,
      who,
      occurred_at,
      device,
      referrer_tracked,
      CASE
        WHEN coalesce(referrer_host, '') = ''
          OR referrer_host = host
          OR referrer_host LIKE '%changtee-curtain.com'
          THEN 'direct'
        WHEN referrer_host ILIKE '%google%'
          OR referrer_host ILIKE '%bing%'
          OR referrer_host ILIKE '%yahoo%'
          OR referrer_host ILIKE '%duckduckgo%'
          THEN 'search'
        WHEN referrer_host ILIKE '%facebook%'
          OR referrer_host ILIKE '%fb.%'
          OR referrer_host ILIKE '%line.me%'
          OR referrer_host ILIKE '%instagram%'
          OR referrer_host ILIKE '%tiktok%'
          OR referrer_host ILIKE '%youtube%'
          THEN 'social'
        ELSE 'other'
      END AS source
    FROM pages
    ORDER BY session_id, occurred_at
  ),
  hourly AS (
    SELECT
      floor(extract(hour FROM occurred_at AT TIME ZONE 'Asia/Bangkok') / 3)::int AS bucket,
      count(DISTINCT who) AS people
    FROM pages
    GROUP BY 1
  ),
  daily AS (
    SELECT
      (occurred_at AT TIME ZONE 'Asia/Bangkok')::date AS day,
      count(DISTINCT who) AS people
    FROM pages
    GROUP BY 1
  ),
  products AS (
    SELECT split_part(path, '/', 3) AS slug, count(*) AS views
    FROM pages
    WHERE path LIKE '/products/_%'
    GROUP BY 1
    ORDER BY views DESC
    LIMIT 3
  )
  SELECT jsonb_build_object(
    'visitors', (SELECT count(DISTINCT who) FROM pages),
    'pageviews', (SELECT count(*) FROM pages),
    'sessions', (SELECT count(*) FROM entries),
    'leads', (
      SELECT count(*)
      FROM changtee_web.leads l
      WHERE l.created_at >= p_from AND l.created_at < p_to
    ),
    'contacts', jsonb_build_object(
      'line', (SELECT count(DISTINCT who) FROM base WHERE kind = 'click' AND click_name = 'line'),
      'phone', (SELECT count(DISTINCT who) FROM base WHERE kind = 'click' AND click_name = 'phone'),
      'quote', (SELECT count(DISTINCT who) FROM base WHERE kind = 'click' AND click_name = 'quote'),
      'facebook', (SELECT count(DISTINCT who) FROM base WHERE kind = 'click' AND click_name = 'facebook')
    ),
    'hours', (
      SELECT jsonb_agg(coalesce(h.people, 0) ORDER BY b.bucket)
      FROM generate_series(0, 7) AS b(bucket)
      LEFT JOIN hourly h ON h.bucket = b.bucket
    ),
    'peakDay', (
      SELECT jsonb_build_object('day', to_char(d.day, 'YYYY-MM-DD'), 'people', d.people)
      FROM daily d
      ORDER BY d.people DESC, d.day
      LIMIT 1
    ),
    'mobileShare', (
      SELECT CASE WHEN count(*) = 0 THEN 0
        ELSE round(100.0 * count(*) FILTER (WHERE device = 'mobile') / count(*))
      END
      FROM entries
    ),
    'sourcesTracked', (SELECT count(*) FROM entries WHERE referrer_tracked),
    'sourcesTrackedFrom', (
      SELECT to_char(min(occurred_at) AT TIME ZONE 'Asia/Bangkok', 'YYYY-MM-DD')
      FROM entries
      WHERE referrer_tracked
    ),
    'sources', jsonb_build_object(
      'search', (SELECT count(DISTINCT who) FROM entries WHERE referrer_tracked AND source = 'search'),
      'direct', (SELECT count(DISTINCT who) FROM entries WHERE referrer_tracked AND source = 'direct'),
      'social', (SELECT count(DISTINCT who) FROM entries WHERE referrer_tracked AND source = 'social'),
      'other', (SELECT count(DISTINCT who) FROM entries WHERE referrer_tracked AND source = 'other')
    ),
    'topProducts', coalesce((
      SELECT jsonb_agg(jsonb_build_object('slug', p.slug, 'views', p.views) ORDER BY p.views DESC)
      FROM products p
    ), '[]'::jsonb)
  )
  INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION changtee_web.line_report_stats(timestamptz, timestamptz) IS
  'Summary for the weekly / monthly LINE web report. Service-role only.';

REVOKE ALL ON FUNCTION changtee_web.line_report_stats(timestamptz, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION changtee_web.line_report_stats(timestamptz, timestamptz) FROM anon;
REVOKE ALL ON FUNCTION changtee_web.line_report_stats(timestamptz, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION changtee_web.line_report_stats(timestamptz, timestamptz) TO service_role;

NOTIFY pgrst, 'reload schema';
