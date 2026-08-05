"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Splits "10,000+" into a number and trailing text so only the digits animate. */
function parse(value: string) {
  const match = value.match(/^([\d,]+)(.*)$/);
  if (!match) return null;
  const target = Number(match[1].replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  return { target, suffix: match[2] };
}

export function CountUp({ value, duration = 1.2 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const parsed = useMemo(() => parse(value), [value]);
  const animated = Boolean(parsed) && !reduced;
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const el = ref.current;
    if (!animated || !parsed || !el) return;

    let frame = 0;

    function run() {
      const start = performance.now();
      frame = requestAnimationFrame(function tick(now) {
        const progress = Math.min((now - start) / (duration * 1000), 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(parsed!.target * eased).toLocaleString("en-US"));
        if (progress < 1) frame = requestAnimationFrame(tick);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [animated, parsed, duration]);

  if (!animated) {
    return <span ref={ref}>{value}</span>;
  }

  return (
    <span ref={ref}>
      {display}
      {parsed?.suffix}
    </span>
  );
}
