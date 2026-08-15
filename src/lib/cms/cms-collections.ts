/**
 * CMS collection allowlists.
 * Draft / history keys must NEVER appear in PUBLIC_CMS_COLLECTIONS —
 * /api/public/cms/[collection] only serves the public list.
 */

export const PUBLIC_CMS_COLLECTIONS = [
  "hero-slides",
  "portfolio",
  "blog",
  "page-sections",
  "reviews",
  "catalogs",
  "careers",
] as const;

export const ADMIN_ONLY_CMS_COLLECTIONS = [
  "page-sections-draft",
  "page-sections-history",
] as const;

export const ADMIN_CMS_COLLECTIONS = [
  ...PUBLIC_CMS_COLLECTIONS,
  ...ADMIN_ONLY_CMS_COLLECTIONS,
] as const;

/** @deprecated Prefer PUBLIC_CMS_COLLECTIONS or ADMIN_CMS_COLLECTIONS explicitly */
export const CMS_COLLECTIONS = PUBLIC_CMS_COLLECTIONS;

export type PublicCmsCollection = (typeof PUBLIC_CMS_COLLECTIONS)[number];
export type AdminOnlyCmsCollection = (typeof ADMIN_ONLY_CMS_COLLECTIONS)[number];
export type AdminCmsCollection = (typeof ADMIN_CMS_COLLECTIONS)[number];
export type CmsCollection = PublicCmsCollection;

export function isPublicCmsCollection(
  value: string,
): value is PublicCmsCollection {
  return (PUBLIC_CMS_COLLECTIONS as readonly string[]).includes(value);
}

export function isAdminCmsCollection(
  value: string,
): value is AdminCmsCollection {
  return (ADMIN_CMS_COLLECTIONS as readonly string[]).includes(value);
}

/** @deprecated use isPublicCmsCollection or isAdminCmsCollection */
export function isCmsCollection(value: string): value is CmsCollection {
  return isPublicCmsCollection(value);
}

/** site_settings.key for a collection */
export function cmsSettingsKey(
  collection: AdminCmsCollection | PublicCmsCollection,
): string {
  if (collection === "page-sections-draft") return "cms.page-sections.draft";
  if (collection === "page-sections-history") return "cms.page-sections.history";
  return `cms.${collection}`;
}
