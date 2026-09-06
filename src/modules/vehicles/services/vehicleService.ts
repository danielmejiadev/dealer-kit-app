import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import type { VehicleStatus } from "../utils/vehicleOptions";

export type Vehicle = Tables<"vehicles">;

interface ListVehiclesOptions {
  /** Public catalog: only `status = 'published'`. Admin: all. */
  publishedOnly?: boolean;
}

/** RLS already enforces this same restriction; this filter only avoids fetching extra rows. */
export async function listVehiclesForDealer(
  dealerId: number,
  options: ListVehiclesOptions = {}
): Promise<Vehicle[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("vehicles")
    .select("*")
    .eq("dealer_id", dealerId)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options.publishedOnly) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`No se pudieron cargar los vehículos: ${error.message}`);
  }

  return data;
}

export async function getVehicleById(vehicleId: number): Promise<Vehicle | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", vehicleId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el vehículo: ${error.message}`);
  }

  return data;
}

export async function createVehicle(input: TablesInsert<"vehicles">): Promise<Vehicle> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("vehicles").insert(input).select().single();

  if (error) {
    throw new Error(`No se pudo crear el vehículo: ${error.message}`, { cause: error });
  }

  return data;
}

export async function updateVehicle(
  vehicleId: number,
  input: TablesUpdate<"vehicles">
): Promise<Vehicle> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("vehicles")
    .update(input)
    .eq("id", vehicleId)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar el vehículo: ${error.message}`, { cause: error });
  }

  return data;
}

/** Sets `published_at` when publishing. */
export async function setVehicleStatus(vehicleId: number, status: VehicleStatus): Promise<Vehicle> {
  return updateVehicle(vehicleId, {
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });
}

export async function deleteVehicle(vehicleId: number): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);

  if (error) {
    throw new Error(`No se pudo borrar el vehículo: ${error.message}`);
  }
}
