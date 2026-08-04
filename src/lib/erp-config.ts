/** Chang Tee website Supabase project (wp-enterprise) */
export const SUPABASE_PROJECT_ID = "pfwygxzwlteqjnnwiwmb";

/** @deprecated use SUPABASE_PROJECT_ID — kept for older imports */
export const ERP_PROJECT_ID = SUPABASE_PROJECT_ID;

export const SUPABASE_SCHEMA =
  process.env.NEXT_PUBLIC_SUPABASE_SCHEMA?.trim() || "changtee_web";

export const APP_SLUG = "changtee-website";
