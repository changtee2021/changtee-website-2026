import { buildLlmsText, llmsResponse } from "@/lib/llms-text";

export const revalidate = 3600;

export async function GET() {
  return llmsResponse(await buildLlmsText({ full: false }));
}
