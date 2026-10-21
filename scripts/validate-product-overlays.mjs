import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const p = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "lib",
  "i18n",
  "content",
  "product-overlays.ts",
);
const s = fs.readFileSync(p, "utf8");

console.log("has FFFD:", s.includes("\uFFFD"));

function firstField(pack, field) {
  const re = new RegExp(
    `const ${pack}:[\\s\\S]*?${field}:\\s*(?:\\n\\s*)?"([^"]+)"`,
  );
  const m = s.match(re);
  return m?.[1] ?? null;
}

for (const pack of ["en", "my", "lo", "km", "zhHans", "zhHant"]) {
  console.log(pack, {
    name: firstField(pack, "name"),
    summary: firstField(pack, "summary"),
    tagline: firstField(pack, "tagline")?.slice(0, 60),
  });
}

const dups = [];
let last = "";
let line = 0;
for (const lineStr of s.split("\n")) {
  line++;
  const km2 = lineStr.match(/^\s+(\w+):\s/);
  if (km2) {
    if (
      km2[1] === last &&
      ["name", "summary", "tagline", "body", "highlights", "suitableFor", "care"].includes(
        km2[1],
      )
    ) {
      dups.push(`${line}:${km2[1]}`);
    }
    last = km2[1];
  } else if (lineStr.trim() === "}," || lineStr.trim() === "};") {
    last = "";
  }
}
console.log("dup keys:", dups);

const enBlock = s.match(/const en:[\s\S]*?^};/m)?.[0] ?? "";
console.log(
  "en keys:",
  [...enBlock.matchAll(/"([a-z0-9/-]+)":/g)].map((m) => m[1]),
);

// Expected Khmer / Lao
const expectedKm = "វាំងននបន្ទះ PVC";
const expectedLo = "ຜ້າມ່ານເສັ້ນ PVC";
console.log("km name ok:", firstField("km", "name") === expectedKm);
console.log("lo name ok:", firstField("lo", "name") === expectedLo);
console.log("expected km:", expectedKm);
console.log("got km:", firstField("km", "name"));
console.log("codepoints km got:", [...(firstField("km", "name") || "")].map((c) => c.codePointAt(0).toString(16)));
console.log("codepoints km exp:", [...expectedKm].map((c) => c.codePointAt(0).toString(16)));
