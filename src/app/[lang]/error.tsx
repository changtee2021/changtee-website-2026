"use client";

import { useEffect } from "react";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";
import { reportClientError } from "@/lib/security/report-client-error";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError(error);
  }, [error]);

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
