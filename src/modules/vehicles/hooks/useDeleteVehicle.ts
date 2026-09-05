"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import { VEHICLES_QUERY_KEY } from "./useVehicles";

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: number) =>
      fetchJson<void>(`/api/v1/vehicles/${vehicleId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: VEHICLES_QUERY_KEY }),
  });
}
