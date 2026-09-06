import type { ReactNode } from "react";
import clsx from "clsx";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
  className?: string;
}

/** Shared between the public catalog and admin lists so both look the same instead of each inventing its own style. */
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
