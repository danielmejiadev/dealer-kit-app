"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCOP } from "@/utils/currency";
import { useVehicles } from "../../hooks/useVehicles";
import { useSetVehicleStatus } from "../../hooks/useSetVehicleStatus";
import { VEHICLE_STATUS_BADGE_TONE, VEHICLE_STATUS_LABELS, type VehicleStatus } from "../../utils/vehicleOptions";
import type { Vehicle } from "../../services/vehicleService";
import { DeleteVehicleModal } from "./DeleteVehicleModal";

interface VehicleAdminListProps {
  initialVehicles: Vehicle[];
}

export function VehicleAdminList({ initialVehicles }: VehicleAdminListProps) {
  const { data: vehicles, isFetching } = useVehicles(initialVehicles);
  const setStatusMutation = useSetVehicleStatus();
  const [vehiclePendingDeletion, setVehiclePendingDeletion] = useState<Vehicle | null>(null);

  function isChangingStatus(vehicleId: number) {
    return setStatusMutation.isPending && setStatusMutation.variables?.vehicleId === vehicleId;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-heading font-semibold text-ink">Vehículos</h1>
          {isFetching ? <Spinner /> : null}
        </div>
        <Link href="/admin/vehiculos/nuevo">
          <Button>Nuevo vehículo</Button>
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <EmptyState
          message="Todavía no hay vehículos."
          action={
            <Link href="/admin/vehiculos/nuevo">
              <Button>Crear el primero</Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg bg-surface shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-ink-dim">
              <tr>
                <th className="px-4 py-3 font-medium">Vehículo</th>
                <th className="px-4 py-3 font-medium">Placa</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink">
                    {vehicle.marca} {vehicle.linea} {vehicle.modelo}
                  </td>
                  <td className="px-4 py-3 text-ink-dim">{vehicle.placa}</td>
                  <td className="px-4 py-3 text-ink">{formatCOP(vehicle.precio_cop)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={VEHICLE_STATUS_BADGE_TONE[vehicle.status as VehicleStatus]}>
                      {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus] ?? vehicle.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/vehiculos/${vehicle.id}/editar`}>
                        <Button variant="ghost">Editar</Button>
                      </Link>
                      {vehicle.status === "published" ? (
                        <Button
                          variant="ghost"
                          disabled={setStatusMutation.isPending}
                          onClick={() => setStatusMutation.mutate({ vehicleId: vehicle.id, status: "draft" })}
                          className="inline-flex items-center gap-2"
                        >
                          {isChangingStatus(vehicle.id) ? <Spinner size="sm" /> : null}
                          Despublicar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          disabled={setStatusMutation.isPending}
                          onClick={() => setStatusMutation.mutate({ vehicleId: vehicle.id, status: "published" })}
                          className="inline-flex items-center gap-2"
                        >
                          {isChangingStatus(vehicle.id) ? <Spinner size="sm" /> : null}
                          Publicar
                        </Button>
                      )}
                      <Button variant="ghost" onClick={() => setVehiclePendingDeletion(vehicle)}>
                        Borrar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteVehicleModal
        vehicle={vehiclePendingDeletion}
        onOpenChange={(open) => {
          if (!open) setVehiclePendingDeletion(null);
        }}
      />
    </div>
  );
}
