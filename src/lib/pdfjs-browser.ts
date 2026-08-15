type PdfjsModule = typeof import("pdfjs-dist");

let cached: Promise<PdfjsModule> | null = null;

/**
 * Load PDF.js from /public so Turbopack never bundles `pdfjs-dist`.
 * Dynamic import of the npm package crashes in Next.js dev:
 * `this._requestsByChunk.getOrInsertComputed is not a function`.
 */
export function loadPdfjs(): Promise<PdfjsModule> {
  if (!cached) {
    cached = (async () => {
      const href = `${window.location.origin}/pdf/pdf.min.mjs`;
      const mod = (await import(
        /* webpackIgnore: true */
        /* turbopackIgnore: true */
        href
      )) as PdfjsModule & { default?: PdfjsModule };
      const pdfjs = mod.default ?? mod;
      pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf/pdf.worker.min.mjs`;
      return pdfjs;
    })();
  }
  return cached;
}
