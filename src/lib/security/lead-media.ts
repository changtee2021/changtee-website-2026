const STORAGE_PREFIX = "storage:";

export function toStorageRef(path: string) {
  return `${STORAGE_PREFIX}${path}`;
}

export function isStorageRef(value: string) {
  return value.startsWith(STORAGE_PREFIX);
}

export function storagePathFromRef(value: string) {
  return isStorageRef(value) ? value.slice(STORAGE_PREFIX.length) : value;
}

export function leadImageRefs(lead: {
  siteImageUrls?: string[] | null;
  siteImageUrl?: string | null;
}) {
  if (lead.siteImageUrls?.length) return lead.siteImageUrls.filter(Boolean);
  return lead.siteImageUrl ? [lead.siteImageUrl] : [];
}

export function isDirectMediaUrl(value: string) {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/uploads/")
  );
}
