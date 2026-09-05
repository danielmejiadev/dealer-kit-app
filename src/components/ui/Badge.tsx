import type { HTMLAttributes } from "react";
import clsx from "clsx";

type BadgeTone = "neutral" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-dim",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
