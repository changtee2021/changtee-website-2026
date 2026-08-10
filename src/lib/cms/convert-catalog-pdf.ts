/**
 * Client-side PDF → JPEG pages (+ optional recompressed PDF) for catalog
 * uploads. Runs in the admin browser so Vercel serverless does not need
 * native canvas binaries.
 */
import { PDFDocument } from "pdf-lib";

export type ConvertedCatalogPage = {
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
};

export type ConvertedCatalog = {
  pages: ConvertedCatalogPage[];
  /** Recompressed raster PDF suitable for public download. */
  pdfBlob: Blob;
  coverBlob: Blob;
  numPages: number;
};

const DPI = 90;
const JPEG_QUALITY = 0.62;

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("JPEG encode failed"))),
      "image/jpeg",
      quality,
    );
  });
}

export async function convertPdfCatalog(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<ConvertedCatalog> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const scale = DPI / 72;
  const pages: ConvertedCatalogPage[] = [];
  const outDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await canvasToJpegBlob(canvas, JPEG_QUALITY);
    const fileName = `page-${String(i).padStart(3, "0")}.jpg`;
    pages.push({
      blob,
      width: canvas.width,
      height: canvas.height,
      fileName,
    });

    const jpegBytes = new Uint8Array(await blob.arrayBuffer());
    const image = await outDoc.embedJpg(jpegBytes);
    const pdfPage = outDoc.addPage([viewport.width, viewport.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });

    page.cleanup();
    onProgress?.(i, pdf.numPages);
  }

  await loadingTask.destroy();
  const pdfBytes = await outDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([Uint8Array.from(pdfBytes)], { type: "application/pdf" });
  const coverBlob = pages[0]?.blob;
  if (!coverBlob) throw new Error("PDF has no pages");

  return { pages, pdfBlob, coverBlob, numPages: pages.length };
}
