import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Unlike the landing (static export to GitHub Pages), this is the real
// product app: a dynamic Next.js server (Route Handlers, Server Components
// reading from Supabase per-request). It deploys to Cloudflare Workers via
// the @opennextjs/cloudflare adapter (see wrangler.jsonc, open-next.config.ts)
// — nothing static-export-specific belongs here. @cloudflare/next-on-pages is
// deprecated and not used.
const nextConfig: NextConfig = {};

// Makes `pnpm dev` use the same Cloudflare bindings (ASSETS, IMAGES,
// WORKER_SELF_REFERENCE) as the deployed Worker, reading local values from
// .dev.vars instead of the production environment.
initOpenNextCloudflareForDev();

export default nextConfig;
