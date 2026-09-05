import { notFound } from "next/navigation";
import { getVehicleById } from "@/modules/vehicles/services/vehicleService";
import { listPhotosForVehicle } from "@/modules/vehicles/services/vehiclePhotoService";
import { VehicleForm } from "@/modules/vehicles/components/admin/VehicleForm";
import { VehiclePhotoUploader } from "@/modules/vehicles/components/admin/VehiclePhotoUploader";

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(Number(id));

  if (!vehicle) {
    notFound();
  }

  const photos = await listPhotosForVehicle(vehicle.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-heading font-semibold text-ink">
        Editar {vehicle.marca} {vehicle.linea} {vehicle.modelo}
      </h1>
      <VehicleForm mode="edit" vehicle={vehicle} />
      <VehiclePhotoUploader vehicleId={vehicle.id} initialPhotos={photos} />
    </div>
  );
}
