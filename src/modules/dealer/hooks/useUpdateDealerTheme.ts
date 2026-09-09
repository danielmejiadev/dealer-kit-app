"use client";

import { useMutation } from "@tanstack/react-query";
import { ApiError, fetchJson } from "@/lib/apiClient";
import type { Dealer } from "../services/dealerService";
import type { DealerThemeFormValues } from "../utils/dealerThemeFormSchema";

export function useUpdateDealerTheme() {
  return useMutation<Dealer, ApiError, DealerThemeFormValues>({
    mutationFn: (values: DealerThemeFormValues) =>
      fetchJson<Dealer>("/api/v1/dealer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }),
  });
}
