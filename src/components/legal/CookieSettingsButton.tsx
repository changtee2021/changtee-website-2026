"use client";

export function CookieSettingsButton({
  className = "",
  label = "ตั้งค่าคุกกี้",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      className={
        className ||
        "rounded-md bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-deep"
      }
      onClick={() => {
        window.dispatchEvent(new Event("ctc-open-cookie-settings"));
      }}
    >
      {label}
    </button>
  );
}
