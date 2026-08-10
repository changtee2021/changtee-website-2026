export type FlipbookPage = {
  url: string;
  width: number;
  height: number;
};

export type FlipbookDoc = {
  numPages: number;
  /** 0-based page index. Cached — safe to call repeatedly. */
  getPage: (index: number) => Promise<FlipbookPage>;
  destroy: () => void;
};

export type FlipbookOpenOptions = {
  catalogId?: string;
  /** Absolute or relative URL to a pre-rendered manifest.json. */
  manifestUrl?: string;
};

// Only used as a fallback when a catalog has no pre-rendered manifest yet.
const FALLBACK_RENDER_SCALE = 1.1;
const FALLBACK_JPEG_QUALITY = 0.7;

type CatalogManifest = {
  numPages: number;
  pages: Array<{ file: string; width: number; height: number }>;
};

async function fetchManifest(url: string): Promise<CatalogManifest | null> {
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = (await res.json()) as CatalogManifest;
    if (!data || !Array.isArray(data.pages) || data.pages.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

async function resolveManifest(
  options: FlipbookOpenOptions | undefined,
): Promise<CatalogManifest | null> {
  if (options?.manifestUrl) {
    const direct = await fetchManifest(options.manifestUrl);
    if (direct) return direct;
  }
  if (options?.catalogId) {
    return fetchManifest(`/catalog/${options.catalogId}/manifest.json`);
  }
  return null;
}

function preloadImage(url: string): Promise<FlipbookPage> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const done = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
    img.onload = done;
    img.onerror = done;
    img.src = url;
    if (img.complete && img.naturalWidth > 0) done();
  });
}

/**
 * Opens a pre-rendered catalog (static JPEGs) — near-instant, browser-cacheable,
 * no PDF parsing or canvas rendering on the client at all.
 */
function openPrerenderedDocument(manifest: CatalogManifest): FlipbookDoc {
  const cache = new Map<number, Promise<FlipbookPage>>();

  function getPage(index: number): Promise<FlipbookPage> {
    const entry = manifest.pages[index];
    if (!entry) return Promise.reject(new Error("Page index out of range"));
    let cached = cache.get(index);
    if (!cached) {
      cached = preloadImage(entry.file).then((loaded) => ({
        url: entry.file,
        width: loaded.width || entry.width,
        height: loaded.height || entry.height,
      }));
      cache.set(index, cached);
    }
    return cached;
  }

  return {
    numPages: manifest.pages.length || manifest.numPages || 0,
    getPage,
    destroy: () => cache.clear(),
  };
}

/**
 * Renders a PDF client-side page by page (pdfjs-dist, dynamically imported
 * so it never touches the server bundle). Used only as a fallback for
 * catalogs that haven't been pre-rendered to static images yet.
 */
async function openPdfDocument(
  fileUrl: string,
  onDownloadProgress?: (loaded: number, total: number) => void,
): Promise<FlipbookDoc> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

  const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
  if (onDownloadProgress) {
    loadingTask.onProgress = (p: { loaded: number; total: number }) =>
      onDownloadProgress(p.loaded, p.total || 0);
  }
  const pdf = await loadingTask.promise;
  const cache = new Map<number, Promise<FlipbookPage>>();

  async function renderPage(index: number): Promise<FlipbookPage> {
    const page = await pdf.getPage(index + 1);
    const viewport = page.getViewport({ scale: FALLBACK_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const result: FlipbookPage = {
      url: canvas.toDataURL("image/jpeg", FALLBACK_JPEG_QUALITY),
      width: canvas.width,
      height: canvas.height,
    };
    page.cleanup();
    return result;
  }

  function getPage(index: number): Promise<FlipbookPage> {
    if (index < 0 || index >= pdf.numPages) {
      return Promise.reject(new Error("Page index out of range"));
    }
    let cached = cache.get(index);
    if (!cached) {
      cached = renderPage(index);
      cache.set(index, cached);
    }
    return cached;
  }

  return {
    numPages: pdf.numPages,
    getPage,
    destroy: () => {
      cache.clear();
      void loadingTask.destroy();
    },
  };
}

/**
 * Opens a catalog for the flipbook viewer. Prefers a pre-rendered static
 * image manifest (instant, cacheable) and falls back to rendering the PDF
 * client-side if no manifest exists for this catalog yet.
 */
export async function openFlipbookDocument(
  fileUrl: string,
  options?: FlipbookOpenOptions,
  onDownloadProgress?: (loaded: number, total: number) => void,
): Promise<FlipbookDoc> {
  const manifest = await resolveManifest(options);
  if (manifest) {
    onDownloadProgress?.(1, 1);
    return openPrerenderedDocument(manifest);
  }
  return openPdfDocument(fileUrl, onDownloadProgress);
}
