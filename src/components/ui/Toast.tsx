"use client";

import type { ReactNode } from "react";
import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import clsx from "clsx";

// Wrap the app once (in layout.tsx) so any Client Component can call useToast(). Behavior comes from Base UI's Toast primitive; this file only supplies our own tokens.
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastPrimitive.Provider>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      className={clsx("rounded-md bg-ink px-4 py-3 text-sm text-bg shadow-lift")}
    >
      <ToastPrimitive.Content>
        <ToastPrimitive.Title className="font-medium" />
        <ToastPrimitive.Description className="text-bg/80" />
      </ToastPrimitive.Content>
      <ToastPrimitive.Close aria-label="Cerrar" className="ml-3 text-bg/60" />
    </ToastPrimitive.Root>
  ));
}

export const useToast = () => ToastPrimitive.useToastManager();
