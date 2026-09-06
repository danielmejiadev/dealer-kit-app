import type { ReactNode } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vacío compartido entre el catálogo público y las listas del
 * admin, para que ambos se vean igual en vez de cada uno con su propio
 * estilo. Ver AGENTS.md, "UI component library".
 */
export function EmptyState({ message, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center gap-3 rounded-lg bg-surface p-10 text-center shadow-soft",
        className
      )}
    >
      <p className="text-ink-dim">{message}</p>
      {action}
    </div>
  );
}
