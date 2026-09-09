import Anthropic from "@anthropic-ai/sdk";

// Server-only, mirrors lib/supabaseClient.ts's role: one configured client,
// no business logic. Unlike the Supabase anon key (safe in the browser
// because RLS enforces access per row), this key has no per-request access
// control — it must only ever be reached from services/ via a Route
// Handler. See AGENTS.md, "Connecting to Supabase vs. the AI provider".
export function createAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
