import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Json, Tables, TablesUpdate } from "@/lib/database.types";
import { extractDealerSlugFromHost } from "../utils/hostname";
import type { DealerTheme } from "../utils/theme";

export type Dealer = Tables<"dealers">;
export type DealerMember = Tables<"dealer_members">;

export async function getDealerBySlug(slug: string): Promise<Dealer | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el dealer: ${error.message}`);
  }

  return data;
}

export async function getDealerById(dealerId: number): Promise<Dealer | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("dealers").select("*").eq("id", dealerId).maybeSingle();

  if (error) {
    throw new Error(`No se pudo cargar el dealer: ${error.message}`);
  }

  return data;
}

/**
 * Public catalog resolution: subdomain -> dealer, falling back to slug='default'
 * with no subdomain. `cache()` dedupes the DB hit when both the `(public)`
 * layout (theming) and its page (data) resolve the same host in one request.
 */
export const getDealerForHost = cache(async (host: string): Promise<Dealer | null> => {
  const slug = extractDealerSlugFromHost(host) ?? "default";
  return getDealerBySlug(slug);
});

/** A single user is only expected to belong to one dealer for now — the first membership row wins. */
export async function getDealerMembership(userId: string): Promise<DealerMember | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dealer_members")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo verificar la membresía del dealer: ${error.message}`);
  }

  return data;
}

/**
 * Admin resolution: the authenticated user's own dealer via `dealer_members`,
 * regardless of hostname. `cache()` dedupes across the admin layout, page,
 * and settings screen resolving the same user within one request.
 */
export const getDealerForMember = cache(async (userId: string): Promise<Dealer | null> => {
  const membership = await getDealerMembership(userId);
  if (!membership) return null;
  return getDealerById(membership.dealer_id);
});

export async function updateDealerTheme(dealerId: number, theme: DealerTheme): Promise<Dealer> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dealers")
    .update({ theme: theme as unknown as Json } satisfies TablesUpdate<"dealers">)
    .eq("id", dealerId)
    .select()
    .single();

  if (error) {
    throw new Error(`No se pudo actualizar el tema del dealer: ${error.message}`, { cause: error });
  }

  return data;
}
