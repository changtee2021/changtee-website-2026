/**
 * Shared LINE Messaging API push helper.
 * Reuses the same channel token as `src/lib/outbound/notify.ts` (sales notify)
 * but allows routing to a dedicated group per feature (visit / HR) when
 * `LINE_VISIT_TO_ID` / `LINE_HR_TO_ID` are set — falls back to `LINE_SALES_TO_ID`
 * so it works out of the box with a single existing LINE group.
 */

export function lineNotifyConfigured(): boolean {
  return Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN);
}

export async function pushLineMessage(
  text: string,
  to?: string | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const target = to || process.env.LINE_SALES_TO_ID;
    if (!token || !target) {
      throw new Error("LINE credentials not configured");
    }

    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: target,
        messages: [{ type: "text", text: text.slice(0, 4900) }],
      }),
    });

    if (!res.ok) throw new Error(`LINE HTTP ${res.status}`);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "LINE failed",
    };
  }
}

/** Destination for factory-visit booking alerts (falls back to sales group). */
export function visitLineTarget(): string | undefined {
  return process.env.LINE_VISIT_TO_ID || process.env.LINE_SALES_TO_ID;
}

/** Destination for HR / job application alerts (falls back to sales group). */
export function hrLineTarget(): string | undefined {
  return process.env.LINE_HR_TO_ID || process.env.LINE_SALES_TO_ID;
}
