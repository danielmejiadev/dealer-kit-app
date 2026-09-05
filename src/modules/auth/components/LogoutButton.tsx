"use client";

import { Button } from "@/components/ui/Button";
import { useLogout } from "../hooks/useLogout";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <Button variant="ghost" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
      Cerrar sesión
    </Button>
  );
}
