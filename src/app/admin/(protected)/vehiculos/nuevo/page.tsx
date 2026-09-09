import { NewVehicleScreen } from "@/modules/vehicles/components/admin/NewVehicleScreen";

export default function NewVehiclePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-heading font-semibold text-ink">Nuevo vehículo</h1>
      <NewVehicleScreen />
    </div>
  );
}
