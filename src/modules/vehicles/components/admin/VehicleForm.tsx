"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCreateVehicle } from "../../hooks/useCreateVehicle";
import { useUpdateVehicle } from "../../hooks/useUpdateVehicle";
import { CLASE_VEHICULO_OPTIONS, COMBUSTIBLE_OPTIONS, TRANSMISION_OPTIONS } from "../../utils/vehicleOptions";
import type { VehicleFormValues } from "../../utils/vehicleValidation";
import type { Vehicle } from "../../services/vehicleService";

interface VehicleFormProps {
  mode: "create" | "edit";
  vehicle?: Vehicle;
}

function vehicleToFormValues(vehicle?: Vehicle): VehicleFormValues {
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
    claseVehiculo: vehicle.clase_vehiculo,
    combustible: vehicle.combustible,
    transmision: vehicle.transmision,
    kilometraje: vehicle.kilometraje,
    precioCop: vehicle.precio_cop,
    descripcion: vehicle.descripcion,
  };
}

/** Crear/editar comparten formulario y validación — solo cambia a qué hook de mutación llaman. */
export function VehicleForm({ mode, vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<VehicleFormValues>(() => vehicleToFormValues(vehicle));
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle(vehicle?.id ?? -1);
  const mutation = mode === "create" ? createVehicleMutation : updateVehicleMutation;

  function updateField<FieldName extends keyof VehicleFormValues>(
    field: FieldName,
    value: VehicleFormValues[FieldName]
  ) {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(values, {
      onSuccess: (savedVehicle) => {
        router.push(mode === "create" ? `/admin/vehiculos/${savedVehicle.id}/editar` : "/admin");
        router.refresh();
      },
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Placa">
            <Input
              value={values.placa}
              onChange={(event) => updateField("placa", event.target.value.toUpperCase())}
              required
            />
          </Field>
          <Field label="Marca">
            <Input value={values.marca} onChange={(event) => updateField("marca", event.target.value)} required />
          </Field>
          <Field label="Línea">
            <Input value={values.linea} onChange={(event) => updateField("linea", event.target.value)} required />
          </Field>
          <Field label="Modelo (año)">
            <Input
              type="number"
              value={values.modelo}
              onChange={(event) => updateField("modelo", Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Color">
            <Input value={values.color} onChange={(event) => updateField("color", event.target.value)} required />
          </Field>
          <Field label="Cilindraje (vacío si es eléctrico)">
            <Input
              type="number"
              value={values.cilindraje ?? ""}
              onChange={(event) =>
                updateField("cilindraje", event.target.value === "" ? null : Number(event.target.value))
              }
            />
          </Field>
          <Field label="Clase de vehículo">
            <Select
              value={values.claseVehiculo}
              onValueChange={(value) => updateField("claseVehiculo", value)}
              options={CLASE_VEHICULO_OPTIONS}
            />
          </Field>
          <Field label="Combustible">
            <Select
              value={values.combustible}
              onValueChange={(value) => updateField("combustible", value)}
              options={COMBUSTIBLE_OPTIONS}
            />
          </Field>
          <Field label="Transmisión">
            <Select
              value={values.transmision}
              onValueChange={(value) => updateField("transmision", value)}
              options={TRANSMISION_OPTIONS}
            />
          </Field>
          <Field label="Kilometraje">
            <Input
              type="number"
              value={values.kilometraje}
              onChange={(event) => updateField("kilometraje", Number(event.target.value))}
              required
            />
          </Field>
          <Field label="Precio (COP)">
            <Input
              type="number"
              value={values.precioCop}
              onChange={(event) => updateField("precioCop", Number(event.target.value))}
              required
            />
          </Field>
        </div>

        <Field label="Descripción">
          <textarea
            value={values.descripcion ?? ""}
            onChange={(event) => updateField("descripcion", event.target.value)}
            rows={4}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </Field>

        {mutation.isError ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : mode === "create" ? "Crear vehículo" : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm text-ink-dim">
      {label}
      {children}
    </label>
  );
}
