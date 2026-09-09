import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDealerForHost } from "@/modules/dealer/services/dealerService";
import { TenantThemeProvider } from "@/modules/dealer/components/TenantThemeProvider";

// Resolves the dealer by subdomain (see modules/dealer/utils/hostname.ts): no
// subdomain falls back to slug='default', an unmatched one 404s.
export default async function PublicLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const dealer = await getDealerForHost(requestHeaders.get("host") ?? "");

  if (!dealer) {
    notFound();
  }

  return (
    <TenantThemeProvider dealer={dealer}>
      <div className="flex min-h-screen flex-col bg-bg">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="font-heading text-lg font-semibold text-ink">
              {dealer.name}
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
        <footer className="border-t border-line px-6 py-6 text-center text-sm text-ink-dim">
          {[dealer.contact_phone, dealer.contact_whatsapp, dealer.contact_email]
            .filter(Boolean)
            .join(" · ")}
        </footer>
      </div>
    </TenantThemeProvider>
  );
}
