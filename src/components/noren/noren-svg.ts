import { layerChrome, layersArt } from "@/lib/noren/layers";
import { pieceSizeLabel, type NorenPiece } from "@/lib/noren/pricing";

export function fmt(n: number) {
  return (Math.round(n * 10) / 10).toString().replace(/\.0$/, "");
}

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] || c);
}

export function clothSvg(piece: NorenPiece, shop: string, opts?: { edit?: { crop: boolean; dim: boolean } }) {
  const W = Math.max(20, piece.widthCm);
  const H = Math.max(20, piece.heightCm);
  const n = Math.max(1, Math.round(piece.panels) || 1);
  const pw = W / n;
  const fill = /^#[0-9A-Fa-f]{6}$/.test(piece.color) ? piece.color : "#F4E6D4";
  const tv = piece.top === "loop" ? 9 : 2.2;
  const F = Math.max(1.8, Math.min(3.1, W * 0.022));
  const title = `${shop} · ${piece.name}`;
  const sub = `${pieceSizeLabel(piece)} · ${piece.top === "loop" ? "หูคอกระเช้า" : "สอดราง"}`;
  const y0 = -(tv + F * 4.2);
  const y2 = H + F * 2.7;
  const yb = y2 + F * 1.6;
  const x0 = -F * 2.8;
  const vw = W - x0 + F * 1.4;
  const vh = yb - y0;
  let ears = "";
  if (piece.top === "loop") {
    const tabs = n + 1;
    for (let k = 0; k < tabs; k += 1) {
      const c = Math.min(W - 2.75, Math.max(2.75, (k * W) / Math.max(1, tabs - 1)));
      ears += `<rect x="${c - 2.75}" y="-9" width="5.5" height="9" fill="${fill}"/>`;
    }
  } else {
    ears = `<rect x="-1.2" y="-1.8" width="${W + 2.4}" height="1.8" rx=".9" fill="#3A6073"/>`;
  }
  const cuts = Array.from({ length: n - 1 }, (_, i) => {
    return `<path d="M${(i + 1) * pw} 0 V${H}" stroke="#FFF8EE" stroke-opacity=".85" stroke-width=".18"/>`;
  }).join("");
  const edit = opts?.edit;
  const art = layersArt(piece.layers, W, H, `nc-c-${piece.id}`, !!edit);
  const sel = edit ? (piece.layers?.find((l) => l.id === piece.isel) ?? piece.layers?.[0]) : undefined;
  const chrome = sel && edit ? layerChrome(sel, W, H, edit) : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${vw} ${vh}" class="h-full w-full">
    <text x="0" y="${y0 + F * 1.3}" font-size="${F * 1.2}" font-weight="600" fill="currentColor">${esc(title)}</text>
    <text x="0" y="${y0 + F * 3.1}" font-size="${F * 0.9}" opacity=".7" fill="currentColor">${esc(sub)}</text>
    ${ears}<rect width="${W}" height="${H}" fill="${fill}"/>${art}${cuts}${chrome}
    <text x="${W / 2}" y="${y2}" text-anchor="middle" font-size="${F}" fill="currentColor">${fmt(W)} ซม.</text>
  </svg>`;
}

export function miniSvg(piece: NorenPiece) {
  const W = Math.max(20, piece.widthCm);
  const H = Math.max(20, piece.heightCm);
  const n = Math.max(1, Math.round(piece.panels) || 1);
  const pw = W / n;
  const fill = /^#[0-9A-Fa-f]{6}$/.test(piece.color) ? piece.color : "#F4E6D4";
  const tv = piece.top === "loop" ? 9 : 2.2;
  let ears = "";
  if (piece.top === "loop") {
    const tabs = n + 1;
    for (let k = 0; k < tabs; k += 1) {
      const c = Math.min(W - 2.75, Math.max(2.75, (k * W) / Math.max(1, tabs - 1)));
      ears += `<rect x="${c - 2.75}" y="-9" width="5.5" height="9" fill="${fill}"/>`;
    }
  } else {
    ears = `<rect x="-1.2" y="-1.8" width="${W + 2.4}" height="1.8" rx=".9" fill="#3A6073"/>`;
  }
  const cuts = Array.from({ length: n - 1 }, (_, i) => {
    return `<path d="M${(i + 1) * pw} 0 V${H}" stroke="#FFF8EE" stroke-opacity=".85" stroke-width=".18"/>`;
  }).join("");
  const art = layersArt(piece.layers, W, H, `nc-m-${piece.id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 ${-(tv + 0.6)} ${W + 4} ${H + tv + 8}" class="mx-auto h-28 w-auto max-w-full">
    ${ears}<rect width="${W}" height="${H}" fill="${fill}"/>${art}${cuts}
  </svg>`;
}
