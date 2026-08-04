-- changtee_web: marketing site + CMS for Chang Tee Curtain
-- App: changtee-website | Project: pfwygxzwlteqjnnwiwmb (wp-enterprise)

CREATE SCHEMA IF NOT EXISTS changtee_web;
GRANT USAGE ON SCHEMA changtee_web TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA changtee_web
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA changtee_web
  GRANT ALL ON TABLES TO service_role;

CREATE TYPE changtee_web.app_role AS ENUM ('admin', 'editor', 'sales');
CREATE TYPE changtee_web.lead_status AS ENUM (
  'new',
  'contacted',
  'quoted',
  'won',
  'cancelled'
);
CREATE TYPE changtee_web.lead_source AS ENUM ('quote', 'estimate', 'contact', 'fab');
CREATE TYPE changtee_web.outbound_channel AS ENUM ('line', 'email', 'webhook');
CREATE TYPE changtee_web.outbound_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE changtee_web.publish_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE changtee_web.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role changtee_web.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION changtee_web.has_role(_user_id UUID, _role changtee_web.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM changtee_web.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION changtee_web.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM changtee_web.user_roles WHERE user_id = _user_id
  );
$$;

CREATE TABLE changtee_web.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  name_en TEXT,
  summary TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES changtee_web.product_categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  body_html TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  cover_url TEXT,
  status changtee_web.publish_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE TABLE changtee_web.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  body_html TEXT,
  cover_url TEXT,
  location TEXT,
  client_name TEXT,
  product_tags TEXT[] NOT NULL DEFAULT '{}',
  place_tags TEXT[] NOT NULL DEFAULT '{}',
  project_tags TEXT[] NOT NULL DEFAULT '{}',
  free_tags TEXT[] NOT NULL DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  status changtee_web.publish_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_html TEXT,
  cover_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  status changtee_web.publish_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  source_label TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status changtee_web.publish_status NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.sale_gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  href TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status changtee_web.publish_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.estimator_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  base_per_sqm NUMERIC(12, 2) NOT NULL DEFAULT 0,
  motor_multiplier NUMERIC(6, 3) NOT NULL DEFAULT 1.45,
  both_layer_multiplier NUMERIC(6, 3) NOT NULL DEFAULT 1.35,
  upcountry_multiplier NUMERIC(6, 3) NOT NULL DEFAULT 1.10,
  range_min_factor NUMERIC(6, 3) NOT NULL DEFAULT 0.85,
  range_max_factor NUMERIC(6, 3) NOT NULL DEFAULT 1.20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source changtee_web.lead_source NOT NULL DEFAULT 'quote',
  status changtee_web.lead_status NOT NULL DEFAULT 'new',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line_id TEXT,
  email TEXT,
  message TEXT,
  product_interest TEXT,
  job_title TEXT,
  contact_type TEXT,
  business_name TEXT,
  install_address TEXT,
  billing_address TEXT,
  tax_id TEXT,
  product_type TEXT,
  requested_size TEXT,
  site_image_url TEXT,
  callback_date DATE,
  referral_source TEXT,
  estimate_payload JSONB,
  form_payload JSONB,
  pdpa_accepted BOOLEAN NOT NULL DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES changtee_web.leads(id) ON DELETE CASCADE,
  from_status changtee_web.lead_status,
  to_status changtee_web.lead_status NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.outbound_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel changtee_web.outbound_channel NOT NULL,
  lead_id UUID REFERENCES changtee_web.leads(id) ON DELETE SET NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  status changtee_web.outbound_status NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  public_url TEXT,
  mime_type TEXT,
  width INT,
  height INT,
  bytes INT,
  alt_text TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE changtee_web.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX leads_status_created_idx ON changtee_web.leads (status, created_at DESC);
CREATE INDEX portfolio_status_idx ON changtee_web.portfolio_items (status, published_at DESC);
CREATE INDEX posts_status_idx ON changtee_web.posts (status, published_at DESC);
CREATE INDEX outbound_jobs_status_idx ON changtee_web.outbound_jobs (status, created_at DESC);

ALTER TABLE changtee_web.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.sale_gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.estimator_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.outbound_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE changtee_web.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read published content
CREATE POLICY categories_public_read ON changtee_web.product_categories
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY products_public_read ON changtee_web.products
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY portfolio_public_read ON changtee_web.portfolio_items
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY posts_public_read ON changtee_web.posts
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY reviews_public_read ON changtee_web.reviews
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY gallery_public_read ON changtee_web.sale_gallery_items
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY rates_public_read ON changtee_web.estimator_rates
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY redirects_public_read ON changtee_web.redirects
  FOR SELECT TO anon, authenticated USING (true);

-- Staff policies
CREATE POLICY staff_all_categories ON changtee_web.product_categories
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_products ON changtee_web.products
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_portfolio ON changtee_web.portfolio_items
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_posts ON changtee_web.posts
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_reviews ON changtee_web.reviews
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_gallery ON changtee_web.sale_gallery_items
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_rates ON changtee_web.estimator_rates
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_leads ON changtee_web.leads
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_lead_events ON changtee_web.lead_events
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_outbound ON changtee_web.outbound_jobs
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_media ON changtee_web.media_assets
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_redirects ON changtee_web.redirects
  FOR ALL TO authenticated USING (changtee_web.is_staff(auth.uid()))
  WITH CHECK (changtee_web.is_staff(auth.uid()));
CREATE POLICY staff_all_settings ON changtee_web.site_settings
  FOR ALL TO authenticated USING (changtee_web.has_role(auth.uid(), 'admin'))
  WITH CHECK (changtee_web.has_role(auth.uid(), 'admin'));
CREATE POLICY staff_read_roles ON changtee_web.user_roles
  FOR SELECT TO authenticated USING (changtee_web.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
CREATE POLICY staff_manage_roles ON changtee_web.user_roles
  FOR ALL TO authenticated USING (changtee_web.has_role(auth.uid(), 'admin'))
  WITH CHECK (changtee_web.has_role(auth.uid(), 'admin'));

GRANT SELECT ON ALL TABLES IN SCHEMA changtee_web TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA changtee_web TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA changtee_web TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA changtee_web TO authenticated, service_role;

-- Seed estimator placeholder rates
INSERT INTO changtee_web.estimator_rates (product_type, label, base_per_sqm) VALUES
  ('curtain', 'ผ้าม่าน', 900),
  ('roller-blinds', 'ม่านม้วน', 750),
  ('venetian-blinds', 'มู่ลี่', 850),
  ('vertical-blinds', 'ม่านปรับแสง', 700),
  ('pvc-partition', 'ฉากกั้นห้อง', 650),
  ('motorized', 'ม่านไฟฟ้า', 1200),
  ('surface', 'วอลเปเปอร์/ฟิล์ม', 400),
  ('outdoor-factory', 'ม่านภายนอก/อุตสาหกรรม', 950),
  ('service', 'บริการ', 300);

INSERT INTO changtee_web.site_settings (key, value) VALUES
  ('brand', '{"usp":"ถูก เร็ว ดี","warranty_years":1}'::jsonb),
  ('contact', '{"address":"310 ถนนไทยรามัญ แขวงสามวาตะวันตก เขตคลองสามวา กรุงเทพมหานคร 10510"}'::jsonb);
