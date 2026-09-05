import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { getCurrentDealer } from "@/modules/dealer/services/dealerService";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

// Gatea todo lo bajo /admin salvo /admin/login (fuera de este route group
// "(protected)" a propósito). Sin proxy.ts: ver
// docs/plans/fase-1-catalogo-admin.md, "Fase 0.5 — Decisión importante"
// (proxy.ts fuerza runtime nodejs y rompe en Cloudflare Workers por
// cloudflare/workers-sdk#13755, un bug abierto sin resolver). Esto es solo
// conveniencia de UX — la seguridad real la impone RLS en cada tabla.
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
