"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";
import type { PriceSuggestionInput, PriceSuggestionResult } from "../utils/priceSuggestionSchema";

export function useSuggestVehiclePrice() {
  return useMutation({
    mutationFn: (vehicle: PriceSuggestionInput) =>
      fetchJson<PriceSuggestionResult>("/api/v1/vehicles/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle),
      }),
  });
}
