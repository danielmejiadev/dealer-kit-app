// No Supabase client, so Client Components (VehiclePhotoUploader) can import it without pulling in vehiclePhotoService.ts's server-only "next/headers" chain.
export const VEHICLE_PHOTOS_BUCKET = "vehicle-photos";

/** The bucket is public-read (see migration 0001). */
export function getVehiclePhotoUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/${VEHICLE_PHOTOS_BUCKET}/${storagePath}`;
}
