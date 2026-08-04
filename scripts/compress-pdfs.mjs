/**
 * Recompress catalog/brochure PDFs for web download.
 * Requires Ghostscript `gswin64c` on PATH, or set GS_BIN.
 *
 * Usage:
 *   1) Put full-res masters in public/_pdf-originals/
 *   2) node scripts/compress-pdfs.mjs
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const originals = path.join(root, "public", "_pdf-originals");
const gs =
  process.env.GS_BIN ||
  (process.platform === "win32" ? "gswin64c" : "gs");

const jobs = [
  {
    master: "wooden-blinds.pdf",
    out: path.join("public", "catalog", "wooden-blinds.pdf"),
    dpi: 140,
    jpegq: 82,
  },
  {
    master: "company-profile-2026.pdf",
    out: path.join("public", "brochure", "company-profile-2026.pdf"),
    dpi: 130,
    jpegq: 80,
  },
];

function mb(file) {
  return (statSync(file).size / 1024 / 1024).toFixed(2);
}

function compress(input, output, dpi, jpegq) {
  mkdirSync(path.dirname(output), { recursive: true });
  const args = [
    "-sDEVICE=pdfwrite",
    "-dCompatibilityLevel=1.5",
    "-dNOPAUSE",
    "-dBATCH",
    "-dQUIET",
    "-dDetectDuplicateImages=true",
    "-dCompressFonts=true",
    "-dSubsetFonts=true",
    "-dDownsampleColorImages=true",
    "-dDownsampleGrayImages=true",
    "-dDownsampleMonoImages=true",
    `-dColorImageResolution=${dpi}`,
    `-dGrayImageResolution=${dpi}`,
    `-dMonoImageResolution=${dpi}`,
    "-dColorImageDownsampleType=/Bicubic",
    "-dGrayImageDownsampleType=/Bicubic",
    "-dColorImageDownsampleThreshold=1.0",
    "-dGrayImageDownsampleThreshold=1.0",
    "-dMonoImageDownsampleThreshold=1.0",
    "-dEncodeColorImages=true",
    "-dEncodeGrayImages=true",
    "-dAutoFilterColorImages=false",
    "-dAutoFilterGrayImages=false",
    "-dColorImageFilter=/DCTEncode",
    "-dGrayImageFilter=/DCTEncode",
    `-dJPEGQ=${jpegq}`,
    `-sOutputFile=${output}`,
    input,
  ];
  const result = spawnSync(gs, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`Ghostscript failed for ${input} (exit ${result.status})`);
  }
}

mkdirSync(originals, { recursive: true });

for (const job of jobs) {
  const masterPath = path.join(originals, job.master);
  const outPath = path.join(root, job.out);
  if (!existsSync(masterPath)) {
    console.warn(`Skip (no master): ${masterPath}`);
    continue;
  }
  // Work in TEMP if path has spaces (Windows GS quirk)
  const work = path.join(process.env.TEMP || "/tmp", "changtee-pdf-work");
  mkdirSync(work, { recursive: true });
  const inTmp = path.join(work, `in-${job.master}`);
  const outTmp = path.join(work, `out-${job.master}`);
  copyFileSync(masterPath, inTmp);
  console.log(`Compress ${job.master} → ${job.out} (dpi=${job.dpi}, q=${job.jpegq})`);
  compress(inTmp, outTmp, job.dpi, job.jpegq);
  copyFileSync(outTmp, outPath);
  console.log(`  master ${mb(masterPath)} MB → web ${mb(outPath)} MB`);
}

console.log("Done.");
