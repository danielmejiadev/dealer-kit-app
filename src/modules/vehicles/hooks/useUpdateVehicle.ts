"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";
import type { VehicleFormValues } from "../utils/vehicleValidation";
import { VEHICLES_QUERY_KEY } from "./useVehicles";
import { vehicleQueryKey } from "./useVehicle";

export function useUpdateVehicle(vehicleId: number) {
  const queryClient = useQueryClient();

  return useMutation<Vehicle, ApiError, VehicleFormValues>({
    mutationFn: (values: VehicleFormValues) =>
      fetchJson<Vehicle>(`/api/v1/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY });
      queryClient.setQueryData(vehicleQueryKey(vehicleId), updatedVehicle);
    },
  });
}
