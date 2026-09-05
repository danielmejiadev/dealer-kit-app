import { getCurrentDealer } from "@/modules/dealer/services/dealerService";
import { listVehiclesForDealer } from "@/modules/vehicles/services/vehicleService";
import { VehicleAdminList } from "@/modules/vehicles/components/admin/VehicleAdminList";

// Patrón de primera carga del admin (ver AGENTS.md): Server Component
// delgado → llama a services/ directo → pasa el resultado como
// initialData al Client Component, que usa useVehicles(initialData).
export default async function AdminVehiclesPage() {
  const dealer = await getCurrentDealer();
  const vehicles = await listVehiclesForDealer(dealer.id);

  return <VehicleAdminList initialVehicles={vehicles} />;
}
