"use client";

import type { ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// Behavior (focus trap, Escape to close, aria-modal, focus return) comes from Base UI's Dialog primitive; this file only supplies our own tokens.
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Popup
          className={clsx(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-lg bg-surface p-6 shadow-lift",
            className
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1 text-sm text-ink-dim">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-4">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ModalClose = Dialog.Close;
