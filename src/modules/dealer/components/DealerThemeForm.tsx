"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useUpdateDealerTheme } from "../hooks/useUpdateDealerTheme";
import { dealerThemeFormSchema, type DealerThemeFormValues } from "../utils/dealerThemeFormSchema";
import { BODY_FONT_OPTIONS, HEADING_FONT_OPTIONS, HEX_COLOR_PATTERN, parseDealerTheme } from "../utils/theme";
import type { Dealer } from "../services/dealerService";

interface DealerThemeFormProps {
  dealer: Dealer;
}

export function DealerThemeForm({ dealer }: DealerThemeFormProps) {
  const router = useRouter();
  const toastManager = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DealerThemeFormValues>({
    resolver: zodResolver(dealerThemeFormSchema),
    defaultValues: parseDealerTheme(dealer.theme),
  });
  const updateThemeMutation = useUpdateDealerTheme();
  const fieldErrors = updateThemeMutation.error?.fieldErrors;

  function onSubmit(formValues: DealerThemeFormValues) {
    updateThemeMutation.mutate(formValues, {
      onSuccess: () => {
        toastManager.add({ title: "Personalización guardada." });
        router.refresh();
      },
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <fieldset disabled={updateThemeMutation.isPending} className="flex flex-col gap-4">
          <Field
            label="Color de acento"
            error={errors.accentColorHex?.message ?? fieldErrors?.accentColorHex}
          >
            {/* One Controller drives both inputs — registering the same field name on two DOM nodes would leave RHF tracking only one of their refs. */}
            <Controller
              control={control}
              name="accentColorHex"
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={HEX_COLOR_PATTERN.test(field.value) ? field.value : "#000000"}
                    onChange={(event) => field.onChange(event.target.value)}
                    className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-line bg-surface"
                    aria-label="Selector de color de acento"
                  />
                  <Input
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="#b8842e"
                    className="flex-1"
                  />
                </div>
              )}
            />
          </Field>

          <Field label="Fuente de título" error={errors.headingFont?.message ?? fieldErrors?.headingFont}>
            <Controller
              control={control}
              name="headingFont"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} options={HEADING_FONT_OPTIONS} />
              )}
            />
          </Field>

          <Field label="Fuente de cuerpo" error={errors.bodyFont?.message ?? fieldErrors?.bodyFont}>
            <Controller
              control={control}
              name="bodyFont"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} options={BODY_FONT_OPTIONS} />
              )}
            />
          </Field>
        </fieldset>

        {updateThemeMutation.isError && !fieldErrors ? (
          <p className="text-sm text-danger">{updateThemeMutation.error.message}</p>
        ) : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={updateThemeMutation.isPending} className="inline-flex items-center gap-2">
            {updateThemeMutation.isPending ? <Spinner size="sm" tone="inverted" /> : null}
            {updateThemeMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
      {label}
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
