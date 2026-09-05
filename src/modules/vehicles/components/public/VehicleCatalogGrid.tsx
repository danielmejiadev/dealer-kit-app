import { getCurrentDealer } from "@/modules/dealer/services/dealerService";
import { listVehiclesForDealer } from "../../services/vehicleService";
import { listCoverPhotosByVehicleId } from "../../services/vehiclePhotoService";
import { getVehiclePhotoUrl } from "../../utils/vehiclePhotoUrl";
import { VehicleCard } from "./VehicleCard";

// Server Component: primera carga del catálogo público, llama a
// services/ directo (ver AGENTS.md, "Reading data on first load"). Solo
// vehículos publicados — RLS ya lo garantiza del lado de la base de
// datos, este filtro solo evita traer filas de más.
export async function VehicleCatalogGrid() {
  const dealer = await getCurrentDealer();
  const vehicles = await listVehiclesForDealer(dealer.id, { publishedOnly: true });

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg bg-surface p-12 text-center shadow-soft">
        <p className="text-ink-dim">Todavía no hay vehículos publicados.</p>
      </div>
    );
  }

  const coverPhotosByVehicleId = await listCoverPhotosByVehicleId(vehicles.map((vehicle) => vehicle.id));

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => {
        const coverPhoto = coverPhotosByVehicleId.get(vehicle.id);
        return (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            photoUrl={coverPhoto ? getVehiclePhotoUrl(coverPhoto.storage_path) : null}
          />
        );
      })}
    </div>
  );
}
