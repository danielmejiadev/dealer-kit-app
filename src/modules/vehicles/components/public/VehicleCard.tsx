import Link from "next/link";
import type { Vehicle } from "../../services/vehicleService";
import { COMBUSTIBLE_LABELS, TRANSMISION_LABELS } from "../../utils/vehicleOptions";
import { formatCOP, formatKilometraje } from "@/utils/currency";
import styles from "./VehicleCard.module.css";

interface VehicleCardProps {
  vehicle: Vehicle;
  photoUrl: string | null;
}

export function VehicleCard({ vehicle, photoUrl }: VehicleCardProps) {
  return (
    <Link
      href={`/vehiculos/${vehicle.id}`}
      className={`${styles.card} block overflow-hidden rounded-lg bg-surface shadow-soft transition-shadow hover:shadow-lift`}
    >
      <div className={`${styles.photoBox} bg-surface-2`}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- bucket público, sin optimización de Next Image por ahora
          <img
            src={photoUrl}
            alt={`${vehicle.marca} ${vehicle.linea} ${vehicle.modelo}`}
            className={styles.photo}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-faint">
            Sin foto
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-base font-heading font-semibold text-ink">
          {vehicle.marca} {vehicle.linea} {vehicle.modelo}
        </h3>
        <p className="text-lg font-semibold text-accent-ink">{formatCOP(vehicle.precio_cop)}</p>
        <p className="text-sm text-ink-dim">
          {formatKilometraje(vehicle.kilometraje)} · {COMBUSTIBLE_LABELS[vehicle.combustible as keyof typeof COMBUSTIBLE_LABELS] ?? vehicle.combustible} ·{" "}
          {TRANSMISION_LABELS[vehicle.transmision as keyof typeof TRANSMISION_LABELS] ?? vehicle.transmision}
        </p>
      </div>
    </Link>
  );
}
