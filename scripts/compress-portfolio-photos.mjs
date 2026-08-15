/**
 * Re-encode portfolio JPGs under public/images/portfolio as web-sized WebP.
 *   node scripts/compress-portfolio-photos.mjs
 */
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readdirSync, unlinkSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "public/images/portfolio");
const MAX_WIDTH = 1200;
const QUALITY = 75;

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) out.push(...walk(full));
    else if (name.name.toLowerCase().endsWith(".jpg")) out.push(full);
  }
  return out;
}

const files = walk(root);
let saved = 0;
let before = 0;
let after = 0;

for (const file of files) {
  const src = statSync(file).size;
  before += src;
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_WIDTH / img.width);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  const bytes = await canvas.encode("webp", QUALITY);
  const dest = file.replace(/\.jpg$/i, ".webp");
  writeFileSync(dest, bytes);
  unlinkSync(file);
  after += bytes.length;
  saved += 1;
  process.stdout.write(
    `  ${path.relative(root, dest)}  ${(src / 1024).toFixed(0)}KB -> ${(bytes.length / 1024).toFixed(0)}KB\r`,
  );
}

console.log(
  `\nDone: ${saved} files  ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`,
);
