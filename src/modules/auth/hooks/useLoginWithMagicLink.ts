"use client";

import { useMutation } from "@tanstack/react-query";
import { fetchJson } from "@/lib/apiClient";

export function useLoginWithMagicLink() {
  return useMutation({
    mutationFn: (email: string) =>
      fetchJson<{ ok: true }>("/api/v1/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
  });
}
