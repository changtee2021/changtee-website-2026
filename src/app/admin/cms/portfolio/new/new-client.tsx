"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PortfolioAiWizard } from "@/components/admin/PortfolioAiWizard";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";

function NewPortfolioMode() {
  const params = useSearchParams();
  if (params.get("mode") === "manual") return <PortfolioEditor />;
  return <PortfolioAiWizard />;
}

export function NewPortfolioClient() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6 text-sm text-muted">
          กำลังโหลด…
        </div>
      }
    >
      <NewPortfolioMode />
    </Suspense>
  );
}
