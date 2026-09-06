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
    // Build output that also needs ignoring, and not just at the repo
    // root: `.claude/worktrees/<id>/` holds full nested checkouts (one
    // per parallel agent), each with its own `.next`/`.open-next`, so a
    // bare ".next/**" never matches those and a lint run from the repo
    // root ends up scanning every other worktree's build artifacts too.
    "**/.next/**",
    "**/.open-next/**",
    "**/.wrangler/**",
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
