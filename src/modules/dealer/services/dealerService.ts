import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Tables } from "@/lib/database.types";

export type Dealer = Tables<"dealers">;
export type DealerMember = Tables<"dealer_members">;

/** Phase 1 has no multi-tenant routing: this is literally the only dealer that exists. */
export async function getCurrentDealer(): Promise<Dealer> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").limit(1).single();

  if (error || !data) {
    throw new Error(`No se pudo cargar el dealer: ${error?.message ?? "sin datos"}`);
  }

  return data;
}

/** Used by api/v1/** routes to return 403 before touching business tables; RLS is still the real authorization, this is just for the right HTTP code. */
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
