import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { getDealerForMember } from "@/modules/dealer/services/dealerService";
import { DealerThemeForm } from "@/modules/dealer/components/DealerThemeForm";

// Re-resolves the dealer (deduped with the layout's own resolution via
// getDealerForMember's cache()) so it can be handed down as an explicit prop.
export default async function DealerSettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  const dealer = await getDealerForMember(data.claims.sub);

  if (!dealer) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-semibold text-ink">Personalización</h1>
      <DealerThemeForm dealer={dealer} />
    </div>
  );
}
