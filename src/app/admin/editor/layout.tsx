import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Editor",
  robots: { index: false, follow: false },
};

/** Full-bleed editor — AdminShell is skipped in parent admin layout for /editor */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
