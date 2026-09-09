// Single source of truth for vehicle form validation: VehicleForm uses this
// schema via zodResolver(), and the api/v1/vehicles Route Handlers reuse it
// via safeParse() instead of duplicating the rules server-side.
// Value constraints mirror supabase/migrations/0001_create_core_schema.sql.
import { z } from "zod";
import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import {
  CLASE_VEHICULO_LABELS,
  COMBUSTIBLE_LABELS,
  TRANSMISION_LABELS,
  VEHICLE_STATUSES,
  type ClaseVehiculo,
  type Combustible,
  type Transmision,
  type VehicleStatus,
} from "./vehicleOptions";

export const PLACA_PATTERN = /^[A-Z]{3}\d{2}[A-Z0-9]$/;
export const CURRENT_YEAR = new Date().getFullYear();
export const MIN_MODEL_YEAR = 1980;

const CLASE_VEHICULO_VALUES = Object.keys(CLASE_VEHICULO_LABELS) as [ClaseVehiculo, ...ClaseVehiculo[]];
const COMBUSTIBLE_VALUES = Object.keys(COMBUSTIBLE_LABELS) as [Combustible, ...Combustible[]];
const TRANSMISION_VALUES = Object.keys(TRANSMISION_LABELS) as [Transmision, ...Transmision[]];

function requiredText(message: string) {
  return z.string().refine((value) => value.trim().length > 0, { message });
}

// react-hook-form's register() reports a native <input> as a string (or ""
// once cleared); JSON bodies posted straight to the Route Handler may
// already carry a number. Empty/null/undefined must become undefined/null
// here rather than coerce through Number(), which turns both "" and null
// into 0 and would silently pass a "required" or "positive" check.
function toNumberOrUndefined(rawValue: unknown) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) return undefined;
  return typeof rawValue === "number" ? rawValue : Number(rawValue);
}

function toNumberOrNull(rawValue: unknown) {
  if (rawValue === "" || rawValue === null || rawValue === undefined) return null;
  return typeof rawValue === "number" ? rawValue : Number(rawValue);
}

export const vehicleFormSchema = z.object({
  placa: requiredText("La placa es obligatoria.").refine(
    (value) => PLACA_PATTERN.test(value.toUpperCase()),
    { message: "La placa debe tener el formato ABC123 o ABC12A." }
  ),
  marca: requiredText("La marca es obligatoria."),
  linea: requiredText("La línea es obligatoria."),
  modelo: z.preprocess(
    toNumberOrUndefined,
    z
      .number({ error: `El modelo debe ser un año entre ${MIN_MODEL_YEAR} y ${CURRENT_YEAR + 1}.` })
      .int(`El modelo debe ser un año entre ${MIN_MODEL_YEAR} y ${CURRENT_YEAR + 1}.`)
      .min(MIN_MODEL_YEAR, `El modelo debe ser un año entre ${MIN_MODEL_YEAR} y ${CURRENT_YEAR + 1}.`)
      .max(CURRENT_YEAR + 1, `El modelo debe ser un año entre ${MIN_MODEL_YEAR} y ${CURRENT_YEAR + 1}.`)
  ),
  color: requiredText("El color es obligatorio."),
  cilindraje: z.preprocess(
    toNumberOrNull,
    z
      .number({ error: "El cilindraje debe ser un número positivo, o dejarse vacío si es eléctrico." })
      .positive("El cilindraje debe ser un número positivo, o dejarse vacío si es eléctrico.")
      .nullable()
  ),
  claseVehiculo: z.enum(CLASE_VEHICULO_VALUES, { error: "Selecciona una clase de vehículo válida." }),
  combustible: z.enum(COMBUSTIBLE_VALUES, { error: "Selecciona un combustible válido." }),
  transmision: z.enum(TRANSMISION_VALUES, { error: "Selecciona una transmisión válida." }),
  kilometraje: z.preprocess(
    toNumberOrUndefined,
    z
      .number({ error: "El kilometraje debe ser un número mayor o igual a cero." })
      .min(0, "El kilometraje debe ser un número mayor o igual a cero.")
  ),
  precioCop: z.preprocess(
    toNumberOrUndefined,
    z.number({ error: "El precio debe ser un número positivo." }).positive("El precio debe ser un número positivo.")
  ),
  descripcion: z.string().nullable(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
// react-hook-form's field types must match what register()/defaultValues carry
// pre-validation: preprocessed numeric fields report as `unknown` on that side
// (a native <input>'s raw string, or a number from defaultValues) until
// zodResolver parses them into VehicleFormValues on submit.
export type VehicleFormInput = z.input<typeof vehicleFormSchema>;

export function isValidVehicleStatus(value: unknown): value is VehicleStatus {
  return typeof value === "string" && (VEHICLE_STATUSES as readonly string[]).includes(value);
}

export function vehicleFormValuesToInsert(
  values: VehicleFormValues,
  dealerId: number
): TablesInsert<"vehicles"> {
  return {
    dealer_id: dealerId,
    placa: values.placa.toUpperCase(),
    marca: values.marca,
    linea: values.linea,
    modelo: values.modelo,
    color: values.color,
    cilindraje: values.cilindraje,
    clase_vehiculo: values.claseVehiculo,
    combustible: values.combustible,
    transmision: values.transmision,
    kilometraje: values.kilometraje,
    precio_cop: values.precioCop,
    descripcion: values.descripcion,
  };
}

export function vehicleFormValuesToUpdate(values: VehicleFormValues): TablesUpdate<"vehicles"> {
  return {
    placa: values.placa.toUpperCase(),
    marca: values.marca,
    linea: values.linea,
    modelo: values.modelo,
    color: values.color,
    cilindraje: values.cilindraje,
    clase_vehiculo: values.claseVehiculo,
    combustible: values.combustible,
    transmision: values.transmision,
    kilometraje: values.kilometraje,
    precio_cop: values.precioCop,
    descripcion: values.descripcion,
  };
}
