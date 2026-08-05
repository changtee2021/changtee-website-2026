"use client";

import { CmsImageUpload } from "@/components/admin/cms/CmsImageUpload";
import { CmsLinkPicker } from "@/components/admin/cms/CmsLinkPicker";
import type { SectionFieldDef } from "@/lib/cms/page-sections";

export function SectionFieldsEditor({
  fields,
  values,
  onChange,
  folder = "cms-sections",
}: {
  fields: SectionFieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  folder?: string;
}) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        if (field.type === "image") {
          return (
            <div key={field.key}>
              <p className="mb-1.5 text-sm font-medium text-navy">{field.label}</p>
              <CmsImageUpload
                value={value}
                onChange={(url) => onChange(field.key, url)}
                folder={folder}
                aspectClassName={field.aspectClassName ?? "aspect-video"}
              />
              {field.hint ? (
                <p className="mt-1 text-xs text-muted">{field.hint}</p>
              ) : null}
            </div>
          );
        }
        if (field.type === "link") {
          return (
            <div key={field.key}>
              <p className="mb-1.5 text-sm font-medium text-navy">{field.label}</p>
              <CmsLinkPicker
                value={value}
                onChange={(href) => onChange(field.key, href)}
              />
            </div>
          );
        }
        if (field.type === "textarea") {
          return (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-sm font-medium text-navy">
                {field.label}
              </span>
              <textarea
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
              />
              {field.hint ? (
                <span className="mt-1 block text-xs text-muted">{field.hint}</span>
              ) : null}
            </label>
          );
        }
        return (
          <label key={field.key} className="block">
            <span className="mb-1.5 block text-sm font-medium text-navy">
              {field.label}
            </span>
            <input
              type="text"
              value={value}
              maxLength={field.maxLength}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy outline-none focus:border-navy/40"
            />
            {field.hint ? (
              <span className="mt-1 block text-xs text-muted">{field.hint}</span>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}
