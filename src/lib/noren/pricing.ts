import type { NorenLayer } from "@/lib/noren/layers";

export const NOREN_RATE = 1300;
export const NOREN_MIN_M2 = 1;
export const NOREN_VAT_RATE = 0.07;

export type NorenPiece = {
  id: string;
  name: string;
  widthCm: number;
  heightCm: number;
  panels: number;
  qty: number;
  color: string;
  top: "loop" | "rod";
  note: string;
  layers?: NorenLayer[];
  isel?: string;
  place?: "center" | "full";
};

export function roundMoney(n: number) {
  return Math.round(n * 100) / 100;
}

export function formatBaht(n: number) {
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function norenLine(piece: Pick<NorenPiece, "widthCm" | "heightCm" | "qty">) {
  const m2 = Math.max(
    NOREN_MIN_M2,
    roundMoney((Math.max(0, piece.widthCm) * Math.max(0, piece.heightCm)) / 10000),
  );
  const qty = Math.max(1, Math.round(piece.qty || 1));
  return { m2, qty, amount: roundMoney(m2 * NOREN_RATE) * qty };
}

export function norenEstimate(pieces: Array<Pick<NorenPiece, "widthCm" | "heightCm" | "qty">>) {
  const exVat = roundMoney(pieces.reduce((sum, piece) => sum + norenLine(piece).amount, 0));
  const vat = roundMoney(exVat * NOREN_VAT_RATE);
  const qty = pieces.reduce((sum, piece) => sum + Math.max(1, Math.round(piece.qty || 1)), 0);
  return { exVat, vat, total: roundMoney(exVat + vat), qty };
}

export function pieceSizeLabel(piece: Pick<NorenPiece, "widthCm" | "heightCm" | "panels" | "qty">) {
  const qty = Math.max(1, Math.round(piece.qty || 1));
  return `${fmt(piece.widthCm)}×${fmt(piece.heightCm)} ซม. · ${Math.max(1, piece.panels)} ผืน${qty > 1 ? ` × ${qty} ชุด` : ""}`;
}

function fmt(n: number) {
  return (Math.round(n * 10) / 10).toString().replace(/\.0$/, "");
}
