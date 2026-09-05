"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import clsx from "clsx";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

// Behavior (keyboard navigation, listbox semantics, positioning) comes
// from Base UI's Select primitive — this file only supplies our own
// tokens. See AGENTS.md, "UI component library: Base UI, hand-wrapped".
export function Select({ value, onValueChange, options, placeholder, className }: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(newValue) => {
        if (newValue !== null) onValueChange?.(newValue);
      }}
    >
      <SelectPrimitive.Trigger
        className={clsx(
          "flex w-full items-center justify-between rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className="text-ink-faint" />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner sideOffset={4}>
          <SelectPrimitive.Popup className="rounded-md bg-surface py-1 shadow-lift">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="cursor-pointer px-3.5 py-2 text-sm text-ink data-[highlighted]:bg-surface-2"
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
