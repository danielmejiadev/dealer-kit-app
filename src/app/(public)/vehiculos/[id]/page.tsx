import { notFound } from "next/navigation";
import { VehicleDetail } from "@/modules/vehicles/components/public/VehicleDetail";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicleId = Number(id);

  if (!Number.isInteger(vehicleId)) {
    notFound();
  }

  return <VehicleDetail vehicleId={vehicleId} />;
}
