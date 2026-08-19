import { promises as fs } from "fs";
import path from "path";
import type {
  AdminCmsCollection,
  PublicCmsCollection,
} from "@/lib/cms/cms-collections";

type CmsKey = AdminCmsCollection | PublicCmsCollection;

export function canUseLocalCmsStore(): boolean {
  return !process.env.VERCEL;
}

const LOCAL_CMS_DIR = path.join(process.cwd(), ".data", "cms");

function localCmsFile(collection: string) {
  return path.join(LOCAL_CMS_DIR, `${collection}.json`);
}

export async function readLocalCmsCollection<T>(
  collection: CmsKey,
): Promise<T[] | null> {
  if (!canUseLocalCmsStore()) return null;
  try {
    const raw = await fs.readFile(localCmsFile(collection), "utf8");
    const parsed = JSON.parse(raw) as { items?: T[] } | T[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.items)) return parsed.items;
    return null;
  } catch {
    return null;
  }
}

export async function writeLocalCmsCollection<T>(
  collection: CmsKey,
  items: T[],
): Promise<{ ok: true; updatedAt: string } | { ok: false; error: string }> {
  if (!canUseLocalCmsStore()) {
    return { ok: false, error: "Local CMS store is not available" };
  }
  try {
    await fs.mkdir(LOCAL_CMS_DIR, { recursive: true });
    const updatedAt = new Date().toISOString();
    await fs.writeFile(
      localCmsFile(collection),
      JSON.stringify({ items, updatedAt }, null, 2),
      "utf8",
    );
    return { ok: true, updatedAt };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Local CMS write failed",
    };
  }
}
