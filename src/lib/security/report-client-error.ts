export function reportClientError(error: Error & { digest?: string }) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({
    message: error.message.slice(0, 300),
    digest: error.digest || null,
    path: window.location.pathname.slice(0, 200),
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/public/errors",
        new Blob([body], { type: "application/json" }),
      );
      return;
    }
  } catch {
    /* fall through */
  }
  void fetch("/api/public/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
