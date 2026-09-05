import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/database.types";

export type Dealer = Tables<"dealers">;
export type DealerMember = Tables<"dealer_members">;

/**
 * Fase 1 no tiene ruteo multi-tenant: literalmente el único dealer que
 * existe. Una fase futura con más de un dealer resolvería esto por
 * dominio/slug en su lugar — ver AGENTS.md.
 */
export async function getCurrentDealer(): Promise<Dealer> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").limit(1).single();

  if (error || !data) {
    throw new Error(`No se pudo cargar el dealer: ${error?.message ?? "sin datos"}`);
  }

  return data;
}

/**
 * Membresía del usuario autenticado sobre el dealer actual, o null si no es
 * miembro. Las rutas api/v1/** la usan para devolver 403 antes de tocar
 * cualquier tabla de negocio — la autorización real la impone RLS de todos
 * modos, esto es solo para responder con el código HTTP correcto.
 */
export async function getCurrentDealerMember(userId: string): Promise<DealerMember | null> {
  const supabase = await createServerSupabaseClient();
  const dealer = await getCurrentDealer();

  const { data, error } = await supabase
    .from("dealer_members")
    .select("*")
    .eq("dealer_id", dealer.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar la membresía del dealer: ${error.message}`);
  }

  return data;
}
