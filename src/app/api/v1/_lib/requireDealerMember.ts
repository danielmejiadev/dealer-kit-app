import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import {
  getCurrentDealer,
  getCurrentDealerMember,
  type Dealer,
  type DealerMember,
} from "@/modules/dealer/services/dealerService";

interface AuthorizedDealerContext {
  dealer: Dealer;
  dealerMember: DealerMember;
}

/** Typed 401/403 so routes can distinguish these from a real 500 error. */
export class AuthGuardError extends Error {
  status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = "AuthGuardError";
    this.status = status;
  }
}

/** Shared by every Route Handler under api/v1/vehicles/**, just to avoid repeating these two calls in each route.ts. */
export async function requireDealerMember(): Promise<AuthorizedDealerContext> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    throw new AuthGuardError(401, "No autenticado.");
  }

  const dealer = await getCurrentDealer();
  const dealerMember = await getCurrentDealerMember(data.claims.sub);

  if (!dealerMember) {
    throw new AuthGuardError(403, "No tienes acceso a este dealer.");
  }

  return { dealer, dealerMember };
}

/** null if `error` isn't an AuthGuardError, so the catch block's generic 500 takes over. */
export function authGuardErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof AuthGuardError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
