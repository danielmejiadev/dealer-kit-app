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
import { useCreateVehicle } from "../../hooks/useCreateVehicle";
import { useUpdateVehicle } from "../../hooks/useUpdateVehicle";
import {
  CLASE_VEHICULO_OPTIONS,
  COMBUSTIBLE_OPTIONS,
  TRANSMISION_OPTIONS,
  type ClaseVehiculo,
  type Combustible,
  type Transmision,
} from "../../utils/vehicleOptions";
import { vehicleFormSchema, type VehicleFormInput, type VehicleFormValues } from "../../utils/vehicleFormSchema";
import type { Vehicle } from "../../services/vehicleService";

interface VehicleFormProps {
  mode: "create" | "edit";
  vehicle?: Vehicle;
}

function vehicleToFormValues(vehicle?: Vehicle): VehicleFormInput {
  if (!vehicle) {
    return {
      placa: "",
      marca: "",
      linea: "",
      modelo: new Date().getFullYear(),
      color: "",
      cilindraje: null,
      claseVehiculo: "automovil",
      combustible: "gasolina",
      transmision: "manual",
      kilometraje: 0,
      precioCop: 0,
      descripcion: "",
    };
  }

  return {
    placa: vehicle.placa,
    marca: vehicle.marca,
    linea: vehicle.linea,
    modelo: vehicle.modelo,
    color: vehicle.color,
    cilindraje: vehicle.cilindraje,
    // The check constraints guarantee these text columns hold a valid enum
    // value; Supabase's generated types just don't narrow them that far.
    claseVehiculo: vehicle.clase_vehiculo as ClaseVehiculo,
    combustible: vehicle.combustible as Combustible,
    transmision: vehicle.transmision as Transmision,
    kilometraje: vehicle.kilometraje,
    precioCop: vehicle.precio_cop,
    descripcion: vehicle.descripcion,
  };
}

// Preprocessed numeric fields report as `unknown` on the input side, which
// widens their formState.errors entry beyond plain FieldError — all we need
// from it here is the message, regardless of shape.
function fieldErrorMessage(clientError?: { message?: string }, serverMessage?: string): string | undefined {
  return clientError?.message ?? serverMessage;
}

/** Crear/editar comparten formulario y validación — solo cambia a qué hook de mutación llaman. */
export function VehicleForm({ mode, vehicle }: VehicleFormProps) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormInput, unknown, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: vehicleToFormValues(vehicle),
  });
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle(vehicle?.id ?? -1);
  const mutation = mode === "create" ? createVehicleMutation : updateVehicleMutation;
  const fieldErrors = mutation.error?.fieldErrors;

  const placaRegistration = register("placa");

  function onSubmit(formValues: VehicleFormValues) {
    mutation.mutate(
      { ...formValues, placa: formValues.placa.toUpperCase() },
      {
        onSuccess: (savedVehicle) => {
          router.push(mode === "create" ? `/admin/vehiculos/${savedVehicle.id}/editar` : "/admin");
          router.refresh();
        },
      }
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <fieldset disabled={mutation.isPending} className="contents">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Placa" error={fieldErrorMessage(errors.placa, fieldErrors?.placa)}>
              <Input
                {...placaRegistration}
                onChange={(event) => {
                  event.target.value = event.target.value.toUpperCase();
                  placaRegistration.onChange(event);
                }}
              />
            </Field>
            <Field label="Marca" error={fieldErrorMessage(errors.marca, fieldErrors?.marca)}>
              <Input {...register("marca")} />
            </Field>
            <Field label="Línea" error={fieldErrorMessage(errors.linea, fieldErrors?.linea)}>
              <Input {...register("linea")} />
            </Field>
            <Field label="Modelo (año)" error={fieldErrorMessage(errors.modelo, fieldErrors?.modelo)}>
              <Input type="number" {...register("modelo")} />
            </Field>
            <Field label="Color" error={fieldErrorMessage(errors.color, fieldErrors?.color)}>
              <Input {...register("color")} />
            </Field>
            <Field label="Cilindraje (vacío si es eléctrico)" error={fieldErrorMessage(errors.cilindraje, fieldErrors?.cilindraje)}>
              <Input type="number" {...register("cilindraje")} />
            </Field>
            <Field
              label="Clase de vehículo"
              error={fieldErrorMessage(errors.claseVehiculo, fieldErrors?.claseVehiculo)}
            >
              <Controller
                control={control}
                name="claseVehiculo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} options={CLASE_VEHICULO_OPTIONS} />
                )}
              />
            </Field>
            <Field label="Combustible" error={fieldErrorMessage(errors.combustible, fieldErrors?.combustible)}>
              <Controller
                control={control}
                name="combustible"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} options={COMBUSTIBLE_OPTIONS} />
                )}
              />
            </Field>
            <Field label="Transmisión" error={fieldErrorMessage(errors.transmision, fieldErrors?.transmision)}>
              <Controller
                control={control}
                name="transmision"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} options={TRANSMISION_OPTIONS} />
                )}
              />
            </Field>
            <Field label="Kilometraje" error={fieldErrorMessage(errors.kilometraje, fieldErrors?.kilometraje)}>
              <Input type="number" {...register("kilometraje")} />
            </Field>
            <Field label="Precio (COP)" error={fieldErrorMessage(errors.precioCop, fieldErrors?.precioCop)}>
              <Input type="number" {...register("precioCop")} />
            </Field>
          </div>

          <Field label="Descripción" error={fieldErrorMessage(errors.descripcion, fieldErrors?.descripcion)}>
            <textarea
              {...register("descripcion")}
              rows={4}
              className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </Field>
        </fieldset>

        {mutation.isError && !fieldErrors ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending} className="inline-flex items-center gap-2">
            {mutation.isPending ? <Spinner size="sm" tone="inverted" /> : null}
            {mutation.isPending ? "Guardando..." : mode === "create" ? "Crear vehículo" : "Guardar cambios"}
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
