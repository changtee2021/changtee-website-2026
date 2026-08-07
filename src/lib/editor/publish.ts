import { revalidatePath } from "next/cache";
import type { PageSectionRecord } from "@/lib/cms/page-sections";
import { writeCmsCollection } from "@/lib/cms/cms-server";
import {
  readPageSectionsDraft,
  readPageSectionsPublished,
} from "@/lib/editor/draft-server";
import { flattenPages } from "@/lib/editor/page-registry";

const HISTORY_LIMIT = 10;

function validateSections(
  defsPageKey: string,
  sections: PageSectionRecord[],
): string | null {
  for (const rec of sections) {
    if (rec.pageKey !== defsPageKey) continue;
    for (const [key, value] of Object.entries(rec.values || {})) {
      if (typeof value !== "string") {
        return `ฟิลด์ ${key} ต้องเป็นข้อความ`;
      }
      if (/^\s*javascript:/i.test(value)) {
        return `ฟิลด์ ${key} มีลิงก์ที่ไม่ปลอดภัย`;
      }
    }
  }
  return null;
}

export async function publishPageKey(
  pageKey: string,
  baseDraftUpdatedAt?: string | null,
): Promise<
  | { ok: true; updatedAt: string; revalidated: string[] }
  | { ok: false; error: string; status?: number }
> {
  const draft = await readPageSectionsDraft();
  if (!draft) {
    return { ok: false, error: "ไม่พบฉบับร่าง", status: 404 };
  }
  if (
    baseDraftUpdatedAt &&
    draft.updatedAt &&
    draft.updatedAt !== baseDraftUpdatedAt
  ) {
    return {
      ok: false,
      error: "ร่างถูกเปลี่ยนจากที่อื่น — โหลดใหม่แล้วลองอีกครั้ง",
      status: 409,
    };
  }

  const pageSections = draft.items.filter((r) => r.pageKey === pageKey);
  if (pageSections.length === 0) {
    return { ok: false, error: "ไม่มีร่างสำหรับหน้านี้", status: 400 };
  }

  const invalid = validateSections(pageKey, pageSections);
  if (invalid) return { ok: false, error: invalid, status: 400 };

  const published = await readPageSectionsPublished();
  const prevItems = published?.items ?? [];

  // History snapshot (best-effort)
  const historyMeta = await readCmsHistory();
  const history = historyMeta ?? [];
  history.unshift({
    at: new Date().toISOString(),
    pageKey,
    items: prevItems.filter((r) => r.pageKey === pageKey),
  });
  await writeCmsCollection(
    "page-sections-history",
    history.slice(0, HISTORY_LIMIT),
  );

  const map = new Map(
    prevItems.map((r) => [`${r.pageKey}::${r.sectionId}`, r] as const),
  );
  const now = new Date().toISOString();
  for (const rec of pageSections) {
    map.set(`${rec.pageKey}::${rec.sectionId}`, {
      ...rec,
      updatedAt: now,
    });
  }

  const result = await writeCmsCollection("page-sections", [...map.values()]);
  if (!result.ok) return result;

  const node = flattenPages().find((p) => p.pageKey === pageKey);
  const paths = node?.revalidate?.length
    ? node.revalidate
    : node?.livePath
      ? [node.livePath]
      : ["/"];

  for (const path of paths) {
    try {
      revalidatePath(path);
    } catch {
      /* ignore on non-next runtimes */
    }
  }
  // Template pages: revalidate the dynamic segment
  if (pageKey === "product") {
    try {
      revalidatePath("/products/[category]/[slug]", "page");
    } catch {
      /* ignore */
    }
  }

  return { ok: true, updatedAt: result.updatedAt, revalidated: paths };
}

type HistoryEntry = {
  at: string;
  pageKey: string;
  items: PageSectionRecord[];
};

async function readCmsHistory(): Promise<HistoryEntry[] | null> {
  const { readCmsCollection } = await import("@/lib/cms/cms-server");
  const items = await readCmsCollection<HistoryEntry>("page-sections-history");
  return items;
}
