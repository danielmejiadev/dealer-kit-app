// Pure URL builder — no external calls, no Supabase client, so it lives in
// utils/ (see AGENTS.md) and can be imported from Client Components
// (VehiclePhotoUploader) without pulling in vehiclePhotoService.ts's
// server-only "next/headers" dependency chain.
export const VEHICLE_PHOTOS_BUCKET = "vehicle-photos";

/** URL pública de una foto — el bucket es público en lectura (ver migración 0001). */
export function getVehiclePhotoUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${VEHICLE_PHOTOS_BUCKET}/${storagePath}`;
}
