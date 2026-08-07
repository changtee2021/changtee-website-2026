"use client";

import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <HttpStatusPage
      code={500}
      showRetry
      onRetry={reset}
      showQuote={false}
    />
  );
}
