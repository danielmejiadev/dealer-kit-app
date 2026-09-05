import clsx from "clsx";

type SpinnerSize = "sm" | "md";
type SpinnerTone = "neutral" | "inverted";

interface SpinnerProps {
  size?: SpinnerSize;
  /** "inverted" para usarlo sobre un fondo oscuro (p. ej. el botón primario). */
  tone?: SpinnerTone;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
};

// Clases completas por tono (no se mezclan con overrides por className):
// dos utilidades de color de borde en el mismo elemento compiten por la
// misma propiedad y cuál "gana" depende del orden interno de Tailwind, no
// del orden en el className — así que el tono se resuelve acá, entero.
const toneClasses: Record<SpinnerTone, string> = {
  neutral: "border-line-strong border-t-accent",
  inverted: "border-bg/30 border-t-bg",
};

/**
 * Indicador de carga simple y reutilizable — un solo lugar para el look de
 * "en vuelo" en botones, filas de tabla y overlays, en vez de que cada
 * componente invente el suyo. Ver AGENTS.md, "UI component library".
 */
export function Spinner({ size = "sm", tone = "neutral", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={clsx("inline-block animate-spin rounded-pill", sizeClasses[size], toneClasses[tone], className)}
    />
  );
}
