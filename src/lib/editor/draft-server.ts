import type { PageSectionRecord } from "@/lib/cms/page-sections";
import {
  readCmsCollectionMeta,
  writeCmsCollection,
} from "@/lib/cms/cms-server";

export async function readPageSectionsDraft(): Promise<{
  items: PageSectionRecord[];
  updatedAt: string | null;
} | null> {
  return readCmsCollectionMeta<PageSectionRecord>("page-sections-draft");
}

export async function readPageSectionsPublished(): Promise<{
  items: PageSectionRecord[];
  updatedAt: string | null;
} | null> {
  return readCmsCollectionMeta<PageSectionRecord>("page-sections");
}

/** Merge draft records for one pageKey into the draft collection */
export async function writePageKeyDraft(
  pageKey: string,
  sections: PageSectionRecord[],
  baseUpdatedAt?: string | null,
): Promise<
  | { ok: true; updatedAt: string }
  | { ok: false; error: string; status?: number }
> {
  const current = await readPageSectionsDraft();
  if (
    baseUpdatedAt &&
    current?.updatedAt &&
    current.updatedAt !== baseUpdatedAt
  ) {
    return {
      ok: false,
      error: "มีคนอื่นบันทึกร่างนี้ไปแล้ว — โหลดใหม่แล้วลองอีกครั้ง",
      status: 409,
    };
  }

  const prev = current?.items ?? [];
  const map = new Map(
    prev.map((r) => [`${r.pageKey}::${r.sectionId}`, r] as const),
  );
  const now = new Date().toISOString();
  for (const rec of sections) {
    if (rec.pageKey !== pageKey) continue;
    map.set(`${rec.pageKey}::${rec.sectionId}`, {
      ...rec,
      updatedAt: now,
    });
  }

  const result = await writeCmsCollection(
    "page-sections-draft",
    [...map.values()],
  );
  if (!result.ok) return result;
  return { ok: true, updatedAt: result.updatedAt };
}
