import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/database.types";
import { VEHICLE_PHOTOS_BUCKET } from "../utils/vehiclePhotoUrl";

export type VehiclePhoto = Tables<"vehicle_photos">;

export async function listPhotosForVehicle(vehicleId: number): Promise<VehiclePhoto[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicle_photos")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las fotos: ${error.message}`);
  }

  return data;
}

/**
 * Foto de portada (position 0) de cada vehículo, en un único round-trip —
 * usado por el grid del catálogo público, que necesita una foto por
 * tarjeta pero no la lista completa. Vehículos sin fotos simplemente no
 * aparecen en el resultado.
 */
export async function listCoverPhotosByVehicleId(
  vehicleIds: number[]
): Promise<Map<number, VehiclePhoto>> {
  if (vehicleIds.length === 0) return new Map();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicle_photos")
    .select("*")
    .in("vehicle_id", vehicleIds)
    .eq("position", 0);

  if (error) {
    throw new Error(`No se pudieron cargar las fotos de portada: ${error.message}`);
  }

  return new Map(data.map((photo) => [photo.vehicle_id, photo]));
}

/**
 * Sube una foto al bucket bajo `{dealerId}/{vehicleId}/...` (RLS de
 * `storage.objects` exige que el primer segmento sea un dealer del que el
 * usuario es miembro) y registra la fila en `vehicle_photos` en la
 * siguiente posición libre.
 */
export async function uploadVehiclePhoto(
  dealerId: number,
  vehicleId: number,
  file: File
): Promise<VehiclePhoto> {
  const supabase = await createServerSupabaseClient();

  const existingPhotos = await listPhotosForVehicle(vehicleId);
  const nextPosition = existingPhotos.length;
  const fileExtension = file.name.split(".").pop() ?? "jpg";
  const storagePath = `${dealerId}/${vehicleId}/${crypto.randomUUID()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from(VEHICLE_PHOTOS_BUCKET)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) {
    throw new Error(`No se pudo subir la foto: ${uploadError.message}`);
  }

  const { data, error: insertError } = await supabase
    .from("vehicle_photos")
    .insert({ vehicle_id: vehicleId, storage_path: storagePath, position: nextPosition })
    .select()
    .single();

  if (insertError) {
    // La fila no se pudo crear — no dejar el archivo huérfano en storage.
    await supabase.storage.from(VEHICLE_PHOTOS_BUCKET).remove([storagePath]);
    throw new Error(`No se pudo registrar la foto: ${insertError.message}`);
  }

  return data;
}

export async function deleteVehiclePhoto(photoId: number): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { data: photo, error: fetchError } = await supabase
    .from("vehicle_photos")
    .select("storage_path")
    .eq("id", photoId)
    .single();

  if (fetchError) {
    throw new Error(`No se pudo encontrar la foto: ${fetchError.message}`);
  }

  const { error: deleteRowError } = await supabase.from("vehicle_photos").delete().eq("id", photoId);

  if (deleteRowError) {
    throw new Error(`No se pudo borrar la foto: ${deleteRowError.message}`);
  }

  await supabase.storage.from(VEHICLE_PHOTOS_BUCKET).remove([photo.storage_path]);
}
