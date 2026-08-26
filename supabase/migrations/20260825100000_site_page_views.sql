-- First-party page views for the admin dashboard.
-- Anonymous only: no IP, no user-agent, no name. Writes go through the service role.

CREATE TABLE changtee_web.site_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  path text NOT NULL,
  host text,
  referrer_host text,
  device text NOT NULL CHECK (device IN ('mobile', 'desktop', 'tablet')),
  session_id text NOT NULL,
  visitor_id text,
  kind text NOT NULL DEFAULT 'page' CHECK (kind IN ('page', 'ping', 'click')),
  click_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_page_views_occurred_at_idx
  ON changtee_web.site_page_views (occurred_at DESC);

CREATE INDEX site_page_views_kind_occurred_idx
  ON changtee_web.site_page_views (kind, occurred_at DESC);

CREATE INDEX site_page_views_session_occurred_idx
  ON changtee_web.site_page_views (session_id, occurred_at DESC);

COMMENT ON TABLE changtee_web.site_page_views IS
  'Anonymous public-site hits for admin analytics. PII is not stored.';

ALTER TABLE changtee_web.site_page_views ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE changtee_web.site_page_views FROM PUBLIC;
REVOKE ALL ON TABLE changtee_web.site_page_views FROM anon;
REVOKE ALL ON TABLE changtee_web.site_page_views FROM authenticated;
GRANT ALL ON TABLE changtee_web.site_page_views TO service_role;

CREATE OR REPLACE FUNCTION changtee_web.analytics_overview(
  p_from timestamptz,
  p_to timestamptz,
  p_include_local boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = changtee_web, pg_temp
AS $$
DECLARE
  span interval;
  prev_from timestamptz;
  prev_to timestamptz;
  use_hours boolean;
  result jsonb;
BEGIN
  -- WHY: one round-trip for the admin dashboard instead of pulling raw rows.
  IF p_from IS NULL OR p_to IS NULL OR p_to <= p_from THEN
    RAISE EXCEPTION 'invalid analytics range';
  END IF;

  span := p_to - p_from;
  prev_from := p_from - span;
  prev_to := p_from;
  use_hours := span <= interval '36 hours';

  WITH
  base AS (
    SELECT v.*
    FROM changtee_web.site_page_views v
    WHERE (p_include_local
      OR coalesce(v.host, '') NOT IN ('localhost', '127.0.0.1'))
  ),
  ranged AS (
    SELECT * FROM base
    WHERE occurred_at >= p_from AND occurred_at < p_to
  ),
  prev AS (
    SELECT * FROM base
    WHERE occurred_at >= prev_from AND occurred_at < prev_to
  ),
  pages AS (
    SELECT * FROM ranged WHERE kind = 'page'
  ),
  prev_pages AS (
    SELECT * FROM prev WHERE kind = 'page'
  ),
  session_stats AS (
    SELECT
      session_id,
      count(*) FILTER (WHERE kind = 'page') AS page_count,
      extract(epoch FROM (max(occurred_at) - min(occurred_at))) AS duration_seconds
    FROM ranged
    GROUP BY session_id
  ),
  prev_session_stats AS (
    SELECT
      session_id,
      count(*) FILTER (WHERE kind = 'page') AS page_count,
      extract(epoch FROM (max(occurred_at) - min(occurred_at))) AS duration_seconds
    FROM prev
    GROUP BY session_id
  ),
  kpis AS (
    SELECT
      (
        SELECT count(DISTINCT coalesce(nullif(visitor_id, ''), session_id))
        FROM pages
      ) AS visitors,
      (SELECT count(*) FROM pages) AS pageviews,
      (SELECT count(DISTINCT session_id) FROM pages) AS sessions,
      (
        SELECT CASE
          WHEN count(*) = 0 THEN 0
          ELSE round(
            100.0 * count(*) FILTER (WHERE page_count = 1) / count(*),
            1
          )
        END
        FROM session_stats
        WHERE page_count > 0
      ) AS bounce_rate,
      (
        SELECT coalesce(round(avg(duration_seconds))::int, 0)
        FROM session_stats
        WHERE page_count > 0
      ) AS avg_session_seconds,
      (
        SELECT count(*)
        FROM changtee_web.leads
        WHERE created_at >= p_from AND created_at < p_to
      ) AS leads
  ),
  prev_kpis AS (
    SELECT
      (
        SELECT count(DISTINCT coalesce(nullif(visitor_id, ''), session_id))
        FROM prev_pages
      ) AS visitors,
      (SELECT count(*) FROM prev_pages) AS pageviews,
      (SELECT count(DISTINCT session_id) FROM prev_pages) AS sessions,
      (
        SELECT CASE
          WHEN count(*) = 0 THEN 0
          ELSE round(
            100.0 * count(*) FILTER (WHERE page_count = 1) / count(*),
            1
          )
        END
        FROM prev_session_stats
        WHERE page_count > 0
      ) AS bounce_rate,
      (
        SELECT coalesce(round(avg(duration_seconds))::int, 0)
        FROM prev_session_stats
        WHERE page_count > 0
      ) AS avg_session_seconds,
      (
        SELECT count(*)
        FROM changtee_web.leads
        WHERE created_at >= prev_from AND created_at < prev_to
      ) AS leads
  ),
  traffic AS (
    SELECT
      CASE
        WHEN use_hours THEN to_char(
          date_trunc('hour', occurred_at AT TIME ZONE 'Asia/Bangkok'),
          'HH24:00'
        )
        ELSE to_char(
          (occurred_at AT TIME ZONE 'Asia/Bangkok')::date,
          'DD/MM'
        )
      END AS label,
      min(occurred_at) AS sort_at,
      count(DISTINCT coalesce(nullif(visitor_id, ''), session_id)) AS users,
      count(*) AS pageviews
    FROM pages
    GROUP BY 1
  ),
  devices AS (
    SELECT
      initcap(device) AS name,
      count(*) AS hits
    FROM pages
    GROUP BY device
  ),
  top_pages AS (
    SELECT path AS name, count(*) AS value
    FROM pages
    GROUP BY path
    ORDER BY value DESC
    LIMIT 8
  ),
  clicks AS (
    SELECT coalesce(nullif(click_name, ''), 'อื่น ๆ') AS name, count(*) AS value
    FROM ranged
    WHERE kind = 'click'
    GROUP BY 1
    ORDER BY value DESC
    LIMIT 8
  ),
  sources AS (
    SELECT
      CASE
        WHEN referrer_host IS NULL
          OR referrer_host = ''
          OR referrer_host = host
          THEN 'Direct'
        WHEN referrer_host ILIKE '%google%'
          OR referrer_host ILIKE '%bing%'
          OR referrer_host ILIKE '%yahoo%'
          THEN 'Organic Search'
        WHEN referrer_host ILIKE '%facebook%'
          OR referrer_host ILIKE '%fbclid%'
          OR referrer_host ILIKE '%line.me%'
          OR referrer_host ILIKE '%instagram%'
          OR referrer_host ILIKE '%tiktok%'
          THEN 'Social / LINE'
        ELSE 'Referral'
      END AS name,
      count(*) AS hits
    FROM pages
    GROUP BY 1
  ),
  live_latest AS (
    SELECT DISTINCT ON (session_id)
      path,
      device,
      referrer_host,
      occurred_at
    FROM base
    WHERE occurred_at > now() - interval '90 seconds'
    ORDER BY session_id, occurred_at DESC
  )
  SELECT jsonb_build_object(
    'visitors', (SELECT visitors FROM kpis),
    'pageviews', (SELECT pageviews FROM kpis),
    'sessions', (SELECT sessions FROM kpis),
    'bounceRate', (SELECT bounce_rate FROM kpis),
    'avgSessionSeconds', (SELECT avg_session_seconds FROM kpis),
    'leads', (SELECT leads FROM kpis),
    'prev', jsonb_build_object(
      'visitors', (SELECT visitors FROM prev_kpis),
      'pageviews', (SELECT pageviews FROM prev_kpis),
      'sessions', (SELECT sessions FROM prev_kpis),
      'bounceRate', (SELECT bounce_rate FROM prev_kpis),
      'avgSessionSeconds', (SELECT avg_session_seconds FROM prev_kpis),
      'leads', (SELECT leads FROM prev_kpis)
    ),
    'traffic', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'label', t.label,
          'users', t.users,
          'pageviews', t.pageviews
        )
        ORDER BY t.sort_at
      )
      FROM traffic t
    ), '[]'::jsonb),
    'devices', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('name', d.name, 'value', d.hits)
        ORDER BY d.hits DESC
      )
      FROM devices d
    ), '[]'::jsonb),
    'topPages', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('name', p.name, 'value', p.value)
        ORDER BY p.value DESC
      )
      FROM top_pages p
    ), '[]'::jsonb),
    'clicks', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('name', c.name, 'value', c.value)
        ORDER BY c.value DESC
      )
      FROM clicks c
    ), '[]'::jsonb),
    'sources', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object('name', s.name, 'value', s.hits)
        ORDER BY s.hits DESC
      )
      FROM sources s
    ), '[]'::jsonb),
    'funnel', jsonb_build_array(
      jsonb_build_object(
        'step', 'เข้าเว็บ',
        'value', (SELECT count(DISTINCT session_id) FROM pages)
      ),
      jsonb_build_object(
        'step', 'ดูสินค้า',
        'value', (
          SELECT count(DISTINCT session_id)
          FROM pages
          WHERE path LIKE '/products%'
        )
      ),
      jsonb_build_object(
        'step', 'ดูแคตตาล็อก / ผลงาน',
        'value', (
          SELECT count(DISTINCT session_id)
          FROM pages
          WHERE path LIKE '/portfolio%' OR path LIKE '%.pdf'
        )
      ),
      jsonb_build_object(
        'step', 'หน้าใบเสนอราคา',
        'value', (
          SELECT count(DISTINCT session_id)
          FROM pages
          WHERE path LIKE '/quote%'
        )
      ),
      jsonb_build_object(
        'step', 'ส่ง Lead สำเร็จ',
        'value', (SELECT leads FROM kpis)
      )
    ),
    'liveOnline', (SELECT count(*) FROM live_latest),
    'liveRows', coalesce((
      SELECT jsonb_agg(
        jsonb_build_object(
          'path', l.path,
          'device', l.device,
          'referrerHost', l.referrer_host,
          'occurredAt', l.occurred_at
        )
        ORDER BY l.occurred_at DESC
      )
      FROM live_latest l
    ), '[]'::jsonb)
  )
  INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION changtee_web.analytics_overview(timestamptz, timestamptz, boolean) IS
  'Aggregates anonymous site traffic for the admin overview. Service-role only.';

REVOKE ALL ON FUNCTION changtee_web.analytics_overview(timestamptz, timestamptz, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION changtee_web.analytics_overview(timestamptz, timestamptz, boolean) FROM anon;
REVOKE ALL ON FUNCTION changtee_web.analytics_overview(timestamptz, timestamptz, boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION changtee_web.analytics_overview(timestamptz, timestamptz, boolean) TO service_role;
