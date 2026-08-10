// Self-hosts the pdf.js worker under /public so it loads same-origin
// (site CSP has no external script-src for a CDN-hosted worker).
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const from = path.join(
  root,
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
);
const destDir = path.join(root, "public/pdf");
const to = path.join(destDir, "pdf.worker.min.mjs");

try {
  await mkdir(destDir, { recursive: true });
  await copyFile(from, to);
  console.log("[copy-pdf-worker] copied pdf.worker.min.mjs -> public/pdf/");
} catch (err) {
  console.warn("[copy-pdf-worker] skipped:", err.message);
}
