"use client";

import { useMemo, useState } from "react";
import {
  CUSTOM_LINK_VALUE,
  SITE_LINK_OPTIONS,
  isKnownSiteLink,
} from "@/lib/cms/site-link-options";
import { cn } from "@/lib/utils";

export function CmsLinkPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (href: string) => void;
  className?: string;
}) {
  const known = isKnownSiteLink(value);
  const [mode, setMode] = useState<"preset" | "custom">(
    known || !value ? "preset" : "custom",
  );

  const groups = useMemo(() => {
    const map = new Map<string, typeof SITE_LINK_OPTIONS>();
    for (const opt of SITE_LINK_OPTIONS) {
      const list = map.get(opt.group) ?? [];
      list.push(opt);
      map.set(opt.group, list);
    }
    return Array.from(map.entries());
  }, []);

  const selectValue =
    mode === "custom" ? CUSTOM_LINK_VALUE : known ? value : CUSTOM_LINK_VALUE;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-xs text-muted">
        ลิงก์เมื่อคลิก
        <select
          value={selectValue}
          onChange={(e) => {
            const v = e.target.value;
            if (v === CUSTOM_LINK_VALUE) {
              setMode("custom");
              if (known) onChange("");
              return;
            }
            setMode("preset");
            onChange(v);
          }}
          className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
        >
          {groups.map(([group, opts]) => (
            <optgroup key={group} label={group}>
              {opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={CUSTOM_LINK_VALUE}>ใส่ลิงก์เอง…</option>
        </select>
      </label>
      {mode === "custom" || selectValue === CUSTOM_LINK_VALUE ? (
        <input
          value={value}
          onChange={(e) => {
            setMode("custom");
            onChange(e.target.value);
          }}
          placeholder="https://… หรือ /path"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
        />
      ) : null}
    </div>
  );
}
