import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentDealer } from "@/modules/dealer/services/dealerService";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

// Gates everything under /admin except /admin/login (deliberately outside this "(protected)" route group). No proxy.ts here: it forces the
// nodejs runtime and breaks on Cloudflare Workers (cloudflare/workers-sdk#13755, an open unresolved bug) — see
// docs/plans/fase-1-catalogo-admin.md, "Fase 0.5". This is UX convenience only; RLS on each table is the real security.
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  const dealer = await getCurrentDealer();

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <span className="font-heading text-lg font-semibold text-ink">{dealer.name} · Admin</span>
        <LogoutButton />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
