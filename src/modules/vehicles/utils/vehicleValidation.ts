// Mirrors the check constraints in supabase/migrations/0001_create_core_schema.sql, so api/v1/vehicles can respond with a useful 400 instead of a raw Postgres error.
import type { TablesInsert, TablesUpdate } from "@/lib/database.types";
import {
  CLASE_VEHICULO_LABELS,
  COMBUSTIBLE_LABELS,
  TRANSMISION_LABELS,
  VEHICLE_STATUSES,
  type VehicleStatus,
} from "./vehicleOptions";

const PLACA_PATTERN = /^[A-Z]{3}\d{2}[A-Z0-9]$/;
const CURRENT_YEAR = new Date().getFullYear();
const MIN_MODEL_YEAR = 1980;

export interface VehicleFormValues {
  placa: string;
  marca: string;
  linea: string;
  modelo: number;
  color: string;
  cilindraje: number | null;
  claseVehiculo: string;
  combustible: string;
  transmision: string;
  kilometraje: number;
  precioCop: number;
  descripcion: string | null;
}

export interface VehicleValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof VehicleFormValues, string>>;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateVehicleForm(values: VehicleFormValues): VehicleValidationResult {
  const errors: VehicleValidationResult["errors"] = {};

  if (!isNonEmptyString(values.placa) || !PLACA_PATTERN.test(values.placa.toUpperCase())) {
    errors.placa = "La placa debe tener el formato ABC123 o ABC12A.";
  }
  if (!isNonEmptyString(values.marca)) errors.marca = "La marca es obligatoria.";
  if (!isNonEmptyString(values.linea)) errors.linea = "La línea es obligatoria.";
  if (!isNonEmptyString(values.color)) errors.color = "El color es obligatorio.";

  if (
    !Number.isInteger(values.modelo) ||
    values.modelo < MIN_MODEL_YEAR ||
    values.modelo > CURRENT_YEAR + 1
  ) {
    errors.modelo = `El modelo debe ser un año entre ${MIN_MODEL_YEAR} y ${CURRENT_YEAR + 1}.`;
  }

  if (values.cilindraje !== null && (!Number.isFinite(values.cilindraje) || values.cilindraje <= 0)) {
    errors.cilindraje = "El cilindraje debe ser un número positivo, o dejarse vacío si es eléctrico.";
  }

  if (!(values.claseVehiculo in CLASE_VEHICULO_LABELS)) {
    errors.claseVehiculo = "Selecciona una clase de vehículo válida.";
  }
  if (!(values.combustible in COMBUSTIBLE_LABELS)) {
    errors.combustible = "Selecciona un combustible válido.";
  }
  if (!(values.transmision in TRANSMISION_LABELS)) {
    errors.transmision = "Selecciona una transmisión válida.";
  }

  if (!Number.isFinite(values.kilometraje) || values.kilometraje < 0) {
    errors.kilometraje = "El kilometraje debe ser un número mayor o igual a cero.";
  }

  if (!Number.isFinite(values.precioCop) || values.precioCop <= 0) {
    errors.precioCop = "El precio debe ser un número positivo.";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

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
