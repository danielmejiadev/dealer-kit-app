"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";

export const VEHICLES_QUERY_KEY = ["vehicles"] as const;

/**
 * Lista de vehículos del admin. `initialData` viene del Server Component
 * de la página (`vehicleService.listVehiclesForDealer()` sin filtro de
 * estado) para que la primera carga no dependa de un round-trip al Route
 * Handler — ver AGENTS.md, patrón de primera carga del admin.
 */
export function useVehicles(initialData: Vehicle[]) {
  return useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: () => fetchJson<Vehicle[]>("/api/v1/vehicles"),
    initialData,
  });
}
