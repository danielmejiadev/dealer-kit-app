import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { getDealerForMember } from "@/modules/dealer/services/dealerService";
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

  // Admin resolves by membership, not hostname: a dealer's owner always sees their own dealer here, regardless of the domain they entered from.
  const dealer = await getDealerForMember(data.claims.sub);

  if (!dealer) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="flex items-center justify-between border-b border-line bg-surface px-6 py-4">
        <span className="font-heading text-lg font-semibold text-ink">{dealer.name} · Admin</span>
        <nav className="flex items-center gap-4">
          <Link href="/admin/configuracion" className="text-sm text-ink-dim hover:text-ink">
            Personalización
          </Link>
          <LogoutButton />
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
