"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDeleteVehicle } from "../../hooks/useDeleteVehicle";
import type { Vehicle } from "../../services/vehicleService";

interface DeleteVehicleModalProps {
  vehicle: Vehicle | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteVehicleModal({ vehicle, onOpenChange }: DeleteVehicleModalProps) {
  const deleteVehicleMutation = useDeleteVehicle();

  function handleConfirm() {
    if (!vehicle) return;
    deleteVehicleMutation.mutate(vehicle.id, { onSuccess: () => onOpenChange(false) });
  }

  return (
    <Modal
      open={vehicle !== null}
      onOpenChange={onOpenChange}
      title="Borrar vehículo"
      description={
        vehicle ? `Esto borra ${vehicle.marca} ${vehicle.linea} ${vehicle.modelo} y sus fotos. No se puede deshacer.` : undefined
      }
    >
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button
          className="bg-danger text-bg hover:opacity-90"
          onClick={handleConfirm}
          disabled={deleteVehicleMutation.isPending}
        >
          {deleteVehicleMutation.isPending ? "Borrando..." : "Borrar"}
        </Button>
      </div>
      {deleteVehicleMutation.isError ? (
        <p className="mt-3 text-sm text-danger">{deleteVehicleMutation.error.message}</p>
      ) : null}
    </Modal>
  );
}
