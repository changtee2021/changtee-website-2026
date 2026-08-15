"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const WIDTHS = [
  {
    id: "narrow",
    title: "หน้าแคบ",
    range: "(W) 100–150 ซม.",
    note: "ม้วนตั้ง วัดจากขอบหนึ่งถึงอีกขอบ",
  },
  {
    id: "wide",
    title: "หน้ากว้าง",
    range: "(W) 280–300 ซม.",
    note: "ม้วนใหญ่กว่า ใช้ทำสูงได้โดยไม่ต่อผืน ถ้ารูปแบบลายอนุญาต",
  },
] as const;

const DIRS = [
  {
    id: "vertical",
    title: "ลายแนวตั้ง",
    note: "ลูกศรขนานความยาวม้วน — เจอบ่อยในผ้าหน้าแคบ",
  },
  {
    id: "horizontal",
    title: "ลายแนวนอน",
    note: "ลูกศรขวางหน้าผ้า — เจอบ่อยในผ้าหน้ากว้าง",
  },
] as const;

const CASES = [
  {
    id: "a",
    title: "หน้าแคบ + ลายตั้ง",
    hook: "สูงได้ไม่จำกัด แต่ต้องต่อผืนและต่อลาย",
    body: "ตัดตามความยาวม้วน แล้วต่อหลายผืนให้ได้ความกว้างม่าน รอยต่อต้องไล่ลายให้ตรง เหมาะบานสูงมาก เช่น H 450 ซม.",
  },
  {
    id: "b",
    title: "หน้ากว้าง + ลายนอน",
    hook: "หมุนผ้า — สูงจำกัดประมาณ 245 ซม.",
    body: "เอาหน้าผ้า 280–300 ซม. มาเป็นความสูงม่าน ลายที่นอนบนม้วนจะกลายเป็นลายตั้งบนบาน ไม่มีรอยต่อแนวตั้ง ต้องเผื่อห่มบน-ล่าง 30–35 ซม. จึงสูงใช้จริงราว 245 ซม.",
  },
  {
    id: "c",
    title: "สูงเกินหน้าผ้า",
    hook: "ต้องต่อแบบหน้าแคบ ลายจะนอนขวางบาน",
    body: "ถ้าม่านต้องสูงกว่าหน้าผ้า หมุนผ้าอย่างเดียวไม่พอ ต้องต่อผืนเหมือนหน้าแคบ ลายที่เคยตั้งจะกลายเป็นลายนอนพาดบาน ต้องคุยลูกค้าก่อนตัด",
  },
] as const;

export function FabricLesson() {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState<(typeof WIDTHS)[number]["id"]>("narrow");
  const [dir, setDir] = useState<(typeof DIRS)[number]["id"]>("vertical");
  const [caseId, setCaseId] = useState<(typeof CASES)[number]["id"]>("a");
  const activeCase = CASES.find((c) => c.id === caseId) ?? CASES[0];

  return (
    <div className="space-y-10">
      <section>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
          01 · หน้าผ้า
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
          กว้างแค่ไหน นับจากขอบถึงขอบ
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {WIDTHS.map((item) => {
            const on = width === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setWidth(item.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  on
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-navy hover:border-navy/30"
                }`}
              >
                <RollSvg wide={item.id === "wide"} invert={on} />
                <p className="mt-4 font-display text-lg font-semibold">{item.title}</p>
                <p className={`mt-1 text-sm ${on ? "text-white/80" : "text-brand-red"}`}>
                  {item.range}
                </p>
                <p className={`mt-2 text-sm ${on ? "text-white/70" : "text-muted"}`}>
                  {item.note}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
          02 · ทิศทางลาย
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
          ลายวิ่งตามม้วน หรือขวางม้วน
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {DIRS.map((item) => {
            const on = dir === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setDir(item.id)}
                className={`rounded-2xl border p-5 text-left transition ${
                  on
                    ? "border-navy bg-navy text-white"
                    : "border-line bg-white text-navy hover:border-navy/30"
                }`}
              >
                <ArrowSvg horizontal={item.id === "horizontal"} invert={on} />
                <p className="mt-4 font-display text-lg font-semibold">{item.title}</p>
                <p className={`mt-2 text-sm ${on ? "text-white/70" : "text-muted"}`}>
                  {item.note}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
          03 · ตัดเย็บจริง
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
          สามกรณีที่ใบราคาเพี้ยนถ้าไม่คุยให้ชัด
        </h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {CASES.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCaseId(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                caseId === item.id
                  ? "bg-navy text-white"
                  : "border border-line bg-white text-navy hover:border-navy/30"
              }`}
            >
              {i + 1}. {item.title}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase.id}
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            className="mt-5 rounded-2xl border border-line bg-white p-6"
          >
            <p className="font-display text-xl font-semibold text-navy">
              {activeCase.title}
            </p>
            <p className="mt-2 text-sm font-semibold text-brand-red">{activeCase.hook}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{activeCase.body}</p>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}

function RollSvg({ wide, invert }: { wide: boolean; invert?: boolean }) {
  const stroke = invert ? "white" : "#0b1f3a";
  return (
    <svg viewBox="0 0 160 90" className="h-16 w-full" aria-hidden>
      <rect
        x={wide ? 48 : 62}
        y="8"
        width={wide ? 64 : 36}
        height="74"
        rx="16"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
      />
      <ellipse
        cx="80"
        cy="16"
        rx={wide ? 32 : 18}
        ry="8"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
    </svg>
  );
}

function ArrowSvg({
  horizontal,
  invert,
}: {
  horizontal: boolean;
  invert?: boolean;
}) {
  const stroke = invert ? "white" : "#c1121f";
  return (
    <svg viewBox="0 0 160 90" className="h-16 w-full" aria-hidden>
      <rect
        x="58"
        y="10"
        width="44"
        height="70"
        rx="14"
        fill="none"
        stroke={invert ? "white" : "#0b1f3a"}
        strokeWidth="2"
      />
      {horizontal ? (
        <path d="M40 48h80l-8-7M120 48l-8 7" fill="none" stroke={stroke} strokeWidth="3" />
      ) : (
        <path d="M80 78V18l-7 8M80 18l7 8" fill="none" stroke={stroke} strokeWidth="3" />
      )}
    </svg>
  );
}
