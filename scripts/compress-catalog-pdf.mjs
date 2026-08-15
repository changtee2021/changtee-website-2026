/**
 * Web-optimize a catalog/brochure PDF by rasterizing each page (via
 * pdfjs-dist + @napi-rs/canvas, pure JS — no Ghostscript needed):
 *
 *   1. Re-packs the pages as JPEGs into a new, much smaller PDF (pdf-lib)
 *      — used for the "ดาวน์โหลด" button.
 *   2. Also writes each page as a standalone JPEG + a manifest.json under
 *      public/catalog/<name>/ — used by the web flipbook viewer so it can
 *      show static, browser-cacheable images instead of parsing/rendering
 *      the PDF client-side on every open.
 *
 * Keeps the original in public/_pdf-originals/ and overwrites the public
 * copy with the compressed version.
 *
 * Usage:
 *   node scripts/compress-catalog-pdf.mjs <name-without-ext> [dpi] [quality] [folder]
 *   node scripts/compress-catalog-pdf.mjs wooden-blinds 90 62
 *   node scripts/compress-catalog-pdf.mjs company-profile-2026 90 62 brochure
 */
import { createCanvas } from "@napi-rs/canvas";
import { PDFDocument } from "pdf-lib";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , nameArg, dpiArg, qualityArg, folderArg] = process.argv;
if (!nameArg) {
  console.error(
    "Usage: node scripts/compress-catalog-pdf.mjs <name-without-ext> [dpi] [quality] [folder]",
  );
  process.exit(1);
}

const dpi = Number(dpiArg) || 90;
const quality = Number(qualityArg) || 62;
const publicFolder = folderArg || "catalog";

const root = process.cwd();
const publicPath = path.join(root, "public", publicFolder, `${nameArg}.pdf`);
const originalsDir = path.join(root, "public", "_pdf-originals");
const originalPath = path.join(originalsDir, `${nameArg}.pdf`);
const pagesDir = path.join(root, "public", publicFolder, nameArg, "pages");
const manifestPath = path.join(root, "public", publicFolder, nameArg, "manifest.json");

mkdirSync(originalsDir, { recursive: true });
mkdirSync(pagesDir, { recursive: true });

// First run: snapshot the current file as the untouched master.
if (!existsSync(originalPath)) {
  if (!existsSync(publicPath)) {
    console.error(`Not found: ${publicPath}`);
    process.exit(1);
  }
  copyFileSync(publicPath, originalPath);
  console.log(`Saved master -> ${path.relative(root, originalPath)}`);
}

function mb(file) {
  return (statSync(file).size / 1024 / 1024).toFixed(2);
}

const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
).href;

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext("2d") };
  }
  reset(ctx, width, height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  }
  destroy() {}
}

const sourceBytes = readFileSync(originalPath);
const loadingTask = pdfjsLib.getDocument({
  data: new Uint8Array(sourceBytes),
  canvasFactory: new NodeCanvasFactory(),
});
const pdf = await loadingTask.promise;

const outDoc = await PDFDocument.create();
const scale = dpi / 72;
const manifestPages = [];

console.log(`Rasterizing ${nameArg}.pdf — ${pdf.numPages} pages @ ${dpi}dpi, jpeg q${quality}...`);

for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  const ctx = canvas.getContext("2d");
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const jpegBuffer = await canvas.encode("jpeg", quality);

  const image = await outDoc.embedJpg(jpegBuffer);
  const pdfPage = outDoc.addPage([viewport.width, viewport.height]);
  pdfPage.drawImage(image, { x: 0, y: 0, width: viewport.width, height: viewport.height });

  const fileName = `page-${String(i).padStart(3, "0")}.jpg`;
  writeFileSync(path.join(pagesDir, fileName), jpegBuffer);
  manifestPages.push({
    file: `/${publicFolder}/${nameArg}/pages/${fileName}`,
    width: canvas.width,
    height: canvas.height,
  });

  page.cleanup();
  process.stdout.write(`  page ${i}/${pdf.numPages}\r`);
}

await loadingTask.destroy?.();

const outBytes = await outDoc.save({ useObjectStreams: true });
writeFileSync(publicPath, outBytes);
writeFileSync(
  manifestPath,
  JSON.stringify({ numPages: manifestPages.length, pages: manifestPages }, null, 0),
);

const pagesKb = manifestPages.length
  ? (statSync(path.join(pagesDir, manifestPages[0].file.split("/").pop())).size / 1024).toFixed(0)
  : "0";

console.log(
  `\nDone: master ${mb(originalPath)} MB -> web PDF ${mb(publicPath)} MB` +
    ` | flipbook images: ${manifestPages.length} pages, ~${pagesKb}KB/page -> ${path.relative(root, manifestPath)}`,
);
