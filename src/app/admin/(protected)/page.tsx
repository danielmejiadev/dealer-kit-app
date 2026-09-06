import { getCurrentDealer } from "@/modules/dealer/services/dealerService";
import { listVehiclesForDealer } from "@/modules/vehicles/services/vehicleService";
import { VehicleAdminList } from "@/modules/vehicles/components/admin/VehicleAdminList";

// Thin Server Component calling services/ directly, passing the result as initialData to the Client Component's useVehicles(initialData).
export default async function AdminVehiclesPage() {
  const dealer = await getCurrentDealer();
  const vehicles = await listVehiclesForDealer(dealer.id);

  return <VehicleAdminList initialVehicles={vehicles} />;
}
