import { revalidatePath } from "next/cache";
import type { AdminCmsCollection } from "@/lib/cms/cms-collections";

const COLLECTION_PATHS: Record<string, string[]> = {
  portfolio: ["/", "/portfolio"],
  blog: ["/", "/blog"],
  "hero-slides": ["/"],
  "page-sections": ["/"],
  reviews: ["/"],
  catalogs: ["/"],
  careers: ["/careers"],
};

/** Bust ISR so a newly published CMS item is visible on the public site. */
export function revalidateCmsCollection(collection: AdminCmsCollection) {
  for (const path of COLLECTION_PATHS[collection] ?? []) {
    revalidatePath(path);
  }
  if (collection === "portfolio") {
    revalidatePath("/portfolio/[slug]", "page");
  }
  if (collection === "blog") {
    revalidatePath("/blog/[slug]", "page");
  }
}
