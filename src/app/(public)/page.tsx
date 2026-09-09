import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDealerForHost } from "@/modules/dealer/services/dealerService";
import { VehicleCatalogGrid } from "@/modules/vehicles/components/public/VehicleCatalogGrid";

// Re-resolves the dealer (deduped with the layout's own resolution via
// getDealerForHost's cache()) so it can be handed down as an explicit prop
// instead of VehicleCatalogGrid resolving it itself.
export default async function CatalogPage() {
  const requestHeaders = await headers();
  const dealer = await getDealerForHost(requestHeaders.get("host") ?? "");

  if (!dealer) {
    notFound();
  }

  return <VehicleCatalogGrid dealerId={dealer.id} />;
}
