"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";
import type { VehicleFormValues } from "../utils/vehicleValidation";
import { VEHICLES_QUERY_KEY } from "./useVehicles";

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VehicleFormValues) =>
      fetchJson<Vehicle>("/api/v1/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY }),
  });
}
