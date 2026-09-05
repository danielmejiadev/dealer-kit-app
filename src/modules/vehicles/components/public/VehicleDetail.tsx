import { notFound } from "next/navigation";
import { getVehicleById } from "../../services/vehicleService";
import { listPhotosForVehicle } from "../../services/vehiclePhotoService";
import { getVehiclePhotoUrl } from "../../utils/vehiclePhotoUrl";
import { CLASE_VEHICULO_LABELS, COMBUSTIBLE_LABELS, TRANSMISION_LABELS } from "../../utils/vehicleOptions";
import { formatCOP, formatKilometraje } from "@/utils/currency";

interface VehicleDetailProps {
  vehicleId: number;
}

// Server Component: primera carga de la página de detalle, llama a
// services/ directo. Un visitante nunca debería llegar aquí para un
// vehículo no publicado (RLS ya se lo esconde), pero por si acaso lo pide
// por URL directa, se trata igual que "no existe".
export async function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const vehicle = await getVehicleById(vehicleId);

  if (!vehicle || vehicle.status !== "published") {
    notFound();
  }

  const photos = await listPhotosForVehicle(vehicleId);

  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {photos.length > 0 ? (
          photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element -- bucket público, sin optimización de Next Image por ahora
            <img
              key={photo.id}
              src={getVehiclePhotoUrl(photo.storage_path)}
              alt={`${vehicle.marca} ${vehicle.linea} ${vehicle.modelo}`}
              className="aspect-4/3 w-full rounded-lg object-cover"
            />
          ))
        ) : (
          <div className="flex aspect-4/3 items-center justify-center rounded-lg bg-surface-2 text-ink-faint sm:col-span-2">
            Sin fotos
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-heading font-semibold text-ink">
          {vehicle.marca} {vehicle.linea} {vehicle.modelo}
        </h1>
        <p className="text-2xl font-semibold text-accent-ink">{formatCOP(vehicle.precio_cop)}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-lg bg-surface p-5 shadow-soft sm:grid-cols-3">
        <VehicleAttribute label="Kilometraje" value={formatKilometraje(vehicle.kilometraje)} />
        <VehicleAttribute
          label="Combustible"
          value={COMBUSTIBLE_LABELS[vehicle.combustible as keyof typeof COMBUSTIBLE_LABELS] ?? vehicle.combustible}
        />
        <VehicleAttribute
          label="Transmisión"
          value={TRANSMISION_LABELS[vehicle.transmision as keyof typeof TRANSMISION_LABELS] ?? vehicle.transmision}
        />
        <VehicleAttribute
          label="Clase"
          value={CLASE_VEHICULO_LABELS[vehicle.clase_vehiculo as keyof typeof CLASE_VEHICULO_LABELS] ?? vehicle.clase_vehiculo}
        />
        <VehicleAttribute label="Color" value={vehicle.color} />
        {vehicle.cilindraje ? (
          <VehicleAttribute label="Cilindraje" value={`${vehicle.cilindraje} cc`} />
        ) : null}
      </dl>

      {vehicle.descripcion ? (
        <p className="whitespace-pre-line text-ink-dim">{vehicle.descripcion}</p>
      ) : null}
    </article>
  );
}

function VehicleAttribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
