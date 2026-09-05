import { VehicleForm } from "@/modules/vehicles/components/admin/VehicleForm";

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-semibold text-ink">Nuevo vehículo</h1>
      <VehicleForm mode="create" />
    </div>
  );
}
