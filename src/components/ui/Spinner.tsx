import clsx from "clsx";

type SpinnerSize = "sm" | "md";
type SpinnerTone = "neutral" | "inverted";

interface SpinnerProps {
  size?: SpinnerSize;
  /** "inverted" for use on a dark background (e.g. the primary button). */
  tone?: SpinnerTone;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
};

// Full classes per tone, not mixed with className overrides: two border-color utilities on the same element would compete, and which one wins depends on Tailwind's internal order, not the className order.
const toneClasses: Record<SpinnerTone, string> = {
  neutral: "border-line-strong border-t-accent",
  inverted: "border-bg/30 border-t-bg",
};

export function Spinner({ size = "sm", tone = "neutral", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={clsx("inline-block animate-spin rounded-pill", sizeClasses[size], toneClasses[tone], className)}
    />
  );
}
