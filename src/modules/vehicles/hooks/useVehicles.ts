"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { Vehicle } from "../services/vehicleService";

export const VEHICLES_QUERY_KEY = ["vehicles"] as const;

/** `initialData` comes from the page's Server Component so the first render doesn't wait on a Route Handler round-trip. */
export function useVehicles(initialData: Vehicle[]) {
  return useQuery({
    queryKey: VEHICLES_QUERY_KEY,
    queryFn: () => fetchJson<Vehicle[]>("/api/v1/vehicles"),
    initialData,
  });
}
