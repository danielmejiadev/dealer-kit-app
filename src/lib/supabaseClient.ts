import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

// Client-side: safe to call from a Client Component. Uses the public
// anon key — Row-Level Security is what actually protects the data, not
// the secrecy of this key. See AGENTS.md, "connecting with Supabase vs.
// the AI provider key".
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server-side: for use inside Server Components and Route Handlers, reads
// the caller's session from cookies so RLS applies as that user.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}

// Service-role client: bypasses RLS entirely. Server-only, and only for
// operations that must cross tenants by design (e.g. admin tooling) — a
// normal Route Handler or Server Component should use
// createServerSupabaseClient() instead so RLS still applies.
export function createServiceRoleSupabaseClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}
