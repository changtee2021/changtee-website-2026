"use client";

import { useEffect } from "react";
import { findThaiText } from "@/lib/i18n/content/thai-text";
import type { Locale } from "@/lib/i18n/locale";

const THAI = /[\u0E00-\u0E7F]/;
const ATTRS = ["alt", "title", "aria-label", "placeholder"] as const;
const SKIP = "[data-keep-thai],script,style,textarea,code,pre,[contenteditable]";

function lookup(locale: Locale, raw: string): string | undefined {
  if (!THAI.test(raw)) return undefined;
  const key = raw.replace(/\s+/g, " ").trim();
  const hit = findThaiText(locale, key);
  if (!hit) return undefined;
  const lead = raw.match(/^\s*/)?.[0] ?? "";
  const trail = raw.match(/\s*$/)?.[0] ?? "";
  return lead + hit + trail;
}

function translateText(locale: Locale, node: Text) {
  const parent = node.parentElement;
  if (!parent || parent.closest(SKIP)) return;
  const next = lookup(locale, node.nodeValue ?? "");
  if (next !== undefined && next !== node.nodeValue) node.nodeValue = next;
}

function translateAttrs(locale: Locale, el: Element) {
  if (el.closest("[data-keep-thai]")) return;
  for (const name of ATTRS) {
    const value = el.getAttribute(name);
    if (!value) continue;
    const next = lookup(locale, value);
    if (next !== undefined && next !== value) el.setAttribute(name, next);
  }
}

function translateTree(locale: Locale, root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateText(locale, root as Text);
    return;
  }
  if (!(root instanceof Element)) return;
  translateAttrs(locale, root);
  for (const el of root.querySelectorAll(ATTRS.map((a) => `[${a}]`).join(","))) {
    translateAttrs(locale, el);
  }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) translateText(locale, n as Text);
}

/**
 * Last-mile fallback for non-Thai locales: swaps any rendered Thai text / alt / title /
 * aria-label / placeholder that has an entry in the active pack. Components that call `tx`
 * already render translated HTML; this only catches copy that is not wired yet.
 * Runs after hydration so React never sees a mismatched server tree.
 * Opt a subtree out with `data-keep-thai` (e.g. customer reviews shown in the original).
 */
export function AutoThaiText({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (locale === "th") return;

    const pending = new Set<Node>();
    let scheduled = false;
    const flush = () => {
      scheduled = false;
      for (const node of pending) if (node.isConnected) translateTree(locale, node);
      pending.clear();
    };
    const queue = (node: Node) => {
      pending.add(node);
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(flush);
      }
    };

    const observer = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "childList") r.addedNodes.forEach(queue);
        else queue(r.target);
      }
    });

    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      translateTree(locale, document.body);
      observer.observe(document.body, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: [...ATTRS],
      });
    };
    const idle = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        setTimeout(start, 200);
      }
    };

    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", idle);
      observer.disconnect();
    };
  }, [locale]);

  return null;
}
