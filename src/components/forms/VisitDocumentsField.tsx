"use client";

import { useRef, useState } from "react";
import { FileText, ImageIcon, Trash2 } from "lucide-react";
import {
  VISIT_DOC_MAX_FILES,
  prepareVisitDocument,
  visitDocAccept,
  visitDocKind,
  normalizeVisitDocType,
} from "@/lib/visits/visit-media";

export type VisitDocItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  kind: "image" | "pdf";
};

export function revokeVisitDocs(items: VisitDocItem[]) {
  for (const item of items) {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  }
}

export function VisitDocumentsField({
  files,
  onFiles,
}: {
  files: VisitDocItem[];
  onFiles: (next: VisitDocItem[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function addFiles(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    if (!incoming.length) return;
    const room = VISIT_DOC_MAX_FILES - files.length;
    if (room <= 0) {
      setLocalError(`แนบได้สูงสุด ${VISIT_DOC_MAX_FILES} ไฟล์`);
      return;
    }

    setBusy(true);
    setLocalError(null);
    const next: VisitDocItem[] = [];
    try {
      for (const file of incoming.slice(0, room)) {
        const kind = visitDocKind(normalizeVisitDocType(file));
        if (!kind) {
          setLocalError("รองรับไฟล์ PDF, JPG หรือ PNG");
          continue;
        }
        try {
          const prepared = await prepareVisitDocument(file);
          next.push({
            id: `visit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            file: prepared,
            previewUrl: kind === "image" ? URL.createObjectURL(prepared) : null,
            kind: prepared.type === "application/pdf" ? "pdf" : "image",
          });
        } catch (err) {
          setLocalError(err instanceof Error ? err.message : "แนบไฟล์ไม่สำเร็จ");
        }
      }
      if (next.length) onFiles([...files, ...next]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeFile(id: string) {
    const target = files.find((item) => item.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onFiles(files.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex gap-1 text-sm font-medium text-ink">
          Company Profile / นามบัตร
          <span className="text-brand-red">*</span>
          {files.length > 0 ? (
            <span className="ml-1 font-normal text-muted">
              ({files.length}/{VISIT_DOC_MAX_FILES})
            </span>
          ) : null}
        </span>
        <button
          type="button"
          disabled={busy || files.length >= VISIT_DOC_MAX_FILES}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy hover:bg-paper disabled:opacity-50"
        >
          {busy ? "กำลังย่อไฟล์..." : "เพิ่มไฟล์"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={visitDocAccept()}
        multiple
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />
      {files.length === 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-paper/50 px-3 py-5 text-xs text-muted hover:border-navy/30 disabled:opacity-50"
        >
          <ImageIcon className="size-5 opacity-60" />
          <span>{busy ? "กำลังย่อรูปให้ส่งได้..." : "คลิกเลือก Company Profile หรือนามบัตร"}</span>
          <span className="text-[11px] opacity-70">
            รูปย่ออัตโนมัติ · PDF ไม่เกิน 8 MB · สูงสุด {VISIT_DOC_MAX_FILES} ไฟล์
          </span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {files.map((item) => (
            <li
              key={item.id}
              className="relative overflow-hidden rounded-lg border border-line bg-paper"
            >
              {item.kind === "image" && item.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1 px-2 text-muted">
                  <FileText className="size-6 opacity-60" />
                  <span className="line-clamp-2 text-center text-[11px]">{item.file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(item.id)}
                className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white hover:bg-brand-red"
                aria-label={`ลบ ${item.file.name}`}
                title="ลบไฟล์"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted">
        {files.length
          ? `ไฟล์ที่เลือก: ${files.map((item) => item.file.name).join(", ")}`
          : "เลือกได้ 1–2 ไฟล์ · PDF / JPG / PNG"}
      </p>
      {localError ? (
        <p className="text-xs text-brand-red" role="alert">
          {localError}
        </p>
      ) : null}
    </div>
  );
}
