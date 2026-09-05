// Los services relanzan el error de Postgres original en `cause` (ver
// vehicleService.createVehicle/updateVehicle) para que las rutas puedan
// distinguir violaciones de constraint sin volver a tocar Supabase.
const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueConstraintViolation(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const cause = error.cause as { code?: string } | undefined;
  return cause?.code === UNIQUE_VIOLATION_CODE;
}
