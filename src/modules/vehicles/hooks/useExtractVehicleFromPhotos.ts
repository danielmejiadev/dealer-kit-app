"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { VehicleExtractionResult } from "../utils/vehicleExtractionSchema";

export function useExtractVehicleFromPhotos() {
  return useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      for (const file of files) formData.append("files", file);
      return fetchJson<VehicleExtractionResult>("/api/v1/vehicles/extract", {
        method: "POST",
        body: formData,
      });
    },
  });
}
