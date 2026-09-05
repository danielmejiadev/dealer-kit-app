import type { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("rounded-lg bg-surface p-5 shadow-soft", className)} {...props} />;
}
