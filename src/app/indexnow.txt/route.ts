import { INDEXNOW_KEY } from "@/lib/seo/indexnow";

/** IndexNow key file. The body must be exactly the key. */
export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
