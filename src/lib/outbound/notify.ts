type LeadNotifyPayload = {
  id: string;
  fullName: string;
  phone: string;
  lineId?: string | null;
  email?: string | null;
  source: string;
  productInterest?: string | null;
  message?: string | null;
};

async function insertOutboundJob(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createServiceSupabase>,
  channel: "line" | "email" | "webhook",
  leadId: string,
  payload: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("outbound_jobs")
    .insert({
      channel,
      lead_id: leadId,
      payload,
      status: "pending",
      attempts: 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function markJob(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createServiceSupabase>,
  jobId: string,
  status: "sent" | "failed",
  lastError?: string,
) {
  await supabase
    .from("outbound_jobs")
    .update({
      status,
      last_error: lastError ?? null,
      attempts: 1,
      processed_at: new Date().toISOString(),
    })
    .eq("id", jobId);
}

export async function enqueueLeadNotifications(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createServiceSupabase>,
  lead: LeadNotifyPayload,
) {
  const results: Array<{ channel: string; ok: boolean; error?: string }> = [];

  // LINE sales notify
  const lineJobId = await insertOutboundJob(supabase, "line", lead.id, {
    to: process.env.LINE_SALES_TO_ID,
    text: [
      `[Chang Tee Lead] ${lead.source}`,
      `ชื่อ: ${lead.fullName}`,
      `โทร: ${lead.phone}`,
      lead.lineId ? `LINE: ${lead.lineId}` : null,
      lead.email ? `อีเมล: ${lead.email}` : null,
      lead.productInterest ? `สนใจ: ${lead.productInterest}` : null,
      lead.message ? `ข้อความ: ${lead.message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });

  try {
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
    const to = process.env.LINE_SALES_TO_ID;
    if (!token || !to) {
      throw new Error("LINE credentials not configured");
    }
    const res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [
          {
            type: "text",
            text: [
              `[Chang Tee Lead] ${lead.source}`,
              `ชื่อ: ${lead.fullName}`,
              `โทร: ${lead.phone}`,
            ].join("\n"),
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`LINE HTTP ${res.status}`);
    await markJob(supabase, lineJobId, "sent");
    results.push({ channel: "line", ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "LINE failed";
    await markJob(supabase, lineJobId, "failed", message);
    results.push({ channel: "line", ok: false, error: message });
  }

  // Customer email auto-reply via Resend
  const emailJobId = await insertOutboundJob(supabase, "email", lead.id, {
    to: lead.email,
    template: "lead-auto-reply",
  });

  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) throw new Error("Resend not configured");
    if (!lead.email) throw new Error("Customer email missing — skip send");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [lead.email],
        subject: "รับเรื่องขอใบเสนอราคา — ช่างตี๋ ผ้าม่าน",
        html: `<p>เรียนคุณ ${lead.fullName}</p>
<p>เราได้รับข้อมูลของท่านแล้ว ทีมงานจะติดต่อกลับโดยเร็วที่สุด</p>
<p>ขอบคุณที่ไว้วางใจช่างตี๋ ผ้าม่าน</p>`,
      }),
    });
    if (!res.ok) throw new Error(`Resend HTTP ${res.status}`);
    await markJob(supabase, emailJobId, "sent");
    results.push({ channel: "email", ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email failed";
    await markJob(supabase, emailJobId, "failed", message);
    results.push({ channel: "email", ok: false, error: message });
  }

  return results;
}
