"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2 } from "lucide-react";
import {
  uploadAdminFile,
  type UploadPrepStatus,
} from "@/lib/cms/admin-upload";
import { UploadPrepBar } from "@/components/admin/cms/UploadPrepBar";
import { cn } from "@/lib/utils";

export function CmsImageUpload({
  value,
  onChange,
  folder = "misc",
  className,
  aspectClassName = "aspect-[16/10]",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectClassName?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<UploadPrepStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadAdminFile(file, folder, setStatus);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setStatus(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "relative block w-full overflow-hidden rounded-xl border border-dashed border-line bg-paper text-left transition hover:border-navy/40",
          aspectClassName,
        )}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            className="object-cover"
            sizes="280px"
            unoptimized={value.startsWith("blob:")}
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-muted">
            <ImagePlus className="size-5" />
            อัปโหลดรูป
          </span>
        )}
        {uploading ? (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy/70 px-3 text-center text-white">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-[11px] leading-snug">
              {status?.label ?? "กำลังอัปโหลด..."}
            </span>
          </span>
        ) : value ? (
          <span className="absolute inset-x-0 bottom-0 bg-navy/70 px-2 py-1 text-center text-[11px] text-white">
            เปลี่ยนรูป
          </span>
        ) : null}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      {status ? <UploadPrepBar status={status} /> : null}
      {error ? <p className="text-[11px] text-brand-red">{error}</p> : null}
    </div>
  );
}
