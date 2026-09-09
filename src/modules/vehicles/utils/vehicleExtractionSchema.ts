// Structured-output schema for foto→ficha (vehicleExtractionService.ts):
// unlike vehicleFormSchema, every field here is nullable — the model must
// report null instead of guessing when a photo doesn't show something
// clearly. kilometraje and precioCop are deliberately absent: an odometer
// reading and a market price aren't reliably readable from photos (price
// is what the separate price-suggestion feature is for), so asking the
// model for them here would just invite guesses.
import { z } from "zod";
import {
  CLASE_VEHICULO_LABELS,
  COMBUSTIBLE_LABELS,
  TRANSMISION_LABELS,
  type ClaseVehiculo,
  type Combustible,
  type Transmision,
} from "./vehicleOptions";
import type { VehicleFormInput } from "./vehicleFormSchema";

const CLASE_VEHICULO_VALUES = Object.keys(CLASE_VEHICULO_LABELS) as [ClaseVehiculo, ...ClaseVehiculo[]];
const COMBUSTIBLE_VALUES = Object.keys(COMBUSTIBLE_LABELS) as [Combustible, ...Combustible[]];
const TRANSMISION_VALUES = Object.keys(TRANSMISION_LABELS) as [Transmision, ...Transmision[]];

export const vehicleExtractionSchema = z.object({
  placa: z.string().nullable(),
  marca: z.string().nullable(),
  linea: z.string().nullable(),
  modelo: z.number().int().nullable(),
  color: z.string().nullable(),
  cilindraje: z.number().nullable(),
  claseVehiculo: z.enum(CLASE_VEHICULO_VALUES).nullable(),
  combustible: z.enum(COMBUSTIBLE_VALUES).nullable(),
  transmision: z.enum(TRANSMISION_VALUES).nullable(),
  descripcion: z.string().nullable(),
});

export type VehicleExtractionResult = z.infer<typeof vehicleExtractionSchema>;

/** Drops nulls so the result only overrides VehicleForm's blank defaults where the model was confident. */
export function extractionResultToFormInitialValues(
  extraction: VehicleExtractionResult
): Partial<VehicleFormInput> {
  const initialValues: Partial<VehicleFormInput> = {};

  if (extraction.placa) initialValues.placa = extraction.placa.toUpperCase();
  if (extraction.marca) initialValues.marca = extraction.marca;
  if (extraction.linea) initialValues.linea = extraction.linea;
  if (extraction.modelo !== null) initialValues.modelo = extraction.modelo;
  if (extraction.color) initialValues.color = extraction.color;
  if (extraction.cilindraje !== null) initialValues.cilindraje = extraction.cilindraje;
  if (extraction.claseVehiculo) initialValues.claseVehiculo = extraction.claseVehiculo;
  if (extraction.combustible) initialValues.combustible = extraction.combustible;
  if (extraction.transmision) initialValues.transmision = extraction.transmision;
  if (extraction.descripcion) initialValues.descripcion = extraction.descripcion;

  return initialValues;
}
