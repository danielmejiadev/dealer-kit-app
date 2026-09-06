import clsx from "clsx";

/**
 * Bloque de carga tipo skeleton — un solo lugar para el look de "todavía
 * no hay datos" en vez de que cada pantalla invente el suyo. Ver
 * AGENTS.md, "UI component library".
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx("animate-pulse rounded-md bg-surface-2", className)} />;
}
