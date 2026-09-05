"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { VehiclePhoto } from "../services/vehiclePhotoService";

export function vehiclePhotosQueryKey(vehicleId: number) {
  return ["vehicles", vehicleId, "photos"] as const;
}

export function useVehiclePhotos(vehicleId: number, initialData: VehiclePhoto[]) {
  return useQuery({
    queryKey: vehiclePhotosQueryKey(vehicleId),
    queryFn: () => fetchJson<VehiclePhoto[]>(`/api/v1/vehicles/${vehicleId}/photos`),
    initialData,
  });
}
