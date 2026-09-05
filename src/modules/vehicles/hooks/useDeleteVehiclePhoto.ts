"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import { vehiclePhotosQueryKey } from "./useVehiclePhotos";

export function useDeleteVehiclePhoto(vehicleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: number) =>
      fetchJson<void>(`/api/v1/vehicles/${vehicleId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclePhotosQueryKey(vehicleId) }),
  });
}
