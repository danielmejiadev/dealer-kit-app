import type { NextConfig } from "next";

// Unlike the landing (static export to GitHub Pages), this is the real
// product app: a dynamic Next.js server (Route Handlers, Server Components
// reading from Supabase per-request). It deploys to Cloudflare Pages via
// the @cloudflare/next-on-pages adapter, wired up in the deploy phase —
// nothing static-export-specific belongs here.
const nextConfig: NextConfig = {};

export default nextConfig;
