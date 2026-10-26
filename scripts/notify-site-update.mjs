/**
 * Post a categorized website-update note to the LINE report group.
 * Falls back to the sales group when LINE_REPORT_TO_ID is unset.
 *
 * Usage: node scripts/notify-site-update.mjs --file update.txt
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null || process.env[key] === "") process.env[key] = value;
  }
}

loadEnv(resolve(".env.local"));
loadEnv(resolve(".env"));

const fileFlag = process.argv.indexOf("--file");
const text =
  fileFlag >= 0 ? readFileSync(process.argv[fileFlag + 1], "utf8").trim() : "";

if (!text) {
  console.error("Missing update text. Pass --file <path>.");
  process.exit(1);
}

const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const to = process.env.LINE_REPORT_TO_ID || process.env.LINE_SALES_TO_ID;
if (!token || !to) {
  console.error("LINE is not configured.");
  process.exit(1);
}

const res = await fetch("https://api.line.me/v2/bot/message/push", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    to,
    messages: [{ type: "text", text: text.slice(0, 4900) }],
  }),
});

if (!res.ok) {
  console.error(`LINE push failed (${res.status}).`);
  process.exit(1);
}

console.log("LINE update sent.");
