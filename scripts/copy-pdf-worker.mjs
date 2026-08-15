// Self-hosts the pdf.js worker under /public so it loads same-origin
// (site CSP has no external script-src for a CDN-hosted worker).
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const destDir = path.join(root, "public/pdf");
const files = ["pdf.min.mjs", "pdf.worker.min.mjs"];

try {
  await mkdir(destDir, { recursive: true });
  for (const name of files) {
    await copyFile(
      path.join(root, "node_modules/pdfjs-dist/build", name),
      path.join(destDir, name),
    );
    console.log(`[copy-pdf-worker] copied ${name} -> public/pdf/`);
  }
} catch (err) {
  console.warn("[copy-pdf-worker] skipped:", err.message);
}
