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

export function parsePrivateStorageRef(
  value: string,
  folder: "leads" | "factory-visits",
): string | null {
  const trimmed = value.trim();
  if (!isStorageRef(trimmed)) return null;
  const storagePath = storagePathFromRef(trimmed);
  if (!storagePath.startsWith(`${folder}/`)) return null;
  if (storagePath.includes("..") || storagePath.includes("\\") || storagePath.includes("//")) {
    return null;
  }
  if (!/^[a-zA-Z0-9._/-]+$/.test(storagePath) || storagePath.length > 240) {
    return null;
  }
  return toStorageRef(storagePath);
}

/** Only accept leads/ objects minted by /api/leads/upload. */
export function parseLeadStorageRef(value: string): string | null {
  return parsePrivateStorageRef(value, "leads");
}

/** Only accept factory-visits/ objects minted by /api/factory-visits/upload. */
export function parseVisitStorageRef(value: string): string | null {
  return parsePrivateStorageRef(value, "factory-visits");
}
