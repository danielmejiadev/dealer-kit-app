import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDealerForHost } from "@/modules/dealer/services/dealerService";
import { VehicleDetail } from "@/modules/vehicles/components/public/VehicleDetail";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicleId = Number(id);

  if (!Number.isInteger(vehicleId)) {
    notFound();
  }

  const requestHeaders = await headers();
  const dealer = await getDealerForHost(requestHeaders.get("host") ?? "");

  if (!dealer) {
    notFound();
  }

  return <VehicleDetail vehicleId={vehicleId} dealerId={dealer.id} />;
}
