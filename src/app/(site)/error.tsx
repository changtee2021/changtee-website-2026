"use client";

import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <HttpStatusPage
      code={500}
      compact
      showRetry
      onRetry={reset}
      showQuote={false}
    />
  );
}
