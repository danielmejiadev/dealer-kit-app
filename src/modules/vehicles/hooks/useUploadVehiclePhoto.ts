"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { VehiclePhoto } from "../services/vehiclePhotoService";
import { vehiclePhotosQueryKey } from "./useVehiclePhotos";

export function useUploadVehiclePhoto(vehicleId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetchJson<VehiclePhoto>(`/api/v1/vehicles/${vehicleId}/photos`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vehiclePhotosQueryKey(vehicleId) }),
  });
}
