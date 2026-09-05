"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";
import type { VehicleStatus } from "../utils/vehicleOptions";
import { VEHICLES_QUERY_KEY } from "./useVehicles";
import { vehicleQueryKey } from "./useVehicle";

/** Publicar/despublicar/marcar vendido/archivar desde la lista admin, sin abrir el formulario completo. */
export function useSetVehicleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId, status }: { vehicleId: number; status: VehicleStatus }) =>
      fetchJson<Vehicle>(`/api/v1/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.setQueryData(vehicleQueryKey(updatedVehicle.id), updatedVehicle);
    },
  });
}
