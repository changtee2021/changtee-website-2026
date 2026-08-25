"use client";

const MAX_FILES = 2;

export function VisitDocumentsField({
  fileNames,
  onFileNames,
}: {
  fileNames: string[];
  onFileNames: (names: string[]) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex gap-1 text-sm font-medium text-ink">
        Company Profile / นามบัตร
        <span className="text-brand-red">*</span>
      </span>
      <input
        name="visitDocuments"
        type="file"
        required
        multiple
        accept="application/pdf,image/jpeg,image/png"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, MAX_FILES);
          onFileNames(files.map((file) => file.name));
        }}
        className="block w-full cursor-pointer rounded-xl border border-line bg-field px-3 py-2.5 text-sm outline-none file:mr-3 file:rounded-full file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-navy focus:border-navy"
      />
      <span className="mt-1 block text-xs text-muted">
        {fileNames.length
          ? `ไฟล์ที่เลือก: ${fileNames.join(", ")}`
          : "เลือกได้ 1–2 ไฟล์ในช่องเดียว · PDF / JPG / PNG ไม่เกิน 8MB ต่อไฟล์"}
      </span>
    </label>
  );
}
