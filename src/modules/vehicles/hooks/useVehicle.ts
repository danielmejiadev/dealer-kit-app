"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";

export function vehicleQueryKey(vehicleId: number) {
  return ["vehicles", vehicleId] as const;
}

export function useVehicle(vehicleId: number, initialData?: Vehicle) {
  return useQuery({
    queryKey: vehicleQueryKey(vehicleId),
    queryFn: () => fetchJson<Vehicle>(`/api/v1/vehicles/${vehicleId}`),
    initialData,
  });
}
