export const CMS_COLLECTIONS = [
  "hero-slides",
  "portfolio",
  "blog",
  "page-sections",
  "reviews",
] as const;

export type CmsCollection = (typeof CMS_COLLECTIONS)[number];

export function isCmsCollection(value: string): value is CmsCollection {
  return (CMS_COLLECTIONS as readonly string[]).includes(value);
}

export function cmsSettingsKey(collection: CmsCollection): string {
  return `cms.${collection}`;
}
