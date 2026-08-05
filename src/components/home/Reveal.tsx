"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Max steps before stagger stops growing — keeps late cards from feeling laggy. */
const MAX_STEPS = 4;

export function Reveal({
  children,
  delayStep = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  /** Position in a group; each step adds 70ms, capped at 4 steps. */
  delayStep?: number;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];
  const delay = Math.min(delayStep, MAX_STEPS) * 0.07;

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

export const revealEase = EASE;
