import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["src/components/admin/editor/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/cms/demo-store", "@/lib/cms/demo-store"],
              message:
                "Page editor must load CMS via server/lib/editor APIs — not localStorage demo-store (stale overwrite risk).",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/lib/editor/protocol.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*"],
              message:
                "protocol.ts must stay type/const-only so admin + site bundles can share it.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
