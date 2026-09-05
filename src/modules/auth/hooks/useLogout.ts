"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { fetchJson } from "@/lib/apiClient";

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: () => fetchJson<{ ok: true }>("/api/v1/auth/logout", { method: "POST" }),
    onSuccess: () => {
      router.push("/admin/login");
      router.refresh();
    },
  });
}
