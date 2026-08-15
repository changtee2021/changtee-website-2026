"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const MODES = [
  {
    id: 1,
    title: "เปิด 1 ด้าน",
    body: "ผืนเดียว ยึดติดข้างกรอบด้านหนึ่ง รูดไปกองอีกฝั่ง ใช้บานแคบหรือประตูที่ใช้ทางเดียว",
  },
  {
    id: 2,
    title: "เปิด 1 ด้านอิสระ",
    body: "ผืนเดียวไม่ยึดข้างกรอบ กองได้ทั้งซ้ายขวา เลื่อนช่องเปิดไปตรงที่เดินบ่อย",
  },
  {
    id: 3,
    title: "เปิด 2 ด้าน แยกกลาง",
    body: "สองผืน ยึดคนละข้างกรอบ มาบรรจบกลาง เปิดช่องกลางห้องสมมาตร ใช้โถงหรือประตูกว้าง",
  },
  {
    id: 4,
    title: "เปิด 2 ด้าน · 1 ด้านอิสระ",
    body: "สองผืน ผืนหนึ่งยึดข้าง กรอบอีกผืนอิสระ เลื่อนช่องเปิดได้โดยยังมีด้านที่ล็อกตำแหน่ง",
  },
  {
    id: 5,
    title: "เปิด 2 ด้าน · 2 ด้านอิสระ",
    body: "สองผืนอิสระทั้งคู่ วางช่องเปิดตรงไหนก็ได้ ยืดหยุ่นสุด แต่ต้องคุยทิศทางการเดินให้ชัด",
  },
] as const;

export function PartitionLesson() {
  const reduced = useReducedMotion();
  const [id, setId] = useState<(typeof MODES)[number]["id"]>(1);
  const mode = MODES.find((m) => m.id === id) ?? MODES[0];

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] text-brand-red uppercase">
        กดดูแบบ
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-navy">
        ฉากกั้นเปิดได้ 5 แบบ
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        แบบอิสระคือผืนที่ไม่ได้ล็อกกับข้างกรอบ — กองได้ทั้งสองทาง
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setId(item.id)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
              id === item.id
                ? "bg-navy text-white"
                : "border border-line bg-white text-navy hover:border-navy/30"
            }`}
          >
            {item.id}. {item.title}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-[#f7f4ef] p-4 sm:p-8">
        <PartitionDiagram mode={id} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode.id}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0 }}
          className="mt-5 rounded-2xl border border-line bg-white p-5"
        >
          <p className="font-display text-lg font-semibold text-navy">{mode.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{mode.body}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PartitionDiagram({ mode }: { mode: number }) {
  const leftFixed = mode === 1 || mode === 3 || mode === 4;
  const rightFixed = mode === 3;
  const two = mode >= 3;
  const leftIndependent = mode === 2 || mode === 5;
  const rightIndependent = mode === 4 || mode === 5;

  return (
    <svg viewBox="0 0 320 160" className="mx-auto h-auto w-full max-w-lg" aria-hidden>
      <rect x="28" y="18" width="264" height="124" fill="none" stroke="#8b5a2b" strokeWidth="10" />
      <rect x="40" y="30" width="240" height="100" fill="#fff8f0" />
      {two ? (
        <>
          <Accordion x={leftIndependent ? 70 : 48} w={88} />
          <Accordion x={rightIndependent ? 162 : 184} w={88} />
          {leftFixed ? <Pin x={44} /> : null}
          {rightFixed ? <Pin x={268} /> : null}
          {leftIndependent ? <FreeMark x={70} /> : null}
          {rightIndependent ? <FreeMark x={250} /> : null}
        </>
      ) : (
        <>
          <Accordion x={leftIndependent ? 96 : 48} w={120} />
          {leftFixed ? <Pin x={44} /> : null}
          {leftIndependent ? <FreeMark x={210} /> : null}
        </>
      )}
    </svg>
  );
}

function Accordion({ x, w }: { x: number; w: number }) {
  const folds = 7;
  const step = w / folds;
  return (
    <g>
      {Array.from({ length: folds }, (_, i) => (
        <rect
          key={i}
          x={x + i * step}
          y="36"
          width={step - 1.5}
          height="88"
          fill={i % 2 === 0 ? "#c1121f" : "#9b0e18"}
        />
      ))}
    </g>
  );
}

function Pin({ x }: { x: number }) {
  return <circle cx={x} cy="80" r="5" fill="#0b1f3a" />;
}

function FreeMark({ x }: { x: number }) {
  return (
    <g>
      <circle cx={x} cy="24" r="6" fill="none" stroke="#0b1f3a" strokeWidth="1.6" />
      <path d={`M${x} 20v8`} stroke="#0b1f3a" strokeWidth="1.6" />
    </g>
  );
}
