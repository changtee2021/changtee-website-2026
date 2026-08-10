"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PortfolioAiWizard } from "@/components/admin/PortfolioAiWizard";
import { PortfolioEditor } from "@/components/admin/PortfolioEditor";
import { PageLoader } from "@/components/ui/page-loader";

function NewPortfolioMode() {
  const params = useSearchParams();
  if (params.get("mode") === "manual") return <PortfolioEditor />;
  return <PortfolioAiWizard />;
}

export function NewPortfolioClient() {
  return (
    <Suspense
      fallback={
        <PageLoader label="กำลังโหลด…" className="min-h-[20vh] bg-transparent" />
      }
    >
      <NewPortfolioMode />
    </Suspense>
  );
}
