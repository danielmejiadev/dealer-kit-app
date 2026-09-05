import { forwardRef, type InputHTMLAttributes } from "react";
import clsx from "clsx";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          className
        )}
        {...props}
      />
    );
  }
);
