import type { VisitBookingKind } from "@/lib/visits/modes";

export const VISIT_SCORE_KEYS = [
  "welcome",
  "process",
  "samples",
  "needs",
  "deal",
] as const;

export type VisitScoreKey = (typeof VISIT_SCORE_KEYS)[number];

export type VisitOutcomeScores = Record<VisitScoreKey, number>;

export const VISIT_NEXT_STEPS = [
  "deal",
  "waiting",
  "follow_up",
  "no_deal",
] as const;

export type VisitNextStep = (typeof VISIT_NEXT_STEPS)[number];

export const VISIT_NEXT_STEP_LABELS: Record<VisitNextStep, string> = {
  deal: "มีดีลต่อ (วัดหน้างาน / ใบเสนอราคา)",
  waiting: "รอลูกค้าตอบกลับ",
  follow_up: "นัดติดตามอีกครั้ง",
  no_deal: "ยังไม่ต่อในตอนนี้",
};

const FACTORY_SCORE_LABELS: Record<VisitScoreKey, { title: string; hint: string }> =
  {
    welcome: {
      title: "การต้อนรับและบรรยากาศโรงงาน",
      hint: "ทีมพร้อมไหม โรงงานดูน่าเชื่อถือแค่ไหน",
    },
    process: {
      title: "ความเข้าใจขั้นตอนผลิต",
      hint: "ลูกค้าเห็นภาพการผลิตชัดไหม",
    },
    samples: {
      title: "ตัวอย่างสินค้าจับต้องได้",
      hint: "ผ้า / มู่ลี่ / ระบบที่โชว์ครบตามที่นัดไหม",
    },
    needs: {
      title: "จับความต้องการลูกค้าได้",
      hint: "รู้หรือยังว่าห้องไหน งบประมาณ และสไตล์แบบไหน",
    },
    deal: {
      title: "โอกาสได้งานต่อ",
      hint: "มีแววสั่งผลิตหรือนัดวัดหน้างานไหม",
    },
  };

const PRESENTATION_SCORE_LABELS: Record<
  VisitScoreKey,
  { title: string; hint: string }
> = {
  welcome: {
    title: "ความพร้อมของทีมและเปิดประชุม",
    hint: "ตรงเวลา อุปกรณ์พร้อม บรรยากาศคุยลื่นไหม",
  },
  process: {
    title: "ความชัดเจนของข้อเสนอ",
    hint: "ลูกค้าเข้าใจแบบ ราคาคร่าวๆ และขั้นตอนถัดไปไหม",
  },
  samples: {
    title: "ตัวอย่าง / แคตตาล็อกตรงงาน",
    hint: "ของที่พกไปตอบโจทย์โปรเจกต์นี้ไหม",
  },
  needs: {
    title: "จับโจทย์ลูกค้าได้",
    hint: "รู้สcope ไทม์ไลน์ และผู้ตัดสินใจชัดไหม",
  },
  deal: {
    title: "โอกาสได้ดีลต่อ",
    hint: "มีแววขอใบเสนอราคาหรือนัดวัดหน้างานไหม",
  },
};

export function visitScoreLabels(kind: VisitBookingKind) {
  return kind === "product-presentation"
    ? PRESENTATION_SCORE_LABELS
    : FACTORY_SCORE_LABELS;
}

export function emptyOutcomeScores(): VisitOutcomeScores {
  return {
    welcome: 0,
    process: 0,
    samples: 0,
    needs: 0,
    deal: 0,
  };
}

export function isCompleteOutcomeScores(
  scores: VisitOutcomeScores | null | undefined,
): scores is VisitOutcomeScores {
  if (!scores) return false;
  return VISIT_SCORE_KEYS.every((key) => {
    const value = scores[key];
    return Number.isInteger(value) && value >= 1 && value <= 5;
  });
}

export function parseOutcomeScores(
  raw: unknown,
): VisitOutcomeScores | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const scores = emptyOutcomeScores();
  for (const key of VISIT_SCORE_KEYS) {
    const value = Number(record[key]);
    scores[key] = Number.isFinite(value) ? value : 0;
  }
  return scores;
}

export function averageOutcomeScore(
  scores: VisitOutcomeScores | null | undefined,
): number | null {
  if (!isCompleteOutcomeScores(scores)) return null;
  const total = VISIT_SCORE_KEYS.reduce((sum, key) => sum + scores[key], 0);
  return Math.round((total / VISIT_SCORE_KEYS.length) * 10) / 10;
}
