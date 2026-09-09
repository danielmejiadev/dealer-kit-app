// Single source of truth for the price-suggestion request, same split as
// vehicleFormSchema: PriceSuggestionInput is what the form hands over
// (react-hook-form's raw field values, pre-coercion), PriceSuggestionValues
// is what the Route Handler validates into via safeParse().
import { z } from "zod";
import {
  CLASE_VEHICULO_LABELS,
  COMBUSTIBLE_LABELS,
  TRANSMISION_LABELS,
  type ClaseVehiculo,
  type Combustible,
  type Transmision,
} from "./vehicleOptions";
import { toNumberOrUndefined } from "./vehicleFormSchema";
import type { VehicleFormInput } from "./vehicleFormSchema";

const CLASE_VEHICULO_VALUES = Object.keys(CLASE_VEHICULO_LABELS) as [ClaseVehiculo, ...ClaseVehiculo[]];
const COMBUSTIBLE_VALUES = Object.keys(COMBUSTIBLE_LABELS) as [Combustible, ...Combustible[]];
const TRANSMISION_VALUES = Object.keys(TRANSMISION_LABELS) as [Transmision, ...Transmision[]];

function requiredText(message: string) {
  return z.string().refine((value) => value.trim().length > 0, { message });
}

export const priceSuggestionRequestSchema = z.object({
  marca: requiredText("La marca es obligatoria."),
  linea: requiredText("La línea es obligatoria."),
  modelo: z.preprocess(toNumberOrUndefined, z.number({ error: "El modelo debe ser un año válido." }).int()),
  kilometraje: z.preprocess(
    toNumberOrUndefined,
    z.number({ error: "El kilometraje debe ser un número mayor o igual a cero." }).min(0)
  ),
  claseVehiculo: z.enum(CLASE_VEHICULO_VALUES, { error: "Selecciona una clase de vehículo válida." }),
  combustible: z.enum(COMBUSTIBLE_VALUES, { error: "Selecciona un combustible válido." }),
  transmision: z.enum(TRANSMISION_VALUES, { error: "Selecciona una transmisión válida." }),
  color: requiredText("El color es obligatorio."),
});

export type PriceSuggestionValues = z.infer<typeof priceSuggestionRequestSchema>;
export type PriceSuggestionInput = z.input<typeof priceSuggestionRequestSchema>;

export const priceSuggestionResponseSchema = z.object({
  suggestedPriceCop: z.number().positive(),
  rationale: z.string(),
});

export type PriceSuggestionResult = z.infer<typeof priceSuggestionResponseSchema>;

/** VehicleForm already carries every one of these fields, just alongside others the price call doesn't need. */
export function vehicleFormValuesToPriceSuggestionInput(values: VehicleFormInput): PriceSuggestionInput {
  return {
    marca: values.marca,
    linea: values.linea,
    modelo: values.modelo,
    kilometraje: values.kilometraje,
    claseVehiculo: values.claseVehiculo,
    combustible: values.combustible,
    transmision: values.transmision,
    color: values.color,
  };
}
