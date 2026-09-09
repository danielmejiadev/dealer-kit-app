import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { getDealerForMember } from "@/modules/dealer/services/dealerService";
import { listVehiclesForDealer } from "@/modules/vehicles/services/vehicleService";
import { VehicleAdminList } from "@/modules/vehicles/components/admin/VehicleAdminList";

// Re-resolves the dealer (deduped with the layout's own resolution via
// getDealerForMember's cache()) so it can be handed down as an explicit prop
// instead of VehicleAdminList resolving it itself.
export default async function AdminVehiclesPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/admin/login");
  }

  const dealer = await getDealerForMember(data.claims.sub);

  if (!dealer) {
    notFound();
  }

  const vehicles = await listVehiclesForDealer(dealer.id);

  return <VehicleAdminList initialVehicles={vehicles} />;
}
