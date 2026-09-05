import { forwardRef, type ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-bg hover:opacity-90",
  secondary: "bg-surface-2 text-ink hover:bg-line",
  ghost: "bg-transparent text-ink hover:bg-surface-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
