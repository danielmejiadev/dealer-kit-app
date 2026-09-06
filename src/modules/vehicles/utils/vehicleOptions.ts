// Values mirror the check constraints in supabase/migrations/0001_create_core_schema.sql.
import type { SelectOption } from "@/components/ui/Select";
import type { BadgeTone } from "@/components/ui/Badge";

export type VehicleStatus = "draft" | "published" | "sold" | "archived";
export type ClaseVehiculo =
  | "automovil"
  | "campero"
  | "camioneta"
  | "motocicleta"
  | "camion"
  | "buseta"
  | "otro";
export type Combustible = "gasolina" | "diesel" | "gas" | "electrico" | "hibrido";
export type Transmision = "manual" | "automatica";

export const VEHICLE_STATUSES: readonly VehicleStatus[] = [
  "draft",
  "published",
  "sold",
  "archived",
];

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  sold: "Vendido",
  archived: "Archivado",
};

export const VEHICLE_STATUS_BADGE_TONE: Record<VehicleStatus, BadgeTone> = {
  draft: "neutral",
  published: "success",
  sold: "warning",
  archived: "danger",
};

export const CLASE_VEHICULO_OPTIONS: SelectOption[] = [
  { value: "automovil", label: "Automóvil" },
  { value: "campero", label: "Campero" },
  { value: "camioneta", label: "Camioneta" },
  { value: "motocicleta", label: "Motocicleta" },
  { value: "camion", label: "Camión" },
  { value: "buseta", label: "Buseta" },
  { value: "otro", label: "Otro" },
];

export const COMBUSTIBLE_OPTIONS: SelectOption[] = [
  { value: "gasolina", label: "Gasolina" },
  { value: "diesel", label: "Diésel" },
  { value: "gas", label: "Gas" },
  { value: "electrico", label: "Eléctrico" },
  { value: "hibrido", label: "Híbrido" },
];

export const TRANSMISION_OPTIONS: SelectOption[] = [
  { value: "manual", label: "Manual" },
  { value: "automatica", label: "Automática" },
];

export const COMBUSTIBLE_LABELS: Record<Combustible, string> = {
  gasolina: "Gasolina",
  diesel: "Diésel",
  gas: "Gas",
  electrico: "Eléctrico",
  hibrido: "Híbrido",
};

export const TRANSMISION_LABELS: Record<Transmision, string> = {
  manual: "Manual",
  automatica: "Automática",
};

export const CLASE_VEHICULO_LABELS: Record<ClaseVehiculo, string> = {
  automovil: "Automóvil",
  campero: "Campero",
  camioneta: "Camioneta",
  motocicleta: "Motocicleta",
  camion: "Camión",
  buseta: "Buseta",
  otro: "Otro",
};
