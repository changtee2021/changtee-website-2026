import { clothSvg } from "@/components/noren/noren-svg";
import type { NorenPiece } from "@/lib/noren/pricing";

const PREVIEW_WIDTH = 1400;

/** Rasterises the finished cloth (art placed, no edit chrome) so staff see the noren, not the raw upload. */
export async function renderNorenPreview(piece: NorenPiece, shop: string, name: string): Promise<File | null> {
  const svg = clothSvg(piece, shop);
  const vb = svg.match(/viewBox="([-\d.e]+) ([-\d.e]+) ([\d.e]+) ([\d.e]+)"/);
  if (!vb) return null;
  const vw = Number(vb[3]);
  const vh = Number(vb[4]);
  if (!(vw > 0 && vh > 0)) return null;
  const width = PREVIEW_WIDTH;
  const height = Math.round((PREVIEW_WIDTH * vh) / vw);
  const standalone = svg.replace(
    'class="h-full w-full"',
    `width="${width}" height="${height}" style="color:#0b1f3a;font-family:sans-serif"`,
  );
  const url = URL.createObjectURL(new Blob([standalone], { type: "image/svg+xml" }));
  try {
    const img = await new Promise<HTMLImageElement>((ok, no) => {
      const el = new Image();
      el.onload = () => ok(el);
      el.onerror = () => no(new Error("preview"));
      el.src = url;
    });
    const pad = Math.round(width * 0.04);
    const c = document.createElement("canvas");
    c.width = width + pad * 2;
    c.height = height + pad * 2;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, pad, pad, width, height);
    const blob = await new Promise<Blob | null>((ok) => c.toBlob(ok, "image/jpeg", 0.9));
    return blob ? new File([blob], name, { type: "image/jpeg" }) : null;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
