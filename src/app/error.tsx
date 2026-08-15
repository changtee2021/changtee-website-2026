"use client";

import { useEffect } from "react";
import { HttpStatusPage } from "@/components/errors/HttpStatusPage";
import { reportClientError } from "@/lib/security/report-client-error";

export default function AppError({
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
      showRetry
      onRetry={reset}
      showQuote={false}
    />
  );
}
