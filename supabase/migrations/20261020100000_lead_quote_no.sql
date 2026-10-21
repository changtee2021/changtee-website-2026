-- Human-friendly running number for web leads: Q69-0001 (Buddhist-era year, resets yearly).

ALTER TABLE changtee_web.leads
  ADD COLUMN IF NOT EXISTS quote_no text;

CREATE UNIQUE INDEX IF NOT EXISTS leads_quote_no_key
  ON changtee_web.leads (quote_no);

COMMENT ON COLUMN changtee_web.leads.quote_no IS
  'Running number shown to sales and customers, e.g. Q69-0001. Assigned by trigger on insert.';

CREATE TABLE IF NOT EXISTS changtee_web.lead_quote_counters (
  be_year int PRIMARY KEY CHECK (be_year BETWEEN 2500 AND 2700),
  last_no int NOT NULL CHECK (last_no >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE changtee_web.lead_quote_counters IS
  'Last issued lead number per Buddhist-era year (Bangkok time).';

ALTER TABLE changtee_web.lead_quote_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE changtee_web.lead_quote_counters FROM PUBLIC;
REVOKE ALL ON TABLE changtee_web.lead_quote_counters FROM anon;
REVOKE ALL ON TABLE changtee_web.lead_quote_counters FROM authenticated;
GRANT ALL ON TABLE changtee_web.lead_quote_counters TO service_role;

CREATE OR REPLACE FUNCTION changtee_web.format_lead_quote_no(p_be_year int, p_no int)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT format(
    'Q%s-%s',
    lpad((p_be_year % 100)::text, 2, '0'),
    lpad(p_no::text, greatest(4, length(p_no::text)), '0')
  );
$$;

CREATE OR REPLACE FUNCTION changtee_web.assign_lead_quote_no()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = changtee_web, pg_temp
AS $$
DECLARE
  v_year int;
  v_no int;
BEGIN
  -- WHY: sales quote a short number to customers on the phone; the upsert
  -- row-locks the year's counter so concurrent submits never share a number.
  IF NEW.quote_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_year := extract(year FROM coalesce(NEW.created_at, now()) AT TIME ZONE 'Asia/Bangkok')::int + 543;

  INSERT INTO changtee_web.lead_quote_counters AS c (be_year, last_no)
  VALUES (v_year, 1)
  ON CONFLICT (be_year)
  DO UPDATE SET last_no = c.last_no + 1, updated_at = now()
  RETURNING c.last_no INTO v_no;

  NEW.quote_no := changtee_web.format_lead_quote_no(v_year, v_no);
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION changtee_web.assign_lead_quote_no() FROM PUBLIC;

DROP TRIGGER IF EXISTS leads_assign_quote_no ON changtee_web.leads;
CREATE TRIGGER leads_assign_quote_no
  BEFORE INSERT ON changtee_web.leads
  FOR EACH ROW
  EXECUTE FUNCTION changtee_web.assign_lead_quote_no();

-- Backfill existing leads in submit order, per year.
WITH numbered AS (
  SELECT
    id,
    extract(year FROM created_at AT TIME ZONE 'Asia/Bangkok')::int + 543 AS be_year,
    row_number() OVER (
      PARTITION BY extract(year FROM created_at AT TIME ZONE 'Asia/Bangkok')
      ORDER BY created_at, id
    )::int AS seq
  FROM changtee_web.leads
  WHERE quote_no IS NULL
)
UPDATE changtee_web.leads l
SET quote_no = changtee_web.format_lead_quote_no(n.be_year, n.seq)
FROM numbered n
WHERE l.id = n.id;

INSERT INTO changtee_web.lead_quote_counters (be_year, last_no)
SELECT
  extract(year FROM created_at AT TIME ZONE 'Asia/Bangkok')::int + 543,
  count(*)::int
FROM changtee_web.leads
GROUP BY 1
ON CONFLICT (be_year) DO UPDATE SET last_no = greatest(lead_quote_counters.last_no, EXCLUDED.last_no), updated_at = now();

NOTIFY pgrst, 'reload schema';
